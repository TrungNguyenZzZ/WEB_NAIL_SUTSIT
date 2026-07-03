import { z } from "zod";
import AdminResourcePage from "../../components/shared/AdminResourcePage";
import { discountApi } from "../../services/api";
import { formatCurrency, formatDate } from "../../utils/format";
import { PageHero, StatusBadge } from "../../components/ui";

const discountSchema = z.object({
  code: z.string().trim().min(2),
  description: z.string().optional(),
  type: z.string().min(1),
  value: z.coerce.number().positive(),
  applyTo: z.string().min(1),
  minOrderValue: z.coerce.number().nonnegative().optional(),
  maxUses: z.coerce.number().positive().optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  status: z.string().min(1)
});

const AdminDiscountsPage = () => (
  <div className="space-y-8">
    <PageHero
      eyebrow="Discounts admin"
      title="Quản lý mã giảm giá cho dịch vụ, sản phẩm hoặc toàn hệ thống."
      description="Thiết lập phần trăm hoặc số tiền cố định, thời gian hiệu lực và số lần sử dụng tối đa ngay trong một màn duy nhất."
    />

    <AdminResourcePage
      title="Mã giảm giá"
      description="Tạo các campaign ngắn hạn hoặc mã ưu đãi dành riêng cho khách quay lại."
      formSchema={discountSchema}
      defaultValues={{
        code: "",
        description: "",
        type: "PERCENT",
        value: 10,
        applyTo: "ALL",
        minOrderValue: 0,
        maxUses: 100,
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
        status: "ACTIVE"
      }}
      fields={[
        { name: "code", label: "Mã giảm giá", placeholder: "HELLO10" },
        { name: "description", label: "Mô tả", type: "textarea", rows: 4 },
        {
          name: "type",
          label: "Loại giảm giá",
          type: "select",
          options: [
            { value: "PERCENT", label: "Theo phần trăm" },
            { value: "FIXED", label: "Theo số tiền" }
          ]
        },
        { name: "value", label: "Giá trị", type: "number", min: 0 },
        {
          name: "applyTo",
          label: "Áp dụng cho",
          type: "select",
          options: [
            { value: "ALL", label: "Toàn hệ thống" },
            { value: "SERVICE", label: "Dịch vụ" },
            { value: "PRODUCT", label: "Sản phẩm" }
          ]
        },
        { name: "minOrderValue", label: "Giá trị tối thiểu", type: "number", min: 0 },
        { name: "maxUses", label: "Số lần dùng tối đa", type: "number", min: 1 },
        { name: "startDate", label: "Ngày bắt đầu", type: "text", placeholder: "YYYY-MM-DD" },
        { name: "endDate", label: "Ngày kết thúc", type: "text", placeholder: "YYYY-MM-DD" },
        {
          name: "status",
          label: "Trạng thái",
          type: "select",
          options: [
            { value: "ACTIVE", label: "Đang hoạt động" },
            { value: "INACTIVE", label: "Tạm dừng" }
          ]
        }
      ]}
      columns={[
        { key: "code", label: "Mã" },
        { key: "applyTo", label: "Áp dụng cho" },
        {
          key: "value",
          label: "Giá trị",
          render: (item) => (item.type === "PERCENT" ? `${item.value}%` : formatCurrency(item.value))
        },
        {
          key: "dateRange",
          label: "Thời gian",
          render: (item) => `${formatDate(item.startDate)} - ${formatDate(item.endDate)}`
        },
        { key: "status", label: "Trạng thái", render: (item) => <StatusBadge value={item.status} /> }
      ]}
      loadItems={discountApi.adminList}
      createItem={discountApi.create}
      updateItem={discountApi.update}
      deleteItem={discountApi.remove}
      transformIn={(item) => ({
        code: item.code,
        description: item.description ?? "",
        type: item.type,
        value: item.value,
        applyTo: item.applyTo,
        minOrderValue: item.minOrderValue ?? 0,
        maxUses: item.maxUses ?? 100,
        startDate: item.startDate.slice(0, 10),
        endDate: item.endDate.slice(0, 10),
        status: item.status
      })}
      emptyTitle="Chưa có mã giảm giá"
      emptyDescription="Tạo mã ưu đãi đầu tiên để thúc đẩy booking hoặc mua sắm."
    />
  </div>
);

export default AdminDiscountsPage;
