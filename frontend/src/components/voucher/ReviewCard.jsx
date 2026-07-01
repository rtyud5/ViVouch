import React from "react";
import PropTypes from "prop-types";
import { StarRating } from "../common/StarRating";

export function ReviewCard({ review }) {
  if (!review) return null;
  
  const userName = review.user?.fullName || "Người dùng ẩn danh";
  const formattedDate = review.createdAt && !isNaN(Date.parse(review.createdAt))
    ? new Date(review.createdAt).toLocaleDateString("vi-VN")
    : "Không rõ ngày";

  return (
    <div className="border-b border-base-200 last:border-0 pb-4 last:pb-0">
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-sm text-base-content">
          {userName}
        </span>
        <span className="text-xs text-base-content/50">
          {formattedDate}
        </span>
      </div>
      <div className="mb-2">
        <StarRating rating={review.rating || 0} readOnly size={14} />
      </div>
      <p className="text-sm text-base-content/80 whitespace-pre-line">
        {review.comment || "Không có nội dung bình luận."}
      </p>
    </div>
  );
}

ReviewCard.propTypes = {
  review: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    user: PropTypes.shape({
      fullName: PropTypes.string
    }),
    rating: PropTypes.number,
    comment: PropTypes.string,
    createdAt: PropTypes.string
  }).isRequired
};
