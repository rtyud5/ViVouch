import { useEffect, useMemo, useState } from "react";
import { resolveActiveBranchId } from "../../utils/branchSelection";
import { useRedeemVoucher } from "../../features/partner/hooks/useRedeemVoucher";
import { usePartnerBranches } from "../../features/partner/hooks/usePartnerBranches";
import { ApiErrorToast } from "../../components/common/ApiErrorToast";
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";

export function RedeemVoucherPage() {
  const [code, setCode] = useState("");
  const [branchId, setBranchId] = useState("");
  const [redeemResult, setRedeemResult] = useState(null);
  const [errorResult, setErrorResult] = useState(null);
  const [toastError, setToastError] = useState(null);

  const { mutate, isPending } = useRedeemVoucher();
  const { data: branchesResponse, isLoading: isLoadingBranches } = usePartnerBranches();
  const activeBranches = useMemo(
    () => (branchesResponse?.data || []).filter((branch) => branch.isActive),
    [branchesResponse],
  );

  useEffect(() => {
    const next = resolveActiveBranchId(branchId, activeBranches);
    if (next !== branchId) {
      setBranchId(next);
    }
  }, [activeBranches, branchId]);

  const handleRedeem = (e) => {
    e.preventDefault();
    if (!code || !branchId || isPending) return;

    setRedeemResult(null);
    setErrorResult(null);
    setToastError(null);

    mutate(
      { code, branchId },
      {
        onSuccess: (data) => {
          setRedeemResult(data);
        },
        onError: (err) => {
          const errCode = err?.response?.data?.code;
          let errMessage = err?.response?.data?.message || "Đã xảy ra lỗi";

          const cardErrorCodes = [
            "VOUCHER_CODE_USED",
            "VOUCHER_CODE_EXPIRED",
            "VOUCHER_CODE_NOT_FOUND",
            "INVALID_VOUCHER_CODE",
            "FORBIDDEN",
            "WRONG_PARTNER",
            "VOUCHER_CODE_CANCELLED",
            "VOUCHER_CODE_LOCKED",
            "BRANCH_REQUIRED",
            "INVALID_BRANCH_SCOPE"
          ];

          if (errCode === 'VOUCHER_CODE_USED') {
            errMessage = "Voucher này đã được sử dụng.";
          } else if (errCode === 'VOUCHER_CODE_EXPIRED') {
            errMessage = "Voucher này đã hết hạn sử dụng.";
          } else if (errCode === 'WRONG_PARTNER' || errCode === 'FORBIDDEN') {
            errMessage = "Voucher này không thuộc về đối tác hiện tại.";
          } else if (errCode === 'VOUCHER_CODE_NOT_FOUND') {
            errMessage = "Không tìm thấy mã voucher này trong hệ thống.";
          } else if (errCode === 'INVALID_BRANCH_SCOPE') {
            errMessage = "Voucher này không áp dụng tại chi nhánh đã chọn.";
          }

          if (cardErrorCodes.includes(errCode)) {
            setErrorResult({ code: errCode, message: errMessage });
          } else {
            setToastError(err);
          }
        },
      }
    );
  };

  const handleReset = () => {
    setCode("");
    setRedeemResult(null);
    setErrorResult(null);
    setToastError(null);
    // autoFocus on the input will handle focus naturally after re-render
  };

  const renderSuccessCard = () => (
    <div className="card bg-success/10 border border-success text-base-content shadow-sm max-w-md mx-auto mt-8">
      <div className="card-body items-center text-center">
        <CheckCircle2 className="w-16 h-16 text-success mb-2" />
        <h2 className="card-title text-success text-2xl mb-4">Đổi mã thành công!</h2>
        
        <div className="w-full space-y-3 text-left">
          <div className="flex justify-between border-b pb-2">
            <span className="text-base-content/70">Mã Voucher:</span>
            <span className="font-mono font-bold">{code}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-base-content/70">Tên Voucher:</span>
            <span className="font-bold">{redeemResult.voucherTitle}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-base-content/70">Khách hàng:</span>
            <span className="font-medium">{redeemResult.customerName}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-base-content/70">Chi nhánh:</span>
            <span className="font-medium">{redeemResult.branchName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-base-content/70">Thời gian đổi:</span>
            <span className="font-medium">
              {new Date(redeemResult.redeemedAt).toLocaleString('vi-VN')}
            </span>
          </div>
        </div>

        <div className="card-actions mt-6 w-full">
          <button className="btn btn-primary w-full" onClick={handleReset}>
            Xác nhận mã khác
          </button>
        </div>
      </div>
    </div>
  );

  const renderErrorCard = () => {
    let Icon = XCircle;
    let title = "Đổi mã thất bại";
    let colorClass = "text-error";
    let bgClass = "bg-error/10 border-error";

    if (errorResult.code === "VOUCHER_CODE_USED" || errorResult.code === "VOUCHER_CODE_EXPIRED") {
      Icon = AlertTriangle;
      colorClass = "text-warning";
      bgClass = "bg-warning/10 border-warning";
    }

    return (
      <div className={`card border shadow-sm max-w-md mx-auto mt-8 ${bgClass}`}>
        <div className="card-body items-center text-center">
          <Icon className={`w-16 h-16 mb-2 ${colorClass}`} />
          <h2 className={`card-title text-2xl mb-2 ${colorClass}`}>{title}</h2>
          
          <div className="font-mono text-xl font-bold mb-4 px-4 py-2 bg-base-100 rounded-lg shadow-inner">
            {code}
          </div>
          
          <p className="text-lg mb-6">{errorResult.message}</p>

          <div className="card-actions w-full">
            <button className="btn btn-primary w-full" onClick={handleReset}>
              Xác nhận mã khác
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Xác thực Voucher</h1>

      {!redeemResult && !errorResult && (
        <div className="max-w-md mx-auto">
          <form onSubmit={handleRedeem} className="card bg-base-100 shadow-md">
            <div className="card-body">
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text text-lg font-medium">Chi nhánh đổi mã</span>
                </label>
                <select
                  className="select select-bordered select-lg w-full"
                  value={branchId}
                  onChange={(event) => setBranchId(event.target.value)}
                  disabled={isPending || isLoadingBranches}
                >
                  <option value="">
                    {isLoadingBranches ? "Đang tải chi nhánh..." : "Chọn chi nhánh"}
                  </option>
                  {activeBranches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                {!isLoadingBranches && activeBranches.length === 0 && (
                  <div className="label">
                    <span className="label-text-alt text-error">
                      Cần kích hoạt ít nhất một chi nhánh trước khi đổi mã.
                    </span>
                  </div>
                )}
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-lg font-medium">Nhập mã Voucher</span>
                </label>
                <input
                  type="text"
                  placeholder="VOUCHER-CODE"
                  className="input input-bordered input-lg w-full font-mono uppercase text-center text-xl tracking-widest"
                  value={code}
                onChange={(e) => {
                    const newCode = e.target.value.toUpperCase();
                    setCode(newCode);
                    // Clear stale error/result as soon as the user starts typing a new code
                    if (errorResult) setErrorResult(null);
                    if (toastError) setToastError(null);
                  }}
                  disabled={isPending}
                  autoFocus
                />
              </div>

              <div className="card-actions mt-6">
                <button
                  type="submit"
                  className="btn btn-primary w-full btn-lg"
                  disabled={!code.trim() || !branchId || isPending}
                >
                  {isPending ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    "Xác nhận đổi mã"
                  )}
                </button>
              </div>
            </div>
          </form>

          <div className="alert alert-info mt-6 shadow-sm">
            <Info className="w-5 h-5 shrink-0" />
            <span>
              Yêu cầu khách hàng cung cấp mã voucher để tiến hành xác thực và áp dụng ưu đãi.
            </span>
          </div>
        </div>
      )}

      {redeemResult && renderSuccessCard()}
      {errorResult && renderErrorCard()}

      {toastError && <ApiErrorToast error={toastError} />}
    </div>
  );
}
