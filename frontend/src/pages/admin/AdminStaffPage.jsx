import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import AdminResourcePage from "../../components/shared/AdminResourcePage";
import { adminApi, serviceApi, staffApi } from "../../services/api";
import { toFormData } from "../../utils/formData";
import { LoadingBlock, PageHero, StatusBadge } from "../../components/ui";

const staffSchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().optional(),
  email: z.string().optional(),
  description: z.string().optional(),
  specialties: z.string().optional(),
  workingDays: z.string().optional(),
  workingHours: z.string().optional(),
  avatarUrl: z.string().optional(),
  imageFile: z.any().optional(),
  status: z.string().min(1),
  serviceIds: z.array(z.string()).optional()
});

const AdminStaffPage = () => {
  const [serviceOptions, setServiceOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await serviceApi.list({ limit: 100, status: "ALL" });
        setServiceOptions(
          response.items.map((item) => ({
            value: item.id,
            label: item.name,
            description: item.category?.name
          }))
        );
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const fields = useMemo(
    () => [
      { name: "name", label: "Tên nhân viên", placeholder: "Nguyễn Khánh Linh" },
      { name: "phone", label: "Số điện thoại", placeholder: "0909..." },
      { name: "email", label: "Email", placeholder: "staff@blushbloom.vn" },
      { name: "specialties", label: "Chuyên môn", placeholder: "Nail art, Lash lift..." },
      { name: "workingDays", label: "Ngày làm việc", placeholder: "Thứ 2 - Thứ 7" },
      { name: "workingHours", label: "Khung giờ", placeholder: "09:00 - 18:00" },
      { name: "description", label: "Mô tả", type: "textarea", rows: 4 },
      { name: "avatarUrl", label: "Avatar URL", placeholder: "https://..." },
      { name: "imageFile", label: "Upload avatar", type: "file" },
      {
        name: "status",
        label: "Trạng thái",
        type: "select",
        options: [
          { value: "ACTIVE", label: "Đang hiển thị" },
          { value: "INACTIVE", label: "Đã ẩn" }
        ]
      },
      {
        name: "serviceIds",
        label: "Dịch vụ phụ trách",
        type: "multiselect",
        options: serviceOptions
      }
    ],
    [serviceOptions]
  );

  if (loading) {
    return <LoadingBlock label="Đang tải dịch vụ để gán cho nhân viên..." />;
  }

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Staff admin"
        title="Quản lý kỹ thuật viên, khung giờ làm việc và dịch vụ phụ trách."
        description="Thông tin staff được dùng ở booking flow để khách có thể chọn người phù hợp và salon điều phối dễ hơn."
      />

      <AdminResourcePage
        title="Nhân viên và kỹ thuật viên"
        description="Tạo hồ sơ staff, thêm ảnh đại diện và gán những dịch vụ mà từng người có thể thực hiện."
        formSchema={staffSchema}
        defaultValues={{
          name: "",
          phone: "",
          email: "",
          description: "",
          specialties: "",
          workingDays: "",
          workingHours: "",
          avatarUrl: "",
          imageFile: undefined,
          status: "ACTIVE",
          serviceIds: []
        }}
        fields={fields}
        columns={[
          { key: "name", label: "Nhân viên" },
          { key: "specialties", label: "Chuyên môn" },
          { key: "workingHours", label: "Giờ làm" },
          {
            key: "services",
            label: "Dịch vụ",
            render: (item) => item.services?.map((service) => service.service.name).join(", ")
          },
          { key: "status", label: "Trạng thái", render: (item) => <StatusBadge value={item.status} /> }
        ]}
        loadItems={() => staffApi.list({ status: "ALL" })}
        createItem={(payload) => adminApi.createStaff(payload)}
        updateItem={(id, payload) => adminApi.updateStaff(id, payload)}
        deleteItem={adminApi.deleteStaff}
        transformIn={(item) => ({
          name: item.name,
          phone: item.phone ?? "",
          email: item.email ?? "",
          description: item.description ?? "",
          specialties: item.specialties ?? "",
          workingDays: item.workingDays ?? "",
          workingHours: item.workingHours ?? "",
          avatarUrl: item.avatarUrl ?? "",
          imageFile: undefined,
          status: item.status,
          serviceIds: item.services?.map((service) => service.serviceId) ?? []
        })}
        transformOut={(values) => {
          const payload = {
            ...values,
            serviceIds: values.serviceIds ?? [],
            avatarUrl: values.avatarUrl
          };
          return toFormData(payload);
        }}
        emptyTitle="Chưa có nhân viên"
        emptyDescription="Thêm đội ngũ kỹ thuật viên để booking flow có thể gợi ý theo chuyên môn."
      />
    </div>
  );
};

export default AdminStaffPage;

