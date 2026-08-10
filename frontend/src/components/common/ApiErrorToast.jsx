import { useEffect, useState } from "react";
import { getCustomerFacingError } from "../../utils/errorReference";

/**
 * Hiển thị toast lỗi khi API call thất bại.
 */
export function ApiErrorToast({ error, message = "Đã xảy ra lỗi. Vui lòng thử lại." }) {
  const [toastState, setToastState] = useState({ message: "", reference: "" });

  useEffect(() => {
    if (error) {
      const next = getCustomerFacingError(error, message);
      setToastState(next);
      const timer = setTimeout(() => setToastState({ message: "", reference: "" }), 4000);
      return () => clearTimeout(timer);
    }
    setToastState({ message: "", reference: "" });
  }, [error, message]);

  if (!toastState.message) return null;

  return (
    <div className="toast toast-top toast-center z-50">
      <div className="alert alert-error shadow-lg text-sm rounded-xl">
        <div className="space-y-1">
          <span>{toastState.message}</span>
          {toastState.reference && (
            <p className="text-xs opacity-80">
              Mã tham chiếu an toàn: <span className="font-mono">{toastState.reference}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
