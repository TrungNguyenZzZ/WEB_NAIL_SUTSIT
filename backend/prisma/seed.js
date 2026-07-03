import bcrypt from "bcryptjs";
import { PrismaClient, PublicationStatus, UserRole, UserStatus, AppointmentStatus, PaymentMethod, PaymentStatus, OrderStatus, DiscountType, DiscountApplyTo } from "@prisma/client";

const prisma = new PrismaClient();

const slugify = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const serviceCategorySeeds = [
  {
    name: "Nail",
    description: "Các dịch vụ làm móng thời thượng, từ basic đến nail art cao cấp."
  },
  {
    name: "Mi",
    description: "Nối mi, uốn mi và chăm sóc sợi mi với phong cách tự nhiên lẫn nổi bật."
  },
  {
    name: "Chăm sóc móng",
    description: "Dưỡng móng, phục hồi và spa thư giãn cho tay chân."
  },
  {
    name: "Combo",
    description: "Các gói tiết kiệm kết hợp nail, mi và dịch vụ chăm sóc."
  }
];

const serviceSeeds = [
  {
    category: "Nail",
    name: "Sơn gel pastel basic",
    shortDescription: "Lên màu mịn, bóng bền và tôn da tay.",
    description: "Dịch vụ sơn gel cơ bản với bảng màu pastel hiện đại, xử lý form móng gọn gàng và phủ bóng lâu trôi.",
    procedure: "Làm sạch bề mặt móng\nTạo form móng\nSơn nền bảo vệ\nLên 2 lớp màu gel\nPhủ top coat và sấy đèn",
    beforeCare: "Không cắt da quá sát trước ngày hẹn. Thông báo nếu móng đang yếu hoặc kích ứng.",
    afterCare: "Hạn chế tiếp xúc hóa chất mạnh trong 24 giờ đầu. Dùng dầu dưỡng móng mỗi tối.",
    price: 220000,
    duration: 60,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=900&q=80"
  },
  {
    category: "Nail",
    name: "French tip hồng sữa",
    shortDescription: "Kiểu French mềm mại, nữ tính và thanh lịch.",
    description: "Phom móng nhẹ nhàng cùng đầu móng trắng hồng được vẽ tỉ mỉ, phù hợp đi làm hoặc dự tiệc.",
    procedure: "Cắt sửa form móng\nLàm sạch da thừa\nSơn nền hồng sữa\nVẽ French tip\nPhủ bóng",
    beforeCare: "Móng thật nên được nghỉ ít nhất 2 ngày sau khi tháo gel cũ.",
    afterCare: "Dưỡng ẩm vùng da quanh móng và đeo găng khi làm việc nhà.",
    price: 280000,
    duration: 75,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=80"
  },
  {
    category: "Nail",
    name: "Cat eye ánh ngọc trai",
    shortDescription: "Hiệu ứng chuyển sáng sang trọng, hợp tiệc tối.",
    description: "Màu cat eye có độ sâu cùng ánh ngọc trai tạo cảm giác sang trọng trên nền móng dài hoặc vừa.",
    procedure: "Chuẩn bị bề mặt móng\nSơn nền tối\nTạo hiệu ứng nam châm\nPhủ bóng hoàn thiện",
    beforeCare: "Nên mang ảnh mẫu nếu muốn căn chỉnh hiệu ứng giống ý tưởng.",
    afterCare: "Tránh va đập mạnh ở 6 giờ đầu sau khi làm móng.",
    price: 340000,
    duration: 90,
    imageUrl: "https://images.unsplash.com/photo-1522336572468-97b06e8ef143?auto=format&fit=crop&w=900&q=80"
  },
  {
    category: "Nail",
    name: "Nail art cô dâu tối giản",
    shortDescription: "Đá nhỏ, line mảnh và tông nude cao cấp.",
    description: "Thiết kế chuyên cho cô dâu hoặc lễ đính hôn với hoạ tiết line art, đá mini và bảng màu nude sang trọng.",
    procedure: "Tư vấn concept\nTạo form móng phù hợp váy cưới\nSơn nền nude\nVẽ họa tiết và đính đá\nPhủ top coat",
    beforeCare: "Nên đặt lịch trước 2-3 ngày để có thời gian chỉnh sửa ý tưởng.",
    afterCare: "Hạn chế cạy mở đồ vật cứng để tránh bong đá.",
    price: 420000,
    duration: 120,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=900&q=80"
  },
  {
    category: "Nail",
    name: "Đắp gel nối móng tự nhiên",
    shortDescription: "Tăng độ dài vừa phải, bền và ôm móng thật.",
    description: "Kỹ thuật nối gel giúp kéo dài móng an toàn, phom tự nhiên, phù hợp khách hàng muốn nuôi móng nhưng cần đẹp ngay.",
    procedure: "Khảo sát móng thật\nGắn form và đắp gel\nMài chỉnh form\nSơn màu hoặc phủ bóng",
    beforeCare: "Không nên tự bóc lớp cũ trước khi đến salon.",
    afterCare: "Quay lại bảo trì sau 2-3 tuần để giữ phom đẹp.",
    price: 380000,
    duration: 110,
    imageUrl: "https://images.unsplash.com/photo-1596704017254-9754c5f81bb2?auto=format&fit=crop&w=900&q=80"
  },
  {
    category: "Chăm sóc móng",
    name: "Spa manicure thảo mộc",
    shortDescription: "Ngâm thảo mộc, tẩy tế bào chết và massage tay.",
    description: "Liệu trình thư giãn cho đôi tay giúp làm mềm da, làm sạch da thừa và cải thiện độ ẩm cho vùng biểu bì.",
    procedure: "Ngâm tay thảo mộc\nCắt sửa móng\nTẩy tế bào chết\nĐắp mask\nMassage dưỡng",
    beforeCare: "Thông báo nếu da tay có vết thương hở hoặc kích ứng.",
    afterCare: "Bôi kem dưỡng tay đều đặn để duy trì độ mềm mịn.",
    price: 260000,
    duration: 70,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1556228578-dd6df2f1bcd8?auto=format&fit=crop&w=900&q=80"
  },
  {
    category: "Chăm sóc móng",
    name: "Spa pedicure bạc hà",
    shortDescription: "Thư giãn, khử mùi và làm mềm gót chân.",
    description: "Liệu trình chăm sóc chân với tinh dầu bạc hà dịu mát, làm sạch da chết và massage thư giãn.",
    procedure: "Ngâm chân thảo mộc\nLàm sạch gót\nCắt da móng chân\nTẩy tế bào chết\nMassage kem dưỡng",
    beforeCare: "Không cạo gót chân tại nhà trước buổi hẹn.",
    afterCare: "Mang dép hở chân tối thiểu 2 tiếng sau khi làm để da dễ thông thoáng.",
    price: 320000,
    duration: 80,
    imageUrl: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80"
  },
  {
    category: "Chăm sóc móng",
    name: "Phục hồi móng mỏng yếu",
    shortDescription: "Tăng cường độ cứng và giảm gãy xước.",
    description: "Chuyên sâu cho khách vừa tháo gel/đắp bột, sử dụng serum và lớp phủ bảo vệ hỗ trợ phục hồi móng.",
    procedure: "Đánh giá bề mặt móng\nLàm sạch nhẹ\nBôi serum phục hồi\nPhủ lớp strengthening coat",
    beforeCare: "Không tự giũa mỏng móng trước buổi hẹn.",
    afterCare: "Duy trì dầu dưỡng và hạn chế sơn gel trong 7-10 ngày.",
    price: 180000,
    duration: 45,
    imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80"
  },
  {
    category: "Chăm sóc móng",
    name: "Chăm sóc biểu bì express",
    shortDescription: "Nhanh gọn cho lịch bận rộn.",
    description: "Dịch vụ cắt da và làm sạch vùng biểu bì, phù hợp khách cần chỉnh chu nhanh trước sự kiện.",
    procedure: "Ngâm mềm biểu bì\nLàm sạch da thừa\nCắt sửa form\nPhủ dưỡng bóng",
    beforeCare: "Không cắn hoặc kéo da quanh móng trước khi đến.",
    afterCare: "Bôi dầu dưỡng 2 lần/ngày để hạn chế xước măng rô.",
    price: 120000,
    duration: 30,
    imageUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=900&q=80"
  },
  {
    category: "Mi",
    name: "Nối mi classic tự nhiên",
    shortDescription: "Sợi nhẹ, mắt to vừa phải và mềm mại.",
    description: "Kiểu nối mi classic 1:1 giúp đôi mắt rõ nét hơn mà vẫn giữ vẻ tự nhiên, phù hợp khách mới làm lần đầu.",
    procedure: "Tư vấn dáng mắt\nLàm sạch mi\nNối từng sợi classic\nChải định hình và kiểm tra",
    beforeCare: "Không dùng mascara trong ngày làm dịch vụ.",
    afterCare: "Tránh nước trong 6 giờ đầu và không dụi mắt.",
    price: 350000,
    duration: 90,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&w=900&q=80"
  },
  {
    category: "Mi",
    name: "Nối mi volume 3D",
    shortDescription: "Độ dày rõ rệt nhưng vẫn nhẹ mắt.",
    description: "Kỹ thuật volume 3D tạo độ dày và cong mềm cho khách thích đôi mắt nổi bật, ăn ảnh đẹp.",
    procedure: "Đánh giá nền mi\nLàm sạch vùng mắt\nNối fan 3D\nCanh form đều và chải hoàn thiện",
    beforeCare: "Không sử dụng dầu dưỡng vùng mắt trong ngày hẹn.",
    afterCare: "Không nằm úp mặt trong đêm đầu tiên sau khi nối.",
    price: 480000,
    duration: 110,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1596704017254-8b7ff2b28f04?auto=format&fit=crop&w=900&q=80"
  },
  {
    category: "Mi",
    name: "Nối mi wispy Hàn Quốc",
    shortDescription: "Form mi bay nhẹ, có điểm nhấn tinh tế.",
    description: "Dáng wispy với độ dài xen kẽ, tạo cảm giác mắt long lanh, phù hợp phong cách makeup trẻ trung.",
    procedure: "Tư vấn độ dài\nTạo layout wispy\nNối fan và spike\nKiểm tra độ cân xứng",
    beforeCare: "Nên tháo lens trước khi thực hiện dịch vụ.",
    afterCare: "Chải mi mỗi sáng bằng spoolie khô để giữ nếp.",
    price: 520000,
    duration: 120,
    imageUrl: "https://images.unsplash.com/photo-1615529328331-f8917597711f?auto=format&fit=crop&w=900&q=80"
  },
  {
    category: "Mi",
    name: "Uốn mi collagen",
    shortDescription: "Nâng độ cong tự nhiên, giảm gãy khô.",
    description: "Dịch vụ uốn mi kết hợp dưỡng collagen giúp sợi mi cong mềm, mắt sáng hơn mà không cần nối mi.",
    procedure: "Làm sạch mi\nDán trục\nỦ thuốc uốn\nKhóa nếp và phủ collagen",
    beforeCare: "Không dùng mascara waterproof trước buổi hẹn.",
    afterCare: "Tránh hơi nước nóng trong 24 giờ đầu.",
    price: 290000,
    duration: 60,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80"
  },
  {
    category: "Mi",
    name: "Uốn mi nhuộm đen",
    shortDescription: "Cong mi và tăng độ sắc nét cho mắt mộc.",
    description: "Kết hợp uốn mi với nhuộm đen nhẹ giúp hàng mi nhìn dày hơn mà không cần mascara mỗi ngày.",
    procedure: "Làm sạch mi\nUốn theo trục phù hợp\nNhuộm đen an toàn\nDưỡng khóa mi",
    beforeCare: "Không đeo lens trong buổi làm để mắt được thư giãn.",
    afterCare: "Không tẩy trang vùng mắt bằng sản phẩm chứa dầu trong 24 giờ đầu.",
    price: 340000,
    duration: 75,
    imageUrl: "https://images.unsplash.com/photo-1607602132700-068258776a10?auto=format&fit=crop&w=900&q=80"
  },
  {
    category: "Mi",
    name: "Dặm mi sau 2 tuần",
    shortDescription: "Làm đầy lại form mi đang thưa.",
    description: "Dịch vụ dành cho khách nối mi quay lại dặm trong vòng 14 ngày để phục hồi độ dày ban đầu.",
    procedure: "Làm sạch mi cũ\nLoại bỏ sợi lệch\nNối bù vùng thưa\nChải định hình",
    beforeCare: "Mang theo thông tin lần nối gần nhất nếu làm ở salon khác.",
    afterCare: "Tiếp tục vệ sinh mi bằng foam dịu nhẹ.",
    price: 220000,
    duration: 50,
    imageUrl: "https://images.unsplash.com/photo-1500840216050-6ffa99d75160?auto=format&fit=crop&w=900&q=80"
  },
  {
    category: "Combo",
    name: "Combo nail gel + uốn mi",
    shortDescription: "Làm đẹp nhanh gọn trong một buổi.",
    description: "Kết hợp sơn gel pastel basic và uốn mi collagen, phù hợp khách văn phòng muốn thay đổi nhẹ nhàng.",
    procedure: "Sơn gel cơ bản\nNghỉ ngắn\nUốn mi collagen\nKiểm tra tổng thể",
    beforeCare: "Đặt lịch sớm để salon sắp xếp kỹ thuật viên phù hợp.",
    afterCare: "Tuân thủ hướng dẫn chăm sóc móng và mi riêng biệt trong 24 giờ đầu.",
    price: 460000,
    duration: 135,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=900&q=80"
  },
  {
    category: "Combo",
    name: "Combo cô dâu mini",
    shortDescription: "Nail art thanh lịch và mi wispy long lanh.",
    description: "Gói làm đẹp cho lễ ăn hỏi, lễ gia tiên hoặc chụp hình với nail art cô dâu tối giản và mi wispy mềm mại.",
    procedure: "Tư vấn concept\nThực hiện nail art\nNối mi wispy\nChụp ảnh hoàn thiện",
    beforeCare: "Nên mang ảnh váy hoặc concept makeup để tư vấn đồng bộ hơn.",
    afterCare: "Đặt lịch dặm mi nếu sự kiện kéo dài nhiều ngày.",
    price: 860000,
    duration: 240,
    imageUrl: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80"
  },
  {
    category: "Combo",
    name: "Combo spa tay chân thư giãn",
    shortDescription: "Manicure và pedicure dịu nhẹ cho cuối tuần.",
    description: "Gói thư giãn kết hợp spa manicure thảo mộc và spa pedicure bạc hà, mang lại cảm giác thư thái trọn vẹn.",
    procedure: "Spa tay\nSpa chân\nMassage dưỡng\nPhủ bóng dưỡng nếu cần",
    beforeCare: "Không nên tẩy da chết quá mạnh tại nhà trước buổi hẹn.",
    afterCare: "Uống đủ nước và dưỡng ẩm da tay chân hằng ngày.",
    price: 520000,
    duration: 150,
    imageUrl: "https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=900&q=80"
  },
  {
    category: "Combo",
    name: "Combo công sở nhanh gọn",
    shortDescription: "Chăm sóc biểu bì, phủ dưỡng và dặm mi nhẹ.",
    description: "Giải pháp tiết kiệm thời gian cho khách bận rộn muốn gọn gàng, tươi tắn trước tuần làm việc mới.",
    procedure: "Chăm sóc biểu bì express\nPhủ dưỡng bóng\nDặm mi nhẹ nhàng",
    beforeCare: "Không makeup vùng mắt quá đậm khi đến salon.",
    afterCare: "Giữ vùng mắt sạch và bôi dưỡng móng đều đặn.",
    price: 300000,
    duration: 80,
    imageUrl: "https://images.unsplash.com/photo-1522336284037-91f7da073525?auto=format&fit=crop&w=900&q=80"
  },
  {
    category: "Nail",
    name: "Sơn bóng dưỡng phục hồi",
    shortDescription: "Trong suốt, khỏe móng và sáng tay.",
    description: "Lớp phủ dưỡng trong suốt dành cho khách muốn móng sạch sẽ, gọn gàng mà vẫn có độ bóng đẹp.",
    procedure: "Làm sạch móng\nCắt da nhẹ\nBôi dưỡng nền\nPhủ bóng",
    beforeCare: "Móng không nên còn keo hoặc lớp gel cũ.",
    afterCare: "Có thể dặm lại sau 5-7 ngày nếu muốn duy trì độ bóng.",
    price: 140000,
    duration: 35,
    imageUrl: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=900&q=80"
  },
  {
    category: "Mi",
    name: "Gỡ mi và dưỡng phục hồi",
    shortDescription: "Làm sạch keo cũ và thư giãn vùng mắt.",
    description: "Dành cho khách muốn tháo nối mi cũ an toàn, đồng thời dưỡng sợi mi khỏe hơn trước khi làm lại.",
    procedure: "Tháo mi bằng dung dịch chuyên dụng\nLàm sạch chân mi\nPhủ serum dưỡng",
    beforeCare: "Không tự giật hoặc kéo sợi nối trước khi đến salon.",
    afterCare: "Dưỡng mi đều trong 1 tuần trước khi nối lại.",
    price: 160000,
    duration: 30,
    imageUrl: "https://images.unsplash.com/photo-1607602132700-068258776a10?auto=format&fit=crop&w=900&q=80"
  }
];

