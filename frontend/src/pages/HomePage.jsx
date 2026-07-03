import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, HeartHandshake, ShoppingBasket } from "lucide-react";
import { cartApi, productApi, serviceApi } from "../services/api";
import { useAppStore } from "../store/useAppStore";
import { HERO_FEATURES, PROMO_BANNERS, SALON_PILLARS, TESTIMONIALS } from "../utils/constants";
import { formatCurrency } from "../utils/format";
import { Button, Card, LoadingBlock, PageHero, SectionHeading, StatCard, buttonStyles } from "../components/ui";
import { ProductCard, ServiceCard } from "../components/shared/CommerceCards";

const HomePage = () => {
  const navigate = useNavigate();
  const token = useAppStore((state) => state.token);
  const setCartSummary = useAppStore((state) => state.setCartSummary);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadHomeData = async () => {
      try {
        const [servicesResponse, productsResponse] = await Promise.all([
          serviceApi.list({ limit: 4, featured: true }),
          productApi.list({ limit: 4, featured: true })
        ]);

        if (!active) {
          return;
        }

        setFeaturedServices(servicesResponse.items);
        setFeaturedProducts(productsResponse.items);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadHomeData();

    return () => {
      active = false;
    };
  }, []);

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
    <div className="space-y-10">
      <PageHero
        eyebrow="Beauty booking and commerce"
        title="Một trải nghiệm làm đẹp nhẹ nhàng, nữ tính và rất dễ đặt lịch."
        description="Blush Bloom gom dịch vụ nail, mi và beauty care vào cùng một hệ thống hiện đại để khách hàng có thể xem dịch vụ, book slot, mua sản phẩm và theo dõi mọi thứ gọn trong một nơi."
        actions={[
          <Link key="booking" to="/booking" className={buttonStyles({ size: "lg" })}>
            Đặt lịch ngay
          </Link>,
          <Link key="products" to="/products" className={buttonStyles({ variant: "secondary", size: "lg" })}>
            Khám phá sản phẩm
          </Link>
        ]}
      />

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="section-shell bg-white/80">
          <SectionHeading
            eyebrow="Signature mood"
            title="Thiết kế cho nhịp sống hiện đại nhưng vẫn giữ cảm giác soft, thoáng và thư thái."
            description="Từ lúc chọn dịch vụ tới lúc chốt lịch hẹn, mọi màn hình đều được tối ưu để rõ ràng, ít bước và đẹp mắt trên cả mobile lẫn desktop."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {HERO_FEATURES.map((feature) => (
              <motion.div key={feature.title} whileHover={{ y: -4 }}>
                <Card className="h-full bg-white/90">
                  <feature.icon className="h-8 w-8 text-rose" />
                  <h3 className="mt-4 text-xl">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-cocoa/80">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          <StatCard label="Lịch hẹn gợi ý" value="09:30 - 18:30" note="Các khung giờ được tối ưu cho nail, mi và combo thư giãn." />
          <StatCard label="Chăm sóc tại nhà" value="30+ sản phẩm" note="Serum dưỡng mi, dầu dưỡng móng, top coat, mask tay chân và gift box." />
          <Card className="overflow-hidden bg-ink text-white">
            <div className="eyebrow bg-white/10 text-white/85">Beauty flow</div>
            <h3 className="mt-4 text-3xl text-white">Xem dịch vụ, đặt lịch, mua thêm sản phẩm.</h3>
            <p className="mt-4 text-sm leading-7 text-white/80">
              Một flow liền mạch giúp salon upsell tự nhiên hơn và khách hàng thấy tiện hơn.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <HeartHandshake className="h-5 w-5" />
              <span className="text-sm">Chăm sóc cả trước và sau dịch vụ</span>
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {PROMO_BANNERS.map((promo) => (
          <Card key={promo.title} className={promo.accent}>
            <div className="eyebrow">Ưu đãi nổi bật</div>
            <h3 className="mt-4 text-3xl">{promo.title}</h3>
            <p className="mt-3 text-sm leading-7 text-cocoa/80">{promo.description}</p>
            <Link to="/booking" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink">
              Chọn lịch ngay
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        ))}
      </section>

      <section className="section-shell">
        <SectionHeading
          eyebrow="Featured services"
          title="Dịch vụ nổi bật cho những ngày bạn muốn mình chỉn chu hơn một chút."
          description="Các dịch vụ được chọn lọc từ nail, mi tới combo làm đẹp đang được khách đặt nhiều."
        />
        {loading ? (
          <LoadingBlock label="Đang tải dịch vụ nổi bật..." />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featuredServices.map((item) => (
              <ServiceCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <section className="section-shell">
        <SectionHeading
          eyebrow="Aftercare essentials"
          title="Sản phẩm giữ độ đẹp sau khi rời salon."
          description="Khách có thể thêm các sản phẩm dưỡng ngay trong cùng flow đặt lịch hoặc mua riêng như một mini beauty shop."
        />
        {loading ? (
          <LoadingBlock label="Đang tải sản phẩm nổi bật..." />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featuredProducts.map((item) => (
              <ProductCard key={item.id} item={item} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="section-shell">
          <SectionHeading
            eyebrow="Salon philosophy"
            title="Beauty ritual được cá nhân hóa theo gu, thời gian và mood của từng khách."
            description="Mỗi dịch vụ đều có mô tả, quy trình, lưu ý và sản phẩm liên quan để khách chủ động hơn trước khi đặt lịch."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {SALON_PILLARS.map((pillar) => (
              <Card key={pillar.title} className="bg-white/90">
                <pillar.icon className="h-8 w-8 text-cocoa" />
                <h3 className="mt-4 text-xl">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-7 text-cocoa/80">{pillar.description}</p>
              </Card>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden bg-gradient-to-br from-ink to-cocoa text-white">
          <div className="eyebrow bg-white/10 text-white/80">Quick look</div>
          <h3 className="mt-4 text-3xl text-white">Blush Bloom trong một buổi hẹn.</h3>
          <div className="mt-6 space-y-4">
            {[
              "1. Chọn dịch vụ hoặc combo theo đúng nhu cầu.",
              "2. Chọn ngày, giờ, kỹ thuật viên và thanh toán mong muốn.",
              "3. Nhận mã lịch hẹn, mua thêm aftercare nếu cần.",
              "4. Theo dõi lịch hẹn và đơn hàng ngay trong tài khoản cá nhân."
            ].map((step) => (
              <div key={step} className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/85">
                {step}
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-3 rounded-3xl bg-white/10 p-4">
            <ShoppingBasket className="h-6 w-6" />
            <div>
              <div className="text-sm font-semibold">Giỏ hàng và đơn hàng</div>
              <div className="text-sm text-white/75">Hỗ trợ mã giảm giá, COD và chuyển khoản.</div>
            </div>
          </div>
        </Card>
      </section>

      <section className="section-shell">
        <SectionHeading
          eyebrow="Customer love"
          title="Những phản hồi điển hình từ khách hàng yêu thích sự gọn gàng và tinh tế."
          description="Cảm giác yên tâm khi dịch vụ, chăm sóc sau làm đẹp và lịch sử đơn hàng cùng nằm trên một hệ thống."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <Card key={testimonial.name} className="bg-white/90">
              <div className="text-2xl text-rose">“</div>
              <p className="mt-3 text-sm leading-7 text-cocoa/85">{testimonial.quote}</p>
              <div className="mt-5 font-semibold text-ink">{testimonial.name}</div>
              <div className="text-sm text-cocoa/70">{testimonial.role}</div>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <StatCard label="Average basket" value={formatCurrency(420000)} note="Kết hợp dịch vụ cùng aftercare giúp tăng trải nghiệm và khả năng quay lại." />
        <StatCard label="Popular combo" value="Nail gel + Uốn mi" note="Combo được thiết kế cho khách văn phòng cần đẹp nhanh mà vẫn tinh tế." />
        <StatCard label="Signature palette" value="Rose, nude, mint" note="Bảng màu mang cảm giác sáng da, mềm mắt và hợp nhiều phong cách." />
      </section>
    </div>
  );
};

export default HomePage;

