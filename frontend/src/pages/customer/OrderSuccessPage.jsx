import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { VoucherCodeCard } from "../../components/voucher/VoucherCodeCard";
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
    setSelectedVoucherCode(vc);
    setIsModalOpen(true);
  };

  const handleCloseQR = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedVoucherCode(null), 300);
  };

  if (!orderId) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 text-center bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm">
        <span className="material-symbols-outlined text-[64px] text-error mb-4">warning</span>
        <h2 className="text-xl font-bold mb-2">Không tìm thấy thông tin đơn hàng</h2>
        <p className="text-on-surface-variant text-sm mb-6">
          Bạn có thể đã tải lại trang hoặc chưa đặt hàng thành công.
        </p>
        <Link to="/customer/home" className="btn btn-primary w-full rounded-full">
          Về trang chủ
        </Link>
      </div>
    );
  }

  const mappedCodes = (voucherCodes || []).map((vc, index) => ({
    id: `vc-${index}`,
    code: vc.code,
    status: String(vc.status || "ISSUED").toUpperCase(),
    expiresAt: vc.expiresAt,
    voucher: {
      title: vc.voucherTitle,
      imageUrl: null,
    },
  }));

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden bg-background min-h-[80vh]">
      <Confetti />

      <div className="max-w-3xl w-full flex flex-col items-center relative z-10 animate-fade-in">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-primary-container rounded-full flex items-center justify-center mb-6 shadow-md border border-primary/10">
          <span
            className="material-symbols-outlined text-primary text-[40px] md:text-[50px] font-bold"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>

        <h1 className="font-display-lg text-[28px] md:text-[36px] text-center mb-2 font-bold text-on-surface tracking-tight">
          Đặt hàng thành công!
        </h1>
        <p className="text-on-surface-variant font-body-lg text-[15px] md:text-[18px] mb-8">
          Mã đơn: <span className="font-mono font-bold text-primary select-all">#{orderId}</span>
        </p>

        <div className="w-full flex flex-col gap-6 mb-8">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-6">
            <h2 className="font-headline-md text-[18px] font-bold text-on-surface mb-4 border-b border-outline-variant/20 pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">local_activity</span>
              Mã voucher đã phát hành ({mappedCodes.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mappedCodes.map((vc) => (
                <VoucherCodeCard key={vc.id} voucherCode={vc} onOpenQR={handleOpenQR} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
          <Link
            to="/customer/home"
            className="btn btn-outline border-2 border-primary text-primary hover:bg-primary-container hover:text-on-primary-container hover:border-primary px-8 py-3 rounded-full flex-1 font-label-md text-label-md"
          >
            Về trang chủ
          </Link>
          <Link
            to="/customer/my-vouchers"
            className="btn btn-primary px-8 py-3 rounded-full flex-1 font-label-md text-label-md shadow-sm"
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
