import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Building2,
  GitCompareArrows,
  Heart,
  LogOut,
  Sparkles,
  UserCircle2,
  X,
} from 'lucide-react';

const menuItems = [
  { label: 'Dashboard', path: '/', icon: BarChart3 },
  { label: 'Colleges', path: '/colleges', icon: Building2 },
  { label: 'Favorites', path: '/favorites', icon: Heart },
  { label: 'Compare', path: '/compare', icon: GitCompareArrows },
];

const SidebarContent = ({ onNavigate, user, onLogout }) => (
  <div className="flex h-full flex-col border-r border-slate-200 bg-white text-slate-700">
    <div className="border-b border-slate-200 px-5 py-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-blue-600 p-3 text-white">
          <Sparkles size={20} />
        </div>
        <div>
          <p className="text-lg font-semibold tracking-tight text-slate-900">Aarohan</p>
          <p className="text-xs text-slate-500">College search</p>
        </div>
      </div>
    </div>

    <nav className="flex-1 space-y-2 p-3">
      {menuItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <span className="rounded-lg bg-slate-100 p-2 text-inherit">
              <Icon size={18} />
            </span>
            {item.label}
          </NavLink>
        );
      })}
    </nav>

    <div className="space-y-3 p-4">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white p-2 text-slate-700">
            <UserCircle2 size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{user?.name || 'Student'}</p>
            <p className="text-xs text-slate-500">{user?.email || 'Logged in'}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-500">
        Explore colleges, compare options, and save what matters.
      </div>

      <button onClick={onLogout} className="app-button-secondary w-full">
        <LogOut size={16} />
        Logout
      </button>
    </div>
  </div>
);

const Sidebar = ({ mobileOpen, onClose, user, onLogout }) => {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:block">
        <SidebarContent user={user} onLogout={onLogout} />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
              onClick={onClose}
            />

            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', stiffness: 220, damping: 24 }}
              className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
            >
              <button
                onClick={onClose}
                className="absolute right-3 top-3 rounded-full border border-slate-300 bg-white p-1.5 text-slate-700 shadow-sm"
              >
                <X size={16} />
              </button>
              <SidebarContent onNavigate={onClose} user={user} onLogout={onLogout} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
