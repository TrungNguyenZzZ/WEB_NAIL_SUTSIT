import { Link } from "react-router-dom";
import { Card, buttonStyles } from "../components/ui";

const NotFoundPage = () => (
  <div className="flex min-h-screen items-center justify-center p-6">
    <Card className="max-w-xl text-center">
      <div className="eyebrow">404</div>
      <h1 className="mt-4 text-5xl">Trang bạn tìm không tồn tại.</h1>
      <p className="mt-4 text-sm leading-7 text-cocoa/80">
        Có thể đường dẫn đã thay đổi hoặc nội dung không còn khả dụng. Bạn có thể quay lại trang chủ để tiếp tục.
      </p>
      <Link to="/" className={buttonStyles({ className: "mt-6 inline-flex" })}>
        Về trang chủ
      </Link>
    </Card>
  </div>
);

export default NotFoundPage;
