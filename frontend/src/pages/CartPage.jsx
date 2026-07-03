import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { cartApi } from "../services/api";
import { useAppStore } from "../store/useAppStore";
import { formatCurrency } from "../utils/format";
import { DEFAULT_IMAGE_FALLBACK, resolveImageUrl } from "../utils/media";
import { Button, Card, EmptyState, LoadingBlock, PageHero, buttonStyles } from "../components/ui";

const CartPage = () => {
  const setCartSummary = useAppStore((state) => state.setCartSummary);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const response = await cartApi.get();
      setCart(response.item);
      setCartSummary({
        totalItems: response.item.totalItems,
        subtotal: response.item.subtotal
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const updateItem = async (itemId, quantity) => {
    await cartApi.update(itemId, { quantity });
    await refresh();
  };

  const removeItem = async (itemId) => {
    await cartApi.remove(itemId);
    await refresh();
  };

  const clearCart = async () => {
    await cartApi.clear();
    await refresh();
  };

  if (loading) {
    return <LoadingBlock label="Đang tải giỏ hàng..." />;
  }

  if (!cart?.items?.length) {
    return (
      <div className="space-y-8">
        <PageHero
          eyebrow="Cart"
          title="Giỏ hàng của bạn đang trống."
          description="Thêm vài món beauty care để hệ thống sẵn sàng tạo đơn hàng và giao tận nơi."
        />
        <EmptyState
          title="Chưa có sản phẩm nào"
          description="Khám phá serum dưỡng mi, tinh dầu biểu bì và các set chăm sóc tại nhà."
          action={
            <Link to="/products" className={buttonStyles()}>
              Đi tới trang sản phẩm
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Cart"
        title="Kiểm tra lại giỏ hàng trước khi thanh toán."
        description="Bạn có thể tăng giảm số lượng, xoá sản phẩm hoặc chuyển thẳng sang bước tạo đơn hàng."
        actions={[
          <Button key="clear" variant="secondary" onClick={clearCart}>
            Xóa toàn bộ
          </Button>
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          {cart.items.map((item) => (
            <Card key={item.id} className="flex flex-col gap-4 md:flex-row md:items-center">
              <img
                src={resolveImageUrl(item.product.imageUrl, DEFAULT_IMAGE_FALLBACK)}
                alt={item.product.name}
                className="h-28 w-28 rounded-3xl object-cover"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl">{item.product.name}</h3>
                    <p className="mt-2 text-sm text-cocoa/75">{item.product.category?.name}</p>
                  </div>
                  <div className="text-lg font-semibold text-ink">{formatCurrency(item.price * item.quantity)}</div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="inline-flex items-center rounded-full bg-white/90 p-1">
                    <button
                      type="button"
                      className="rounded-full p-3 text-cocoa"
                      onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-12 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      className="rounded-full p-3 text-cocoa"
                      onClick={() => updateItem(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <Button variant="ghost" onClick={() => removeItem(item.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="h-fit">
          <div className="eyebrow">Order summary</div>
          <h2 className="mt-4 text-3xl">Tổng quan đơn hàng</h2>
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-sm text-cocoa/80">
              <span>Số lượng sản phẩm</span>
              <span>{cart.totalItems}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-cocoa/80">
              <span>Tạm tính</span>
              <span>{formatCurrency(cart.subtotal)}</span>
            </div>
          </div>
          <div className="mt-6 rounded-3xl bg-ink p-5 text-white">
            <div className="text-sm text-white/70">Tổng thanh toán</div>
            <div className="mt-3 text-3xl font-display">{formatCurrency(cart.subtotal)}</div>
          </div>
          <Link to="/checkout" className={buttonStyles({ className: "mt-6 flex w-full" })}>
            Tiến hành thanh toán
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default CartPage;
