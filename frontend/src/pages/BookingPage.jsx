import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { staffApi, serviceApi } from "../services/api";
import { useAppStore } from "../store/useAppStore";
import { LoadingBlock, PageHero } from "../components/ui";
import BookingForm from "../components/forms/BookingForm";

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const currentUser = useAppStore((state) => state.user);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const [serviceResponse, staffResponse] = await Promise.all([
          serviceApi.list({ limit: 50 }),
          staffApi.list()
        ]);

        if (!active) {
          return;
        }

        setServices(serviceResponse.items);
        setStaff(staffResponse.items);
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

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Booking flow"
        title="Đặt lịch làm đẹp trong một biểu mẫu rõ ràng và nhanh gọn."
        description="Chọn dịch vụ, khung giờ, kỹ thuật viên và phương thức thanh toán phù hợp. Mọi thông tin sẽ được lưu vào tài khoản của bạn để tiện theo dõi sau này."
      />

      {loading ? (
        <LoadingBlock label="Đang chuẩn bị lịch hẹn..." />
      ) : (
        <BookingForm
          services={services}
          staff={staff}
          initialServiceId={searchParams.get("service") ?? ""}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default BookingPage;

