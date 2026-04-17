import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = 'Search colleges...' }) => {
  return (
    <div className="relative w-full">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/30"
      />
    </div>
  );
};

export default SearchBar;
