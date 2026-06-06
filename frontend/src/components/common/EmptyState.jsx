export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-base-100 rounded-box border border-base-200 border-dashed">
      <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-base-content">{title}</h3>
      {description && <p className="text-base-content/70 mt-2 max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
