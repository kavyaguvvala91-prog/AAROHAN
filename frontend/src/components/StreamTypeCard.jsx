import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const streamThemes = {
  engineering: {
    shell: 'from-blue-500/15 via-white to-blue-100/70',
    icon: 'from-blue-500 to-cyan-400 text-white',
    accent: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  polytechnic: {
    shell: 'from-violet-500/15 via-white to-fuchsia-100/70',
    icon: 'from-violet-500 to-purple-500 text-white',
    accent: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  medical: {
    shell: 'from-emerald-500/15 via-white to-green-100/70',
    icon: 'from-emerald-500 to-teal-400 text-white',
    accent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  law: {
    shell: 'from-amber-500/15 via-white to-orange-100/70',
    icon: 'from-amber-500 to-orange-500 text-white',
    accent: 'bg-amber-50 text-amber-700 border-amber-200',
  },
};

const StreamTypeCard = ({ title, description, icon: Icon, slug }) => {
  const theme = streamThemes[slug] || streamThemes.engineering;

  return (
    <Link to={`/stream/${encodeURIComponent(slug)}`}>
      <motion.article
        whileHover={{ y: -8, scale: 1.03 }}
        whileTap={{ scale: 0.99 }}
        className={`group h-full rounded-[1.75rem] border border-white/70 bg-gradient-to-br ${theme.shell} p-6 shadow-md transition duration-200 hover:shadow-xl`}
      >
        <div className="flex items-start justify-between">
          <div className={`rounded-[1.25rem] bg-gradient-to-br ${theme.icon} p-3 shadow-lg`}>
            <Icon size={22} />
          </div>
          <ArrowRight
            size={18}
            className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700"
          />
        </div>

        <h3 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>

        <div className="mt-6 flex items-center justify-between text-sm font-medium text-slate-700">
          <span>Explore stream</span>
          <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] ${theme.accent}`}>
            {slug}
          </span>
        </div>
      </motion.article>
    </Link>
  );
};

export default StreamTypeCard;
