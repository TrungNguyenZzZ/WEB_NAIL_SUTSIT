import { useEffect, useState } from "react";
import { appointmentApi, staffApi } from "../../services/api";
import { formatCurrency, formatDate } from "../../utils/format";
import { Button, Card, EmptyState, Input, LoadingBlock, PageHero, Select, StatusBadge } from "../../components/ui";

const APPOINTMENT_STATUS_OPTIONS = ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"];
const PAYMENT_STATUS_OPTIONS = ["PENDING", "PAID", "REFUNDED"];

const AdminAppointmentsPage = () => {
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    date: "",
    staffId: ""
  });
  const [staff, setStaff] = useState([]);
  const [items, setItems] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [staffResponse, appointmentResponse] = await Promise.all([
        staffApi.list({ status: "ALL" }),
        appointmentApi.adminList({
          ...filters,
          status: filters.status || undefined,
          date: filters.date || undefined,
          staffId: filters.staffId || undefined,
          search: filters.search || undefined
        })
      ]);
      setStaff(staffResponse.items);
      setItems(appointmentResponse.items);
      setDrafts(
        Object.fromEntries(
          appointmentResponse.items.map((item) => [
            item.id,
            {
              status: item.status,
              paymentStatus: item.paymentStatus,
              internalNote: item.internalNote ?? "",
              staffId: item.staffId ?? ""
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
  }, [filters.search, filters.status, filters.date, filters.staffId]);

  const updateDraft = (appointmentId, key, value) => {
    setDrafts((previous) => ({
      ...previous,
      [appointmentId]: {
        ...previous[appointmentId],
        [key]: value
      }
    }));
  };

  const saveAppointment = async (appointmentId) => {
    await appointmentApi.updateStatus(appointmentId, drafts[appointmentId]);
    await loadData();
  };

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Appointments admin"
        title="Theo dõi, xác nhận và điều phối lịch hẹn theo ngày hoặc theo nhân viên."
        description="Admin có thể cập nhật trạng thái, ghi chú nội bộ và chỉ định kỹ thuật viên trực tiếp từ một màn quản lý tập trung."
      />

      <Card>
        <div className="grid gap-4 lg:grid-cols-4">
          <Input
            placeholder="Tìm theo mã, tên khách hoặc SĐT..."
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
          />
          <Select value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}>
            <option value="">Tất cả trạng thái</option>
            {APPOINTMENT_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
          <Input type="date" value={filters.date} onChange={(event) => setFilters((prev) => ({ ...prev, date: event.target.value }))} />
          <Select value={filters.staffId} onChange={(event) => setFilters((prev) => ({ ...prev, staffId: event.target.value }))}>
            <option value="">Tất cả nhân viên</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {loading ? (
        <LoadingBlock label="Đang tải lịch hẹn..." />
      ) : items.length ? (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div className="xl:w-[32%]">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl">{item.code}</h3>
                    <StatusBadge value={item.status} />
                  </div>
                  <p className="mt-3 text-sm text-cocoa/75">
                    {item.customerName} • {item.customerPhone}
                  </p>
                  <p className="mt-2 text-sm text-cocoa/75">
                    {formatDate(item.appointmentDate)} lúc {item.appointmentTime}
                  </p>
                  <div className="mt-3 text-sm text-cocoa/80">{item.items.map((service) => service.serviceName).join(", ")}</div>
                  <div className="mt-4 font-semibold text-ink">{formatCurrency(item.totalPrice)}</div>
                </div>

                <div className="grid flex-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-cocoa">Trạng thái lịch hẹn</label>
                    <Select value={drafts[item.id]?.status || item.status} onChange={(event) => updateDraft(item.id, "status", event.target.value)}>
                      {APPOINTMENT_STATUS_OPTIONS.map((status) => (
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
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-cocoa">Nhân viên phụ trách</label>
                    <Select value={drafts[item.id]?.staffId || ""} onChange={(event) => updateDraft(item.id, "staffId", event.target.value)}>
                      <option value="">Salon gợi ý</option>
                      {staff.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-cocoa">Ghi chú nội bộ</label>
                    <Input
                      value={drafts[item.id]?.internalNote || ""}
                      onChange={(event) => updateDraft(item.id, "internalNote", event.target.value)}
                      placeholder="Ví dụ: khách thích tông nude..."
                    />
                  </div>
                </div>

                <div className="xl:w-[150px]">
                  <Button className="w-full" onClick={() => saveAppointment(item.id)}>
                    Lưu cập nhật
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="Chưa có lịch hẹn phù hợp bộ lọc" description="Thử đổi ngày hoặc trạng thái để xem thêm dữ liệu." />
      )}
    </div>
  );
};

export default AdminAppointmentsPage;

