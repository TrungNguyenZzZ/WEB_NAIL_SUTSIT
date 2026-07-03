import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cartApi, productApi } from "../services/api";
import { useAppStore } from "../store/useAppStore";
import { Button, EmptyState, Input, LoadingBlock, PageHero, Select } from "../components/ui";
import { ProductCard } from "../components/shared/CommerceCards";

const ProductsPage = () => {
  const navigate = useNavigate();
  const token = useAppStore((state) => state.token);
  const setCartSummary = useAppStore((state) => state.setCartSummary);
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = {
    search: searchParams.get("search") ?? "",
    category: searchParams.get("category") ?? "",
    sort: searchParams.get("sort") ?? "newest"
  };

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const [categoryResponse, productResponse] = await Promise.all([
          productApi.categories(),
          productApi.list({
            limit: 12,
            search: filters.search || undefined,
            category: filters.category || undefined,
            sort: filters.sort
          })
        ]);

        if (!active) {
          return;
        }

        setCategories(categoryResponse.items);
        setProducts(productResponse.items);
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
  }, [filters.search, filters.category, filters.sort]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const addToCart = async (product) => {
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

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Beauty aftercare"
        title="Mua thêm những món nhỏ giúp giữ hiệu quả sau mỗi buổi làm đẹp."
        description="Từ serum dưỡng mi đến dầu dưỡng móng, các sản phẩm được sắp xếp rõ ràng để khách dễ tìm và dễ thêm vào giỏ."
      />

      <div className="section-shell">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <Input
            placeholder="Tìm sản phẩm dưỡng, sơn móng, dụng cụ..."
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
          />
          <Select value={filters.category} onChange={(event) => updateFilter("category", event.target.value)}>
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </Select>
          <Select value={filters.sort} onChange={(event) => updateFilter("sort", event.target.value)}>
            <option value="newest">Mới nhất</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
            <option value="best-selling">Bán chạy</option>
          </Select>
        </div>
      </div>

      {loading ? (
        <LoadingBlock label="Đang tải sản phẩm..." />
      ) : products.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((item) => (
            <ProductCard key={item.id} item={item} onAddToCart={addToCart} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Chưa tìm thấy sản phẩm phù hợp"
          description="Hãy thử thay đổi từ khóa hoặc chọn danh mục khác để xem thêm lựa chọn."
          action={
            <Button variant="secondary" onClick={() => setSearchParams(new URLSearchParams())}>
              Xóa bộ lọc
            </Button>
          }
        />
      )}
    </div>
  );
};

export default ProductsPage;

