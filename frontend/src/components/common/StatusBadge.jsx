export function StatusBadge({ status }) {
  if (!status) return null;

  const normalizedStatus = status.toLowerCase();

  const badgeMap = {
    draft: 'badge-ghost',
    pending: 'badge-warning',
    on_sale: 'badge-success',
    rejected: 'badge-error',
    paused: 'badge-warning',
    pending_approval: 'badge-warning',
    approved: 'badge-info',
    expired: 'badge-ghost',
    suspended: 'badge-error',
    issued: 'badge-info',
    used: 'badge-success',
    cancelled: 'badge-error',
    locked: 'badge-error',
  };

  const labelMap = {
    draft: 'Draft',
    pending: 'Pending',
    on_sale: 'On Sale',
    rejected: 'Rejected',
    paused: 'Paused',
    pending_approval: 'Pending Approval',
    approved: 'Approved',
    expired: 'Expired',
    suspended: 'Suspended',
    issued: 'Issued',
    used: 'Used',
    cancelled: 'Cancelled',
    locked: 'Locked',
  };

  const badgeClass = badgeMap[normalizedStatus] || 'badge-ghost';
  const label = labelMap[normalizedStatus] || status;

  return (
    <div className={`badge ${badgeClass} font-medium`}>
      {label}
    </div>
  );
}
