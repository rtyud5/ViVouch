import React, { useState } from "react";
import { VoucherCodeCard } from "../../components/voucher/VoucherCodeCard";
import { useMyVouchers } from "../../features/orders/hooks";

export function MyVouchersPage() {
  const { voucherCodes, isLoading } = useMyVouchers();
  const [activeTab, setActiveTab] = useState("ISSUED");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVoucherCode, setSelectedVoucherCode] = useState(null);

  const tabs = [
    { id: "ISSUED", label: "Chưa dùng" },
    { id: "USED", label: "Đã dùng" },
    { id: "EXPIRED", label: "Hết hạn" },
  ];

  const filteredVouchers = voucherCodes?.filter((vc) => vc.status === activeTab) || [];
  const issuedCount = voucherCodes?.filter((vc) => vc.status === "ISSUED").length || 0;

  const handleOpenQR = (voucherCode) => {
    setSelectedVoucherCode(voucherCode);
    setIsModalOpen(true);
  };

  const handleCloseQR = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedVoucherCode(null), 300);
  };

  const handleCopyCode = async () => {
    if (!selectedVoucherCode || !navigator.clipboard?.writeText) return;
    await navigator.clipboard.writeText(selectedVoucherCode.code);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 w-full">
      <div className="mb-6 md:mb-8">
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-6">Voucher của tôi</h1>
        <div className="flex border-b border-outline-variant gap-4 md:gap-8 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 whitespace-nowrap border-b-2 font-label-md text-label-md transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab.label} {tab.id === "ISSUED" && `(${issuedCount})`}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
      ) : filteredVouchers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
          <span className="material-symbols-outlined text-6xl mb-4 opacity-50">local_activity</span>
          <p className="font-body-lg text-body-lg text-center">Chưa có voucher nào trong mục này</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {filteredVouchers.map((vc) => (
            <VoucherCodeCard key={vc.id} voucherCode={vc} onOpenQR={handleOpenQR} />
          ))}
        </div>
      )}

      <div
        className={`fixed inset-0 z-[100] bg-on-surface/40 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300 ${
          isModalOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) handleCloseQR();
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") handleCloseQR();
        }}
        role="button"
        tabIndex={isModalOpen ? 0 : -1}
        aria-label="Đóng QR Modal"
      >
        <div className={`bg-surface-container-lowest rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col items-center transform transition-transform duration-300 ${isModalOpen ? "scale-100" : "scale-95"}`}>
          <button className="self-end text-on-surface-variant hover:text-on-surface mb-2" onClick={handleCloseQR}>
            <span className="material-symbols-outlined">close</span>
          </button>

          <h2 className="font-headline-md text-headline-md text-on-surface text-center mb-6 line-clamp-2">
            {selectedVoucherCode?.voucher?.name}
          </h2>

          <div className="bg-surface-container p-4 rounded-xl mb-6 shadow-inner w-48 h-48 flex items-center justify-center">
            <span className="material-symbols-outlined text-[150px] text-on-surface font-light">qr_code_2</span>
          </div>

          <p className="font-body-md text-body-md text-on-surface-variant mb-2">Mã của bạn</p>
          <div className="bg-primary-container/20 px-4 py-3 rounded-lg border border-primary/30 w-full flex items-center justify-center gap-3">
            <p className="font-mono text-[24px] font-bold text-primary tracking-[0.2em]">{selectedVoucherCode?.code}</p>
            <button onClick={handleCopyCode} className="text-primary hover:text-primary-fixed-dim transition-colors" title="Copy code">
              <span className="material-symbols-outlined text-[20px]">content_copy</span>
            </button>
          </div>

          <button
            className="w-full mt-8 py-3 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-surface-tint active:scale-95 transition-all shadow-md"
            onClick={handleCloseQR}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
