import React, { useState, useEffect } from 'react';
import { VoucherCodeCard } from '../../components/voucher/VoucherCodeCard';

// Mock hook since useMyVouchers from T-hooks3 is not available yet
/**
 * A mock hook to simulate fetching user's voucher codes.
 *
 * @returns {Object} An object containing the voucher codes data and loading state
 */
const useMyVouchersMock = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Mock data
        const mockVouchers = [
            {
                id: 1,
                status: "ISSUED",
                code: "HDL88XYZ",
                expirationDate: "2024-11-30T00:00:00.000Z",
                voucher: {
                    name: "Buffet Lẩu Haidilao",
                    partner: { name: "Haidilao Vietnam" },
                    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1d1Y9RGlCM_742-mngx3a8OltvTaU8MlOhrXl_oQuyWGxowtyg4J5TKXtwqUDS9_D4CZndZoF3PxnIYS4bttTkeBdGqsLHfjYmil0F-dKu9Zfm937ED2yS-YHcbrrsIXfsPEy5aUN4WyCTBaux7O8LSgMso4YBJNH9T0xCJB-Z1Ak1GHd8yG4RQxLY1gcAFo846_SoVMxH9CeIq4HKhacCiFrRPEge-9cOu_NuMnQkvxgkhLcjCGhL1zdrz4ywQqAHLegkNp0sfY"
                }
            },
            {
                id: 2,
                status: "ISSUED",
                code: "HL50KNOV",
                expirationDate: "2024-12-15T00:00:00.000Z",
                voucher: {
                    name: "Giảm 50K Đồ Uống",
                    partner: { name: "Highlands Coffee" },
                    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDL9cl-EevmKL6AKe0pOcPc6MZPoc0Obtz948qRgzDBbZXtaBs3_eAZ9_pmWesU6Qz_cXQwerI_E_LTyJNWjfl3ZZrCYsfsqjJ8g8ihp8_s8_EWmqZrm5IviDZFdEzCH0iIEAbtzT45BYzl6a_qa--SrBa8lkr2mnTXLtNhCsgJfED35IOuT_mwqHtavdEGkuI_nShrHPMZ9myw3yiDLPpcBgcxbCGaZ_MTMHXUwp1A_3jrB7YP7mAHv5vz9E_AB3thsMUhLRgFsEI"
                }
            },
            {
                id: 3,
                status: "USED",
                code: "CGV2D89P",
                expirationDate: "2024-10-20T00:00:00.000Z",
                voucher: {
                    name: "Vé Xem Phim 2D",
                    partner: { name: "CGV Cinemas" },
                    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1O0x7Rvo3cQgjEcA89SZIBiLxG6OQpKA50V5tFMrIyTjrk0P8VoE4oIOf6KReH-fZAN-i035hi_gceoPo2v103V88W7eWkbtL5vy0PQVQHMx71Pck7NfV8eSidkHMX1dOLiDNyHSphPTiU_Q-TRzCZfSGNlTtjnURpo3fwNKwiZUoeRLZ0sbmsbjZLH5BvSCes9KVeN_IwTZRKxLkMNxs0AXCehDtq7UuNO5cngGYJ1SsOfMObmZofJJ8HruiSY4I6CXsXzNuDps"
                }
            },
            {
                id: 4,
                status: "EXPIRED",
                code: "GB20PCTA",
                expirationDate: "2023-12-31T00:00:00.000Z",
                voucher: {
                    name: "Giảm 20% Chuyến đi",
                    partner: { name: "GrabBike" },
                    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCdNGGKTFlB9-5XWum8ZNj8vE-Wf40MO4viA5AXqp13-JyZ6hEz8rBH5wit4Zn8Xj8btfc04brFy5LPsCBgeFPDjqw4Z0CSDu0LYPElsTkTnojqjjUr6F97Ar3M_hhTiZ8pqvTjL0C6YPl-ZX85uwPMbwHg0HsFKPZVK2XhgJqwD6AaPxo8WTYAj4R7fMZBCZ47bVkBn8Py_NLGQh2rxJFACoFcibU5TdqT2Xz-Ce81mVRs4ZFt8KwyBhSuPgGWvTwzMZfweaZ2VKM"
                }
            }
        ];

        const timer = setTimeout(() => {
            setData(mockVouchers);
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    return { data, isLoading };
};

/**
 * MyVouchersPage component renders the list of user's voucher codes grouped by tabs: ISSUED, USED, and EXPIRED.
 * It also renders a modal to display a full-size QR code and option to copy the voucher code.
 *
 * @returns {React.ReactElement} The rendered MyVouchersPage component
 */
export function MyVouchersPage() {
    const { data: voucherCodes, isLoading } = useMyVouchersMock();
    const [activeTab, setActiveTab] = useState("ISSUED");

    // QR Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVoucherCode, setSelectedVoucherCode] = useState(null);

    const tabs = [
        { id: "ISSUED", label: "Chưa dùng" },
        { id: "USED", label: "Đã dùng" },
        { id: "EXPIRED", label: "Hết hạn" }
    ];

    const filteredVouchers = voucherCodes?.filter(vc => vc.status === activeTab) || [];

    // Đếm số lượng để hiển thị (chỉ đếm cho tab ISSUED)
    const issuedCount = voucherCodes?.filter(vc => vc.status === "ISSUED").length || 0;

    const handleOpenQR = (voucherCode) => {
        setSelectedVoucherCode(voucherCode);
        setIsModalOpen(true);
    };

    const handleCloseQR = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedVoucherCode(null), 300); // Wait for transition
    };

    const handleCopyCode = async () => {
        if (selectedVoucherCode) {
            try {
                if (!navigator.clipboard?.writeText) return;
                await navigator.clipboard.writeText(selectedVoucherCode.code);
            } catch (err) {
                console.error("Failed to copy:", err);
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 w-full">
            <div className="mb-6 md:mb-8">
                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-6">Voucher của tôi</h1>

                {/* Tabs */}
                <div className="flex border-b border-outline-variant gap-4 md:gap-8 overflow-x-auto hide-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 whitespace-nowrap border-b-2 font-label-md text-label-md transition-colors ${activeTab === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-on-surface-variant hover:text-on-surface'
                                }`}
                        >
                            {tab.label} {tab.id === "ISSUED" && `(${issuedCount})`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Voucher List */}
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
                    {filteredVouchers.map(vc => (
                        <VoucherCodeCard key={vc.id} voucherCode={vc} onOpenQR={handleOpenQR} />
                    ))}
                </div>
            )}

            {/* QR Modal */}
            <div
                className={`fixed inset-0 z-[100] bg-on-surface/40 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300 ${isModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        handleCloseQR();
                    }
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                        handleCloseQR();
                    }
                }}
                role="button"
                tabIndex={isModalOpen ? 0 : -1}
                aria-label="Đóng QR Modal"
            >
                <div
                    className={`bg-surface-container-lowest rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col items-center transform transition-transform duration-300 ${isModalOpen ? 'scale-100' : 'scale-95'}`}
                >
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
