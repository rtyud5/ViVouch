import React from "react";
import PropTypes from "prop-types";
import { ReviewCard } from "./ReviewCard";
import { AlertCircle } from "lucide-react";

export function ReviewList({ reviews = [], isLoading = false, error = null }) {
  if (isLoading) {
    return (
      <div className="w-full bg-base-100 rounded-2xl shadow-sm border border-base-200 p-6 mt-6">
        <h3 className="font-bold text-lg mb-4 text-base-content">Đánh giá mới nhất</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex flex-col gap-2 border-b border-base-200 last:border-0 pb-4 last:pb-0">
              <div className="flex justify-between">
                <div className="h-4 bg-base-300 rounded w-1/4"></div>
                <div className="h-3 bg-base-300 rounded w-1/6"></div>
              </div>
              <div className="h-4 bg-base-300 rounded w-20"></div>
              <div className="h-4 bg-base-300 rounded w-full"></div>
              <div className="h-4 bg-base-300 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-base-100 rounded-2xl shadow-sm border border-error/20 p-6 mt-6 text-center">
        <div className="flex flex-col items-center gap-2 text-error">
          <AlertCircle size={24} />
          <p className="font-medium text-sm">Không thể tải đánh giá</p>
          <p className="text-xs opacity-80">{typeof error === 'string' ? error : 'Đã có lỗi xảy ra, vui lòng thử lại sau.'}</p>
        </div>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="w-full bg-base-100 rounded-2xl shadow-sm border border-base-200 p-6 mt-6 text-center">
        <p className="text-base-content/50 italic text-sm">Chưa có đánh giá nào cho voucher này.</p>
      </div>
    );
  }

  const displayReviews = reviews.slice(0, 5);

  return (
    <div className="w-full bg-base-100 rounded-2xl shadow-sm border border-base-200 p-6 mt-6">
      <h3 className="font-bold text-lg mb-4 text-base-content flex items-center gap-2">
        Đánh giá mới nhất <span className="text-base-content/50 text-sm font-normal">({reviews.length})</span>
      </h3>
      <div className="space-y-4">
        {displayReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}

ReviewList.propTypes = {
  reviews: PropTypes.array,
  isLoading: PropTypes.bool,
  error: PropTypes.any
};
