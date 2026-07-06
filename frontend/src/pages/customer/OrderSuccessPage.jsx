import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

const CONFETTI_COLORS = ["#00694c", "#68dbae", "#ffba38", "#b7131a"];

const Confetti = React.memo(function Confetti() {
  const style = `
    @keyframes fall {
      0% { opacity: 1; transform: translateY(-20px) rotate(0deg); }
      100% { opacity: 0; transform: translateY(80vh) rotate(360deg); }
    }
    .animate-fall {
      animation-name: fall;
      animation-timing-function: linear;
      animation-iteration-count: 1;
    }
  `;

  const particles = React.useMemo(
    () =>
      new Array(60).fill(null).map((_, i) => ({
        left: (i * 17) % 100,
        delay: ((i * 7) % 20) / 10,
        duration: 1.5 + ((i * 11) % 10) / 10,
        size: 6 + ((i * 13) % 8),
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        shapeClass: i % 2 === 0 ? "rounded-full" : "rounded-sm",
      })),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <style>{style}</style>
      {particles.map((p, i) => (
        <div
          key={i}
          className={`absolute top-0 animate-fall pointer-events-none ${p.shapeClass}`}
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            animationFillMode: "forwards",
          }}
        />
      ))}
    </div>
  );
});

function VoucherCodeItem({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.code);
    setCopied(true);
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <div className="bg-base-100 rounded-3xl border border-base-200 shadow-sm p-6 flex flex-col sm:flex-row gap-6 items-center hover:shadow-md transition-shadow">
      {/* QR Code Container */}
      <div className="bg-white p-3 rounded-2xl border border-base-200 shadow-sm flex-shrink-0">
        <QRCodeSVG value={code.code} size={110} level="M" includeMargin={false} />
      </div>
      
      {/* Thông tin */}
      <div className="flex-1 flex flex-col w-full text-center sm:text-left gap-3 h-full">
        <h3 className="font-bold text-lg leading-snug line-clamp-2 text-base-content">
          {code.voucherTitle}
        </h3>
        
        <div className="flex flex-col gap-3 mt-auto">
          <div className="text-sm font-medium text-base-content/60 flex items-center justify-center sm:justify-start gap-1">
            <span className="material-symbols-outlined text-[16px]">timer</span>
            HSD: {code.expiresAt ? new Date(code.expiresAt).toLocaleDateString("vi-VN") : "Không thời hạn"}
          </div>
          
          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
            <div className="bg-base-200/50 px-3 py-1.5 rounded-lg border border-base-200/50">
              <span className="font-mono font-bold text-primary tracking-widest text-[15px]">{code.code}</span>
            </div>
            <button 
              className={`btn btn-sm rounded-lg ${copied ? 'btn-success text-white border-success' : 'btn-outline btn-primary'}`}
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  Đã sao chép!
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  Sao chép
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Lấy dữ liệu 1 lần duy nhất từ location.state
  const [successData] = useState(() => location.state);

  // Xoá state khỏi history ngay lập tức. F5 sẽ thấy state = null.
  useEffect(() => {
    if (location.state) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, navigate, location.pathname]);

  if (!successData || !successData.orderId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 bg-base-50 min-h-[80vh] animate-fade-in">
        <div className="bg-base-100 p-8 rounded-3xl shadow-sm text-center max-w-md w-full border border-base-200">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
            <span className="material-symbols-outlined text-[40px]">inventory_2</span>
          </div>
          <h2 className="text-2xl font-bold mb-3">Chưa có thông tin đơn hàng</h2>
          <p className="text-base-content/70 mb-8 leading-relaxed">
            Có vẻ bạn vừa tải lại trang hoặc phiên giao dịch đã kết thúc. Các mã ưu đãi (nếu có) đã được lưu an toàn vào tài khoản của bạn.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/customer/my-vouchers" className="btn btn-primary w-full rounded-xl font-bold">
              Xem voucher của tôi
            </Link>
            <Link to="/customer/home" className="btn btn-ghost w-full rounded-xl font-medium text-base-content/70 hover:text-primary">
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { orderId, voucherCodes } = successData;

  // Map data
  const mappedCodes = (voucherCodes || []).map((vc) => ({
    code: vc.code,
    voucherTitle: vc.voucherTitle || vc.voucher?.title || "Voucher",
    expiresAt: vc.expiresAt,
  }));

  return (
    <div className="flex-1 flex flex-col items-center py-12 px-4 relative overflow-hidden bg-base-50 min-h-[80vh]">
      <Confetti />

      <div className="max-w-5xl w-full flex flex-col items-center relative z-10 animate-fade-in">
        {/* Success Icon */}
        <div className="w-20 h-20 md:w-24 md:h-24 bg-success/10 rounded-full flex items-center justify-center mb-6 shadow-sm border border-success/20 text-success">
          <span
            className="material-symbols-outlined text-[40px] md:text-[50px] font-bold"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>

        <h1 className="text-[28px] md:text-[36px] text-center mb-2 font-bold text-base-content tracking-tight">
          Đặt hàng thành công!
        </h1>
        <p className="text-base-content/70 text-[15px] md:text-[18px] mb-10">
          Mã đơn: <span className="font-mono font-bold text-primary select-all">#{orderId}</span>
        </p>

        {/* Danh sách QR Codes */}
        <div className="w-full mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mappedCodes.map((code) => (
              <VoucherCodeItem key={code.code} code={code} />
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
          <Link
            to="/customer/home"
            className="btn btn-outline border-2 border-primary text-primary hover:bg-primary/10 hover:border-primary px-8 py-3 rounded-full flex-1 font-bold shadow-sm"
          >
            Về trang chủ
          </Link>
          <Link
            to="/customer/my-vouchers"
            className="btn btn-primary px-8 py-3 rounded-full flex-1 font-bold shadow-sm"
          >
            Xem voucher của tôi
          </Link>
        </div>
      </div>
    </div>
  );
}