const productCategorySeeds = [
  {
    name: "Dưỡng móng",
    description: "Tinh dầu, serum và kem giúp móng chắc khỏe, bóng đẹp."
  },
  {
    name: "Dưỡng mi",
    description: "Serum, dưỡng chất và foam hỗ trợ hàng mi mềm, sạch và khỏe."
  },
  {
    name: "Sơn móng",
    description: "Sơn dưỡng, màu trendy và top coat cho móng đẹp tại nhà."
  },
  {
    name: "Dụng cụ làm đẹp",
    description: "Bộ kềm, dũa và phụ kiện chăm sóc cá nhân tiện lợi."
  },
  {
    name: "Chăm sóc sau làm đẹp",
    description: "Kem dưỡng, mask và sản phẩm giữ hiệu quả sau dịch vụ."
  }
];

const productSeeds = [
  ["Dưỡng móng", "Tinh dầu biểu bì hoa hồng", 145000, 129000, 48, true],
  ["Dưỡng móng", "Serum phục hồi móng keratin", 210000, null, 30, true],
  ["Dưỡng móng", "Kem dưỡng tay vanilla silk", 165000, 149000, 42, true],
  ["Dưỡng móng", "Sơn dưỡng cứng móng calcium", 120000, null, 50, false],
  ["Dưỡng móng", "Tinh chất chống tách móng ban đêm", 195000, null, 26, false],
  ["Dưỡng móng", "Dầu ủ móng peppermint soft", 180000, 160000, 24, false],
  ["Dưỡng mi", "Serum dưỡng mi peptide", 255000, 229000, 35, true],
  ["Dưỡng mi", "Foam vệ sinh mi dịu nhẹ", 175000, null, 40, true],
  ["Dưỡng mi", "Mascara dưỡng mi trong suốt", 150000, null, 32, false],
  ["Dưỡng mi", "Tinh chất bảo vệ mi sau nối", 225000, 199000, 28, false],
  ["Dưỡng mi", "Lược chải mi mini set 3", 65000, null, 60, false],
  ["Dưỡng mi", "Patch mắt collagen mềm dịu", 95000, 79000, 52, false],
  ["Sơn móng", "Sơn pastel hồng nude", 135000, null, 25, true],
  ["Sơn móng", "Sơn xanh mint dịu", 135000, null, 22, false],
  ["Sơn móng", "Top coat bóng gương", 115000, null, 35, true],
  ["Sơn móng", "Base coat bảo vệ móng", 110000, null, 33, false],
  ["Sơn móng", "Bộ 3 màu french thanh lịch", 295000, 259000, 18, true],
  ["Sơn móng", "Sơn ánh nhũ champagne", 149000, null, 20, false],
  ["Dụng cụ làm đẹp", "Bộ kềm cắt da chuyên dụng", 230000, null, 19, true],
  ["Dụng cụ làm đẹp", "Set dũa móng 5 món", 95000, null, 56, false],
  ["Dụng cụ làm đẹp", "Bàn chải vệ sinh móng mini", 65000, null, 70, false],
  ["Dụng cụ làm đẹp", "Túi đựng dụng cụ pastel", 120000, 99000, 27, false],
  ["Dụng cụ làm đẹp", "Gương cầm tay blush pink", 160000, null, 15, false],
  ["Dụng cụ làm đẹp", "Dao đẩy da thép không gỉ", 85000, null, 38, false],
  ["Chăm sóc sau làm đẹp", "Mask tay phục hồi collagen", 125000, 99000, 36, true],
  ["Chăm sóc sau làm đẹp", "Mask chân bạc hà thư giãn", 125000, null, 31, false],
  ["Chăm sóc sau làm đẹp", "Kem khóa ẩm sau nối mi", 180000, null, 21, false],
  ["Chăm sóc sau làm đẹp", "Xịt thơm tay botanical mist", 145000, null, 29, false],
  ["Chăm sóc sau làm đẹp", "Combo dưỡng sau nail tại nhà", 320000, 285000, 17, true],
  ["Chăm sóc sau làm đẹp", "Gift box beauty care mini", 420000, 389000, 12, true]
].map(([category, name, price, discountPrice, stock, featured], index) => ({
  category,
  name,
  price,
  discountPrice,
  stock,
  featured,
  description: `${name} là sản phẩm được tuyển chọn cho khách hàng muốn duy trì hiệu quả làm đẹp tại nhà với trải nghiệm dịu nhẹ, sang trọng và dễ sử dụng.`,
  benefits: "Hỗ trợ duy trì vẻ đẹp sau dịch vụ\nThiết kế tiện dùng tại nhà\nPhù hợp làm quà tặng nhỏ xinh",
  usageInstructions: "Đọc kỹ hướng dẫn trên bao bì\nDùng với lượng vừa đủ\nNgưng sử dụng nếu có dấu hiệu kích ứng",
  imageUrl: `https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80&sig=${index + 1}`
}));

