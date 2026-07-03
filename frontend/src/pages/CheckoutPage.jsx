import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cartApi } from "../services/api";
import { useAppStore } from "../store/useAppStore";
import { EmptyState, LoadingBlock, PageHero, buttonStyles } from "../components/ui";
import CheckoutForm from "../components/forms/CheckoutForm";

const CheckoutPage = () => {
  const currentUser = useAppStore((state) => state.user);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const response = await cartApi.get();
        if (!active) {
          return;
        }
        setCart(response.item);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <LoadingBlock label="Đang chuẩn bị bước thanh toán..." />;
  }

  if (!cart?.items?.length) {
    return (
      <EmptyState
        title="Không có sản phẩm để thanh toán"
        description="Hãy thêm sản phẩm vào giỏ trước khi đi tới bước tạo đơn hàng."
        action={
          <Link to="/products" className={buttonStyles()}>
            Tiếp tục mua sắm
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Checkout"
        title="Điền thông tin nhận hàng và hoàn tất đơn mua beauty care."
        description="Hệ thống sẽ lưu toàn bộ đơn hàng vào database để bạn theo dõi về sau trong tài khoản cá nhân."
      />

      <CheckoutForm cart={cart} currentUser={currentUser} />
    </div>
  );
};

export default CheckoutPage;
