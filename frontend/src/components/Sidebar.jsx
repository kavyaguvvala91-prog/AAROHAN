import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Building2, GitCompareArrows, Sparkles, X } from 'lucide-react';

const menuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: BarChart3 },
  { label: 'Colleges', path: '/colleges', icon: Building2 },
  { label: 'Compare', path: '/compare', icon: GitCompareArrows },
];

const SidebarContent = ({ onNavigate }) => (
  <div className="flex h-full flex-col border-r border-slate-800 bg-slate-950 text-slate-200">
    <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-6">
      <div className="rounded-xl bg-blue-600 p-2 text-white shadow-lg shadow-blue-900/40">
        <Sparkles size={18} />
      </div>
      <div>
        <p className="text-lg font-bold text-white">CollegeAI</p>
        <p className="text-xs text-slate-400">Premium Discovery Suite</p>
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
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {item.label}
          </NavLink>
        );
      })}
    </nav>

    <div className="p-4">
      <div className="rounded-xl border border-emerald-900/60 bg-emerald-900/30 px-4 py-3 text-xs text-emerald-300">
        Live backend connected. AI matching is ready.
      </div>
    </div>
  </div>
);

const Sidebar = ({ mobileOpen, onClose }) => {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:block">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
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
                className="absolute right-3 top-3 rounded-full border border-slate-700 bg-slate-900 p-1 text-slate-200 shadow"
              >
                <X size={16} />
              </button>
              <SidebarContent onNavigate={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