const staffSeeds = [
  {
    name: "Nguyễn Khánh Linh",
    phone: "0909000101",
    email: "linh@blushbloom.vn",
    description: "Chuyên nail art cô dâu và bảng màu pastel Hàn Quốc.",
    specialties: "Nail art, French tip, Bridal nails",
    workingDays: "Thứ 2 - Thứ 7",
    workingHours: "09:00 - 18:00",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=80"
  },
  {
    name: "Trần Mỹ Duyên",
    phone: "0909000102",
    email: "duyen@blushbloom.vn",
    description: "Kỹ thuật viên nối mi có phong cách tự nhiên, mềm mắt.",
    specialties: "Classic lashes, Lash lift, Wispy",
    workingDays: "Thứ 3 - Chủ nhật",
    workingHours: "10:00 - 19:00",
    avatarUrl: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=700&q=80"
  },
  {
    name: "Lê Thanh Hân",
    phone: "0909000103",
    email: "han@blushbloom.vn",
    description: "Phụ trách các dịch vụ spa tay chân thư giãn và phục hồi móng.",
    specialties: "Spa manicure, Spa pedicure, Nail recovery",
    workingDays: "Thứ 2 - Thứ 6",
    workingHours: "08:30 - 17:30",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=700&q=80"
  },
  {
    name: "Phạm Bảo Trâm",
    phone: "0909000104",
    email: "tram@blushbloom.vn",
    description: "Mạnh về combo làm đẹp nhanh gọn cho khách công sở.",
    specialties: "Combo, Gel nails, Quick beauty",
    workingDays: "Thứ 2 - Chủ nhật",
    workingHours: "11:00 - 20:00",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=80"
  },
  {
    name: "Đỗ Mai Chi",
    phone: "0909000105",
    email: "chi@blushbloom.vn",
    description: "Kỹ thuật viên volume lash và các layout mắt cá tính.",
    specialties: "Volume, Wispy, Lash refill",
    workingDays: "Thứ 4 - Chủ nhật",
    workingHours: "09:30 - 18:30",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=700&q=80"
  }
];

