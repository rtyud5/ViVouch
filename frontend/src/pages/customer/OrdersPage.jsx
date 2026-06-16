import React, { useState, useEffect } from 'react';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';

// Mock hook since useOrders is not available yet
const useOrdersMock = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Mock data
        const mockOrders = [
            {
                code: "#VV-00142",
                date: "2024-05-20T10:30:00.000Z",
                status: "COMPLETED",
                totalAmount: 529000,
                items: [
                    {
                        id: 1,
                        quantity: 1,
                        voucher: {
                            name: "Buffet Lẩu 2 người — Haidilao",
                            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfLn1Cm6h7ijDTLOvN_Y4CMiQ_I2mr1yz1nHf7UAI_RH0AgHgCTy460gl7Qs81Pwkgj0JL1UWZDkMb9Hezn8wBMhAR5KFfspyChyVcWqeF5qVJD0-xBYgtHg9lmzrB_-x1wcmkoOb8e4cbCdUwW0h1jggdaeKXajl5LzFaT9m-vJXbLb8dhOz3J62saaaQZgmmQrCGpOsdT8pONuysdrLLGKbqcAiKTuHGVexfJOOcxagvTJ3nGgtcUeUnc35NknhMGFqHitXhFjg"
                        }
                    },
                    {
                        id: 2,
                        quantity: 1,
                        voucher: {
                            name: "Buffet Hải Sản Nikko",
                            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBly9sHjErwVhkT08cKkXRc8xS2EAFJIIN4hSUgTcWscWWd9CjvE-8fBJW4ukccSGQF-8-iIqLXvxiX_57s_x00JfxIrxv3BrNqqH0xcrVWvJmnKljzivfwMJhb5qoxKqyjT9Fmrnk2jLO8ZH8DjAtNDhYXWIIWGAUEKXYN54UTUXjaihhngYcWDASG13pZyZLpOO9ISL5LI5brmPdiopelgAzfhc3Bmenj75dFrOv52hkgrdH9eaHUeuaJc6IBLTFLsnYi09Uin2E"
                        }
                    }
                ]
            },
            {
                code: "#VV-00141",
                date: "2024-05-15T14:20:00.000Z",
                status: "PENDING",
                totalAmount: 150000,
                items: [
                    {
                        id: 3,
                        quantity: 1,
                        voucher: {
                            name: "Vé Xem Phim 2D CGV",
                            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1O0x7Rvo3cQgjEcA89SZIBiLxG6OQpKA50V5tFMrIyTjrk0P8VoE4oIOf6KReH-fZAN-i035hi_gceoPo2v103V88W7eWkbtL5vy0PQVQHMx71Pck7NfV8eSidkHMX1dOLiDNyHSphPTiU_Q-TRzCZfSGNlTtjnURpo3fwNKwiZUoeRLZ0sbmsbjZLH5BvSCes9KVeN_IwTZRKxLkMNxs0AXCehDtq7UuNO5cngGYJ1SsOfMObmZofJJ8HruiSY4I6CXsXzNuDps"
                        }
                    }
                ]
            },
            {
                code: "#VV-00139",
                date: "2024-05-10T09:15:00.000Z",
                status: "CANCELLED",
                totalAmount: 1200000,
                items: [
                    {
                        id: 4,
                        quantity: 3,
                        voucher: {
                            name: "Giảm 50K Đồ Uống Highlands",
                            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDL9cl-EevmKL6AKe0pOcPc6MZPoc0Obtz948qRgzDBbZXtaBs3_eAZ9_pmWesU6Qz_cXQwerI_E_LTyJNWjfl3ZZrCYsfsqjJ8g8ihp8_s8_EWmqZrm5IviDZFdEzCH0iIEAbtzT45BYzl6a_qa--SrBa8lkr2mnTXLtNhCsgJfED35IOuT_mwqHtavdEGkuI_nShrHPMZ9myw3yiDLPpcBgcxbCGaZ_MTMHXUwp1A_3jrB7YP7mAHv5vz9E_AB3thsMUhLRgFsEI"
                        }
                    }
                ]
            }
        ];

        const timer = setTimeout(() => {
            // Sort by newest first
            const sorted = mockOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
            setData(sorted);
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    return { data, isLoading };
};

const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const getStatusStyle = (status) => {
    switch (status) {
        case 'COMPLETED':
            return {
                label: 'Thành công',
                classes: 'badge badge-success'
            };
        case 'CANCELLED':
            return {
                label: 'Đã huỷ',
                classes: 'badge badge-error'
            };
        case 'PENDING':
            return {
                label: 'Chờ xử lý',
                classes: 'badge badge-warning'
            };
        default:
            return {
                label: status,
                classes: 'badge badge-neutral'
            };
    }
};

export function OrdersPage() {
    const { data: orders, isLoading } = useOrdersMock();
    const [activeTab, setActiveTab] = useState("ALL");
    const [expandedOrders, setExpandedOrders] = useState(new Set());

    const tabs = [
        { id: "ALL", label: "Tất cả" },
        { id: "COMPLETED", label: "Thành công" },
        { id: "CANCELLED", label: "Đã huỷ" }
    ];

    const filteredOrders = orders?.filter(order => {
        if (activeTab === "ALL") return true;
        return order.status === activeTab;
    }) || [];

    const toggleExpand = (orderCode) => {
        const newExpanded = new Set(expandedOrders);
        if (newExpanded.has(orderCode)) {
            newExpanded.delete(orderCode);
        } else {
            newExpanded.add(orderCode);
        }
        setExpandedOrders(newExpanded);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'COMPLETED':
                return {
                    label: 'Thành công',
                    classes: 'bg-primary-container text-on-primary-container'
                };
            case 'CANCELLED':
                return {
                    label: 'Đã huỷ',
                    classes: 'bg-error-container text-on-error-container'
                };
            case 'PENDING':
                return {
                    label: 'Chờ xử lý',
                    classes: 'bg-warning/20 text-warning-content' // Using standard DaisyUI warning color
                };
            default:
                return {
                    label: status,
                    classes: 'bg-surface-variant text-on-surface-variant'
                };
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
            <div className="flex items-center gap-4 mb-8">
                <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">
                    Lịch sử đơn hàng
                </h1>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-4 mb-8 border-b border-surface-variant overflow-x-auto hide-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`font-label-md text-label-md py-4 px-2 whitespace-nowrap transition-colors ${activeTab === tab.id
                            ? 'text-primary font-bold border-b-2 border-primary'
                            : 'text-on-surface-variant hover:text-primary'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Order List */}
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
                    filteredOrders.map(order => {
                        const isExpanded = expandedOrders.has(order.code);
                        const statusStyle = getStatusStyle(order.status);
                        const totalVouchers = order.items.reduce((sum, item) => sum + item.quantity, 0);

                        return (
                            <div
                                key={order.code}
                                className={`bg-surface-container-lowest rounded-lg shadow-sm p-6 border border-surface-variant transition-all hover:shadow-md ${order.status === 'CANCELLED' ? 'opacity-75' : ''
                                    }`}
                            >
                                {/* Collapsed Header */}
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
                                        <span
                                            className={`material-symbols-outlined text-on-surface-variant transition-transform duration-300 ${isExpanded ? 'rotate-180 text-primary' : 'group-hover:text-primary'
                                                }`}
                                        >
                                            expand_more
                                        </span>
                                    </div>
                                </button>

                                {/* Expanded Content: Voucher Items */}
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
