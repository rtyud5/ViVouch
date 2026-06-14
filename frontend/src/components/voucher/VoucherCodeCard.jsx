import React from 'react';

export function VoucherCodeCard({ voucherCode, onOpenQR }) {
  const { code, status, expirationDate, voucher } = voucherCode;

  // Status mapping
  const statusConfig = {
    ISSUED: {
      colorClass: 'bg-primary',
      badgeClass: 'bg-primary-fixed/20 text-primary-fixed-dim border-primary-fixed/30',
      text: 'Còn hiệu lực',
      stripColor: 'bg-primary'
    },
    USED: {
      colorClass: 'bg-outline',
      badgeClass: 'bg-surface-container text-on-surface-variant border-outline-variant/30',
      text: 'Đã sử dụng',
      stripColor: 'bg-outline'
    },
    EXPIRED: {
      colorClass: 'bg-error',
      badgeClass: 'bg-error-container text-error border-error-container/30',
      text: 'Đã hết hạn',
      stripColor: 'bg-error'
    }
  };

  const currentStatus = statusConfig[status] || statusConfig.ISSUED;
  const isUsable = status === 'ISSUED';
  
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('vi-VN');
  };

  return (
    <article 
      className={`flex bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant shadow-sm transition-all duration-300 relative overflow-hidden group ${isUsable ? 'hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] cursor-pointer active:scale-[0.98]' : 'opacity-80'} h-auto md:h-36`}
      onClick={() => isUsable && onOpenQR(voucherCode)}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${currentStatus.stripColor} z-10`}></div>
      
      {/* Mobile layout (Image left, details right) */}
      <div className="flex flex-1 md:hidden h-[120px]">
        <div className="w-[96px] h-full flex-shrink-0 bg-surface-container flex items-center justify-center p-3 relative z-0 pl-[14px]">
            <img src={voucher.image || "https://placehold.co/100x100"} alt={voucher.name} className="w-full h-full object-cover rounded-lg shadow-sm" />
        </div>
        <div className="relative w-0 border-l border-dashed border-outline-variant my-4 z-0">
            <div className="absolute -top-6 -left-3 w-6 h-6 rounded-full bg-surface border-b border-outline-variant"></div>
            <div className="absolute -bottom-6 -left-3 w-6 h-6 rounded-full bg-surface border-t border-outline-variant"></div>
        </div>
        <div className="flex-1 p-3 pl-4 flex flex-col justify-between z-0 min-w-0">
            <div>
                <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="font-label-md text-label-md text-on-surface line-clamp-2 leading-tight">{voucher.name}</h3>
                </div>
                <div className="mb-1">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap border ${currentStatus.badgeClass}`}>
                        {currentStatus.text}
                    </span>
                </div>
                <p className="font-body-md text-[12px] text-on-surface-variant flex items-center gap-1 truncate">
                    <span className="material-symbols-outlined text-[14px]">storefront</span> {voucher.partner?.name}
                </p>
            </div>
            <div className="flex items-end justify-between mt-1 gap-2">
                <p className={`font-body-md text-[11px] font-medium flex items-center gap-1 shrink-0 ${status === 'EXPIRED' ? 'text-error' : 'text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined text-[12px]">timer</span> HSD: {formatDate(expirationDate)}
                </p>
                <div className="flex items-center gap-1.5 bg-surface-container-low border border-outline-variant/30 rounded px-1.5 py-1 min-w-0">
                    <span className={`font-mono text-[12px] font-bold tracking-widest truncate ${isUsable ? 'text-primary' : 'text-on-surface-variant'}`}>{code}</span>
                    <span className={`material-symbols-outlined text-[14px] shrink-0 ${isUsable ? 'text-primary' : 'text-on-surface-variant'}`}>qr_code_2</span>
                </div>
            </div>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex flex-1 items-center p-4 gap-4 pl-6 min-w-0">
        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 shadow-sm border border-outline-variant/30">
           <img src={voucher.image || "https://placehold.co/100x100"} alt={voucher.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col justify-center flex-1 min-w-0">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-label-md text-[10px] w-fit mb-1 border uppercase tracking-wider ${currentStatus.badgeClass}`}>
            {currentStatus.text}
          </span>
          <h2 className="font-headline-md text-[18px] leading-[24px] text-on-surface truncate mb-0.5">{voucher.name}</h2>
          <p className="font-body-md text-[14px] text-on-surface-variant truncate mb-2">{voucher.partner?.name}</p>
          <div className={`flex items-center gap-1.5 ${status === 'EXPIRED' ? 'text-error' : 'text-on-surface-variant'}`}>
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            <span className="font-body-md text-[12px]">HSD: {formatDate(expirationDate)}</span>
          </div>
        </div>
      </div>
      
      <div className="hidden md:flex relative w-0 border-l border-dashed border-outline-variant my-2 z-10 flex-col justify-between items-center">
        <div className="w-4 h-4 rounded-full bg-surface absolute -top-4 -left-2 border-b border-dashed border-outline-variant"></div>
        <div className="w-4 h-4 rounded-full bg-surface absolute -bottom-4 -left-2 border-t border-dashed border-outline-variant"></div>
      </div>

      <div className="hidden md:flex w-[120px] shrink-0 bg-surface-container-lowest flex-col items-center justify-center p-4 relative group">
        <div className={`p-2 rounded-lg bg-surface-container mb-2 transition-colors ${isUsable ? 'group-hover:bg-primary-fixed/20' : ''}`}>
          <span className={`material-symbols-outlined text-[32px] text-on-surface-variant transition-colors ${isUsable ? 'group-hover:text-primary' : ''}`}>
             qr_code_2
          </span>
        </div>
        <div className="bg-surface px-2 py-1 rounded border border-outline-variant/30 w-full text-center truncate">
          <span className="font-mono text-[11px] font-bold tracking-widest text-on-surface">{code}</span>
        </div>
        {isUsable && (
            <span className="font-label-md text-[10px] text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Sử dụng ngay</span>
        )}
      </div>
    </article>
  );
}
