import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LockKeyhole, Sparkles, UserPlus } from "lucide-react";
import { Button, Card, PageHero } from "../components/ui";
import AuthForm from "../components/forms/AuthForm";

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get("mode") === "register" ? "register" : "login";
  const redirect = useMemo(() => searchParams.get("redirect") || "/account", [searchParams]);

  const switchMode = (nextMode) => {
    const next = new URLSearchParams(searchParams);
    next.set("mode", nextMode);
    setSearchParams(next);
  };

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Welcome back"
        title="Đăng nhập để đặt lịch, theo dõi lịch hẹn và quản lý đơn hàng."
        description="Tài khoản giúp bạn lưu lịch sử làm đẹp, giỏ hàng và trạng thái đơn sản phẩm ở cùng một nơi."
      />

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="bg-ink text-white">
          <div className="eyebrow bg-white/10 text-white/80">Why create an account</div>
          <div className="mt-5 space-y-4">
            {[
              {
                icon: LockKeyhole,
                title: "Theo dõi lịch hẹn",
                description: "Xem trạng thái xác nhận, lịch sử đặt lịch và hủy hẹn trong khung thời gian cho phép."
              },
              {
                icon: Sparkles,
                title: "Lưu gu làm đẹp",
                description: "Dễ dàng quay lại dịch vụ yêu thích hoặc mua lại sản phẩm đã hợp với bạn."
              },
              {
                icon: UserPlus,
                title: "Quản lý đơn hàng",
                description: "Theo dõi thanh toán, giao hàng và các mã giảm giá đã dùng trước đó."
              }
            ].map((item) => (
              <div key={item.title} className="rounded-3xl bg-white/10 p-5">
                <item.icon className="h-6 w-6 text-white" />
                <h3 className="mt-4 text-2xl text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/80">{item.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex gap-3">
            <Button variant={mode === "login" ? "primary" : "secondary"} onClick={() => switchMode("login")}>
              Đăng nhập
            </Button>
            <Button variant={mode === "register" ? "primary" : "secondary"} onClick={() => switchMode("register")}>
              Đăng ký
            </Button>
          </div>
          <div className="mt-6">
            <h2 className="text-3xl">{mode === "register" ? "Tạo tài khoản mới" : "Đăng nhập tài khoản"}</h2>
            <p className="mt-3 text-sm leading-7 text-cocoa/80">
              {mode === "register"
                ? "Điền thông tin cơ bản để bắt đầu đặt lịch và mua sắm trên Blush Bloom."
                : "Sử dụng email và mật khẩu đã đăng ký để tiếp tục."}
            </p>
          </div>
          <div className="mt-8">
            <AuthForm
              mode={mode}
              onSuccess={() => {
                navigate(redirect, { replace: true });
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;