const discountsSeed = [
  {
    code: "HELLO10",
    description: "Giảm 10% cho đơn đầu tiên.",
    type: DiscountType.PERCENT,
    value: 10,
    applyTo: DiscountApplyTo.ALL,
    minOrderValue: 250000,
    maxUses: 200
  },
  {
    code: "NAIL50",
    description: "Giảm 50.000đ cho các đơn sản phẩm chăm sóc móng.",
    type: DiscountType.FIXED,
    value: 50000,
    applyTo: DiscountApplyTo.PRODUCT,
    minOrderValue: 300000,
    maxUses: 120
  },
  {
    code: "LASH15",
    description: "Giảm 15% cho các đơn liên quan tới dịch vụ mi.",
    type: DiscountType.PERCENT,
    value: 15,
    applyTo: DiscountApplyTo.SERVICE,
    minOrderValue: 350000,
    maxUses: 80
  },
  {
    code: "BEAUTY80",
    description: "Giảm 80.000đ cho combo hoặc giỏ hàng lớn.",
    type: DiscountType.FIXED,
    value: 80000,
    applyTo: DiscountApplyTo.ALL,
    minOrderValue: 800000,
    maxUses: 60
  }
];

async function main() {
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.appointmentItem.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.staffService.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Admin@123", 10);
  const userPasswordHash = await bcrypt.hash("User@123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Blush Bloom Admin",
      email: "admin@blushbloom.vn",
      password: passwordHash,
      phone: "0909000000",
      address: "12 Nguyễn Trãi, Quận 1, TP.HCM",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE
    }
  });

  const sampleUsers = await Promise.all(
    [
      ["Phạm Thu An", "an@example.com", "0909001001", "45 Lê Lợi, Quận 1, TP.HCM"],
      ["Nguyễn Minh Anh", "minhanh@example.com", "0909001002", "28 Trần Hưng Đạo, Quận 5, TP.HCM"],
      ["Lê Bảo Yến", "baoyen@example.com", "0909001003", "90 Phan Xích Long, Phú Nhuận, TP.HCM"],
      ["Trần Quỳnh Giao", "quynhgiao@example.com", "0909001004", "7 Võ Văn Tần, Quận 3, TP.HCM"],
      ["Đỗ Tường Vy", "tuongvy@example.com", "0909001005", "56 Nguyễn Thị Minh Khai, Quận 3, TP.HCM"]
    ].map(([name, email, phone, address]) =>
      prisma.user.create({
        data: {
          name,
          email,
          password: userPasswordHash,
          phone,
          address,
          role: UserRole.USER,
          status: UserStatus.ACTIVE
        }
      })
    )
  );

  await Promise.all(
    [admin, ...sampleUsers].map((user) =>
      prisma.cart.create({
        data: {
          userId: user.id
        }
      })
    )
  );

  const serviceCategories = {};
  for (const category of serviceCategorySeeds) {
    serviceCategories[category.name] = await prisma.serviceCategory.create({
      data: {
        ...category,
        slug: slugify(category.name)
      }
    });
  }

  const services = {};
  for (const service of serviceSeeds) {
    const created = await prisma.service.create({
      data: {
        name: service.name,
        slug: slugify(service.name),
        description: service.description,
        shortDescription: service.shortDescription,
        procedure: service.procedure,
        beforeCare: service.beforeCare,
        afterCare: service.afterCare,
        price: service.price,
        duration: service.duration,
        imageUrl: service.imageUrl,
        featured: service.featured ?? false,
        status: PublicationStatus.ACTIVE,
        categoryId: serviceCategories[service.category].id
      }
    });
    services[service.name] = created;
  }

  const productCategories = {};
  for (const category of productCategorySeeds) {
    productCategories[category.name] = await prisma.productCategory.create({
      data: {
        ...category,
        slug: slugify(category.name)
      }
    });
  }

  const products = {};
  for (const product of productSeeds) {
    const created = await prisma.product.create({
      data: {
        name: product.name,
        slug: slugify(product.name),
        description: product.description,
        benefits: product.benefits,
        usageInstructions: product.usageInstructions,
        price: product.price,
        discountPrice: product.discountPrice,
        imageUrl: product.imageUrl,
        stock: product.stock,
        featured: product.featured,
        status: PublicationStatus.ACTIVE,
        categoryId: productCategories[product.category].id
      }
    });
    products[product.name] = created;
  }

  const staffs = {};
  for (const seed of staffSeeds) {
    const staff = await prisma.staff.create({
      data: {
        name: seed.name,
        phone: seed.phone,
        email: seed.email,
        avatarUrl: seed.avatarUrl,
        description: seed.description,
        specialties: seed.specialties,
        workingDays: seed.workingDays,
        workingHours: seed.workingHours,
        status: PublicationStatus.ACTIVE
      }
    });
    staffs[seed.name] = staff;
  }

  const staffAssignments = {
    "Nguyễn Khánh Linh": [
      "Sơn gel pastel basic",
      "French tip hồng sữa",
      "Cat eye ánh ngọc trai",
      "Nail art cô dâu tối giản",
      "Đắp gel nối móng tự nhiên"
    ],
    "Trần Mỹ Duyên": [
      "Nối mi classic tự nhiên",
      "Uốn mi collagen",
      "Uốn mi nhuộm đen",
      "Dặm mi sau 2 tuần"
    ],
    "Lê Thanh Hân": [
      "Spa manicure thảo mộc",
      "Spa pedicure bạc hà",
      "Phục hồi móng mỏng yếu",
      "Chăm sóc biểu bì express",
      "Sơn bóng dưỡng phục hồi"
    ],
    "Phạm Bảo Trâm": [
      "Combo nail gel + uốn mi",
      "Combo spa tay chân thư giãn",
      "Combo công sở nhanh gọn",
      "Sơn gel pastel basic",
      "Uốn mi collagen"
    ],
    "Đỗ Mai Chi": [
      "Nối mi volume 3D",
      "Nối mi wispy Hàn Quốc",
      "Dặm mi sau 2 tuần",
      "Gỡ mi và dưỡng phục hồi",
      "Combo cô dâu mini"
    ]
  };

  for (const [staffName, serviceNames] of Object.entries(staffAssignments)) {
    await prisma.staffService.createMany({
      data: serviceNames.map((serviceName) => ({
        staffId: staffs[staffName].id,
        serviceId: services[serviceName].id
      }))
    });
  }

  const discounts = {};
  const now = new Date();
  const pastDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const futureDate = new Date(now.getFullYear(), now.getMonth() + 2, now.getDate());
  for (const discount of discountsSeed) {
    const created = await prisma.discount.create({
      data: {
        ...discount,
        startDate: pastDate,
        endDate: futureDate,
        status: PublicationStatus.ACTIVE
      }
    });
    discounts[discount.code] = created;
  }

  const appointmentSeeds = [
    {
      code: "APT-1001",
      user: sampleUsers[0],
      staff: staffs["Nguyễn Khánh Linh"],
      dateOffset: 2,
      time: "10:00",
      services: ["French tip hồng sữa"],
      paymentMethod: PaymentMethod.SALON,
      paymentStatus: PaymentStatus.PENDING,
      status: AppointmentStatus.CONFIRMED
    },
    {
      code: "APT-1002",
      user: sampleUsers[1],
      staff: staffs["Trần Mỹ Duyên"],
      dateOffset: 3,
      time: "14:30",
      services: ["Nối mi classic tự nhiên"],
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      paymentStatus: PaymentStatus.PAID,
      status: AppointmentStatus.CONFIRMED
    },
    {
      code: "APT-1003",
      user: sampleUsers[2],
      staff: staffs["Phạm Bảo Trâm"],
      dateOffset: -1,
      time: "16:00",
      services: ["Combo nail gel + uốn mi"],
      paymentMethod: PaymentMethod.SALON,
      paymentStatus: PaymentStatus.PAID,
      status: AppointmentStatus.COMPLETED
    },
    {
      code: "APT-1004",
      user: sampleUsers[3],
      staff: staffs["Lê Thanh Hân"],
      dateOffset: 4,
      time: "09:30",
      services: ["Spa manicure thảo mộc", "Phục hồi móng mỏng yếu"],
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      paymentStatus: PaymentStatus.PENDING,
      status: AppointmentStatus.PENDING
    }
  ];

  for (const seed of appointmentSeeds) {
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + seed.dateOffset);
    scheduledDate.setHours(0, 0, 0, 0);

    const selectedServices = seed.services.map((serviceName) => services[serviceName]);
    const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);

    await prisma.appointment.create({
      data: {
        code: seed.code,
        userId: seed.user.id,
        staffId: seed.staff.id,
        appointmentDate: scheduledDate,
        appointmentTime: seed.time,
        totalPrice,
        status: seed.status,
        paymentMethod: seed.paymentMethod,
        paymentStatus: seed.paymentStatus,
        customerName: seed.user.name,
        customerPhone: seed.user.phone,
        customerEmail: seed.user.email,
        note: "Khách thích phong cách nhẹ nhàng, tông màu nude.",
        items: {
          create: selectedServices.map((service) => ({
            serviceId: service.id,
            serviceName: service.name,
            price: service.price,
            duration: service.duration
          }))
        }
      }
    });
  }

  const orderSeeds = [
    {
      code: "ORD-2001",
      user: sampleUsers[0],
      discount: discounts["HELLO10"],
      paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
      paymentStatus: PaymentStatus.PENDING,
      orderStatus: OrderStatus.PENDING,
      items: [
        ["Tinh dầu biểu bì hoa hồng", 1],
        ["Serum dưỡng mi peptide", 1]
      ]
    },
    {
      code: "ORD-2002",
      user: sampleUsers[1],
      discount: discounts["NAIL50"],
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      paymentStatus: PaymentStatus.PAID,
      orderStatus: OrderStatus.CONFIRMED,
      items: [
        ["Bộ kềm cắt da chuyên dụng", 1],
        ["Set dũa móng 5 món", 1],
        ["Top coat bóng gương", 2]
      ]
    },
    {
      code: "ORD-2003",
      user: sampleUsers[2],
      discount: null,
      paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
      paymentStatus: PaymentStatus.PAID,
      orderStatus: OrderStatus.DELIVERED,
      items: [
        ["Gift box beauty care mini", 1]
      ]
    }
  ];

  for (const seed of orderSeeds) {
    const items = seed.items.map(([productName, quantity]) => ({
      product: products[productName],
      quantity
    }));
    const totalPrice = items.reduce((sum, item) => {
      const unitPrice = item.product.discountPrice ?? item.product.price;
      return sum + unitPrice * item.quantity;
    }, 0);

    let discountAmount = 0;
    if (seed.discount) {
      discountAmount =
        seed.discount.type === DiscountType.PERCENT
          ? Math.min(totalPrice * (seed.discount.value / 100), totalPrice)
          : Math.min(seed.discount.value, totalPrice);
    }

    await prisma.order.create({
      data: {
        code: seed.code,
        userId: seed.user.id,
        discountId: seed.discount?.id,
        receiverName: seed.user.name,
        receiverPhone: seed.user.phone,
        receiverEmail: seed.user.email,
        receiverAddress: seed.user.address,
        note: "Giao hàng giờ hành chính nếu có thể.",
        totalPrice,
        discountAmount,
        finalPrice: totalPrice - discountAmount,
        paymentMethod: seed.paymentMethod,
        paymentStatus: seed.paymentStatus,
        orderStatus: seed.orderStatus,
        items: {
          create: items.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            productImage: item.product.imageUrl,
            quantity: item.quantity,
            price: item.product.discountPrice ?? item.product.price
          }))
        }
      }
    });
  }

  await prisma.review.createMany({
    data: [
      {
        userId: sampleUsers[0].id,
        serviceId: services["French tip hồng sữa"].id,
        rating: 5,
        comment: "Màu lên rất sang, form móng tự nhiên và kỹ thuật viên cực kỳ tỉ mỉ."
      },
      {
        userId: sampleUsers[1].id,
        serviceId: services["Nối mi classic tự nhiên"].id,
        rating: 5,
        comment: "Mi nhẹ và bền, nhìn mắt to hơn nhưng vẫn tự nhiên."
      },
      {
        userId: sampleUsers[2].id,
        productId: products["Serum dưỡng mi peptide"].id,
        rating: 4,
        comment: "Dùng đều khoảng 2 tuần thấy mi mềm hơn rõ rệt."
      },
      {
        userId: sampleUsers[3].id,
        productId: products["Tinh dầu biểu bì hoa hồng"].id,
        rating: 5,
        comment: "Mùi thơm dịu, da quanh móng mềm hơn sau vài ngày sử dụng."
      }
    ]
  });

  console.log("Seed completed successfully.");
  console.log("Admin account: admin@blushbloom.vn / Admin@123");
  console.log("Sample customer password: User@123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
