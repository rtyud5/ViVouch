import { describe, it, expect } from 'vitest';
import { resolveActiveBranchId } from './branchSelection';

describe('resolveActiveBranchId', () => {
  const branches = [
    { id: 'uuid-aaa' },
    { id: 'uuid-bbb' },
    { id: 'uuid-ccc' },
  ];

  it('keeps currentBranchId when it still exists in activeBranches', () => {
    expect(resolveActiveBranchId('uuid-bbb', branches)).toBe('uuid-bbb');
  });

  it('returns the first active branch when currentBranchId is stale / not in list', () => {
    expect(resolveActiveBranchId('uuid-deleted', branches)).toBe('uuid-aaa');
  });

  it('returns the first active branch when currentBranchId is empty string', () => {
    expect(resolveActiveBranchId('', branches)).toBe('uuid-aaa');
  });

  it('returns empty string when activeBranches list is empty', () => {
    expect(resolveActiveBranchId('uuid-aaa', [])).toBe('');
  });

  it('returns empty string when activeBranches is undefined', () => {
    expect(resolveActiveBranchId('uuid-aaa', undefined)).toBe('');
  });

  it('returns empty string when activeBranches is null', () => {
    expect(resolveActiveBranchId('uuid-aaa', null)).toBe('');
  });

  it('returns empty string when activeBranches is undefined and currentBranchId is empty', () => {
    expect(resolveActiveBranchId('', undefined)).toBe('');
  });
});
