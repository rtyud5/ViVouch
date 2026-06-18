import React, { useState } from "react";
import { VoucherCodeCard } from "../../components/voucher/VoucherCodeCard";
import { useMyVouchers } from "../../features/orders/hooks";
import { QRCodeModal, CustomerEmptyState, LoadingSpinner } from "../../components/common";

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

  const filteredVouchers = voucherCodes?.filter((vc) => {
    const vcStatus = String(vc.status || '').toUpperCase();
    return vcStatus === activeTab;
  }) || [];

  const issuedCount = voucherCodes?.filter((vc) => String(vc.status || '').toUpperCase() === "ISSUED").length || 0;

  const handleOpenQR = (voucherCode) => {
    setSelectedVoucherCode(voucherCode);
    setIsModalOpen(true);
  };

  const handleCloseQR = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedVoucherCode(null), 300);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 w-full animate-fade-in">
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
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredVouchers.length === 0 ? (
        <CustomerEmptyState
          type="vouchers"
          description={
            activeTab === "ISSUED"
              ? "Bạn chưa có voucher nào chưa dùng."
              : activeTab === "USED"
              ? "Bạn chưa dùng voucher nào."
              : "Không có voucher nào hết hạn."
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {filteredVouchers.map((vc) => (
            <VoucherCodeCard key={vc.id} voucherCode={vc} onOpenQR={handleOpenQR} />
          ))}
        </div>
      )}

      {/* Shared QRCodeModal */}
      <QRCodeModal
        isOpen={isModalOpen}
        onClose={handleCloseQR}
        voucherCode={selectedVoucherCode}
      />
    </div>
  );
}
