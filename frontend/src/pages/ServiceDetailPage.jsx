import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Clock3, Star, Users2 } from "lucide-react";
import { serviceApi } from "../services/api";
import { formatCurrency, toBulletList } from "../utils/format";
import { DEFAULT_AVATAR_FALLBACK, DEFAULT_IMAGE_FALLBACK, resolveImageUrl } from "../utils/media";
import { Badge, Button, Card, LoadingBlock, PageHero, buttonStyles } from "../components/ui";
import { ReviewCard, ServiceCard } from "../components/shared/CommerceCards";

const ServiceDetailPage = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [relatedServices, setRelatedServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const response = await serviceApi.detail(id);
        if (!active) {
          return;
        }
        setService(response.item);
        setRelatedServices(response.relatedServices);
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

  if (loading) {
    return <LoadingBlock label="Đang tải chi tiết dịch vụ..." />;
  }

  if (!service) {
    return null;
  }

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow={service.category?.name || "Dịch vụ"}
        title={service.name}
        description={service.description}
        actions={[
          <Link key="booking" to={`/booking?service=${service.id}`} className="inline-flex items-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
            Đặt lịch ngay
          </Link>
        ]}
      />

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="overflow-hidden p-0">
          <img
            src={resolveImageUrl(service.imageUrl, DEFAULT_IMAGE_FALLBACK)}
            alt={service.name}
            className="h-full min-h-[420px] w-full object-cover"
          />
        </Card>

        <Card>
          <div className="flex flex-wrap gap-3">
            <Badge>{service.category?.name}</Badge>
            {service.featured ? <Badge className="bg-mint/70">Featured</Badge> : null}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-petal/70 p-4">
              <div className="text-sm text-cocoa/75">Chi phí</div>
              <div className="mt-2 text-2xl font-display">{formatCurrency(service.price)}</div>
            </div>
            <div className="rounded-3xl bg-mint/60 p-4">
              <div className="text-sm text-cocoa/75">Thời lượng</div>
              <div className="mt-2 flex items-center gap-2 text-2xl font-display">
                <Clock3 className="h-5 w-5" />
                {service.duration} phút
              </div>
            </div>
            <div className="rounded-3xl bg-sand/80 p-4">
              <div className="text-sm text-cocoa/75">Đánh giá</div>
              <div className="mt-2 flex items-center gap-2 text-2xl font-display">
                <Star className="h-5 w-5 fill-current text-rose" />
                {service.averageRating}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <div className="rounded-3xl bg-white/70 p-5">
              <h3 className="text-xl">Quy trình thực hiện</h3>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-cocoa/80">
                {toBulletList(service.procedure).map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-white/70 p-5">
                <h3 className="text-xl">Trước khi làm</h3>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-cocoa/80">
                  {toBulletList(service.beforeCare).map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl bg-white/70 p-5">
                <h3 className="text-xl">Sau khi làm</h3>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-cocoa/80">
                  {toBulletList(service.afterCare).map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="section-shell">
        <div className="flex items-center gap-3">
          <Users2 className="h-5 w-5 text-cocoa" />
          <h2 className="text-3xl">Nhân viên có thể thực hiện</h2>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {service.staffAssignments?.map((assignment) => (
            <Card key={assignment.id} className="bg-white/90">
              <div className="flex items-center gap-4">
                <img
                  src={resolveImageUrl(assignment.staff.avatarUrl, DEFAULT_AVATAR_FALLBACK)}
                  alt={assignment.staff.name}
                  className="h-16 w-16 rounded-2xl object-cover"
                />
                <div>
                  <div className="font-semibold text-ink">{assignment.staff.name}</div>
                  <div className="text-sm text-cocoa/75">{assignment.staff.specialties}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <h2 className="text-3xl">Đánh giá khách hàng</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {service.reviews?.length ? (
            service.reviews.map((review) => <ReviewCard key={review.id} item={review} />)
          ) : (
            <Card className="md:col-span-2 xl:col-span-3">Chưa có đánh giá cho dịch vụ này.</Card>
          )}
        </div>
      </section>

      <section className="section-shell">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-3xl">Dịch vụ liên quan</h2>
          <Link to="/services" className={buttonStyles({ variant: "secondary" })}>
            Xem tất cả
          </Link>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {relatedServices.map((item) => (
            <ServiceCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default ServiceDetailPage;
