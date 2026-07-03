import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Star } from "lucide-react";
import { cartApi, productApi } from "../services/api";
import { useAppStore } from "../store/useAppStore";
import { formatCurrency, toBulletList } from "../utils/format";
import { DEFAULT_IMAGE_FALLBACK, resolveImageUrl } from "../utils/media";
import { Badge, Button, Card, LoadingBlock, PageHero, buttonStyles } from "../components/ui";
import { ProductCard, ReviewCard } from "../components/shared/CommerceCards";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useAppStore((state) => state.token);
  const setCartSummary = useAppStore((state) => state.setCartSummary);
  const [item, setItem] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const response = await productApi.detail(id);
        if (!active) {
          return;
        }
        setItem(response.item);
        setRelatedProducts(response.relatedProducts);
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
  }, [id]);

  const addToCart = async (selectedQuantity = quantity) => {
    if (!token) {
      navigate(`/auth?redirect=${encodeURIComponent(`/products/${id}`)}`);
      return false;
    }

    try {
      const response = await cartApi.add({
        productId: item.id,
        quantity: selectedQuantity
      });
      setCartSummary({
        totalItems: response.item.totalItems,
        subtotal: response.item.subtotal
      });
      window.alert("Đã thêm sản phẩm vào giỏ.");
      return true;
    } catch (error) {
      window.alert(error.message || "Không thể thêm sản phẩm vào giỏ.");
      return false;
    }
  };

  const addSpecificProductToCart = async (product) => {
    if (!token) {
      navigate("/auth?redirect=/products");
      return;
    }

    try {
      const response = await cartApi.add({
        productId: product.id,
        quantity: 1
      });
      setCartSummary({
        totalItems: response.item.totalItems,
        subtotal: response.item.subtotal
      });
    } catch (error) {
      window.alert(error.message || "Không thể thêm sản phẩm vào giỏ.");
    }
  };

  if (loading) {
    return <LoadingBlock label="Đang tải chi tiết sản phẩm..." />;
  }

  if (!item) {
    return null;
  }

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow={item.category?.name || "Sản phẩm"}
        title={item.name}
        description={item.description}
      />

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="overflow-hidden p-0">
          <img
            src={resolveImageUrl(item.imageUrl, DEFAULT_IMAGE_FALLBACK)}
            alt={item.name}
            className="h-full min-h-[420px] w-full object-cover"
          />
        </Card>

        <Card>
          <div className="flex flex-wrap gap-3">
            <Badge>{item.category?.name}</Badge>
            {item.featured ? <Badge className="bg-mint/70">Best pick</Badge> : null}
          </div>
          <div className="mt-5 flex items-end gap-4">
            <div className="text-4xl font-display text-ink">
              {formatCurrency(item.discountPrice || item.price)}
            </div>
            {item.discountPrice ? (
              <div className="pb-1 text-sm text-cocoa/55 line-through">{formatCurrency(item.price)}</div>
            ) : null}
          </div>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-cocoa/80">
            <span className="inline-flex items-center gap-2">
              <Star className="h-4 w-4 fill-current text-rose" />
              {item.averageRating} ({item.reviewCount} đánh giá)
            </span>
            <span>Còn {item.stock} sản phẩm</span>
          </div>

          <div className="mt-6 rounded-3xl bg-petal/70 p-5">
            <h3 className="text-xl">Công dụng nổi bật</h3>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-cocoa/80">
              {toBulletList(item.benefits).map((benefit) => (
                <li key={benefit}>• {benefit}</li>
              ))}
            </ul>
          </div>

          <div className="mt-4 rounded-3xl bg-white/70 p-5">
            <h3 className="text-xl">Hướng dẫn sử dụng</h3>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-cocoa/80">
              {toBulletList(item.usageInstructions).map((step) => (
                <li key={step}>• {step}</li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center rounded-full bg-white/80 p-1">
              <button
                type="button"
                className="rounded-full p-3 text-cocoa"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-12 text-center text-sm font-semibold">{quantity}</span>
              <button
                type="button"
                className="rounded-full p-3 text-cocoa"
                onClick={() => setQuantity((current) => Math.min(item.stock, current + 1))}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button onClick={() => addToCart()}>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Thêm vào giỏ
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                const added = await addToCart();
                if (added) {
                  navigate("/cart");
                }
              }}
            >
              Mua ngay
            </Button>
          </div>
        </Card>
      </section>

      <section className="section-shell">
        <h2 className="text-3xl">Đánh giá sản phẩm</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {item.reviews?.length ? (
            item.reviews.map((review) => <ReviewCard key={review.id} item={review} />)
          ) : (
            <Card className="md:col-span-2 xl:col-span-3">Chưa có đánh giá cho sản phẩm này.</Card>
          )}
        </div>
      </section>

      <section className="section-shell">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-3xl">Sản phẩm liên quan</h2>
          <Link to="/products" className={buttonStyles({ variant: "secondary" })}>
            Xem tất cả
          </Link>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {relatedProducts.map((product) => (
            <ProductCard key={product.id} item={product} onAddToCart={addSpecificProductToCart} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductDetailPage;
