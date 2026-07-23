import React, { useState } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../../utils/formatDate";
import { formatCurrency } from "../../utils/formatCurrency";
import { useOrders } from "../../features/orders/hooks";
import { OrderItemCard } from "../../components/voucher/OrderItemCard";
import { OrderStatusBadge, CustomerEmptyState, LoadingSpinner, ErrorRetryPanel } from "../../components/common";
import { getRefundEligibility } from "../../utils/refundEligibility";

export function OrdersPage() {
  const { orders, isLoading, error, refetch } = useOrders();
  const [activeTab, setActiveTab] = useState("ALL");
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  const tabs = [
    { id: "ALL", label: "Tất cả" },
    { id: "COMPLETED", label: "Thành công" },
    { id: "REFUND_PENDING", label: "Chờ hoàn" },
    { id: "REFUNDED", label: "Đã hoàn" },
    { id: "CANCELLED", label: "Đã huỷ" },
  ];

  const filteredOrders =
    orders?.filter((order) => {
      if (activeTab === "ALL") return true;
      return String(order.status || "").toUpperCase() === activeTab;
    }) || [];

  const toggleExpand = (orderCode) => {
    const next = new Set(expandedOrders);
    if (next.has(orderCode)) next.delete(orderCode);
    else next.add(orderCode);
    setExpandedOrders(next);
  };

  const errorTitle = "Không thể tải lịch sử đơn hàng";
  const errorDescription =
    "Dữ liệu đơn hàng tạm thời không truy cập được. Vui lòng thử lại để tiếp tục demo.";

  let emptyDescription = "Không có đơn hàng đã huỷ nào.";
  if (activeTab === "ALL") {
    emptyDescription = "Bạn chưa thực hiện bất kỳ giao dịch nào.";
  } else if (activeTab === "COMPLETED") {
    emptyDescription = "Không có đơn hàng thành công nào.";
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">
          Lịch sử đơn hàng
        </h1>
      </div>

      <div className="flex gap-4 mb-8 border-b border-surface-variant overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`font-label-md text-label-md py-4 px-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "text-primary font-bold border-b-2 border-primary"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {isLoading ? (
          <div className="flex flex-col gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-container-lowest rounded-xl shadow-sm p-6 border border-surface-variant flex justify-between items-start">
                <div>
                  <div className="h-5 bg-surface-container rounded w-32 mb-3"></div>
                  <div className="h-4 bg-surface-container rounded w-24"></div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="h-6 bg-surface-container rounded w-28 mb-1"></div>
                  <div className="h-6 bg-surface-container rounded-full w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorRetryPanel title={errorTitle} description={errorDescription} onRetry={refetch} />
        ) : filteredOrders.length === 0 ? (
          <CustomerEmptyState 
            type="orders" 
            description={emptyDescription} 
            action={
              <Link to="/vouchers" className="btn btn-primary rounded-full px-8 font-bold mt-2">
                Khám phá voucher ngay
              </Link>
            }
          />
        ) : (
          filteredOrders.map((order) => {
            const normalizedStatus = String(order.status || "").toUpperCase();
            const orderCode = order.code || order.id;
            const isExpanded = expandedOrders.has(orderCode);
            const totalVouchers = (order.items || []).reduce(
              (sum, item) => sum + (item.quantity ?? item.qty ?? 0),
              0
            );

            return (
              <div
                key={orderCode}
                className={`bg-surface-container-lowest rounded-xl shadow-sm p-6 border border-surface-variant transition-all hover:shadow-md ${
                  normalizedStatus === "CANCELLED" ? "opacity-75" : ""
                }`}
              >
                <button
                  className="flex justify-between items-start cursor-pointer group w-full text-left focus:outline-none"
                  onClick={() => toggleExpand(orderCode)}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        #{String(orderCode).slice(0, 8)}
                      </span>
                      <span className="font-body-md text-body-md text-on-surface-variant text-sm">
                        {formatDate(order.date || order.createdAt)}
                      </span>
                    </div>
                    <div className="font-body-md text-body-md text-on-surface-variant">
                      {totalVouchers} voucher
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5">
                    <div className="font-price-display text-price-display text-on-surface">
                      {formatCurrency(Number(order.totalAmount))}
                    </div>
                    <OrderStatusBadge status={normalizedStatus} />
                    <span
                      className={`material-symbols-outlined text-on-surface-variant transition-transform duration-300 ${
                        isExpanded ? "rotate-180 text-primary" : "group-hover:text-primary"
                      }`}
                    >
                      expand_more
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-surface-variant mt-4 pt-4 flex flex-col gap-4">
                    {order.items.map((item, index) => (
                      <OrderItemCard key={index} item={item} />
                    ))}

                    <div className="bg-base-200/40 rounded-xl p-4 mt-2 text-sm space-y-2 border border-base-200">
                      <div className="flex justify-between flex-wrap gap-2">
                        <span className="text-base-content/70 font-medium">Phương thức thanh toán:</span>
                        <span className="font-semibold text-base-content">
                          {order.payment?.method === "VIVOUCH_WALLET" && "Ví ViVouch (Mock)"}
                          {order.payment?.method === "PAYOS" && "payOS VietQR (Real)"}
                          {!["VIVOUCH_WALLET", "PAYOS"].includes(order.payment?.method) && (order.payment?.method || "Không rõ")}
                        </span>
                      </div>
                      <div className="flex justify-between flex-wrap gap-2">
                        <span className="text-base-content/70 font-medium">Trạng thái thanh toán:</span>
                        <span className={`font-semibold ${order.payment?.status === "PAID" ? "text-success" : "text-warning"}`}>
                          {order.payment?.status === "PAID" && "Đã thanh toán"}
                          {order.payment?.status === "PENDING" && "Chờ thanh toán"}
                          {order.payment?.status === "REFUNDED" && "Đã hoàn tiền"}
                          {order.payment?.status === "CANCELLED" && "Đã hủy"}
                          {order.payment?.status === "FAILED" && "Thất bại"}
                        </span>
                      </div>

                      {(order.recipientName || order.recipientPhone || order.note) && (
                        <div className="border-t border-base-200 pt-3 mt-3 space-y-2">
                          <h4 className="font-bold text-xs text-primary uppercase tracking-wider">Thông tin quà tặng & Ghi chú</h4>
                          {order.recipientName && (
                            <div className="flex justify-between flex-wrap gap-2">
                              <span className="text-base-content/70">Người nhận:</span>
                              <span className="font-semibold text-base-content">{order.recipientName}</span>
                            </div>
                          )}
                          {order.recipientPhone && (
                            <div className="flex justify-between flex-wrap gap-2">
                              <span className="text-base-content/70">Số điện thoại người nhận:</span>
                              <span className="font-semibold text-base-content font-mono">{order.recipientPhone}</span>
                            </div>
                          )}
                          {order.note && (
                            <div className="flex justify-between flex-wrap gap-2">
                              <span className="text-base-content/70">Ghi chú / Lời nhắn:</span>
                              <span className="font-medium text-base-content text-right italic">"{order.note}"</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {getRefundEligibility(order).eligible && (
                      <div className="flex justify-end">
                        <Link to={`/customer/refunds?orderId=${order.id}`} className="btn btn-outline btn-sm">Yêu cầu hoàn tiền</Link>
                      </div>
                    )}
                    {order.refundRequest && <div className="alert alert-info text-sm">Trạng thái hoàn tiền: {order.refundRequest.status}</div>}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
