import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPartnerVouchers } from '../../features/partner/api/vouchers.api';

// Constants
const TABS = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'DRAFT', label: 'Nháp' },
  { id: 'PENDING_APPROVAL', label: 'Chờ duyệt' },
  { id: 'ON_SALE', label: 'Đang bán' },
  { id: 'PAUSED', label: 'Tạm dừng' },
  { id: 'EXPIRED', label: 'Hết hạn' },
  { id: 'REJECTED', label: 'Bị từ chối' },
];

const PAGE_SIZE = 12;

// Sub-components 
function StatusBadge({ status }) {
  const map = {
    DRAFT:            'bg-surface-variant text-on-surface-variant',
    PENDING_APPROVAL: 'bg-tertiary-fixed text-on-tertiary-fixed',
    ON_SALE:          'bg-primary-fixed text-on-primary-fixed',
    REJECTED:         'bg-error-container text-on-error-container',
    PAUSED:           'bg-tertiary-fixed text-on-tertiary-fixed',
    EXPIRED:          'bg-surface-variant text-on-surface-variant',
  };

  const labelMap = {
    DRAFT: 'Nháp',
    PENDING_APPROVAL: 'Chờ duyệt',
    ON_SALE: 'Đang bán',
    REJECTED: 'Từ chối',
    PAUSED: 'Tạm dừng',
    EXPIRED: 'Hết hạn',
  };

  const cls = map[status] || 'bg-surface-variant text-on-surface-variant';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {labelMap[status] || status}
    </span>
  );
}

// Hiển thị 3 dòng skeleton khi đang tải dữ liệu.
function TableSkeleton() {
  return Array.from({ length: 3 }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-md bg-surface-variant flex-shrink-0" />
          <div className="space-y-2">
            <div className="h-3 w-36 bg-surface-variant rounded" />
            <div className="h-2 w-20 bg-surface-variant rounded" />
          </div>
        </div>
      </td>
      {Array.from({ length: 5 }).map((_, j) => (
        <td key={j} className="px-4 py-4">
          <div className="h-3 w-16 bg-surface-variant rounded" />
        </td>
      ))}
      <td className="px-4 py-4">
        <div className="flex justify-center gap-2">
          <div className="w-7 h-7 bg-surface-variant rounded" />
          <div className="w-7 h-7 bg-surface-variant rounded" />
        </div>
      </td>
    </tr>
  ));
}

// Format ngày từ ISO string sang dd/MM/yyyy.
function formatDate(isoStr) {
  if (!isoStr) return null;
  const d = new Date(isoStr);
  if (isNaN(d)) return null;
  return d.toLocaleDateString('vi-VN');
}

