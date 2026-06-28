import React, { useState } from "react";
import PropTypes from "prop-types";
import { Star, Send } from "lucide-react";

export function WriteReviewForm({ 
  onSubmit, 
  isSubmitting = false, 
  eligibility = "NOT_ELIGIBLE", // "NOT_ELIGIBLE", "ELIGIBLE", "ALREADY_REVIEWED"
  message = "Bạn cần sử dụng voucher này để có thể đánh giá."
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;
    if (onSubmit) {
      onSubmit({ rating, comment });
    }
  };

  if (eligibility === "ALREADY_REVIEWED") {
    return (
      <div className="w-full bg-base-100 rounded-2xl shadow-sm border border-base-200 p-6 mt-6 text-center">
        <p className="text-success font-semibold flex justify-center items-center gap-2">
          <Star size={18} fill="currentColor" />
          Bạn đã đánh giá voucher này. Cảm ơn phản hồi của bạn!
        </p>
      </div>
    );
  }

  if (eligibility === "NOT_ELIGIBLE") {
    return (
      <div className="w-full bg-base-100 rounded-2xl shadow-sm border border-base-200 p-6 mt-6 text-center bg-base-200/50">
        <p className="text-base-content/60 text-sm">{message}</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-base-100 rounded-2xl shadow-sm border border-base-200 p-6 mt-6">
      <h3 className="font-bold text-lg mb-4 text-base-content">Đánh giá của bạn</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <span className="block text-sm font-medium mb-2">Đánh giá chất lượng</span>
          <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onMouseEnter={() => setHoverRating(star)}
                onClick={() => setRating(star)}
              >
                <Star
                  size={28}
                  className={(hoverRating || rating) >= star ? "text-warning" : "text-base-300"}
                  fill={(hoverRating || rating) >= star ? "currentColor" : "none"}
                />
              </button>
            ))}
          </div>
          {rating === 0 && <span className="text-xs text-error mt-1">Vui lòng chọn số sao</span>}
        </div>

        <div>
          <label htmlFor="review-comment" className="block text-sm font-medium mb-2">Nhận xét chi tiết (tùy chọn)</label>
          <textarea
            id="review-comment"
            className="textarea textarea-bordered w-full"
            placeholder="Chia sẻ trải nghiệm của bạn về voucher này..."
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={rating === 0 || isSubmitting}
          className="btn btn-primary w-full sm:w-auto flex items-center gap-2"
        >
          {isSubmitting ? <span className="loading loading-spinner loading-sm"></span> : <Send size={16} />}
          Gửi đánh giá
        </button>
      </form>
    </div>
  );
}

WriteReviewForm.propTypes = {
  onSubmit: PropTypes.func,
  isSubmitting: PropTypes.bool,
  eligibility: PropTypes.oneOf(["NOT_ELIGIBLE", "ELIGIBLE", "ALREADY_REVIEWED"]),
  message: PropTypes.string,
};
