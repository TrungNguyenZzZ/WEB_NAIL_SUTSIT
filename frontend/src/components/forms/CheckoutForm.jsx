import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { discountApi, orderApi } from "../../services/api";
import { PAYMENT_OPTIONS } from "../../utils/constants";
import { formatCurrency } from "../../utils/format";
import { useAppStore } from "../../store/useAppStore";
import {
  Button,
  Card,
  FieldError,
  FieldHint,
  Input,
  Label,
  Select,
  Textarea
} from "../ui";

const schema = z.object({
  receiverName: z.string().trim().min(2, "Vui lòng nhập họ tên."),
  receiverPhone: z.string().trim().min(8, "Số điện thoại chưa hợp lệ."),
  receiverEmail: z.string().trim().email("Email chưa hợp lệ."),
  receiverAddress: z.string().trim().min(8, "Vui lòng nhập địa chỉ nhận hàng."),
  note: z.string().optional(),
  paymentMethod: z.enum(["CASH_ON_DELIVERY", "BANK_TRANSFER", "VNPAY", "MOMO"]),
  discountCode: z.string().optional()
});

const CheckoutForm = ({ cart, currentUser }) => {
  const navigate = useNavigate();
  const setCartSummary = useAppStore((state) => state.setCartSummary);
  const [serverError, setServerError] = useState("");
  const [discountResult, setDiscountResult] = useState(null);
  const [discountMessage, setDiscountMessage] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      receiverName: currentUser?.name ?? "",
      receiverPhone: currentUser?.phone ?? "",
      receiverEmail: currentUser?.email ?? "",
      receiverAddress: currentUser?.address ?? "",
      note: "",
      paymentMethod: "CASH_ON_DELIVERY",
      discountCode: ""
    }
  });

  const discountCode = watch("discountCode");

  const summary = useMemo(() => {
    const subtotal = cart?.subtotal ?? 0;
    const discountAmount = discountResult?.discountAmount ?? 0;
    return {
      subtotal,
      discountAmount,
      finalPrice: subtotal - discountAmount
    };
  }, [cart?.subtotal, discountResult]);

  const handleApplyDiscount = async () => {
    if (!discountCode) {
      setDiscountMessage("Nhập mã giảm giá trước khi áp dụng.");
      return;
    }
    try {
      const response = await discountApi.apply({
        code: discountCode,
        subtotal: cart.subtotal,
        applyTo: "PRODUCT"
      });
      setDiscountResult(response.item);
      setDiscountMessage("Mã giảm giá đã được áp dụng.");
    } catch (error) {
      setDiscountResult(null);
      setDiscountMessage(error.message || "Không thể áp dụng mã giảm giá.");
    }
  };

  const onSubmit = async (values) => {
    setServerError("");
    try {
      const response = await orderApi.create(values);
      setCartSummary({
        totalItems: 0,
        subtotal: 0
      });
      navigate(`/account?tab=orders&code=${encodeURIComponent(response.item.code)}`);
    } catch (error) {
      setServerError(error.message || "Không thể tạo đơn hàng.");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <Label>Người nhận</Label>
              <Input {...register("receiverName")} />
              <FieldError message={errors.receiverName?.message} />
            </div>
            <div>
              <Label>Số điện thoại</Label>
              <Input {...register("receiverPhone")} />
              <FieldError message={errors.receiverPhone?.message} />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <Label>Email</Label>
              <Input type="email" {...register("receiverEmail")} />
              <FieldError message={errors.receiverEmail?.message} />
            </div>
            <div>
              <Label>Phương thức thanh toán</Label>
              <Select {...register("paymentMethod")}>
                {PAYMENT_OPTIONS.filter((option) => option.value !== "SALON").map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Label>Địa chỉ giao hàng</Label>
            <Input {...register("receiverAddress")} />
            <FieldError message={errors.receiverAddress?.message} />
          </div>

          <div>
            <Label>Ghi chú đơn hàng</Label>
            <Textarea rows={4} placeholder="Ví dụ: giao trong giờ hành chính..." {...register("note")} />
          </div>

          <div className="rounded-3xl bg-petal/70 p-5">
            <Label>Mã giảm giá</Label>
            <div className="flex flex-col gap-3 md:flex-row">
              <Input placeholder="HELLO10" {...register("discountCode")} />
              <Button type="button" variant="secondary" onClick={handleApplyDiscount}>
                Áp dụng
              </Button>
            </div>
            {discountMessage ? <FieldHint>{discountMessage}</FieldHint> : null}
          </div>

          {serverError ? <FieldError message={serverError} /> : null}

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang tạo đơn..." : "Hoàn tất thanh toán"}
          </Button>
        </form>
      </Card>

      <Card className="h-fit">
        <div className="eyebrow">Đơn hàng của bạn</div>
        <h3 className="mt-4 text-2xl">Order summary</h3>
        <div className="mt-6 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4 rounded-2xl bg-white/80 p-4">
              <div>
                <p className="font-semibold text-ink">{item.product.name}</p>
                <p className="mt-1 text-sm text-cocoa/75">
                  {item.quantity} x {formatCurrency(item.price)}
                </p>
              </div>
              <div className="font-semibold text-cocoa">{formatCurrency(item.price * item.quantity)}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-3xl bg-ink p-5 text-white">
          <div className="flex items-center justify-between text-sm">
            <span>Tạm tính</span>
            <span>{formatCurrency(summary.subtotal)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span>Giảm giá</span>
            <span>- {formatCurrency(summary.discountAmount)}</span>
          </div>
          <div className="mt-4 text-3xl font-display">{formatCurrency(summary.finalPrice)}</div>
        </div>
      </Card>
    </div>
  );
};

export default CheckoutForm;

