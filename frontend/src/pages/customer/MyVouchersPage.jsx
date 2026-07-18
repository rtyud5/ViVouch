import React, { useState } from "react";
import { Link } from "react-router-dom";
import { VoucherCodeCard } from "../../components/voucher/VoucherCodeCard";
import { useMyVouchers } from "../../features/orders/hooks";
import { QRCodeModal, CustomerEmptyState, LoadingSpinner, ErrorRetryPanel } from "../../components/common";

export function MyVouchersPage() {
  const { voucherCodes, isLoading, error, refetch } = useMyVouchers();
  const [activeTab, setActiveTab] = useState("ISSUED");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVoucherCode, setSelectedVoucherCode] = useState(null);

  const tabs = [
    { id: "ISSUED", label: "Chưa dùng" },
    { id: "USED", label: "Đã dùng" },
    { id: "EXPIRED", label: "Hết hạn" },
  ];
  const normalizeStatus = (status) => String(status ?? "ISSUED").toUpperCase();
  const filteredVouchers =
    voucherCodes?.filter((vc) => normalizeStatus(vc.status) === activeTab) || [];
  const issuedCount =
    voucherCodes?.filter((vc) => normalizeStatus(vc.status) === "ISSUED").length || 0;

  const handleOpenQR = (voucherCode) => {
    setSelectedVoucherCode(voucherCode);
    setIsModalOpen(true);
  };

  const handleCloseQR = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedVoucherCode(null), 300);
  };

  const errorTitle = "Không thể tải voucher của tôi";
  const errorDescription =
    "Dữ liệu voucher tạm thời không truy cập được. Vui lòng thử lại để tiếp tục demo.";

  let emptyDescription = "Không có voucher nào hết hạn.";
  if (activeTab === "ISSUED") {
    emptyDescription = "Bạn chưa có voucher nào chưa dùng.";
  } else if (activeTab === "USED") {
    emptyDescription = "Bạn chưa dùng voucher nào.";
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 w-full animate-fade-in">
      <div className="mb-6 md:mb-8">
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-6">Voucher của tôi</h1>
        <div className="flex border-b border-outline-variant gap-4 md:gap-8 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 whitespace-nowrap border-b-2 font-label-md text-label-md transition-colors ${activeTab === tab.id
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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[120px] md:h-36 bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant shadow-sm flex">
              <div className="w-[96px] h-full md:w-20 md:h-20 md:m-4 bg-surface-container flex-shrink-0 md:rounded-lg"></div>
              <div className="flex-1 p-3 md:p-0 md:py-4 md:pr-4 md:ml-4 flex flex-col justify-center gap-2">
                <div className="h-4 bg-surface-container rounded w-3/4"></div>
                <div className="h-3 bg-surface-container rounded w-1/2"></div>
                <div className="h-3 bg-surface-container rounded w-1/4 mt-auto md:mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorRetryPanel title={errorTitle} description={errorDescription} onRetry={refetch} />
      ) : filteredVouchers.length === 0 ? (
        <CustomerEmptyState 
          type="vouchers" 
          description={emptyDescription} 
          action={
            <Link to="/vouchers" className="btn btn-primary rounded-full px-8 font-bold mt-2">
              Khám phá voucher ngay
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {filteredVouchers.map((vc) => (
            <VoucherCodeCard key={vc.code || vc.id} voucherCode={vc} onOpenQR={handleOpenQR} />
          ))}
        </div>
      )}

      <QRCodeModal
        isOpen={isModalOpen}
        onClose={handleCloseQR}
        voucherCode={selectedVoucherCode}
      />
    </div>
  );
}
