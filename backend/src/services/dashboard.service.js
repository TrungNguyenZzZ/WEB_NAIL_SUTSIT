import { prisma } from "../config/prisma.js";

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfToday = () => {
  const date = startOfToday();
  date.setHours(23, 59, 59, 999);
  return date;
};

export const getDashboardStatistics = async () => {
  const [revenue, appointments, orders, customers, services, products] = await Promise.all([
    prisma.order.aggregate({
      _sum: { finalPrice: true },
      where: { paymentStatus: "PAID" }
    }),
    prisma.appointment.count(),
    prisma.order.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.service.count(),
    prisma.product.count()
  ]);

  return {
    totalRevenue: revenue._sum.finalPrice ?? 0,
    totalAppointments: appointments,
    totalOrders: orders,
    totalCustomers: customers,
    totalServices: services,
    totalProducts: products
  };
};

export const getRevenueSeries = async () => {
  const days = 7;
  const start = startOfToday();
  start.setDate(start.getDate() - (days - 1));

  const paidOrders = await prisma.order.findMany({
    where: {
      paymentStatus: "PAID",
      createdAt: {
        gte: start
      }
    },
    select: {
      createdAt: true,
      finalPrice: true
    }
  });

  return Array.from({ length: days }).map((_, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    const key = current.toISOString().slice(0, 10);
    const amount = paidOrders
      .filter((order) => order.createdAt.toISOString().slice(0, 10) === key)
      .reduce((sum, order) => sum + order.finalPrice, 0);

    return {
      date: key,
      revenue: amount
    };
  });
};

export const getTodayAppointments = async () =>
  prisma.appointment.findMany({
    where: {
      appointmentDate: {
        gte: startOfToday(),
        lte: endOfToday()
      }
    },
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
    orderBy: [{ appointmentTime: "asc" }, { createdAt: "desc" }],
    take: 10
  });

export const getBestSellingProducts = async () => {
  const items = await prisma.orderItem.groupBy({
    by: ["productId", "productName", "productImage"],
    _sum: {
      quantity: true
    }
  });

  const sorted = items
    .sort((a, b) => (b._sum.quantity ?? 0) - (a._sum.quantity ?? 0))
    .slice(0, 5);

  return sorted.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    productImage: item.productImage,
    sold: item._sum.quantity ?? 0
  }));
};

export const getTopServices = async () => {
  const items = await prisma.appointmentItem.groupBy({
    by: ["serviceId", "serviceName"],
    _count: {
      serviceId: true
    }
  });

  return items
    .sort((a, b) => (b._count.serviceId ?? 0) - (a._count.serviceId ?? 0))
    .slice(0, 5)
    .map((item) => ({
      serviceId: item.serviceId,
      serviceName: item.serviceName,
      booked: item._count.serviceId ?? 0
    }));
};
