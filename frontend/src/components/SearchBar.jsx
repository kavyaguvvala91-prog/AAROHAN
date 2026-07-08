import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = 'Search colleges...' }) => {
  return (
    <div className="relative w-full">
      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
};

export default SearchBar;
