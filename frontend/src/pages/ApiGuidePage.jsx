import { Badge, Card, PageHero } from "../components/ui";

const apiSections = [
  {
    title: "Dịch vụ nail, mi",
    endpoint: "GET /api/services",
    note: "Lấy danh sách dịch vụ, hỗ trợ page, limit, search, category, sort và featured.",
    sample: `{
  "items": [
    {
      "id": "svc_001",
      "name": "Nail gel cơ bản",
      "slug": "nail-gel-co-ban",
      "price": 180000,
      "duration": 60,
      "status": "ACTIVE",
      "featured": true
    }
  ]
}`
  },
  {
    title: "Sản phẩm",
    endpoint: "GET /api/products",
    note: "Lấy danh sách sản phẩm, có thể lọc theo category, search, sort.",
    sample: `{
  "items": [
    {
      "id": "prd_001",
      "name": "Serum dưỡng mi",
      "slug": "serum-duong-mi",
      "price": 220000,
      "discountPrice": 189000,
      "stock": 15
    }
  ]
}`
  },
  {
    title: "Nhân viên",
    endpoint: "GET /api/staff",
    note: "Lấy danh sách kỹ thuật viên, hỗ trợ search và lọc theo serviceId.",
    sample: `{
  "items": [
    {
      "id": "staff_001",
      "name": "Trần Ngọc Anh",
      "specialties": "Nối mi, nail art",
      "workingHours": "09:00-18:00"
    }
  ]
}`
  },
  {
    title: "Lịch hẹn",
    endpoint: "POST /api/appointments",
    note: "Đặt lịch hẹn, cần JWT token của người dùng đã đăng nhập.",
    sample: `{
  "serviceIds": ["svc_001", "svc_002"],
  "staffId": "staff_001",
  "appointmentDate": "2026-07-10",
  "appointmentTime": "10:30",
  "customerName": "Nguyen Tai Trung",
  "customerPhone": "0909123456",
  "customerEmail": "nguyentaitrung26704@gmail.com",
  "paymentMethod": "SALON"
}`
  },
  {
    title: "Đơn hàng",
    endpoint: "POST /api/orders",
    note: "Tạo đơn hàng từ giỏ hàng, hỗ trợ discountCode và các phương thức thanh toán.",
    sample: `{
  "receiverName": "Nguyen Tai Trung",
  "receiverPhone": "0909123456",
  "receiverEmail": "nguyentaitrung26704@gmail.com",
  "receiverAddress": "123 Nguyen Trai, Quan 1, TP.HCM",
  "paymentMethod": "CASH_ON_DELIVERY",
  "discountCode": "SUMMER10"
}`
  }
];

const extraEndpoints = [
  "GET /api/service-categories",
  "GET /api/product-categories",
  "GET /api/appointments/my-appointments",
  "GET /api/orders/my-orders",
  "GET /api/cart",
  "POST /api/cart/add",
  "POST /api/discounts/apply",
  "GET /api/admin/orders"
];

const ApiGuidePage = () => {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="API guide"
        title="API mẫu cho SỤT SỊT NAIL"
        description="Trang này tổng hợp các endpoint mẫu cho dịch vụ nail, mi, sản phẩm, lịch hẹn, nhân viên và đơn hàng. Base URL sẽ là domain backend của bạn cộng thêm /api."
      />

      <Card className="bg-white/85">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Base URL</Badge>
          <code className="rounded-2xl bg-ink px-4 py-2 text-sm text-white">
            https://your-backend-domain.com/api
          </code>
        </div>
        <p className="mt-4 text-sm leading-7 text-cocoa/80">
          Các API cần đăng nhập gửi kèm header:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-[28px] bg-cocoa/95 p-5 text-sm text-white">
{`Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json`}
        </pre>
      </Card>

      <section className="grid gap-6 xl:grid-cols-2">
        {apiSections.map((section) => (
          <Card key={section.title} className="bg-white/90">
            <div className="flex flex-wrap items-center gap-3">
              <Badge>{section.title}</Badge>
              <code className="rounded-full bg-petal px-3 py-1 text-xs font-semibold text-cocoa">
                {section.endpoint}
              </code>
            </div>
            <p className="mt-4 text-sm leading-7 text-cocoa/80">{section.note}</p>
            <pre className="mt-5 overflow-x-auto rounded-[28px] bg-cocoa/95 p-5 text-sm text-white">
              {section.sample}
            </pre>
          </Card>
        ))}
      </section>

      <Card className="bg-white/85">
        <h2 className="text-3xl">Thêm các endpoint hữu ích</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {extraEndpoints.map((endpoint) => (
            <div key={endpoint} className="rounded-2xl bg-petal/70 px-4 py-3 text-sm font-semibold text-cocoa">
              {endpoint}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ApiGuidePage;
