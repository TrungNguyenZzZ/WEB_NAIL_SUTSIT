import { useEffect, useState } from "react";
import { orderApi } from "../../services/api";
import { formatCurrency, formatDate } from "../../utils/format";
import { Button, Card, EmptyState, Input, LoadingBlock, PageHero, Select, StatusBadge } from "../../components/ui";

const ORDER_STATUS_OPTIONS = ["PENDING", "CONFIRMED", "SHIPPING", "DELIVERED", "CANCELLED"];
const PAYMENT_STATUS_OPTIONS = ["PENDING", "PAID", "REFUNDED"];

const AdminOrdersPage = () => {
  const [filters, setFilters] = useState({
    search: "",
    orderStatus: "",
    paymentStatus: ""
  });
  const [items, setItems] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await orderApi.adminList({
        search: filters.search || undefined,
        orderStatus: filters.orderStatus || undefined,
        paymentStatus: filters.paymentStatus || undefined
      });
      setItems(response.items);
      setDrafts(
        Object.fromEntries(
          response.items.map((item) => [
            item.id,
            {
              orderStatus: item.orderStatus,
              paymentStatus: item.paymentStatus
            }
          ])
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters.search, filters.orderStatus, filters.paymentStatus]);

  const updateDraft = (orderId, key, value) => {
    setDrafts((previous) => ({
      ...previous,
      [orderId]: {
        ...previous[orderId],
        [key]: value
      }
    }));
  };

  const persistOrder = async (orderId) => {
    await orderApi.updateStatus(orderId, drafts[orderId]);
    await loadData();
  };

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Orders admin"
        title="Quản lý đơn sản phẩm, giao hàng và trạng thái thanh toán."
        description="Theo dõi toàn bộ quy trình từ lúc khách đặt hàng đến khi giao xong, hoàn tiền hoặc huỷ đơn nếu cần."
      />

      <Card>
        <div className="grid gap-4 lg:grid-cols-3">
          <Input
            placeholder="Tìm theo mã đơn, tên người nhận, email..."
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
          />
          <Select value={filters.orderStatus} onChange={(event) => setFilters((prev) => ({ ...prev, orderStatus: event.target.value }))}>
            <option value="">Tất cả trạng thái đơn</option>
            {ORDER_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
          <Select value={filters.paymentStatus} onChange={(event) => setFilters((prev) => ({ ...prev, paymentStatus: event.target.value }))}>
            <option value="">Tất cả trạng thái thanh toán</option>
            {PAYMENT_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {loading ? (
        <LoadingBlock label="Đang tải đơn hàng..." />
      ) : items.length ? (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div className="xl:w-[34%]">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl">{item.code}</h3>
                    <StatusBadge value={item.orderStatus} />
                    <StatusBadge value={item.paymentStatus} />
                  </div>
                  <p className="mt-3 text-sm text-cocoa/75">
                    {item.receiverName} • {item.receiverPhone}
                  </p>
                  <p className="mt-2 text-sm text-cocoa/75">{formatDate(item.createdAt)}</p>
                  <div className="mt-3 text-sm text-cocoa/80">{item.items.map((product) => `${product.productName} x${product.quantity}`).join(", ")}</div>
                  <div className="mt-4 font-semibold text-ink">{formatCurrency(item.finalPrice)}</div>
                </div>

                <div className="grid flex-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-cocoa">Trạng thái đơn</label>
                    <Select value={drafts[item.id]?.orderStatus || item.orderStatus} onChange={(event) => updateDraft(item.id, "orderStatus", event.target.value)}>
                      {ORDER_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-cocoa">Thanh toán</label>
                    <Select value={drafts[item.id]?.paymentStatus || item.paymentStatus} onChange={(event) => updateDraft(item.id, "paymentStatus", event.target.value)}>
                      {PAYMENT_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="md:col-span-2 rounded-3xl bg-petal/70 p-4 text-sm leading-7 text-cocoa/80">
                    <div className="font-semibold text-ink">Giao tới</div>
                    <div>{item.receiverAddress}</div>
                    <div className="mt-2">Email: {item.receiverEmail}</div>
                  </div>
                </div>

                <div className="xl:w-[150px]">
                  <Button className="w-full" onClick={() => persistOrder(item.id)}>
                    Lưu cập nhật
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="Chưa có đơn hàng phù hợp bộ lọc" description="Điều chỉnh trạng thái hoặc từ khóa để xem thêm dữ liệu." />
      )}
    </div>
  );
};

export default AdminOrdersPage;
