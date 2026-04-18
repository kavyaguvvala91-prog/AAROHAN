const badgeStyles = {
  Safe: {
    text: 'Safe Choice',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  Target: {
    text: 'Best ROI',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  Dream: {
    text: 'Dream College',
    className: 'border-rose-200 bg-rose-50 text-rose-700',
  },
};

const Badge = ({ label }) => {
  const config = badgeStyles[label] || {
    text: label,
    className: 'border-slate-200 bg-slate-100 text-slate-700',
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${config.className}`}
    >
      {config.text}
    </span>
  );
};

export default Badge;
