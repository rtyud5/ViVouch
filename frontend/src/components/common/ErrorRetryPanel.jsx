import React from "react";
import { getCustomerFacingError } from "../../utils/errorReference";

export function ErrorRetryPanel({ title, description, error, onRetry }) {
  const next = getCustomerFacingError(error, description);

  return (
    <div className="max-w-2xl mx-auto rounded-2xl border border-error/20 bg-error/5 p-6 text-center">
      <p className="text-lg font-bold text-error mb-2">{title}</p>
      <p className="text-sm text-on-surface-variant mb-4">{next.message}</p>
      {next.reference && (
        <p className="text-xs text-on-surface-variant mb-6">
          Mã tham chiếu an toàn: <span className="font-mono">{next.reference}</span>
        </p>
      )}
      <button type="button" onClick={onRetry} className="btn btn-primary rounded-full">
        Thử lại
      </button>
    </div>
  );
}
