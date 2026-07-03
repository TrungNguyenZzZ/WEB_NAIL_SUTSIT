import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { appointmentApi, authApi, orderApi } from "../services/api";
import { useAppStore } from "../store/useAppStore";
import { formatCurrency, formatDate, formatStatusLabel } from "../utils/format";
import { Button, Card, EmptyState, FieldError, Input, Label, LoadingBlock, PageHero, StatusBadge } from "../components/ui";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Vui lòng nhập họ tên."),
  phone: z.string().trim().min(8, "Số điện thoại chưa hợp lệ."),
  address: z.string().trim().min(6, "Vui lòng nhập địa chỉ."),
  avatarUrl: z.string().optional()
});

const AccountPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const updateUser = useAppStore((state) => state.updateUser);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notice, setNotice] = useState("");

  const activeTab = searchParams.get("tab") || "profile";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      avatarUrl: ""
    }
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [meResponse, appointmentResponse, orderResponse] = await Promise.all([
        authApi.me(),
        appointmentApi.mine(),
        orderApi.mine()
      ]);
      updateUser(meResponse.user);
      reset({
        name: meResponse.user.name ?? "",
        phone: meResponse.user.phone ?? "",
        address: meResponse.user.address ?? "",
        avatarUrl: meResponse.user.avatarUrl ?? ""
      });
      setAppointments(appointmentResponse.items);
      setOrders(orderResponse.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const appointmentCode = searchParams.get("code");
    if (appointmentCode) {
      setNotice(`Đã ghi nhận thao tác mới với mã: ${appointmentCode}`);
    }
  }, []);

  const appointmentCountText = useMemo(() => `${appointments.length} lịch hẹn`, [appointments.length]);
  const orderCountText = useMemo(() => `${orders.length} đơn hàng`, [orders.length]);

  const updateProfile = async (values) => {
    try {
      const response = await authApi.updateProfile(values);
      updateUser(response.user);
      setNotice("Thông tin tài khoản đã được cập nhật.");
    } catch (error) {
      setNotice(error.message || "Không thể cập nhật thông tin.");
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      await appointmentApi.cancel(appointmentId);
      await loadData();
      setSearchParams(new URLSearchParams({ tab: "appointments" }));
      setNotice("Đã hủy lịch hẹn thành công.");
    } catch (error) {
      setNotice(error.message || "Không thể hủy lịch hẹn.");
    }
  };

  if (loading) {
    return <LoadingBlock label="Đang tải tài khoản của bạn..." />;
  }

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="My account"
        title="Theo dõi mọi lịch hẹn và đơn hàng làm đẹp của bạn."
        description="Tài khoản cá nhân là nơi lưu thông tin liên hệ, lịch sử booking và các đơn mua beauty care sau mỗi lần ghé salon."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Thông tin cá nhân", "profile"],
          [appointmentCountText, "appointments"],
          [orderCountText, "orders"]
        ].map(([label, value]) => (
          <Button
            key={value}
            variant={activeTab === value ? "primary" : "secondary"}
            onClick={() => setSearchParams(new URLSearchParams({ tab: value }))}
            className="justify-start"
          >
            {label}
          </Button>
        ))}
      </div>

      {notice ? <Card className="text-sm text-cocoa">{notice}</Card> : null}

      {activeTab === "profile" ? (
        <Card>
          <h2 className="text-3xl">Thông tin cá nhân</h2>
          <form className="mt-6 grid gap-5 md:grid-cols-2" onSubmit={handleSubmit(updateProfile)}>
            <div>
              <Label>Họ tên</Label>
              <Input {...register("name")} />
              <FieldError message={errors.name?.message} />
            </div>
            <div>
              <Label>Số điện thoại</Label>
              <Input {...register("phone")} />
              <FieldError message={errors.phone?.message} />
            </div>
            <div className="md:col-span-2">
              <Label>Địa chỉ</Label>
              <Input {...register("address")} />
              <FieldError message={errors.address?.message} />
            </div>
            <div className="md:col-span-2">
              <Label>Avatar URL</Label>
              <Input {...register("avatarUrl")} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {activeTab === "appointments" ? (
        appointments.length ? (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl">{appointment.code}</h3>
                      <StatusBadge value={appointment.status} />
                    </div>
                    <p className="mt-3 text-sm text-cocoa/75">
                      {formatDate(appointment.appointmentDate)} lúc {appointment.appointmentTime}
                    </p>
                    <div className="mt-4 space-y-2 text-sm text-cocoa/80">
                      {appointment.items.map((item) => (
                        <div key={item.id}>
                          • {item.serviceName} - {formatCurrency(item.price)}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3 lg:text-right">
                    <div className="text-lg font-semibold text-ink">{formatCurrency(appointment.totalPrice)}</div>
                    {["PENDING", "CONFIRMED"].includes(appointment.status) ? (
                      <Button variant="secondary" onClick={() => cancelAppointment(appointment.id)}>
                        Hủy lịch
                      </Button>
                    ) : null}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Bạn chưa có lịch hẹn nào"
            description="Hãy tạo một lịch hẹn mới để theo dõi ngay trong tài khoản."
          />
        )
      ) : null}

      {activeTab === "orders" ? (
        orders.length ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl">{order.code}</h3>
                      <StatusBadge value={order.orderStatus} />
                      <StatusBadge value={order.paymentStatus} />
                    </div>
                    <p className="mt-3 text-sm text-cocoa/75">
                      Tạo ngày {formatDate(order.createdAt)} - Thanh toán {formatStatusLabel(order.paymentStatus)}
                    </p>
                    <div className="mt-4 space-y-2 text-sm text-cocoa/80">
                      {order.items.map((item) => (
                        <div key={item.id}>
                          • {item.productName} x {item.quantity}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 lg:text-right">
                    <div className="text-lg font-semibold text-ink">{formatCurrency(order.finalPrice)}</div>
                    <div className="text-sm text-cocoa/70">{order.receiverAddress}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Bạn chưa có đơn hàng nào"
            description="Khi mua sản phẩm beauty care, lịch sử đơn sẽ xuất hiện ở đây."
          />
        )
      ) : null}
    </div>
  );
};

export default AccountPage;
