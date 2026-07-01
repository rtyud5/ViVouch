import { useEffect, useState } from "react";
import PropTypes from "prop-types";

/**
 * Hiển thị toast thành công sau thao tác API.
 */
export function ApiSuccessToast({ message, duration = 4000 }) {
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (message) {
      setToastMessage(message);
      const timer = setTimeout(() => setToastMessage(""), duration);
      return () => clearTimeout(timer);
    }
    setToastMessage("");
  }, [message, duration]);

  if (!toastMessage) return null;

  return (
    <div className="toast toast-top toast-center z-50">
      <div className="alert alert-success shadow-lg text-sm rounded-xl">
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}

ApiSuccessToast.propTypes = {
  message: PropTypes.string,
  duration: PropTypes.number,
};
