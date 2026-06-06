export function LoadingSpinner({ size = 'lg', className = '' }) {
  return (
    <div className={`flex justify-center items-center p-4 ${className}`}>
      <span className={`loading loading-spinner loading-${size} text-primary`}></span>
    </div>
  );
}
