import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { getStaffRedeemHistory } from '../../features/marketplace/api/marketplace.api';
import { usePartnerBranches } from '../../features/partner/hooks/usePartnerBranches';
import { History, Search, RefreshCw, Copy, Check, Store, User, Tag, Calendar } from 'lucide-react';

export function StaffRedeemHistoryPage() {
  const user = useAuthStore((state) => state.user);
  const membership = user?.partnerMemberships?.[0];
  const isOwner = membership?.role === 'OWNER';

  const [state, setState] = useState({ loading: true, error: '', items: [] });
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  const { data: branchesResponse } = usePartnerBranches();
  const branches = useMemo(() => branchesResponse?.data || [], [branchesResponse]);

  const loadHistory = useCallback(async (branchId = '') => {
    setState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const params = {};
      if (branchId) params.branchId = branchId;
      const items = await getStaffRedeemHistory(params);
      setState({ loading: false, error: '', items: Array.isArray(items) ? items : [] });
    } catch (error) {
      setState({
        loading: false,
        error: error?.response?.data?.message || 'Không thể tải lịch sử đổi mã voucher.',
        items: [],
      });
    }
  }, []);

  useEffect(() => {
    loadHistory(selectedBranch);
  }, [loadHistory, selectedBranch]);

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredItems = useMemo(() => {
    if (!search.trim()) return state.items;
    const query = search.toLowerCase().trim();
    return state.items.filter((item) => {
      const title = item.voucherCode?.voucher?.title?.toLowerCase() || '';
      const code = item.voucherCode?.code?.toLowerCase() || '';
      const customer = item.voucherCode?.owner?.fullName?.toLowerCase() || '';
      const email = item.voucherCode?.owner?.email?.toLowerCase() || '';
      const branchName = item.branch?.name?.toLowerCase() || '';
      return (
        title.includes(query) ||
        code.includes(query) ||
        customer.includes(query) ||
        email.includes(query) ||
        branchName.includes(query)
      );
    });
  }, [state.items, search]);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-base-content">Lịch sử đổi voucher</h1>
              <p className="text-sm text-base-content/60 mt-0.5">
                {isOwner
                  ? 'Lịch sử tất cả các lượt đổi voucher tại các chi nhánh của đối tác.'
                  : `Các mã voucher đã xác nhận tại chi nhánh ${membership?.branch?.name || 'được phân công'}.`}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => loadHistory(selectedBranch)}
          disabled={state.loading}
          className="btn btn-outline btn-sm gap-2 self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${state.loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-base-100 p-4 rounded-2xl border border-base-300 shadow-sm mb-6 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
          <input
            type="text"
            placeholder="Tìm theo tên voucher, mã voucher, khách hàng, chi nhánh..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered input-sm w-full pl-9"
          />
        </div>

        {isOwner && branches.length > 0 && (
          <div className="w-full md:w-64">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="select select-bordered select-sm w-full"
            >
              <option value="">Tất cả chi nhánh ({branches.length})</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {state.error && (
        <div className="alert alert-error mb-6 flex justify-between items-center">
          <span>{state.error}</span>
          <button onClick={() => loadHistory(selectedBranch)} className="btn btn-xs btn-outline">
            Thử lại
          </button>
        </div>
      )}

      {/* Content */}
      {state.loading ? (
        <div className="py-16 text-center bg-base-100 rounded-2xl border border-base-300">
          <span className="loading loading-spinner loading-lg text-purple-700" />
          <p className="text-sm text-base-content/60 mt-3">Đang tải danh sách đổi mã...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center bg-base-100 rounded-2xl border border-base-300 p-6">
          <History className="w-12 h-12 mx-auto text-base-content/30 mb-3" />
          <h3 className="font-bold text-lg text-base-content mb-1">
            {state.items.length === 0 ? 'Chưa có lượt đổi voucher nào' : 'Không tìm thấy kết quả phù hợp'}
          </h3>
          <p className="text-sm text-base-content/60 max-w-md mx-auto">
            {state.items.length === 0
              ? 'Khi khách hàng xuất trình mã và được xác thực tại quầy, lịch sử đổi mã sẽ hiển thị tại đây.'
              : 'Hãy thử đổi từ khóa tìm kiếm hoặc chọn chi nhánh khác.'}
          </p>
        </div>
      ) : (
        <div className="bg-base-100 rounded-2xl border border-base-300 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-base-200/50 text-base-content/70">
                  <th className="whitespace-nowrap">Voucher</th>
                  <th className="whitespace-nowrap">Mã đổi</th>
                  <th className="whitespace-nowrap">Khách hàng</th>
                  <th className="whitespace-nowrap">Chi nhánh</th>
                  <th className="whitespace-nowrap">Thời gian đổi</th>
                  <th className="whitespace-nowrap text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const voucher = item.voucherCode?.voucher;
                  const code = item.voucherCode?.code;
                  const customer = item.voucherCode?.owner;
                  const branch = item.branch;
                  const voucherImg = voucher?.imageUrl || voucher?.image;
                  const discountPct = voucher?.originalPrice && voucher?.salePrice && Number(voucher.originalPrice) > Number(voucher.salePrice)
                    ? Math.round(((Number(voucher.originalPrice) - Number(voucher.salePrice)) / Number(voucher.originalPrice)) * 100)
                    : null;

                  return (
                    <tr key={item.id} className="hover">
                      {/* Voucher info */}
                      <td>
                        <div className="flex items-center gap-3">
                          {voucherImg ? (
                            <img
                              src={voucherImg}
                              alt={voucher.title}
                              className="w-10 h-10 rounded-lg object-cover bg-base-200 shrink-0 border border-base-300"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                              <Tag className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-sm line-clamp-1">{voucher?.title || 'Voucher'}</div>
                            {discountPct && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                                Giảm {discountPct}%
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 bg-base-200 px-2.5 py-1 rounded-md font-mono text-xs font-bold text-base-content border border-base-300">
                          <span>{code || '---'}</span>
                          {code && (
                            <button
                              type="button"
                              onClick={() => handleCopyCode(code)}
                              className="btn btn-ghost btn-xs p-0.5 min-h-0 h-auto hover:bg-base-300"
                              title="Sao chép mã"
                            >
                              {copiedCode === code ? (
                                <Check className="w-3.5 h-3.5 text-success" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-base-content/50" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Customer */}
                      <td>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-base-content/40 shrink-0" />
                          <div>
                            <div className="font-medium text-xs whitespace-nowrap">{customer?.fullName || 'Khách hàng'}</div>
                            {customer?.email && (
                              <div className="text-[11px] text-base-content/50 whitespace-nowrap">{customer.email}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Branch */}
                      <td>
                        <div className="flex items-center gap-2 text-sm">
                          <Store className="w-4 h-4 text-base-content/40 shrink-0" />
                          <div>
                            <div className="font-medium text-xs whitespace-nowrap">{branch?.name || 'Chi nhánh'}</div>
                            {branch?.city && (
                              <div className="text-[11px] text-base-content/50 whitespace-nowrap">{branch.city}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Time */}
                      <td className="whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-base-content/70">
                          <Calendar className="w-3.5 h-3.5 text-base-content/40 shrink-0" />
                          <span>{item.redeemedAt ? new Date(item.redeemedAt).toLocaleString('vi-VN') : '---'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-[#dcfce7] text-[#166534] border border-[#bbf7d0] whitespace-nowrap">
                          Đã sử dụng
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-base-200/30 border-t border-base-200 text-xs text-base-content/60 text-right">
            Hiển thị {filteredItems.length} / {state.items.length} lượt đổi mã
          </div>
        </div>
      )}
    </div>
  );
}
