const badgeStyles = {
  Safe: 'bg-green-100 text-green-700 border-green-200',
  Target: 'bg-amber-100 text-amber-700 border-amber-200',
  Dream: 'bg-rose-100 text-rose-700 border-rose-200',
};

const Badge = ({ label }) => {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeStyles[label] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {label}
    </span>
  );
};

export default Badge;
