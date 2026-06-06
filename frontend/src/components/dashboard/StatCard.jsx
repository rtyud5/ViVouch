export function StatCard({ label, value, trend, color = 'primary' }) {
  const colorMap = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    accent: 'border-accent',
    success: 'border-success',
    warning: 'border-warning',
    error: 'border-error',
    info: 'border-info',
    neutral: 'border-neutral'
  };
  const borderClass = colorMap[color] || 'border-primary';

  return (
    <div className={`bg-base-100 p-6 rounded-lg shadow-sm border-l-4 ${borderClass} flex flex-col`}>
      <span className="text-sm font-medium text-base-content/70 uppercase tracking-wider">{label}</span>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-base-content">{value}</span>
        {trend && (
          <span className="text-sm font-medium opacity-80">{trend}</span>
        )}
      </div>
    </div>
  );
}
