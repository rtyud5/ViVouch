import React, { useState } from "react";
import { StatCard } from "../../components/dashboard/StatCard";
import {
  StatusBadge,
  LoadingSpinner,
  EmptyState,
  CopyButton,
  QRCodeModal,
  OrderStatusBadge,
  CustomerEmptyState
} from "../../components/common";
import { VoucherCodeCard } from "../../components/voucher/VoucherCodeCard";
import { OrderItemCard } from "../../components/voucher/OrderItemCard";
import { OrderSummaryCard } from "../../components/voucher/OrderSummaryCard";

export function TestComponentsPage() {
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedVoucherCode, setSelectedVoucherCode] = useState(null);

  // Mock voucher code objects for VoucherCodeCard
  const activeVoucherCode = {
    code: "HDL88XYZ",
    status: "ISSUED",
    expiresAt: "2026-12-31T23:59:59Z",
    voucher: {
      title: "Buffet Lẩu Haidilao 2 Người",
      imageUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=300&q=80",
      partner: {
        businessName: "Haidilao Vietnam"
      }
    }
  };

  const usedVoucherCode = {
    code: "HL50KNOV",
    status: "USED",
    expiresAt: "2026-11-30T23:59:59Z",
    voucher: {
      title: "Giảm 50K Toàn Bộ Menu Đồ Uống",
      imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=300&q=80",
      partner: {
        businessName: "Highlands Coffee"
      }
    }
  };

  const expiredVoucherCode = {
    code: "CGV2D89P",
    status: "EXPIRED",
    expiresAt: "2026-05-15T23:59:59Z",
    voucher: {
      title: "Vé Xem Phim 2D Mọi Khung Giờ",
      imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=300&q=80",
      partner: {
        businessName: "CGV Cinemas"
      }
    }
  };

  // Mock order items for OrderItemCard
  const mockOrderItems = [
    {
      id: "item-1",
      voucher: {
        title: "Buffet Lẩu Haidilao 2 Người",
        imageUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=300&q=80"
      },
      qty: 2,
      unitPrice: 250000
    },
    {
      id: "item-2",
      voucher: {
        title: "Giảm 50K Toàn Bộ Menu Đồ Uống",
        imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=300&q=80"
      },
      qty: 1,
      unitPrice: 50000
    }
  ];

  const handleOpenQR = (vc) => {
    setSelectedVoucherCode(vc);
    setIsQRModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-12 pb-24">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">Component Test Page</h1>
        <p className="text-on-surface-variant text-sm mt-1">Previewing shared components for Customer Portal</p>
      </div>

      {/* CopyButton & QRCodeModal Test */}
      <section className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm space-y-4">
        <h2 className="text-xl font-bold border-b pb-2 text-primary flex items-center gap-2">
          <span className="material-symbols-outlined">qr_code_2</span>
          CopyButton & QRCodeModal
        </h2>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/30">
            <span className="font-mono font-bold text-on-surface">VC-SAMPLE-999</span>
            <CopyButton text="VC-SAMPLE-999" />
          </div>
          <button
            onClick={() => handleOpenQR(activeVoucherCode)}
            className="btn btn-primary rounded-full px-6 shadow-sm"
          >
            Mở QRCodeModal mẫu
          </button>
        </div>
      </section>

      {/* VoucherCodeCard Test */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined">local_activity</span>
          VoucherCodeCards (Responsive mobile/desktop)
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Chưa dùng (Clickable)</p>
            <VoucherCodeCard voucherCode={activeVoucherCode} onOpenQR={handleOpenQR} />
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Đã sử dụng</p>
            <VoucherCodeCard voucherCode={usedVoucherCode} />
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Đã hết hạn</p>
            <VoucherCodeCard voucherCode={expiredVoucherCode} />
          </div>
        </div>
      </section>

      {/* OrderItemCard & OrderSummaryCard Test */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">shopping_bag</span>
            OrderItemCards
          </h2>
          <div className="flex flex-col gap-4">
            <OrderItemCard item={mockOrderItems[0]} />
            <OrderItemCard item={mockOrderItems[1]} />
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">receipt</span>
            OrderSummaryCard
          </h2>
          <OrderSummaryCard
            totalQty={3}
            totalAmount={550000}
            paymentMethod="MOCK_GATEWAY"
            orderCode="VV-2026-XYZ123"
            date="2026-06-18T12:00:00Z"
            status="COMPLETED"
            action={
              <button className="btn btn-primary w-full rounded-full" onClick={() => alert("CTA Clicked")}>
                Hành động chính
              </button>
            }
          />
        </div>
      </section>

      {/* OrderStatusBadge & CustomerEmptyState Test */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm">
          <h2 className="text-xl font-bold text-primary border-b pb-2 flex items-center gap-2">
            <span className="material-symbols-outlined">shield</span>
            OrderStatusBadges
          </h2>
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-on-surface-variant uppercase font-medium">COMPLETED</span>
              <OrderStatusBadge status="COMPLETED" />
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-on-surface-variant uppercase font-medium">PENDING_PAYMENT</span>
              <OrderStatusBadge status="PENDING_PAYMENT" />
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-on-surface-variant uppercase font-medium">PENDING</span>
              <OrderStatusBadge status="PENDING" />
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-on-surface-variant uppercase font-medium">CANCELLED</span>
              <OrderStatusBadge status="CANCELLED" />
            </div>
          </div>
        </div>

        <div className="space-y-4 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm">
          <h2 className="text-xl font-bold text-primary border-b pb-2 flex items-center gap-2">
            <span className="material-symbols-outlined">inbox</span>
            CustomerEmptyStates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="border border-dashed border-outline-variant/40 rounded-xl p-4">
              <span className="text-xs font-semibold text-on-surface-variant mb-2 block text-center">Type: vouchers</span>
              <CustomerEmptyState type="vouchers" />
            </div>
            <div className="border border-dashed border-outline-variant/40 rounded-xl p-4">
              <span className="text-xs font-semibold text-on-surface-variant mb-2 block text-center">Type: orders</span>
              <CustomerEmptyState type="orders" />
            </div>
          </div>
        </div>
      </section>

      {/* Legacy Core components */}
      <div className="border-t pt-8">
        <h2 className="text-xl font-bold mb-4 text-on-surface-variant">Legacy Core Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-surface-container-low p-6 rounded-box">
            <h3 className="text-lg font-semibold mb-3">StatCards</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard label="Total Revenue" value="$45,231" trend="+20.1%" color="primary" />
              <StatCard label="Active Users" value="2,450" trend="+15%" color="success" />
            </div>
          </section>

          <section className="bg-surface-container-low p-6 rounded-box">
            <h3 className="text-lg font-semibold mb-3">Loading Spinner Sizes</h3>
            <div className="flex items-center gap-6">
              <LoadingSpinner size="sm" />
              <LoadingSpinner size="md" />
              <LoadingSpinner size="lg" />
            </div>
          </section>
        </div>
      </div>

      {/* Active Modal Portal */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        voucherCode={selectedVoucherCode}
      />
    </div>
  );
}
