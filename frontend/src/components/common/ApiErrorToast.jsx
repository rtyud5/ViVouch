import { useEffect, useState } from "react";

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

/**
 * Hiển thị toast lỗi khi API call thất bại.
 */
export function ApiErrorToast({ error, message = "Đã xảy ra lỗi. Vui lòng thử lại." }) {
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (error) {
      setToastMessage(getErrorMessage(error, message));
      const timer = setTimeout(() => setToastMessage(""), 4000);
      return () => clearTimeout(timer);
    }
    setToastMessage("");
  }, [error, message]);

  if (!toastMessage) return null;

  return (
    <div className="toast toast-top toast-center z-50">
      <div className="alert alert-error shadow-lg text-sm rounded-xl">
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}
