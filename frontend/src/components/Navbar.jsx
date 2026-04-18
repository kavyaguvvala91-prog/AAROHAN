import { LogOut, Menu, UserCircle2 } from 'lucide-react';
import SearchBar from './SearchBar';

const Navbar = ({ searchTerm, onSearchChange, onMenuToggle, user, onLogout }) => {
  return (
    <header className="fixed right-0 top-0 z-20 w-full border-b border-white/60 bg-white/70 backdrop-blur-xl lg:pl-72">
      <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-2xl items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="inline-flex rounded-2xl border border-slate-200/80 bg-white/80 p-2.5 text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 lg:hidden"
          >
            <Menu size={18} />
          </button>
          <SearchBar value={searchTerm} onChange={onSearchChange} />
        </div>

        <div className="ml-3 flex items-center gap-2">
          <div className="hidden items-center gap-3 rounded-full border border-white/70 bg-white/85 px-4 py-2.5 text-sm text-slate-600 shadow-sm sm:flex">
            <div className="rounded-full bg-gradient-to-br from-blue-500 to-violet-500 p-2 text-white shadow-md shadow-blue-200/50">
              <UserCircle2 size={18} />
            </div>
            <div className="leading-tight">
              <p className="font-semibold text-slate-800">{user?.name || 'Student'}</p>
              <p className="text-xs text-slate-500">Welcome back</p>
            </div>
          </div>

          <button onClick={onLogout} className="app-button-secondary px-4 py-2.5">
            <LogOut size={16} />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
