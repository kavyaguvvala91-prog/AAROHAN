import { motion } from 'framer-motion';
import { MapPin, IndianRupee, Trophy } from 'lucide-react';
import Badge from './Badge';

const CollegeCard = ({ college, showScore = false }) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -6 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition hover:shadow-xl"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900">{college.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
            <MapPin size={14} />
            {college.location}
          </p>
        </div>
        {college.tag && <Badge label={college.tag} />}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-slate-500">Fees</p>
          <p className="mt-1 flex items-center text-base font-semibold text-slate-800">
            <IndianRupee size={13} />
            {college.fees?.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-slate-500">Avg Package</p>
          <p className="mt-1 flex items-center text-base font-semibold text-green-700">
            <IndianRupee size={13} />
            {college.avg_package?.toLocaleString()}
          </p>
        </div>
      </div>

      {showScore && (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50 px-3 py-2 text-blue-700">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Trophy size={16} />
            Match Score
          </p>
          <p className="text-lg font-bold">{college.score}/100</p>
        </div>
      )}
    </motion.article>
  );
};

export default CollegeCard;
