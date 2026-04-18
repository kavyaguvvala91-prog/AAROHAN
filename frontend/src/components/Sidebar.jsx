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
  <div className="flex h-full flex-col border-r border-white/20 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.28),_transparent_24%),linear-gradient(180deg,#0f172a,#172554_42%,#4c1d95_100%)] text-slate-200">
    <div className="border-b border-white/10 px-5 py-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-gradient-to-br from-blue-500 via-blue-400 to-violet-500 p-3 text-white shadow-lg shadow-blue-900/40">
          <Sparkles size={20} />
        </div>
        <div>
          <p className="text-lg font-bold tracking-tight text-white">Aarohan</p>
          <p className="text-xs text-blue-100/80">Interactive decision platform</p>
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
              `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white/16 text-white shadow-lg shadow-blue-950/20 ring-1 ring-white/20'
                  : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <span className="rounded-xl bg-white/10 p-2 text-inherit transition group-hover:bg-white/15">
              <Icon size={18} />
            </span>
            {item.label}
          </NavLink>
        );
      })}
    </nav>

    <div className="space-y-3 p-4">
      <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-gradient-to-br from-emerald-400 to-blue-400 p-2 text-slate-950">
            <UserCircle2 size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{user?.name || 'Student'}</p>
            <p className="text-xs text-blue-100/70">{user?.email || 'Logged in'}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-xs leading-5 text-emerald-100">
        Live recommendations, maps, cutoffs, and comparison insights are ready to explore.
      </div>

      <button onClick={onLogout} className="app-button-secondary w-full bg-white/85">
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
              className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden"
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
                className="absolute right-3 top-3 rounded-full border border-white/20 bg-slate-950/60 p-1.5 text-white shadow"
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
