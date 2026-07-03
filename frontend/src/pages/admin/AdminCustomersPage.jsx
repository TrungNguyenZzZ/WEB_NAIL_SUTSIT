import { useEffect, useState } from "react";
import { adminApi } from "../../services/api";
import { Button, Card, DataTable, Input, LoadingBlock, PageHero, Select, StatusBadge } from "../../components/ui";

const AdminCustomersPage = () => {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await adminApi.users({ search: search || undefined });
      setItems(response.items);
      setDrafts(
        Object.fromEntries(
          response.items.map((item) => [
            item.id,
            {
              role: item.role,
              status: item.status
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
  }, [search]);

  const updateDraft = (userId, key, value) => {
    setDrafts((previous) => ({
      ...previous,
      [userId]: {
        ...previous[userId],
        [key]: value
      }
    }));
  };

  const saveUser = async (userId) => {
    await adminApi.updateUser(userId, drafts[userId]);
    await loadData();
  };

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Customers admin"
        title="Quản lý người dùng, vai trò và trạng thái tài khoản."
        description="Admin có thể xem nhanh ai đang hoạt động nhiều, ai có nhiều lịch hẹn hoặc đơn hàng, đồng thời khoá/mở khoá tài khoản khi cần."
      />

      <Card>
        <Input
          placeholder="Tìm theo tên, email hoặc số điện thoại..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </Card>

      {loading ? (
        <LoadingBlock label="Đang tải danh sách khách hàng..." />
      ) : (
        <DataTable
          columns={[
            { key: "name", label: "Khách hàng" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Số điện thoại" },
            {
              key: "counts",
              label: "Lịch sử",
              render: (item) => `${item._count?.appointments ?? 0} lịch hẹn • ${item._count?.orders ?? 0} đơn`
            },
            {
              key: "role",
              label: "Vai trò",
              render: (item) => (
                <Select value={drafts[item.id]?.role || item.role} onChange={(event) => updateDraft(item.id, "role", event.target.value)}>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </Select>
              )
            },
            {
              key: "status",
              label: "Trạng thái",
              render: (item) => (
                <div className="space-y-2">
                  <StatusBadge value={item.status} />
                  <Select value={drafts[item.id]?.status || item.status} onChange={(event) => updateDraft(item.id, "status", event.target.value)}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="BLOCKED">BLOCKED</option>
                  </Select>
                </div>
              )
            }
          ]}
          rows={items}
          emptyTitle="Chưa có người dùng nào"
          emptyDescription="Khi khách đăng ký tài khoản, dữ liệu sẽ xuất hiện tại đây."
          actions={(item) => (
            <Button size="sm" onClick={() => saveUser(item.id)}>
              Lưu
            </Button>
          )}
        />
      )}
    </div>
  );
};

export default AdminCustomersPage;

