import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import AdminResourcePage from "../../components/shared/AdminResourcePage";
import { adminApi, productApi } from "../../services/api";
import { formatCurrency } from "../../utils/format";
import { toFormData } from "../../utils/formData";
import { LoadingBlock, PageHero, StatusBadge } from "../../components/ui";

const productSchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().trim().min(10),
  benefits: z.string().optional(),
  usageInstructions: z.string().optional(),
  price: z.coerce.number().positive(),
  discountPrice: z.union([z.coerce.number().nonnegative(), z.nan()]).optional(),
  stock: z.coerce.number().nonnegative(),
  imageUrl: z.string().optional(),
  imageFile: z.any().optional(),
  status: z.string().min(1),
  featured: z.boolean().optional(),
  categoryId: z.string().min(1)
});

const AdminProductsPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await productApi.categories();
        setCategories(response.items);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const fields = useMemo(
    () => [
      { name: "name", label: "Tên sản phẩm", placeholder: "Serum dưỡng mi peptide" },
      { name: "categoryId", label: "Danh mục", type: "select", options: categories.map((item) => ({ value: item.id, label: item.name })) },
      { name: "price", label: "Giá gốc", type: "number", min: 0 },
      { name: "discountPrice", label: "Giá khuyến mãi", type: "number", min: 0 },
      { name: "stock", label: "Tồn kho", type: "number", min: 0 },
      { name: "description", label: "Mô tả", type: "textarea", rows: 5 },
      { name: "benefits", label: "Công dụng", type: "textarea", rows: 4 },
      { name: "usageInstructions", label: "Hướng dẫn sử dụng", type: "textarea", rows: 4 },
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
      { name: "featured", label: "Nổi bật", type: "checkbox", checkboxLabel: "Đưa sản phẩm lên nhóm nổi bật" }
    ],
    [categories]
  );

  if (loading) {
    return <LoadingBlock label="Đang tải danh mục sản phẩm..." />;
  }

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Products admin"
        title="Quản lý beauty shop, tồn kho và các sản phẩm aftercare."
        description="Mỗi sản phẩm đều có mô tả, giá bán, ảnh và trạng thái hiển thị để đồng bộ với giỏ hàng và checkout."
      />

      <AdminResourcePage
        title="Sản phẩm bán kèm"
        description="Thêm serum, dầu dưỡng, sơn móng hoặc gift box để mở rộng doanh thu sau dịch vụ."
        formSchema={productSchema}
        defaultValues={{
          name: "",
          description: "",
          benefits: "",
          usageInstructions: "",
          price: 0,
          discountPrice: undefined,
          stock: 0,
          imageUrl: "",
          imageFile: undefined,
          status: "ACTIVE",
          featured: false,
          categoryId: categories[0]?.id ?? ""
        }}
        fields={fields}
        columns={[
          { key: "name", label: "Sản phẩm" },
          { key: "category", label: "Danh mục", render: (item) => item.category?.name },
          { key: "price", label: "Giá", render: (item) => formatCurrency(item.discountPrice || item.price) },
          { key: "stock", label: "Tồn kho" },
          { key: "status", label: "Trạng thái", render: (item) => <StatusBadge value={item.status} /> }
        ]}
        loadItems={() => productApi.list({ limit: 50, status: "ALL" })}
        createItem={(payload) => adminApi.createProduct(payload)}
        updateItem={(id, payload) => adminApi.updateProduct(id, payload)}
        deleteItem={adminApi.deleteProduct}
        transformIn={(item) => ({
          name: item.name,
          description: item.description,
          benefits: item.benefits ?? "",
          usageInstructions: item.usageInstructions ?? "",
          price: item.price,
          discountPrice: item.discountPrice ?? undefined,
          stock: item.stock,
          imageUrl: item.imageUrl ?? "",
          imageFile: undefined,
          status: item.status,
          featured: item.featured,
          categoryId: item.categoryId
        })}
        transformOut={(values) => toFormData(values)}
        emptyTitle="Chưa có sản phẩm"
        emptyDescription="Thêm sản phẩm beauty care đầu tiên để hoàn thiện flow mua sắm."
      />
    </div>
  );
};

export default AdminProductsPage;
