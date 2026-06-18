import React, { useState } from "react";
import { formatDate } from "../../utils/formatDate";
import { formatCurrency } from "../../utils/formatCurrency";
import { useOrders } from "../../features/orders/hooks";
import { OrderItemCard } from "../../components/voucher/OrderItemCard";
import { OrderStatusBadge, CustomerEmptyState, LoadingSpinner } from "../../components/common";

export function OrdersPage() {
  const { orders, isLoading } = useOrders();
  const [activeTab, setActiveTab] = useState("ALL");
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  const tabs = [
    { id: "ALL", label: "Tất cả" },
    { id: "COMPLETED", label: "Thành công" },
    { id: "CANCELLED", label: "Đã huỷ" },
  ];

  const filteredOrders = orders?.filter((order) => {
    if (activeTab === "ALL") return true;
    const orderStatus = String(order.status || '').toUpperCase();
    return orderStatus === activeTab;
  }) || [];

  const toggleExpand = (orderCode) => {
    const next = new Set(expandedOrders);
    if (next.has(orderCode)) next.delete(orderCode);
    else next.add(orderCode);
    setExpandedOrders(next);
  };

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
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <CustomerEmptyState
            type="orders"
            description={
              activeTab === "ALL"
                ? "Bạn chưa thực hiện bất kỳ giao dịch nào."
                : activeTab === "COMPLETED"
                ? "Không có đơn hàng thành công nào."
                : "Không có đơn hàng đã hủy nào."
            }
          />
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = expandedOrders.has(order.code);
            const totalVouchers = order.items.reduce((sum, item) => sum + (item.quantity ?? item.qty ?? 0), 0);

            return (
              <div
                key={order.code}
                className={`bg-surface-container-lowest rounded-xl shadow-sm p-6 border border-surface-variant transition-all hover:shadow-md ${
                  order.status === "CANCELLED" ? "opacity-75" : ""
                }`}
              >
                <button
                  className="flex justify-between items-start cursor-pointer group w-full text-left focus:outline-none"
                  onClick={() => toggleExpand(order.code)}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        #{order.code}
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
                    <OrderStatusBadge status={order.status} />
                    <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-300 ${isExpanded ? "rotate-180 text-primary" : "group-hover:text-primary"}`}>
                      expand_more
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-surface-variant mt-4 pt-4 flex flex-col gap-4">
                    {order.items.map((item, index) => (
                      <OrderItemCard key={index} item={item} />
                    ))}
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