// Main Component 
export function PartnerVoucherListPage() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [keyword, setKeyword]     = useState('');
  const [debouncedKw, setDebouncedKw] = useState('');
  const [page, setPage]           = useState(1);

  // Debounce: đợi 400ms sau khi người dùng ngừng gõ mới gọi API
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setKeyword(value);
    setPage(1); // reset về trang 1 khi search

    clearTimeout(handleSearchChange._timer);
    handleSearchChange._timer = setTimeout(() => {
      setDebouncedKw(value.trim());
    }, 400);
  }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setPage(1); // reset về trang 1 khi đổi tab
  };

  // Params gửi lên API
  const queryParams = {
    page,
    limit: PAGE_SIZE,
    ...(activeTab !== 'ALL' && { status: activeTab }),
    ...(debouncedKw && { keyword: debouncedKw }),
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['partnerVouchers', queryParams],
    queryFn: () => getPartnerVouchers(queryParams),
    // Giữ data cũ trong khi tải trang mới (tránh nhấp nháy)
    placeholderData: (prev) => prev,
  });

  const vouchers   = data?.data ?? [];
  const pagination = data?.pagination ?? { page: 1, totalPages: 1, total: 0 };

  return (
    <div className="flex flex-col h-full bg-surface-container-lowest">

      {/* Header */}
      <header className="px-6 py-6 flex justify-between items-center border-b border-outline-variant/30">
        <h1 className="font-headline-md text-headline-md text-on-background">Voucher của tôi</h1>
        <Link
          to="/partner/vouchers/new"
          className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md flex items-center gap-2 hover:bg-primary-fixed-variant transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tạo voucher mới
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-6 mt-4 px-6 pb-6">

        {/* Filters */}
        <div className="flex flex-col gap-4">

          {/* Status Tabs */}
          <div className="flex border-b border-outline-variant/50 w-full overflow-x-auto hide-scrollbar">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-3 font-label-md text-label-md whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                search
              </span>
              <input
                id="voucher-search"
                className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Tìm kiếm voucher..."
                type="text"
                value={keyword}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-variant border-b border-outline-variant">
                <tr>
                  <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant font-semibold">Voucher</th>
                  <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant font-semibold">Giá bán</th>
                  <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant font-semibold">Đã bán/Tổng</th>
                  <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant font-semibold min-w-[120px]">Tỷ lệ dùng</th>
                  <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant font-semibold">Thời hạn bán</th>
                  <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant font-semibold text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">

                {/* Loading state */}
                {isLoading && <TableSkeleton />}

                {/* Error state */}
                {isError && !isLoading && (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-error">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-4xl">error</span>
                        <p className="font-body-md text-body-md">
                          {error?.response?.data?.message || 'Không thể tải dữ liệu. Vui lòng thử lại.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Empty state */}
                {!isLoading && !isError && vouchers.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-on-surface-variant">
                      <div className="flex flex-col items-center justify-center">
                        <span className="material-symbols-outlined text-4xl mb-2 text-outline-variant">inbox</span>
                        <p className="font-body-md text-body-md mt-2">
                          {debouncedKw
                            ? `Không tìm thấy voucher nào khớp với "${debouncedKw}".`
                            : 'Không có voucher nào trong trạng thái này.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Data rows */}
                {!isLoading && !isError && vouchers.map(v => {
                  const usageRate = v.totalQty > 0
                    ? Math.round((v.soldQty / v.totalQty) * 100)
                    : 0;
                  const startStr = formatDate(v.saleStart);
                  const endStr   = formatDate(v.saleEnd);

                  return (
                    <tr key={v.id} className="hover:bg-surface-container-low transition-colors group">
                      {/* Voucher info */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-md bg-surface-dim overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {v.imageUrl ? (
                              <img alt={v.title} className="w-full h-full object-cover" src={v.imageUrl} />
                            ) : (
                              <span className="material-symbols-outlined text-outline">image</span>
                            )}
                          </div>
                          <div>
                            <p className="font-body-md text-body-md font-semibold text-on-background">{v.title}</p>
                            <p className="font-label-md text-[11px] text-on-surface-variant mt-0.5">
                              ID: {v.id.slice(0, 8).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <StatusBadge status={v.status} />
                      </td>

                      {/* Price */}
                      <td className="px-4 py-4 font-body-md text-body-md">
                        {v.salePrice ? `${v.salePrice.toLocaleString('vi-VN')}đ` : '--'}
                      </td>

                      {/* Sold / Total */}
                      <td className="px-4 py-4 font-body-md text-body-md text-on-surface-variant">
                        <span className="text-on-background font-medium">{v.soldQty}</span>
                        /{v.totalQty || '--'}
                      </td>

                      {/* Usage rate */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${usageRate}%` }} />
                          </div>
                          <span className="font-label-md text-[11px] text-on-surface-variant">{usageRate}%</span>
                        </div>
                      </td>

                      {/* Date range */}
                      <td className="px-4 py-4 font-body-md text-[13px] text-on-surface-variant">
                        {startStr && endStr ? `${startStr} - ${endStr}` : '--'}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="btn btn-sm btn-ghost p-1 h-auto min-h-0 text-primary hover:bg-primary/10 tooltip tooltip-top"
                            data-tip="Xem chi tiết"
                            aria-label={`Xem chi tiết voucher ${v.title}`}
                          >
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>

                          <button
                            className={`btn btn-sm btn-ghost p-1 h-auto min-h-0 tooltip tooltip-top ${
                              ['DRAFT', 'REJECTED'].includes(v.status)
                                ? 'text-secondary hover:bg-secondary/10'
                                : 'text-outline-variant opacity-50 cursor-not-allowed'
                            }`}
                            data-tip="Chỉnh sửa"
                            disabled={!['DRAFT', 'REJECTED'].includes(v.status)}
                            aria-label={`Chỉnh sửa voucher ${v.title}`}
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && !isError && pagination.total > 0 && (
            <div className="px-4 py-3 border-t border-outline-variant/50 bg-surface flex items-center justify-between">
              <div className="font-body-md text-[13px] text-on-surface-variant">
                Trang {pagination.page}/{pagination.totalPages} · Tổng {pagination.total} voucher
              </div>
              <div className="flex items-center gap-1">
                <button
                  id="voucher-list-prev-page"
                  className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50"
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  aria-label="Trang trước"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>

                {/* Render tối đa 5 nút trang quanh trang hiện tại */}
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(p => Math.abs(p - page) <= 2)
                  .map(p => (
                    <button
                      key={p}
                      id={`voucher-list-page-${p}`}
                      className={`w-8 h-8 flex items-center justify-center rounded font-label-md transition-colors ${
                        p === page
                          ? 'bg-primary text-on-primary'
                          : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                      onClick={() => setPage(p)}
                      aria-label={`Trang ${p}`}
                      aria-current={p === page ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  ))}

                <button
                  id="voucher-list-next-page"
                  className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  aria-label="Trang sau"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
