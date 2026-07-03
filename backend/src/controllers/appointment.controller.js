import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { generateCode } from "../utils/codes.js";

const ACTIVE_APPOINTMENT_STATUSES = ["PENDING", "CONFIRMED", "IN_PROGRESS"];

const buildDateRange = (dateString) => {
  const start = new Date(dateString);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

export const createAppointment = asyncHandler(async (req, res) => {
  const appointmentDay = new Date(req.body.appointmentDate);
  appointmentDay.setHours(0, 0, 0, 0);

  if (Number.isNaN(appointmentDay.getTime())) {
    throw new ApiError(400, "Appointment date is invalid.");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (appointmentDay < today) {
    throw new ApiError(400, "Appointment date must be today or later.");
  }

  const services = await prisma.service.findMany({
    where: {
      id: { in: req.body.serviceIds },
      status: "ACTIVE"
    }
  });

  if (services.length !== req.body.serviceIds.length) {
    throw new ApiError(400, "One or more services are unavailable.");
  }

  let staff = null;
  if (req.body.staffId) {
    staff = await prisma.staff.findUnique({
      where: { id: req.body.staffId },
      include: {
        services: true
      }
    });

    if (!staff || staff.status !== "ACTIVE") {
      throw new ApiError(404, "Selected staff member was not found.");
    }

    const serviceSet = new Set(staff.services.map((item) => item.serviceId));
    const canHandleAllServices = req.body.serviceIds.every((serviceId) => serviceSet.has(serviceId));

    if (!canHandleAllServices) {
      throw new ApiError(400, "Selected staff member cannot perform all chosen services.");
    }

    const conflict = await prisma.appointment.findFirst({
      where: {
        staffId: staff.id,
        appointmentDate: appointmentDay,
        appointmentTime: req.body.appointmentTime,
        status: {
          in: ACTIVE_APPOINTMENT_STATUSES
        }
      }
    });

    if (conflict) {
      throw new ApiError(409, "That time slot is already booked for the selected staff member.");
    }
  }

  const existingCustomerSlot = await prisma.appointment.findFirst({
    where: {
      userId: req.user.id,
      appointmentDate: appointmentDay,
      appointmentTime: req.body.appointmentTime,
      status: {
        in: ACTIVE_APPOINTMENT_STATUSES
      }
    }
  });

  if (existingCustomerSlot) {
    throw new ApiError(409, "You already have an appointment in that time slot.");
  }

  const totalPrice = services.reduce((sum, service) => sum + service.price, 0);

  const appointment = await prisma.appointment.create({
    data: {
      code: generateCode("APT"),
      userId: req.user.id,
      staffId: staff?.id,
      appointmentDate: appointmentDay,
      appointmentTime: req.body.appointmentTime,
      totalPrice,
      status: "PENDING",
      paymentMethod: req.body.paymentMethod,
      paymentStatus: req.body.paymentMethod === "BANK_TRANSFER" ? "PENDING" : "PENDING",
      customerName: req.body.customerName,
      customerPhone: req.body.customerPhone,
      customerEmail: req.body.customerEmail,
      note: req.body.note,
      items: {
        create: services.map((service) => ({
          serviceId: service.id,
          serviceName: service.name,
          price: service.price,
          duration: service.duration
        }))
      }
    },
    include: {
      items: true,
      staff: true
    }
  });

  res.status(201).json({
    message: "Appointment booked successfully.",
    item: appointment
  });
});

export const listMyAppointments = asyncHandler(async (req, res) => {
  const items = await prisma.appointment.findMany({
    where: {
      userId: req.user.id
    },
    include: {
      staff: true,
      items: true
    },
    orderBy: [{ appointmentDate: "desc" }, { appointmentTime: "desc" }]
  });

  res.json({ items });
});

export const getAppointmentById = asyncHandler(async (req, res) => {
  const item = await prisma.appointment.findUnique({
    where: { id: req.params.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      },
      staff: true,
      items: {
        include: {
          service: true
        }
      }
    }
  });

  if (!item) {
    throw new ApiError(404, "Appointment not found.");
  }

  if (req.user.role !== "ADMIN" && item.userId !== req.user.id) {
    throw new ApiError(403, "You do not have access to this appointment.");
  }

  res.json({ item });
});

export const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: req.params.id }
  });

  if (!appointment || appointment.userId !== req.user.id) {
    throw new ApiError(404, "Appointment not found.");
  }

  if (!["PENDING", "CONFIRMED"].includes(appointment.status)) {
    throw new ApiError(400, "Only pending or confirmed appointments can be cancelled.");
  }

  const [hours, minutes] = appointment.appointmentTime.split(":").map(Number);
  const scheduledMoment = new Date(appointment.appointmentDate);
  scheduledMoment.setHours(hours, minutes, 0, 0);

  if (scheduledMoment.getTime() - Date.now() < 4 * 60 * 60 * 1000) {
    throw new ApiError(400, "Appointments can only be cancelled at least 4 hours in advance.");
  }

  const item = await prisma.appointment.update({
    where: { id: req.params.id },
    data: {
      status: "CANCELLED"
    }
  });

  res.json({
    message: "Appointment cancelled successfully.",
    item
  });
});

export const listAdminAppointments = asyncHandler(async (req, res) => {
  const search = req.query.search?.trim();
  const filters = {
    ...(req.query.status ? { status: req.query.status } : {}),
    ...(req.query.staffId ? { staffId: req.query.staffId } : {}),
    ...(req.query.serviceId
      ? {
          items: {
            some: {
              serviceId: req.query.serviceId
            }
          }
        }
      : {}),
    ...(req.query.date
      ? (() => {
          const { start, end } = buildDateRange(req.query.date);
          return {
            appointmentDate: {
              gte: start,
              lte: end
            }
          };
        })()
      : {}),
    ...(search
      ? {
          OR: [
            { code: { contains: search, mode: "insensitive" } },
            { customerName: { contains: search, mode: "insensitive" } },
            { customerPhone: { contains: search, mode: "insensitive" } },
            { customerEmail: { contains: search, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const items = await prisma.appointment.findMany({
    where: filters,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      },
      staff: true,
      items: true
    },
    orderBy: [{ appointmentDate: "desc" }, { appointmentTime: "asc" }]
  });

  res.json({ items });
});

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const existing = await prisma.appointment.findUnique({
    where: { id: req.params.id }
  });

  if (!existing) {
    throw new ApiError(404, "Appointment not found.");
  }

  const item = await prisma.appointment.update({
    where: { id: req.params.id },
    data: {
      status: req.body.status,
      paymentStatus: req.body.paymentStatus ?? existing.paymentStatus,
      staffId: req.body.staffId ?? existing.staffId,
      internalNote: req.body.internalNote ?? existing.internalNote
    },
    include: {
      staff: true,
      items: true
    }
  });

  res.json({
    message: "Appointment updated successfully.",
    item
  });
});

