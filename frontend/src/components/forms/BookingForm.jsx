import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { appointmentApi } from "../../services/api";
import { PAYMENT_OPTIONS, TIME_SLOTS } from "../../utils/constants";
import { formatCurrency } from "../../utils/format";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  FieldError,
  FieldHint,
  Input,
  Label,
  Select,
  Textarea
} from "../ui";

const schema = z.object({
  serviceIds: z.array(z.string()).min(1, "Hãy chọn ít nhất một dịch vụ."),
  staffId: z.string().optional(),
  appointmentDate: z.string().min(1, "Vui lòng chọn ngày."),
  appointmentTime: z.string().min(1, "Vui lòng chọn giờ."),
  customerName: z.string().trim().min(2, "Vui lòng nhập họ tên."),
  customerPhone: z.string().trim().min(8, "Số điện thoại chưa hợp lệ."),
  customerEmail: z.string().trim().email("Email chưa hợp lệ."),
  note: z.string().optional(),
  paymentMethod: z.enum(["SALON", "BANK_TRANSFER", "VNPAY", "MOMO"])
});

const BookingForm = ({ services, staff, initialServiceId, currentUser }) => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const groupedServices = useMemo(() => {
    return services.reduce((accumulator, item) => {
      const key = item.category?.name || "Khác";
      accumulator[key] = accumulator[key] ?? [];
      accumulator[key].push(item);
      return accumulator;
    }, {});
  }, [services]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      serviceIds: initialServiceId ? [initialServiceId] : [],
      staffId: "",
      appointmentDate: "",
      appointmentTime: "",
      customerName: currentUser?.name ?? "",
      customerPhone: currentUser?.phone ?? "",
      customerEmail: currentUser?.email ?? "",
      note: "",
      paymentMethod: "SALON"
    }
  });

  useEffect(() => {
    if (initialServiceId) {
      setValue("serviceIds", [initialServiceId]);
    }
  }, [initialServiceId, setValue]);

  const selectedServiceIds = watch("serviceIds");
  const selectedServices = services.filter((item) => selectedServiceIds.includes(item.id));
  const totalPrice = selectedServices.reduce((sum, item) => sum + item.price, 0);
  const totalDuration = selectedServices.reduce((sum, item) => sum + item.duration, 0);

  const onSubmit = async (values) => {
    setServerError("");
    try {
      const response = await appointmentApi.create(values);
      navigate(`/account?tab=appointments&code=${encodeURIComponent(response.item.code)}`);
    } catch (error) {
      setServerError(error.message || "Không thể đặt lịch vào lúc này.");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label>Dịch vụ muốn đặt</Label>
            <Controller
              control={control}
              name="serviceIds"
              render={({ field }) => (
                <div className="space-y-4">
                  {Object.entries(groupedServices).map(([groupName, groupItems]) => (
                    <div key={groupName} className="rounded-3xl border border-rose/10 bg-white/70 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-semibold text-ink">{groupName}</h3>
                        <Badge>{groupItems.length} lựa chọn</Badge>
                      </div>
                      <div className="grid gap-3">
                        {groupItems.map((item) => {
                          const checked = field.value.includes(item.id);
                          return (
                            <label
                              key={item.id}
                              className="flex cursor-pointer items-start gap-3 rounded-2xl border border-rose/10 bg-white/90 p-4"
                            >
                              <Checkbox
                                checked={checked}
                                onChange={(event) => {
                                  const next = event.target.checked
                                    ? [...field.value, item.id]
                                    : field.value.filter((serviceId) => serviceId !== item.id);
                                  field.onChange(next);
                                }}
                              />
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <p className="font-semibold text-ink">{item.name}</p>
                                  <span className="text-sm font-semibold text-cocoa">
                                    {formatCurrency(item.price)}
                                  </span>
                                </div>
                                <p className="mt-2 text-sm text-cocoa/80">{item.shortDescription}</p>
                                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-cocoa/60">
                                  {item.duration} phút
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            />
            <FieldError message={errors.serviceIds?.message} />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <Label>Ngày hẹn</Label>
              <Input type="date" min={new Date().toISOString().slice(0, 10)} {...register("appointmentDate")} />
              <FieldError message={errors.appointmentDate?.message} />
            </div>
            <div>
              <Label>Khung giờ</Label>
              <Select {...register("appointmentTime")}>
                <option value="">Chọn giờ</option>
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </Select>
              <FieldError message={errors.appointmentTime?.message} />
            </div>
          </div>

          <div>
            <Label>Nhân viên ưu tiên</Label>
            <Select {...register("staffId")}>
              <option value="">Salon sẽ gợi ý người phù hợp nhất</option>
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.specialties || "Beauty expert"}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <Label>Họ tên</Label>
              <Input {...register("customerName")} />
              <FieldError message={errors.customerName?.message} />
            </div>
            <div>
              <Label>Số điện thoại</Label>
              <Input {...register("customerPhone")} />
              <FieldError message={errors.customerPhone?.message} />
            </div>
          </div>

          <div>
            <Label>Email</Label>
            <Input type="email" {...register("customerEmail")} />
            <FieldError message={errors.customerEmail?.message} />
          </div>

          <div>
            <Label>Phương thức thanh toán</Label>
            <Select {...register("paymentMethod")}>
              {PAYMENT_OPTIONS.filter((option) => option.value !== "CASH_ON_DELIVERY").map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Ghi chú thêm</Label>
            <Textarea
              rows={4}
              placeholder="Ví dụ: thích phong cách nude, cần form mi nhẹ nhàng..."
              {...register("note")}
            />
          </div>

          {serverError ? <FieldError message={serverError} /> : null}

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang xác nhận lịch..." : "Xác nhận đặt lịch"}
          </Button>
        </form>
      </Card>

      <Card className="h-fit">
        <div className="eyebrow">Tóm tắt buổi hẹn</div>
        <h3 className="mt-4 text-2xl">Beauty slot của bạn</h3>
        <div className="mt-6 space-y-4">
          {selectedServices.length ? (
            selectedServices.map((item) => (
              <div key={item.id} className="rounded-2xl bg-petal/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{item.name}</p>
                    <p className="mt-1 text-sm text-cocoa/75">{item.duration} phút</p>
                  </div>
                  <div className="font-semibold text-cocoa">{formatCurrency(item.price)}</div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm leading-7 text-cocoa/75">
              Chọn dịch vụ bên trái để hệ thống tính tổng chi phí và thời lượng dự kiến.
            </p>
          )}
        </div>
        <div className="mt-6 rounded-3xl bg-ink p-5 text-white">
          <div className="flex items-center justify-between text-sm">
            <span>Tổng dịch vụ</span>
            <span>{selectedServices.length}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span>Thời lượng dự kiến</span>
            <span>{totalDuration} phút</span>
          </div>
          <div className="mt-4 text-3xl font-display">{formatCurrency(totalPrice)}</div>
        </div>
        <FieldHint>Salon sẽ xác nhận lại kỹ thuật viên và thời gian phù hợp sau khi bạn hoàn tất.</FieldHint>
      </Card>
    </div>
  );
};

export default BookingForm;

