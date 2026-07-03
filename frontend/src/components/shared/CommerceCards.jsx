import { Link } from "react-router-dom";
import { Clock3, ShoppingBag, Sparkles, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Badge, Button, Card, buttonStyles } from "../ui";
import { formatCurrency } from "../../utils/format";
import { DEFAULT_IMAGE_FALLBACK, resolveImageUrl } from "../../utils/media";

export const ServiceCard = ({ item }) => (
  <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.22 }}>
    <Card className="h-full overflow-hidden p-0">
      <img
        src={resolveImageUrl(item.imageUrl, DEFAULT_IMAGE_FALLBACK)}
        alt={item.name}
        className="h-56 w-full object-cover"
      />
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge>{item.category?.name}</Badge>
            <h3 className="mt-3 text-2xl">{item.name}</h3>
          </div>
          {item.featured ? <Sparkles className="mt-1 h-5 w-5 text-rose" /> : null}
        </div>
        <p className="text-sm leading-7 text-cocoa/80">{item.shortDescription || item.description}</p>
        <div className="flex flex-wrap gap-3 text-sm text-cocoa/75">
          <span className="inline-flex items-center gap-2">
            <Clock3 className="h-4 w-4" />
            {item.duration} phút
          </span>
          <span className="inline-flex items-center gap-2">
            <Star className="h-4 w-4 fill-current text-rose" />
            {item.averageRating || 0} ({item.reviewCount || 0})
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="text-lg font-semibold text-ink">{formatCurrency(item.price)}</div>
          <div className="flex gap-2">
            <Link to={`/services/${item.slug}`} className={buttonStyles({ variant: "secondary", size: "sm" })}>
              Chi tiết
            </Link>
            <Link to={`/booking?service=${item.id}`} className={buttonStyles({ size: "sm" })}>
              Đặt lịch
            </Link>
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
);

export const ProductCard = ({ item, onAddToCart }) => (
  <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.22 }}>
    <Card className="h-full overflow-hidden p-0">
      <img
        src={resolveImageUrl(item.imageUrl, DEFAULT_IMAGE_FALLBACK)}
        alt={item.name}
        className="h-56 w-full object-cover"
      />
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge>{item.category?.name}</Badge>
            <h3 className="mt-3 text-2xl">{item.name}</h3>
          </div>
          <ShoppingBag className="mt-1 h-5 w-5 text-cocoa/70" />
        </div>
        <p className="text-sm leading-7 text-cocoa/80">{item.description}</p>
        <div className="flex items-center gap-3 text-sm text-cocoa/75">
          <span>Còn {item.stock} sản phẩm</span>
          <span className="inline-flex items-center gap-2">
            <Star className="h-4 w-4 fill-current text-rose" />
            {item.averageRating || 0}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            {item.discountPrice ? (
              <>
                <div className="text-lg font-semibold text-ink">{formatCurrency(item.discountPrice)}</div>
                <div className="text-sm text-cocoa/55 line-through">{formatCurrency(item.price)}</div>
              </>
            ) : (
              <div className="text-lg font-semibold text-ink">{formatCurrency(item.price)}</div>
            )}
          </div>
          <div className="flex gap-2">
            <Link to={`/products/${item.slug}`} className={buttonStyles({ variant: "secondary", size: "sm" })}>
              Chi tiết
            </Link>
            <Button size="sm" onClick={() => onAddToCart?.(item)}>
              Thêm giỏ
            </Button>
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
);

export const ReviewCard = ({ item }) => (
  <Card className="h-full">
    <div className="flex items-center gap-1 text-rose">
      {Array.from({ length: item.rating }).map((_, index) => (
        <Star key={index} className="h-4 w-4 fill-current" />
      ))}
    </div>
    <p className="mt-4 text-sm leading-7 text-cocoa/85">{item.comment}</p>
    <div className="mt-5 text-sm font-semibold text-ink">{item.user?.name || "Khách hàng"}</div>
  </Card>
);
