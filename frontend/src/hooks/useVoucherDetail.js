import { useState, useEffect } from "react";
import { mockVouchers } from "../data/mockVouchers";

/**
 * Custom hook useVoucherDetail
 *
 * Hook này mô phỏng việc lấy chi tiết voucher từ API bằng mock data.
 * Nó hỗ trợ trạng thái loading giả lập trong 1.2 giây để hiển thị skeleton loader
 * và tự động bổ sung các thông tin chi tiết: mô tả, điều kiện áp dụng, chi nhánh áp dụng.
 *
 * @param {string} id - ID của voucher cần lấy chi tiết
 * @returns {{ voucher: object|null, loading: boolean, error: string|null, refetch: function }}
 */
export function useVoucherDetail(id) {
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    // Giả lập gọi API với delay 1.2s
    const timer = setTimeout(() => {
      if (!isMounted) return;

      const found = mockVouchers.find((v) => v.id === id);

      if (!found) {
        // Nếu không tìm thấy trong mock, nhưng id hợp lệ thì tạo ra mock ngẫu nhiên
        // nhằm giúp việc test các ID khác nhau không bị lỗi
        if (id && id.startsWith("mock-")) {
          setError("Không tìm thấy voucher yêu cầu.");
          setLoading(false);
          return;
        }

        // Tạo dữ liệu mặc định để hiển thị nếu id bất kỳ
        const fallbackVoucher = {
          id: id || "mock-default",
          name: "Voucher Ưu Đãi Đặc Biệt ViVouch",
          partnerName: "Đối tác Liên Kết ViVouch",
          category: "am-thuc",
          imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
          originalPrice: 500000,
          salePrice: 250000,
          rating: 4.5,
          reviewCount: 45,
          totalQuantity: 100,
          soldQuantity: 60,
        };
        
        enrichAndSetVoucher(fallbackVoucher);
      } else {
        enrichAndSetVoucher(found);
      }
      setLoading(false);
    }, 1200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [id]);

  // Hàm bổ sung chi tiết nội dung
  const enrichAndSetVoucher = (baseVoucher) => {
    const remainingQuantity = Math.max(0, baseVoucher.totalQuantity - baseVoucher.soldQuantity);
    
    // Thêm các thông tin mô tả, điều kiện, chi nhánh
    const enriched = {
      ...baseVoucher,
      remainingQuantity,
      description: `Sở hữu ngay ưu đãi cực kỳ hấp dẫn từ ${baseVoucher.partnerName}. Voucher áp dụng cho các dịch vụ chất lượng cao được cung cấp trực tiếp tại các chi nhánh được ủy quyền. Với thiết kế tinh tế và quy trình phục vụ chuyên nghiệp, chúng tôi cam kết đem lại trải nghiệm tuyệt vời nhất cho quý khách hàng. Đừng bỏ lỡ cơ hội sở hữu voucher với mức giá ưu đãi chưa từng có này!`,
      conditions: [
        "Mỗi voucher chỉ được áp dụng cho 01 hóa đơn thanh toán.",
        "Không áp dụng đồng thời với các chương trình khuyến mãi khác của cửa hàng.",
        "Voucher không có giá trị quy đổi thành tiền mặt hay trả lại tiền thừa.",
        "Khách hàng vui lòng liên hệ hotline chi nhánh trước khi đến để được phục vụ tốt nhất.",
        "Thời hạn sử dụng voucher: 30 ngày kể từ ngày mua thành công.",
        "Không áp dụng vào các ngày Lễ, Tết theo quy định của nhà nước."
      ],
      branches: [
        {
          name: `${baseVoucher.partnerName} - Chi nhánh Quận 1`,
          address: "123 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
          phone: "028.1234.5678"
        },
        {
          name: `${baseVoucher.partnerName} - Chi nhánh Quận 3`,
          address: "456 Lê Văn Sỹ, Phường 14, Quận 3, TP. Hồ Chí Minh",
          phone: "028.8765.4321"
        },
        {
          name: `${baseVoucher.partnerName} - Chi nhánh Bình Thạnh`,
          address: "789 Điện Biên Phủ, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh",
          phone: "028.1122.3344"
        }
      ]
    };
    
    setVoucher(enriched);
  };

  const refetch = () => {
    setLoading(true);
    setError(null);
    // Kích hoạt lại useEffect bằng cách đổi state hoặc đơn giản là set timeout lại
    setTimeout(() => {
      const found = mockVouchers.find((v) => v.id === id);
      if (found) {
        enrichAndSetVoucher(found);
      }
      setLoading(false);
    }, 800);
  };

  return { voucher, loading, error, refetch };
}
