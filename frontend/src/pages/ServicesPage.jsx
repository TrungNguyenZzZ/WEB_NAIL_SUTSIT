import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { serviceApi } from "../services/api";
import { Button, EmptyState, Input, LoadingBlock, PageHero, Select } from "../components/ui";
import { ServiceCard } from "../components/shared/CommerceCards";

const ServicesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
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
        const [categoryResponse, serviceResponse] = await Promise.all([
          serviceApi.categories(),
          serviceApi.list({
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
        setServices(serviceResponse.items);
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

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Service catalogue"
        title="Chọn dịch vụ nail, mi hoặc combo theo đúng mood của ngày hôm nay."
        description="Danh sách dịch vụ được trình bày rõ giá, thời lượng và mô tả ngắn để khách có thể quyết định nhanh hơn."
      />

      <div className="section-shell">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <Input
            placeholder="Tìm dịch vụ theo tên hoặc mô tả..."
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
            <option value="duration-asc">Thời gian tăng dần</option>
            <option value="duration-desc">Thời gian giảm dần</option>
          </Select>
        </div>
      </div>

      {loading ? (
        <LoadingBlock label="Đang tải danh sách dịch vụ..." />
      ) : services.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((item) => (
            <ServiceCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Chưa tìm thấy dịch vụ phù hợp"
          description="Hãy thử đổi từ khóa, danh mục hoặc thứ tự sắp xếp để khám phá thêm các lựa chọn khác."
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

export default ServicesPage;

