const LoadingSpinner = ({ label = 'Loading...' }) => {
  return (
    <div className="flex items-center gap-3 text-slate-600">
      <span className="h-5 w-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
};

export default LoadingSpinner;