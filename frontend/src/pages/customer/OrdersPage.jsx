import React, { useState } from "react";
import { formatDate } from "../../utils/formatDate";
import { formatCurrency } from "../../utils/formatCurrency";
import { useOrders } from "../../features/orders/hooks";

const getStatusStyle = (status) => {
  switch (status) {
    case "COMPLETED":
      return { label: "Thành công", classes: "badge badge-success" };
    case "CANCELLED":
      return { label: "Đã huỷ", classes: "badge badge-error" };
    case "PENDING":
      return { label: "Chờ xử lý", classes: "badge badge-warning" };
    default:
      return { label: status, classes: "badge badge-neutral" };
  }
};

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
    return order.status === activeTab;
  }) || [];

  const toggleExpand = (orderCode) => {
    const next = new Set(expandedOrders);
    if (next.has(orderCode)) next.delete(orderCode);
    else next.add(orderCode);
    setExpandedOrders(next);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
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
          <div className="flex justify-center py-12">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-50">receipt_long</span>
            <p className="font-body-lg text-body-lg text-center">Chưa có đơn hàng nào</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = expandedOrders.has(order.code);
            const statusStyle = getStatusStyle(order.status);
            const totalVouchers = order.items.reduce((sum, item) => sum + item.quantity, 0);

            return (
              <div
                key={order.code}
                className={`bg-surface-container-lowest rounded-lg shadow-sm p-6 border border-surface-variant transition-all hover:shadow-md ${
                  order.status === "CANCELLED" ? "opacity-75" : ""
                }`}
              >
                <button
                  className="flex justify-between items-start cursor-pointer group w-full text-left"
                  onClick={() => toggleExpand(order.code)}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-label-md text-label-md text-on-surface">{order.code}</span>
                      <span className="font-body-md text-body-md text-on-surface-variant text-sm">
                        {formatDate(order.date)}
                      </span>
                    </div>
                    <div className="font-body-md text-body-md text-on-surface-variant">
                      {totalVouchers} voucher
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="font-price-display text-price-display text-on-surface mb-2">
                      {formatCurrency(order.totalAmount)}
                    </div>
                    <div className={`font-label-md text-label-md px-3 py-1 rounded-full text-xs mb-2 ${statusStyle.classes}`}>
                      {statusStyle.label}
                    </div>
                    <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-300 ${isExpanded ? "rotate-180 text-primary" : "group-hover:text-primary"}`}>
                      expand_more
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-surface-variant mt-4 pt-4 flex flex-col gap-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex gap-4 items-center">
                        <img
                          alt={item.voucher.name}
                          className="w-20 h-20 rounded-lg object-cover bg-surface-container-high"
                          src={item.voucher.image}
                        />
                        <div>
                          <div className="font-label-md text-label-md text-on-surface mb-1">
                            {item.voucher.name}
                          </div>
                          <div className="font-body-md text-body-md text-on-surface-variant text-sm">
                            Số lượng: {item.quantity}
                          </div>
                        </div>
                      </div>
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
