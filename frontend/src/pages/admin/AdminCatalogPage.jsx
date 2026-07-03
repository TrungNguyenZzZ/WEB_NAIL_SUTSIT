import { z } from "zod";
import { adminApi, productApi, serviceApi } from "../../services/api";
import AdminResourcePage from "../../components/shared/AdminResourcePage";
import { PageHero } from "../../components/ui";

const categorySchema = z.object({
  name: z.string().trim().min(2, "Tên danh mục là bắt buộc."),
  description: z.string().optional()
});

const categoryFields = [
  { name: "name", label: "Tên danh mục", placeholder: "Ví dụ: Nail" },
  { name: "description", label: "Mô tả", type: "textarea", placeholder: "Mô tả ngắn về danh mục" }
];

const categoryColumns = [
  { key: "name", label: "Tên" },
  { key: "description", label: "Mô tả" },
  {
    key: "count",
    label: "Số lượng",
    render: (item) => item._count?.services ?? item._count?.products ?? 0
  }
];

const AdminCatalogPage = () => (
  <div className="space-y-8">
    <PageHero
      eyebrow="Catalog admin"
      title="Quản lý các danh mục nền tảng cho dịch vụ và sản phẩm."
      description="Danh mục rõ ràng sẽ giúp frontend lọc nhanh hơn và khách hàng dễ khám phá đúng nhóm nội dung cần tìm."
    />

    <AdminResourcePage
      title="Danh mục dịch vụ"
      description="Tạo hoặc chỉnh sửa các nhóm như Nail, Mi, Combo và chăm sóc móng."
      formSchema={categorySchema}
      defaultValues={{ name: "", description: "" }}
      fields={categoryFields}
      columns={categoryColumns}
      loadItems={serviceApi.categories}
      createItem={adminApi.createServiceCategory}
      updateItem={adminApi.updateServiceCategory}
      deleteItem={adminApi.deleteServiceCategory}
      emptyTitle="Chưa có danh mục dịch vụ"
      emptyDescription="Thêm một danh mục mới để phân loại dịch vụ."
    />

    <AdminResourcePage
      title="Danh mục sản phẩm"
      description="Tạo nhóm sản phẩm dưỡng móng, dưỡng mi, sơn móng và các aftercare essentials."
      formSchema={categorySchema}
      defaultValues={{ name: "", description: "" }}
      fields={categoryFields}
      columns={categoryColumns}
      loadItems={productApi.categories}
      createItem={adminApi.createProductCategory}
      updateItem={adminApi.updateProductCategory}
      deleteItem={adminApi.deleteProductCategory}
      emptyTitle="Chưa có danh mục sản phẩm"
      emptyDescription="Tạo danh mục để tổ chức beauty shop rõ ràng hơn."
    />
  </div>
);

export default AdminCatalogPage;

