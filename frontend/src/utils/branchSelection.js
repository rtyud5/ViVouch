/**
 * Resolves which branch ID should be selected given the current selection
 * and the current list of active branches.
 *
 * Rules:
 *  - If currentBranchId exists in activeBranches → keep it.
 *  - If currentBranchId is absent / stale → pick activeBranches[0].id.
 *  - If activeBranches is empty / falsy → return "".
 *
 * @param {string} currentBranchId
 * @param {Array<{id: string}>} activeBranches
 * @returns {string}
 */
export function resolveActiveBranchId(currentBranchId, activeBranches) {
  const branches = Array.isArray(activeBranches) ? activeBranches : [];
  if (branches.length === 0) return '';
  const stillActive = branches.some((b) => b.id === currentBranchId);
  if (stillActive) return currentBranchId;
  return branches[0].id;
}
