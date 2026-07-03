import {
  CalendarHeart,
  PackageOpen,
  Sparkles,
  SwatchBook,
  TimerReset,
  WandSparkles
} from "lucide-react";

export const PUBLIC_NAV_ITEMS = [
  { label: "Trang chủ", href: "/" },
  { label: "Dịch vụ", href: "/services" },
  { label: "Sản phẩm", href: "/products" },
  { label: "Đặt lịch", href: "/booking" },
  { label: "Tài khoản", href: "/account" }
];

export const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Danh mục", href: "/admin/catalog" },
  { label: "Dịch vụ", href: "/admin/services" },
  { label: "Sản phẩm", href: "/admin/products" },
  { label: "Nhân viên", href: "/admin/staff" },
  { label: "Lịch hẹn", href: "/admin/appointments" },
  { label: "Đơn hàng", href: "/admin/orders" },
  { label: "Khách hàng", href: "/admin/customers" },
  { label: "Khuyến mãi", href: "/admin/discounts" }
];

export const HERO_FEATURES = [
  {
    icon: CalendarHeart,
    title: "Đặt lịch trong vài chạm",
    description: "Chọn dịch vụ, giờ hẹn và kỹ thuật viên theo đúng gu của bạn."
  },
  {
    icon: Sparkles,
    title: "Giao diện nhẹ và sang",
    description: "Tối ưu mobile, desktop và tablet với trải nghiệm mượt mà."
  },
  {
    icon: PackageOpen,
    title: "Mua sắm beauty care tiện lợi",
    description: "Thêm serum, dầu dưỡng và bộ quà chăm sóc ngay trong cùng hệ thống."
  }
];

export const SALON_PILLARS = [
  {
    icon: SwatchBook,
    title: "Bảng màu được tuyển chọn",
    description: "Pastel, nude, mint và các tone thanh lịch được phối để hợp da và hợp ảnh."
  },
  {
    icon: TimerReset,
    title: "Quy trình ít bước",
    description: "Từ chọn dịch vụ đến xác nhận lịch hẹn đều được rút gọn rõ ràng, dễ hiểu."
  },
  {
    icon: WandSparkles,
    title: "Feel-good beauty ritual",
    description: "Không chỉ làm đẹp, mỗi buổi hẹn còn là một khoảng nghỉ nhẹ nhàng cho ngày bận rộn."
  }
];

export const TESTIMONIALS = [
  {
    name: "Minh Anh",
    role: "Khách đặt lịch định kỳ",
    quote: "Mình đặt lịch rất nhanh, giao diện dễ dùng và phần gợi ý combo cực kỳ hợp lý."
  },
  {
    name: "Thu An",
    role: "Khách mua serum dưỡng mi",
    quote: "Sản phẩm và dịch vụ nằm chung một chỗ nên tiện theo dõi đơn hàng lẫn lịch hẹn."
  },
  {
    name: "Bảo Yến",
    role: "Khách cô dâu",
    quote: "Phong cách trang web rất nữ tính nhưng vẫn hiện đại, cảm giác đúng chất beauty studio."
  }
];

export const PROMO_BANNERS = [
  {
    title: "Combo weekend glow",
    description: "Đặt combo spa tay chân và uốn mi để nhận quà mini beauty care.",
    accent: "bg-gradient-to-br from-rose/20 via-white to-sand/40"
  },
  {
    title: "Tích điểm theo lịch hẹn",
    description: "Mỗi lần hoàn thành dịch vụ là thêm điểm đổi sản phẩm chăm sóc tại nhà.",
    accent: "bg-gradient-to-br from-mint/30 via-white to-petal"
  }
];

export const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30"
];

export const PAYMENT_OPTIONS = [
  { value: "SALON", label: "Thanh toán tại salon" },
  { value: "BANK_TRANSFER", label: "Chuyển khoản" },
  { value: "CASH_ON_DELIVERY", label: "COD" },
  { value: "VNPAY", label: "VNPay (mở rộng)" },
  { value: "MOMO", label: "MoMo (mở rộng)" }
];

export const STATUS_TONES = {
  ACTIVE: "bg-mint/60 text-cocoa",
  INACTIVE: "bg-sand text-cocoa",
  PENDING: "bg-sand text-cocoa",
  CONFIRMED: "bg-mint/70 text-cocoa",
  IN_PROGRESS: "bg-blush/60 text-cocoa",
  COMPLETED: "bg-ink text-white",
  CANCELLED: "bg-rose/25 text-cocoa",
  NO_SHOW: "bg-rose/35 text-cocoa",
  BLOCKED: "bg-rose/30 text-cocoa",
  PAID: "bg-mint/80 text-cocoa",
  REFUNDED: "bg-sand text-cocoa",
  SHIPPING: "bg-blush/55 text-cocoa",
  DELIVERED: "bg-ink text-white"
};

