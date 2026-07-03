import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarRange, Package, Sparkles } from "lucide-react";
import { adminApi } from "../../services/api";
import { formatCurrency, formatDate } from "../../utils/format";
import { Card, LoadingBlock, PageHero, StatCard, StatusBadge } from "../../components/ui";

const AdminDashboardPage = () => {
  const [data, setData] = useState({
    stats: null,
    revenue: [],
    todayAppointments: [],
    bestSellingProducts: [],
    topServices: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const [stats, revenue, todayAppointments, bestSellingProducts, topServices] = await Promise.all([
          adminApi.dashboardStats(),
          adminApi.revenue(),
          adminApi.todayAppointments(),
          adminApi.bestSellingProducts(),
          adminApi.topServices()
        ]);

        if (!active) {
          return;
        }

        setData({
          stats: stats.item,
          revenue: revenue.items,
          todayAppointments: todayAppointments.items,
          bestSellingProducts: bestSellingProducts.items,
          topServices: topServices.items
        });
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const revenuePeak = useMemo(
    () => Math.max(...data.revenue.map((item) => item.revenue), 1),
    [data.revenue]
  );

  if (loading) {
    return <LoadingBlock label="Đang tải dashboard..." />;
  }

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Admin dashboard"
        title="Tổng quan vận hành của salon ở một nơi rõ ràng và dễ đọc."
        description="Theo dõi doanh thu, lịch hẹn, đơn hàng và các hạng mục được đặt nhiều nhất để ra quyết định nhanh hơn."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Doanh thu đã thanh toán" value={formatCurrency(data.stats.totalRevenue)} note="Tổng doanh thu từ các đơn có trạng thái thanh toán thành công." />
        <StatCard label="Lịch hẹn" value={data.stats.totalAppointments} note="Bao gồm lịch chờ xác nhận, đã xác nhận và hoàn thành." />
        <StatCard label="Đơn sản phẩm" value={data.stats.totalOrders} note="Tổng số đơn beauty care đã phát sinh." />
        <StatCard label="Khách hàng" value={data.stats.totalCustomers} note="Tài khoản USER đang hoạt động trong hệ thống." />
        <StatCard label="Dịch vụ" value={data.stats.totalServices} note="Tổng danh mục dịch vụ khả dụng hoặc đã lưu trữ." />
        <StatCard label="Sản phẩm" value={data.stats.totalProducts} note="Kho sản phẩm hiện có trong hệ thống." />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-cocoa" />
            <h2 className="text-3xl">Revenue 7 ngày gần nhất</h2>
          </div>
          <div className="mt-6 grid gap-4">
            {data.revenue.map((item) => (
              <div key={item.date}>
                <div className="flex items-center justify-between text-sm text-cocoa/75">
                  <span>{formatDate(item.date)}</span>
                  <span>{formatCurrency(item.revenue)}</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-petal/70">
                  <div
                    className="h-full rounded-full bg-ink"
                    style={{ width: `${(item.revenue / revenuePeak) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <CalendarRange className="h-5 w-5 text-cocoa" />
            <h2 className="text-3xl">Lịch hôm nay</h2>
          </div>
          <div className="mt-6 space-y-4">
            {data.todayAppointments.length ? (
              data.todayAppointments.map((appointment) => (
                <div key={appointment.id} className="rounded-3xl bg-white/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-ink">{appointment.customerName}</div>
                      <div className="text-sm text-cocoa/75">
                        {appointment.appointmentTime} - {appointment.staff?.name || "Salon gợi ý"}
                      </div>
                    </div>
                    <StatusBadge value={appointment.status} />
                  </div>
                  <div className="mt-3 text-sm text-cocoa/80">
                    {appointment.items.map((item) => item.serviceName).join(", ")}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-cocoa/75">Hôm nay chưa có lịch hẹn nào.</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-cocoa" />
            <h2 className="text-3xl">Best-selling products</h2>
          </div>
          <div className="mt-6 space-y-4">
            {data.bestSellingProducts.map((product) => (
              <div key={product.productId} className="flex items-center justify-between rounded-3xl bg-white/80 p-4">
                <div>
                  <div className="font-semibold text-ink">{product.productName}</div>
                  <div className="text-sm text-cocoa/75">Sản phẩm bán chạy</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-cocoa">{product.sold}</div>
                  <div className="text-xs uppercase tracking-[0.16em] text-cocoa/60">Đã bán</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-cocoa" />
            <h2 className="text-3xl">Top booked services</h2>
          </div>
          <div className="mt-6 space-y-4">
            {data.topServices.map((service) => (
              <div key={service.serviceId} className="flex items-center justify-between rounded-3xl bg-white/80 p-4">
                <div>
                  <div className="font-semibold text-ink">{service.serviceName}</div>
                  <div className="text-sm text-cocoa/75">Dịch vụ nổi bật</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-cocoa">{service.booked}</div>
                  <div className="text-xs uppercase tracking-[0.16em] text-cocoa/60">Lượt đặt</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

