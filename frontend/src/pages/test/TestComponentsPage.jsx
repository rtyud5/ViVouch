import React, { useState } from 'react';
import { StatCard } from "../../components/dashboard/StatCard";
import { StatusBadge, LoadingSpinner, EmptyState, CopyButton, CustomerEmptyState } from "../../components/common";
import { VoucherCodeCard } from "../../components/voucher/VoucherCodeCard";
import { QRCodeModal } from "../../components/voucher/QRCodeModal";
import { OrderItemCard } from "../../components/order/OrderItemCard";
import { OrderSummaryCard } from "../../components/order/OrderSummaryCard";
import { OrderStatusBadge } from "../../components/order/OrderStatusBadge";

export function TestComponentsPage() {
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const mockVoucherCode = {
    id: 101,
    status: "ISSUED",
    code: "HDL88XYZ",
    expirationDate: "2026-11-30T00:00:00.000Z",
    voucher: {
      name: "Buffet Lẩu Haidilao - Suất Gia Đình",
      partner: { name: "Haidilao Vietnam" },
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1d1Y9RGlCM_742-mngx3a8OltvTaU8MlOhrXl_oQuyWGxowtyg4J5TKXtwqUDS9_D4CZndZoF3PxnIYS4bttTkeBdGqsLHfjYmil0F-dKu9Zfm937ED2yS-YHcbrrsIXfsPEy5aUN4WyCTBaux7O8LSgMso4YBJNH9T0xCJB-Z1Ak1GHd8yG4RQxLY1gcAFo846_SoVMxH9CeIq4HKhacCiFrRPEge-9cOu_NuMnQkvxgkhLcjCGhL1zdrz4ywQqAHLegkNp0sfY"
    }
  };

  const mockVoucherCodeUsed = {
    ...mockVoucherCode,
    id: 102,
    status: "USED",
    code: "HDL-USED"
  };

  const mockVoucherCodeExpired = {
    ...mockVoucherCode,
    id: 103,
    status: "EXPIRED",
    code: "HDL-EXPIRED",
    expirationDate: "2023-01-01T00:00:00.000Z"
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12 pb-24">
      <h1 className="text-3xl font-bold border-b pb-4">Component Test Page</h1>

      {/* QRCodeModal & VoucherCodeCard Test */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b border-outline-variant pb-2">Voucher Code Cards & QR Modal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-on-surface-variant">Horizontal (MyVouchers List)</h3>
            <VoucherCodeCard voucherCode={mockVoucherCode} onOpenQR={() => setIsQRModalOpen(true)} />
            <VoucherCodeCard voucherCode={mockVoucherCodeUsed} onOpenQR={() => setIsQRModalOpen(true)} />
            <VoucherCodeCard voucherCode={mockVoucherCodeExpired} onOpenQR={() => setIsQRModalOpen(true)} />
            <button className="btn btn-outline btn-primary w-full mt-2 cursor-pointer" onClick={() => setIsQRModalOpen(true)}>
              Mở QR Code Modal trực tiếp
            </button>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-on-surface-variant">Detailed (OrderSuccess Page)</h3>
            <VoucherCodeCard voucherCode={mockVoucherCode} variant="detailed" />
          </div>
        </div>

        <QRCodeModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          voucherCode={mockVoucherCode}
        />
      </section>

      {/* CopyButton Test */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b border-outline-variant pb-2">CopyButton Utility</h2>
        <div className="bg-surface-container p-6 rounded-xl flex flex-wrap gap-6 items-center">
          <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/30">
            <span className="font-mono font-bold select-all">MÃ-TEST-12345</span>
            <CopyButton value="MÃ-TEST-12345" />
          </div>
          <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/30">
            <CopyButton value="MÃ-VỚI-NHÃN-HIỂN-THỊ" showLabel={true} />
          </div>
        </div>
      </section>

      {/* OrderItemCard & OrderSummaryCard Test */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b border-outline-variant pb-2">Order Shared Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 space-y-4">
            <h3 className="text-lg font-medium text-on-surface-variant">Order Items</h3>
            <OrderItemCard
              name="Buffet Lẩu 2 người - Haidilao"
              image="https://lh3.googleusercontent.com/aida-public/AB6AXuD1d1Y9RGlCM_742-mngx3a8OltvTaU8MlOhrXl_oQuyWGxowtyg4J5TKXtwqUDS9_D4CZndZoF3PxnIYS4bttTkeBdGqsLHfjYmil0F-dKu9Zfm937ED2yS-YHcbrrsIXfsPEy5aUN4WyCTBaux7O8LSgMso4YBJNH9T0xCJB-Z1Ak1GHd8yG4RQxLY1gcAFo846_SoVMxH9CeIq4HKhacCiFrRPEge-9cOu_NuMnQkvxgkhLcjCGhL1zdrz4ywQqAHLegkNp0sfY"
              quantity={1}
              price={179000}
              partnerName="Haidilao Vietnam"
            />
            <OrderItemCard
              name="Buffet Hải Sản Cao Cấp tại Khách Sạn Nikko Saigon"
              image="https://lh3.googleusercontent.com/aida-public/AB6AXuBly9sHjErwVhkT08cKkXRc8xS2EAFJIIN4hSUgTcWscWWd9CjvE-8fBJW4ukccSGQF-8-iIqLXvxiX_57s_x00JfxIrxv3BrNqqH0xcrVWvJmnKljzivfwMJhb5qoxKqyjT9Fmrnk2jLO8ZH8DjAtNDhYXWIIWGAUEKXYN54UTUXjaihhngYcWDASG13pZyZLpOO9ISL5LI5brmPdiopelgAzfhc3Bmenj75dFrOv52hkgrdH9eaHUeuaJc6IBLTFLsnYi09Uin2E"
              quantity={2}
              price={350000}
              partnerName="Nikko Saigon Hotel"
            />
          </div>
          <div className="md:col-span-5">
            <h3 className="text-lg font-medium text-on-surface-variant mb-4">Summary Panel</h3>
            <OrderSummaryCard
              totalQuantity={3}
              totalAmount={879000}
              discount={50000}
              finalAmount={829000}
              paymentMethod="Ví ViVouch (Mô phỏng)"
              actionButton={
                <button className="w-full bg-primary text-on-primary font-semibold py-3 rounded-lg hover:bg-surface-tint transition-all active:scale-[0.98] cursor-pointer">
                  Thanh Toán Ngay
                </button>
              }
            />
          </div>
        </div>
      </section>

      {/* OrderStatusBadge Test */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b border-outline-variant pb-2">OrderStatus Badges</h2>
        <div className="flex flex-wrap gap-4 bg-surface-container p-6 rounded-xl">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-on-surface-variant font-mono">PENDING</span>
            <OrderStatusBadge status="PENDING" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-on-surface-variant font-mono">COMPLETED</span>
            <OrderStatusBadge status="COMPLETED" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-on-surface-variant font-mono">PAID</span>
            <OrderStatusBadge status="PAID" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-on-surface-variant font-mono">CANCELLED</span>
            <OrderStatusBadge status="CANCELLED" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-on-surface-variant font-mono">FAILED</span>
            <OrderStatusBadge status="FAILED" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-on-surface-variant font-mono">UNKNOWN</span>
            <OrderStatusBadge status="SOME_RANDOM_STATUS" />
          </div>
        </div>
      </section>

      {/* CustomerEmptyState Test */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold border-b border-outline-variant pb-2">CustomerEmptyState Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-outline-variant/30 rounded-xl bg-surface-container-lowest overflow-hidden">
            <h3 className="p-4 bg-surface-container-low border-b border-outline-variant/20 font-medium text-sm">Example: Cart Empty</h3>
            <CustomerEmptyState
              title="Giỏ hàng trống"
              description="Bạn chưa có voucher nào trong giỏ hàng. Hãy khám phá những ưu đãi hấp dẫn ngay!"
              icon="local_mall"
              action={
                <button className="btn btn-primary btn-sm rounded-full cursor-pointer">Khám phá voucher</button>
              }
            />
          </div>
          <div className="border border-outline-variant/30 rounded-xl bg-surface-container-lowest overflow-hidden">
            <h3 className="p-4 bg-surface-container-low border-b border-outline-variant/20 font-medium text-sm">Example: No Orders</h3>
            <CustomerEmptyState
              title="Chưa có đơn hàng"
              description="Bạn chưa thực hiện bất kỳ giao dịch nào trên hệ thống."
              icon="receipt_long"
            />
          </div>
        </div>
      </section>

      {/* Existing Test Page Sections */}
      <section className="border-t border-outline-variant pt-8">
        <h2 className="text-2xl font-semibold mb-4 text-on-surface-variant">Default Component Previews</h2>
        <div className="space-y-8">
          <div>
            <h3 className="font-semibold mb-2 text-sm">StatCards</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard label="Total Revenue" value="$45,231" trend="+20.1%" color="primary" />
              <StatCard label="Active Users" value="2,450" trend="+15%" color="success" />
              <StatCard label="Bounce Rate" value="45%" trend="-5%" color="error" />
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-sm">StatusBadges</h3>
            <div className="flex flex-wrap gap-4">
              <StatusBadge status="draft" />
              <StatusBadge status="pending_approval" />
              <StatusBadge status="approved" />
              <StatusBadge status="on_sale" />
              <StatusBadge status="rejected" />
              <StatusBadge status="paused" />
              <StatusBadge status="expired" />
              <StatusBadge status="suspended" />
              <StatusBadge status="issued" />
              <StatusBadge status="used" />
              <StatusBadge status="cancelled" />
              <StatusBadge status="locked" />
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-sm">LoadingSpinner</h3>
            <div className="flex items-center gap-8 bg-base-200 p-6 rounded-box">
              <LoadingSpinner size="sm" />
              <LoadingSpinner size="md" />
              <LoadingSpinner size="lg" />
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-sm">Original EmptyState</h3>
            <EmptyState 
              title="No search results found" 
              description="Try adjusting your keywords or search filters."
            />
          </div>
        </div>
      </section>
    </div>
  );
}
