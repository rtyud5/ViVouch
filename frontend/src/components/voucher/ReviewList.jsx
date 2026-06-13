import React from "react";
import { Star } from "lucide-react";

export function ReviewList({ reviews = [] }) {
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
          <div key={review.id} className="border-b border-base-200 last:border-0 pb-4 last:pb-0">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm text-base-content">
                {review.user?.fullName || "Người dùng ẩn danh"}
              </span>
              <span className="text-xs text-base-content/50">
                {new Date(review.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
            <div className="flex text-warning mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i < review.rating ? "currentColor" : "none"}
                  className={i < review.rating ? "text-warning" : "text-base-300"}
                />
              ))}
            </div>
            <p className="text-sm text-base-content/80 whitespace-pre-line">
              {review.comment || "Không có nội dung bình luận."}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
