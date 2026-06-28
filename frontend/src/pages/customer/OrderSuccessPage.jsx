import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { QRCodeModal } from "../../components/common/QRCodeModal";

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

function readLastSuccessFromSession() {
  try {
    const raw = sessionStorage.getItem("vivouch:last-order-success");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.orderId) return null;
    return parsed;
  } catch {
    return null;
  }
}

function VoucherGroupCard({ group, onOpenQR }) {
  const { title, imageUrl, codes } = group;

  return (
    <div className="flex flex-col md:flex-row bg-base-100 rounded-2xl border border-base-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Thông tin chung voucher */}
      <div className="flex p-5 md:p-6 md:w-5/12 border-b md:border-b-0 md:border-r border-base-200 gap-5 items-center bg-base-100/50">
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl bg-base-200 overflow-hidden flex-shrink-0 shadow-sm">
          <img
            src={imageUrl || "/placeholder.jpg"}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = "https://placehold.co/100x100?text=Voucher"; }}
          />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg leading-snug mb-2 line-clamp-3 text-base-content">{title}</h3>
          <div className="inline-flex items-center gap-2 text-sm font-medium text-base-content/80 bg-base-200/50 px-3 py-1 rounded-lg">
            <span>Số lượng:</span>
            <span className="text-primary font-bold">{codes.length}</span>
          </div>
        </div>
      </div>

      {/* Danh sách mã */}
      <div className="p-5 md:p-6 md:w-7/12 bg-base-50/50 flex flex-col gap-3 max-h-[320px] overflow-y-auto">
        {codes.map(vc => (
          <div key={vc.id} className="flex justify-between items-center p-4 bg-base-100 rounded-xl border border-base-200 shadow-sm hover:border-primary/30 transition-colors">
            <div>
              <div className="font-mono font-bold text-lg text-primary tracking-widest">{vc.code}</div>
              <div className="text-xs font-medium text-base-content/60 mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">timer</span>
                HSD: {vc.expiresAt ? new Date(vc.expiresAt).toLocaleDateString("vi-VN") : "Không thời hạn"}
              </div>
            </div>
            <button 
              className="btn btn-primary btn-sm btn-circle btn-outline shadow-sm"
              onClick={() => onOpenQR(vc)}
              title="Hiện QR Code"
            >
              <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrderSuccessPage() {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVoucherCode, setSelectedVoucherCode] = useState(null);

  const locationState = location.state || {};
  const persistedState = readLastSuccessFromSession();
  const successState = locationState.orderId ? locationState : persistedState;
  const { orderId, voucherCodes } = successState || {};

  React.useEffect(() => {
    return () => {
      sessionStorage.removeItem("vivouch:last-order-success");
    };
  }, []);

  const handleOpenQR = (vc) => {
    // Map to structure expected by QRCodeModal if needed, but QRCodeModal usually just needs .code
    setSelectedVoucherCode(vc);
    setIsModalOpen(true);
  };

  const handleCloseQR = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedVoucherCode(null), 300);
  };

  if (!orderId) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 text-center bg-base-100 border border-base-200 rounded-2xl shadow-sm">
        <span className="material-symbols-outlined text-[64px] text-error mb-4">warning</span>
        <h2 className="text-xl font-bold mb-2">Không tìm thấy thông tin đơn hàng</h2>
        <p className="text-base-content/70 text-sm mb-6">
          Bạn có thể đã tải lại trang hoặc chưa đặt hàng thành công.
        </p>
        <Link to="/customer/home" className="btn btn-primary w-full rounded-full">
          Về trang chủ
        </Link>
      </div>
    );
  }

  // 1. Map data
  const mappedCodes = (voucherCodes || []).map((vc, index) => ({
    id: `vc-${index}`,
    code: vc.code,
    status: String(vc.status || "ISSUED").toUpperCase(),
    expiresAt: vc.expiresAt,
    voucher: {
      title: vc.voucherTitle,
      imageUrl: vc.imageUrl, // Lấy từ payload backend vừa update
    },
  }));

  // 2. Group by title
  const groupedCodesObj = mappedCodes.reduce((acc, curr) => {
    const title = curr.voucher.title || "Voucher";
    if (!acc[title]) {
      acc[title] = {
        title,
        imageUrl: curr.voucher.imageUrl,
        codes: []
      };
    }
    acc[title].codes.push(curr);
    return acc;
  }, {});

  const groupedCodes = Object.values(groupedCodesObj);

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden bg-base-50 min-h-[80vh]">
      <Confetti />

      <div className="max-w-4xl w-full flex flex-col items-center relative z-10 animate-fade-in">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-sm border border-primary/20">
          <span
            className="material-symbols-outlined text-primary text-[40px] md:text-[50px] font-bold"
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

        <div className="w-full flex flex-col gap-6 mb-10">
          <div className="bg-base-100 rounded-3xl border border-base-200 shadow-sm p-6 md:p-8">
            <h2 className="text-[20px] font-bold text-base-content mb-6 border-b border-base-200 pb-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[28px]">local_activity</span>
              Danh sách voucher đã mua
            </h2>

            {/* Hiển thị dạng Group */}
            <div className="flex flex-col gap-6">
              {groupedCodes.map((group, idx) => (
                <VoucherGroupCard key={idx} group={group} onOpenQR={handleOpenQR} />
              ))}
            </div>
          </div>
        </div>

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

      <QRCodeModal
        isOpen={isModalOpen}
        onClose={handleCloseQR}
        voucherCode={selectedVoucherCode}
      />
    </div>
  );
}
