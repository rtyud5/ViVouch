export function canTransition(currentStatus, nextStatus, transitions) {
  return transitions[currentStatus]?.includes(nextStatus) || false;
}
