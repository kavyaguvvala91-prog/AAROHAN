import { Menu, UserCircle2 } from 'lucide-react';
import SearchBar from './SearchBar';

const Navbar = ({ searchTerm, onSearchChange, onMenuToggle }) => {
  return (
    <header className="fixed right-0 top-0 z-20 w-full border-b border-slate-200 bg-white/90 backdrop-blur lg:pl-72">
      <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-2xl items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 lg:hidden"
          >
            <Menu size={18} />
          </button>
          <SearchBar value={searchTerm} onChange={onSearchChange} />
        </div>

        <button className="ml-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <UserCircle2 className="text-blue-600" size={20} />
          <span className="hidden sm:block">Student</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
