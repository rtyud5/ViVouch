import { describe, it, expect } from 'vitest';
import { createReviewSchema } from '../src/modules/reviews/reviews.validator.js';

describe('Reviews Validator Tests', () => {
  it('accepts valid rating and comment', () => {
    const result = createReviewSchema.parse({ rating: 4, comment: 'Good' });
    expect(result.rating).toBe(4);
    expect(result.comment).toBe('Good');
  });

  it('rejects rating below 1', () => {
    expect(() => createReviewSchema.parse({ rating: 0 })).toThrow();
  });

  it('rejects rating above 5', () => {
    expect(() => createReviewSchema.parse({ rating: 6 })).toThrow();
  });

  it('rejects comment longer than 1000 characters', () => {
    expect(() => createReviewSchema.parse({ rating: 5, comment: 'a'.repeat(1001) })).toThrow();
  });
});
