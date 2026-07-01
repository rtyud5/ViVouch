import React, { useState } from "react";
import PropTypes from "prop-types";
import { Star, Send } from "lucide-react";
import { StarRating } from "../common/StarRating";

export function WriteReviewForm({
  onSubmit,
  isSubmitting = false,
  eligibility = "NOT_ELIGIBLE", // "NOT_ELIGIBLE", "ELIGIBLE", "ALREADY_REVIEWED"
  message = "Bạn cần sử dụng voucher này để có thể đánh giá."
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    
    if (rating < 1 || rating > 5) {
      setError("Vui lòng chọn số sao từ 1 đến 5.");
      return;
    }
    
    if (isSubmitting) return;
    
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
          <StarRating 
            rating={rating} 
            onRatingChange={(val) => {
              setRating(val);
              if (error) setError("");
            }} 
            size={28}
          />
          {error && <span className="text-xs text-error mt-1 block">{error}</span>}
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
