import React, { useState } from "react";
import PropTypes from "prop-types";
import { Star } from "lucide-react";

export function StarRating({ 
  rating = 0, 
  maxStars = 5, 
  onRatingChange, 
  readOnly = false,
  size = 24,
  className = ""
}) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div 
      className={`flex gap-1 ${className}`} 
      onMouseLeave={() => !readOnly && setHoverRating(0)}
    >
      {[...Array(maxStars)].map((_, i) => {
        const starValue = i + 1;
        const isFilled = (hoverRating || rating) >= starValue;
        
        return (
          <button
            key={starValue}
            type="button"
            disabled={readOnly}
            aria-label={`Chọn ${starValue} sao`}
            aria-pressed={rating === starValue}
            className={`focus:outline-none transition-transform ${
              !readOnly ? "hover:scale-110 cursor-pointer" : "cursor-default"
            }`}
            onMouseEnter={() => !readOnly && setHoverRating(starValue)}
            onClick={() => !readOnly && onRatingChange && onRatingChange(starValue)}
          >
            <Star
              size={size}
              className={isFilled ? "text-warning" : "text-base-300"}
              fill={isFilled ? "currentColor" : "none"}
            />
          </button>
        );
      })}
    </div>
  );
}

StarRating.propTypes = {
  rating: PropTypes.number,
  maxStars: PropTypes.number,
  onRatingChange: PropTypes.func,
  readOnly: PropTypes.bool,
  size: PropTypes.number,
  className: PropTypes.string,
};
