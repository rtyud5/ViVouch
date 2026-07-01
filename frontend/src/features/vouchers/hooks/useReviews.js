import { useState, useCallback } from "react";

// Placeholder hook for reviews feature
export function useReviews(voucherId) {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eligibility, setEligibility] = useState("NOT_ELIGIBLE"); // Mock status
  
  const fetchReviews = useCallback(async () => {
    if (!voucherId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call when Reviews API is ready
      // const data = await api.get(`/vouchers/${voucherId}/reviews`);
      // setReviews(data);
      console.log(`[Placeholder] Fetching reviews for voucher ${voucherId}...`);
      
      // Do not hardcode mock into production path
      setReviews([]);
    } catch (err) {
      setError(err.message || "Failed to fetch reviews");
    } finally {
      setIsLoading(false);
    }
  }, [voucherId]);

  const submitReview = async (reviewData) => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call when Reviews API is ready
      // await api.post(`/vouchers/${voucherId}/reviews`, reviewData);
      console.log("[Placeholder] Submitting review:", reviewData);
      
      // Re-fetch reviews after successful submission
      await fetchReviews();
      setEligibility("ALREADY_REVIEWED");
    } catch (err) {
      console.error("Failed to submit review", err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    reviews,
    isLoading,
    error,
    isSubmitting,
    eligibility,
    fetchReviews,
    submitReview
  };
}
