import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const StreamTypeCard = ({ title, description, icon: Icon, slug }) => {
  return (
    <Link to={`/stream/${encodeURIComponent(slug)}`}>
      <motion.article
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group h-full rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-md transition hover:border-blue-200 hover:shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-100 p-3 text-blue-700 transition group-hover:scale-110">
            <Icon size={20} />
          </div>
          <ArrowRight size={18} className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />
        </div>

        <h3 className="mt-6 text-xl font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>

        <div className="mt-6 flex items-center justify-between text-sm font-medium text-blue-700">
          <span>Open colleges</span>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs uppercase tracking-[0.18em] text-blue-700">
            {slug}
          </span>
        </div>
      </motion.article>
    </Link>
  );
};

export default StreamTypeCard;
