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
      window.alert(error.message || "KhÃ´ng thá»ƒ thÃªm sáº£n pháº©m vÃ o giá».");
    }
  };

  return (
    <div className="space-y-10">
      <PageHero
        eyebrow="Beauty booking and commerce"
        title="Má»™t tráº£i nghiá»‡m lÃ m Ä‘áº¹p nháº¹ nhÃ ng, ná»¯ tÃ­nh vÃ  ráº¥t dá»… Ä‘áº·t lá»‹ch."
        description="SỤT SỊT NAIL gom dá»‹ch vá»¥ nail, mi vÃ  beauty care vÃ o cÃ¹ng má»™t há»‡ thá»‘ng hiá»‡n Ä‘áº¡i Ä‘á»ƒ khÃ¡ch hÃ ng cÃ³ thá»ƒ xem dá»‹ch vá»¥, book slot, mua sáº£n pháº©m vÃ  theo dÃµi má»i thá»© gá»n trong má»™t nÆ¡i."
        actions={[
          <Link key="booking" to="/booking" className={buttonStyles({ size: "lg" })}>
            Äáº·t lá»‹ch ngay
          </Link>,
          <Link key="products" to="/products" className={buttonStyles({ variant: "secondary", size: "lg" })}>
            KhÃ¡m phÃ¡ sáº£n pháº©m
          </Link>
        ]}
      />

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="section-shell bg-white/80">
          <SectionHeading
            eyebrow="Signature mood"
            title="Thiáº¿t káº¿ cho nhá»‹p sá»‘ng hiá»‡n Ä‘áº¡i nhÆ°ng váº«n giá»¯ cáº£m giÃ¡c soft, thoÃ¡ng vÃ  thÆ° thÃ¡i."
            description="Tá»« lÃºc chá»n dá»‹ch vá»¥ tá»›i lÃºc chá»‘t lá»‹ch háº¹n, má»i mÃ n hÃ¬nh Ä‘á»u Ä‘Æ°á»£c tá»‘i Æ°u Ä‘á»ƒ rÃµ rÃ ng, Ã­t bÆ°á»›c vÃ  Ä‘áº¹p máº¯t trÃªn cáº£ mobile láº«n desktop."
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
          <StatCard label="Lá»‹ch háº¹n gá»£i Ã½" value="09:30 - 18:30" note="CÃ¡c khung giá» Ä‘Æ°á»£c tá»‘i Æ°u cho nail, mi vÃ  combo thÆ° giÃ£n." />
          <StatCard label="ChÄƒm sÃ³c táº¡i nhÃ " value="30+ sáº£n pháº©m" note="Serum dÆ°á»¡ng mi, dáº§u dÆ°á»¡ng mÃ³ng, top coat, mask tay chÃ¢n vÃ  gift box." />
          <Card className="overflow-hidden bg-ink text-white">
            <div className="eyebrow bg-white/10 text-white/85">Beauty flow</div>
            <h3 className="mt-4 text-3xl text-white">Xem dá»‹ch vá»¥, Ä‘áº·t lá»‹ch, mua thÃªm sáº£n pháº©m.</h3>
            <p className="mt-4 text-sm leading-7 text-white/80">
              Má»™t flow liá»n máº¡ch giÃºp salon upsell tá»± nhiÃªn hÆ¡n vÃ  khÃ¡ch hÃ ng tháº¥y tiá»‡n hÆ¡n.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <HeartHandshake className="h-5 w-5" />
              <span className="text-sm">ChÄƒm sÃ³c cáº£ trÆ°á»›c vÃ  sau dá»‹ch vá»¥</span>
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {PROMO_BANNERS.map((promo) => (
          <Card key={promo.title} className={promo.accent}>
            <div className="eyebrow">Æ¯u Ä‘Ã£i ná»•i báº­t</div>
            <h3 className="mt-4 text-3xl">{promo.title}</h3>
            <p className="mt-3 text-sm leading-7 text-cocoa/80">{promo.description}</p>
            <Link to="/booking" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink">
              Chá»n lá»‹ch ngay
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        ))}
      </section>

      <section className="section-shell">
        <SectionHeading
          eyebrow="Featured services"
          title="Dá»‹ch vá»¥ ná»•i báº­t cho nhá»¯ng ngÃ y báº¡n muá»‘n mÃ¬nh chá»‰n chu hÆ¡n má»™t chÃºt."
          description="CÃ¡c dá»‹ch vá»¥ Ä‘Æ°á»£c chá»n lá»c tá»« nail, mi tá»›i combo lÃ m Ä‘áº¹p Ä‘ang Ä‘Æ°á»£c khÃ¡ch Ä‘áº·t nhiá»u."
        />
        {loading ? (
          <LoadingBlock label="Äang táº£i dá»‹ch vá»¥ ná»•i báº­t..." />
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
          title="Sáº£n pháº©m giá»¯ Ä‘á»™ Ä‘áº¹p sau khi rá»i salon."
          description="KhÃ¡ch cÃ³ thá»ƒ thÃªm cÃ¡c sáº£n pháº©m dÆ°á»¡ng ngay trong cÃ¹ng flow Ä‘áº·t lá»‹ch hoáº·c mua riÃªng nhÆ° má»™t mini beauty shop."
        />
        {loading ? (
          <LoadingBlock label="Äang táº£i sáº£n pháº©m ná»•i báº­t..." />
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
            title="Beauty ritual Ä‘Æ°á»£c cÃ¡ nhÃ¢n hÃ³a theo gu, thá»i gian vÃ  mood cá»§a tá»«ng khÃ¡ch."
            description="Má»—i dá»‹ch vá»¥ Ä‘á»u cÃ³ mÃ´ táº£, quy trÃ¬nh, lÆ°u Ã½ vÃ  sáº£n pháº©m liÃªn quan Ä‘á»ƒ khÃ¡ch chá»§ Ä‘á»™ng hÆ¡n trÆ°á»›c khi Ä‘áº·t lá»‹ch."
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
          <h3 className="mt-4 text-3xl text-white">SỤT SỊT NAIL trong má»™t buá»•i háº¹n.</h3>
          <div className="mt-6 space-y-4">
            {[
              "1. Chá»n dá»‹ch vá»¥ hoáº·c combo theo Ä‘Ãºng nhu cáº§u.",
              "2. Chá»n ngÃ y, giá», ká»¹ thuáº­t viÃªn vÃ  thanh toÃ¡n mong muá»‘n.",
              "3. Nháº­n mÃ£ lá»‹ch háº¹n, mua thÃªm aftercare náº¿u cáº§n.",
              "4. Theo dÃµi lá»‹ch háº¹n vÃ  Ä‘Æ¡n hÃ ng ngay trong tÃ i khoáº£n cÃ¡ nhÃ¢n."
            ].map((step) => (
              <div key={step} className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/85">
                {step}
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-3 rounded-3xl bg-white/10 p-4">
            <ShoppingBasket className="h-6 w-6" />
            <div>
              <div className="text-sm font-semibold">Giá» hÃ ng vÃ  Ä‘Æ¡n hÃ ng</div>
              <div className="text-sm text-white/75">Há»— trá»£ mÃ£ giáº£m giÃ¡, COD vÃ  chuyá»ƒn khoáº£n.</div>
            </div>
          </div>
        </Card>
      </section>

      <section className="section-shell">
        <SectionHeading
          eyebrow="Customer love"
          title="Nhá»¯ng pháº£n há»“i Ä‘iá»ƒn hÃ¬nh tá»« khÃ¡ch hÃ ng yÃªu thÃ­ch sá»± gá»n gÃ ng vÃ  tinh táº¿."
          description="Cáº£m giÃ¡c yÃªn tÃ¢m khi dá»‹ch vá»¥, chÄƒm sÃ³c sau lÃ m Ä‘áº¹p vÃ  lá»‹ch sá»­ Ä‘Æ¡n hÃ ng cÃ¹ng náº±m trÃªn má»™t há»‡ thá»‘ng."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <Card key={testimonial.name} className="bg-white/90">
              <div className="text-2xl text-rose">â€œ</div>
              <p className="mt-3 text-sm leading-7 text-cocoa/85">{testimonial.quote}</p>
              <div className="mt-5 font-semibold text-ink">{testimonial.name}</div>
              <div className="text-sm text-cocoa/70">{testimonial.role}</div>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <StatCard label="Average basket" value={formatCurrency(420000)} note="Káº¿t há»£p dá»‹ch vá»¥ cÃ¹ng aftercare giÃºp tÄƒng tráº£i nghiá»‡m vÃ  kháº£ nÄƒng quay láº¡i." />
        <StatCard label="Popular combo" value="Nail gel + Uá»‘n mi" note="Combo Ä‘Æ°á»£c thiáº¿t káº¿ cho khÃ¡ch vÄƒn phÃ²ng cáº§n Ä‘áº¹p nhanh mÃ  váº«n tinh táº¿." />
        <StatCard label="Signature palette" value="Rose, nude, mint" note="Báº£ng mÃ u mang cáº£m giÃ¡c sÃ¡ng da, má»m máº¯t vÃ  há»£p nhiá»u phong cÃ¡ch." />
      </section>
    </div>
  );
};

export default HomePage;


