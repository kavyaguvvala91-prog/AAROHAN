import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const streamThemes = {
  engineering: {
    icon: 'bg-blue-50 text-blue-700',
    accent: 'text-blue-700 border-blue-200 bg-blue-50',
  },
  polytechnic: {
    icon: 'bg-violet-50 text-violet-700',
    accent: 'text-violet-700 border-violet-200 bg-violet-50',
  },
  medical: {
    icon: 'bg-emerald-50 text-emerald-700',
    accent: 'text-emerald-700 border-emerald-200 bg-emerald-50',
  },
  law: {
    icon: 'bg-amber-50 text-amber-700',
    accent: 'text-amber-700 border-amber-200 bg-amber-50',
  },
};

const StreamTypeCard = ({ title, description, icon: Icon, slug }) => {
  const theme = streamThemes[slug] || streamThemes.engineering;

  return (
    <Link to={`/stream/${encodeURIComponent(slug)}`}>
      <motion.article
        whileHover={{ y: -3, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="group h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:shadow-md"
      >
        <div className="flex items-start justify-between">
          <div className={`rounded-lg p-3 ${theme.icon}`}>
            <Icon size={22} />
          </div>
          <ArrowRight
            size={18}
            className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700"
          />
        </div>

        <h3 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">{title}</h3>
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
