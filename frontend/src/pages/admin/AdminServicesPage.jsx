import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import AdminResourcePage from "../../components/shared/AdminResourcePage";
import { adminApi, serviceApi } from "../../services/api";
import { formatCurrency } from "../../utils/format";
import { toFormData } from "../../utils/formData";
import { LoadingBlock, PageHero, StatusBadge } from "../../components/ui";

const serviceSchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().trim().min(10),
  shortDescription: z.string().optional(),
  procedure: z.string().optional(),
  beforeCare: z.string().optional(),
  afterCare: z.string().optional(),
  price: z.coerce.number().positive(),
  duration: z.coerce.number().positive(),
  imageUrl: z.string().optional(),
  imageFile: z.any().optional(),
  status: z.string().min(1),
  featured: z.boolean().optional(),
  categoryId: z.string().min(1)
});

const AdminServicesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await serviceApi.categories();
        setCategories(response.items);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const fields = useMemo(
    () => [
      { name: "name", label: "Tên dịch vụ", placeholder: "Nail art cô dâu tối giản" },
      { name: "categoryId", label: "Danh mục", type: "select", options: categories.map((item) => ({ value: item.id, label: item.name })) },
      { name: "price", label: "Giá", type: "number", min: 0 },
      { name: "duration", label: "Thời lượng (phút)", type: "number", min: 15 },
      { name: "shortDescription", label: "Mô tả ngắn", placeholder: "Mềm mại, tinh tế, hợp tiệc nhẹ." },
      { name: "description", label: "Mô tả đầy đủ", type: "textarea", rows: 5 },
      { name: "procedure", label: "Quy trình", type: "textarea", rows: 5, helpText: "Mỗi bước một dòng để frontend hiển thị đẹp hơn." },
      { name: "beforeCare", label: "Lưu ý trước khi làm", type: "textarea" },
      { name: "afterCare", label: "Lưu ý sau khi làm", type: "textarea" },
      { name: "imageUrl", label: "Ảnh URL", placeholder: "https://..." },
      { name: "imageFile", label: "Upload ảnh", type: "file" },
      {
        name: "status",
        label: "Trạng thái",
        type: "select",
        options: [
          { value: "ACTIVE", label: "Hiển thị" },
          { value: "INACTIVE", label: "Ẩn" }
        ]
      },
      { name: "featured", label: "Nổi bật", type: "checkbox", checkboxLabel: "Đưa dịch vụ lên nhóm nổi bật" }
    ],
    [categories]
  );

  if (loading) {
    return <LoadingBlock label="Đang tải danh mục dịch vụ..." />;
  }

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Services admin"
        title="Quản lý bảng dịch vụ, giá, hình ảnh và nội dung tư vấn."
        description="Trang này được thiết kế để nhân sự salon có thể cập nhật nhanh nội dung hiển thị cho khách hàng lẫn luồng booking."
      />

      <AdminResourcePage
        title="Dịch vụ salon"
        description="Thêm mới hoặc chỉnh sửa các dịch vụ nail, mi, combo và chăm sóc móng."
        formSchema={serviceSchema}
        defaultValues={{
          name: "",
          description: "",
          shortDescription: "",
          procedure: "",
          beforeCare: "",
          afterCare: "",
          price: 0,
          duration: 60,
          imageUrl: "",
          imageFile: undefined,
          status: "ACTIVE",
          featured: false,
          categoryId: categories[0]?.id ?? ""
        }}
        fields={fields}
        columns={[
          { key: "name", label: "Dịch vụ" },
          { key: "category", label: "Danh mục", render: (item) => item.category?.name },
          { key: "price", label: "Giá", render: (item) => formatCurrency(item.price) },
          { key: "duration", label: "Thời lượng", render: (item) => `${item.duration} phút` },
          { key: "status", label: "Trạng thái", render: (item) => <StatusBadge value={item.status} /> }
        ]}
        loadItems={() => serviceApi.list({ limit: 50, status: "ALL" })}
        createItem={(payload) => adminApi.createService(payload)}
        updateItem={(id, payload) => adminApi.updateService(id, payload)}
        deleteItem={adminApi.deleteService}
        transformIn={(item) => ({
          name: item.name,
          description: item.description,
          shortDescription: item.shortDescription ?? "",
          procedure: item.procedure ?? "",
          beforeCare: item.beforeCare ?? "",
          afterCare: item.afterCare ?? "",
          price: item.price,
          duration: item.duration,
          imageUrl: item.imageUrl ?? "",
          imageFile: undefined,
          status: item.status,
          featured: item.featured,
          categoryId: item.categoryId
        })}
        transformOut={(values) => toFormData(values)}
        emptyTitle="Chưa có dịch vụ"
        emptyDescription="Thêm một dịch vụ mới để hiển thị lên website và booking flow."
      />
    </div>
  );
};

export default AdminServicesPage;

