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

  if (readOnly) {
    return (
      <div
        className={"flex gap-1 " + className}
        role="img"
        aria-label={rating + "/" + maxStars + " sao"}
      >
        {[...Array(maxStars)].map((_, i) => {
          const starValue = i + 1;
          const isFilled = rating >= starValue;
          return (
            <Star
              key={starValue}
              size={size}
              className={isFilled ? "text-warning" : "text-base-300"}
              fill={isFilled ? "currentColor" : "none"}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={"flex gap-1 " + className}
      onMouseLeave={() => setHoverRating(0)}
    >
      {[...Array(maxStars)].map((_, i) => {
        const starValue = i + 1;
        const isFilled = (hoverRating || rating) >= starValue;

        return (
          <button
            key={starValue}
            type="button"
            aria-label={readOnly ? `${starValue} sao` : `Chọn ${starValue} sao`}
            aria-pressed={!readOnly && isFilled}
            className={`focus:outline-none focus-visible:ring-2 focus-visible:ring-warning transition-transform ${!readOnly ? "cursor-pointer hover:scale-110" : "cursor-default"
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
