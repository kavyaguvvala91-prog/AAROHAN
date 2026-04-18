import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = 'Search colleges...' }) => {
  return (
    <div className="relative w-full">
      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-white/70 bg-white/88 py-3 pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition duration-200 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-200/40"
      />
    </div>
  );
};

export default SearchBar;
