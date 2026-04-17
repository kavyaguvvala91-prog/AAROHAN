import { motion } from 'framer-motion';
import { CheckCircle2, Heart, MapPin, IndianRupee, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from './Badge';
import { useFavorites } from '../context/FavoritesContext';

const CollegeCard = ({
  college,
  showScore = false,
  selectable = false,
  selected = false,
  onSelect,
  selectionLabel = 'Select for compare',
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(college?._id);

  const handleFavoriteClick = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      await toggleFavorite(college);
    } catch (error) {
      // Error state is handled in the shared favorites context.
    }
  };

  const handleSelectClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onSelect?.(college);
  };

  const handleCardClick = () => {
    if (!selectable) return;
    onSelect?.(college);
  };

  const handleCardKeyDown = (event) => {
    if (!selectable) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect?.(college);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -6 }}
      whileTap={selectable ? { scale: 0.995 } : undefined}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      tabIndex={selectable ? 0 : undefined}
      role={selectable ? 'button' : undefined}
      aria-pressed={selectable ? selected : undefined}
      className={`h-full rounded-2xl border p-6 shadow-md transition hover:shadow-xl ${
        selectable ? 'cursor-pointer' : ''
      } ${
        selected
          ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-100'
          : 'border-slate-200 bg-white hover:border-blue-200'
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-xl font-bold text-slate-900">{college.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
            <MapPin size={14} />
            {college.location}
          </p>
        </div>
        <div className="flex items-start gap-2">
          {selectable && (
            <motion.div
              animate={{
                opacity: selected ? 1 : 0.8,
                scale: selected ? 1 : 0.96,
              }}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                selected
                  ? 'border-blue-200 bg-blue-100 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-500'
              }`}
            >
              <CheckCircle2 size={14} className={selected ? 'text-blue-600' : 'text-slate-400'} />
              {selected ? 'Selected' : 'Select'}
            </motion.div>
          )}
          {college.tag && <Badge label={college.tag} />}
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={handleFavoriteClick}
            aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
              favorite
                ? 'border-rose-200 bg-rose-50 text-rose-500 shadow-sm'
                : 'border-slate-200 bg-white text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500'
            }`}
          >
            <Heart size={18} className={favorite ? 'fill-current' : ''} />
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className={`rounded-xl p-3 transition ${selected ? 'bg-white/90' : 'bg-slate-50'}`}>
          <p className="text-slate-500">Fees</p>
          <p className="mt-1 flex items-center text-base font-semibold text-slate-800">
            <IndianRupee size={13} />
            {college.fees?.toLocaleString()}
          </p>
        </div>

        <div className={`rounded-xl p-3 transition ${selected ? 'bg-white/90' : 'bg-slate-50'}`}>
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

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className={`text-sm font-medium ${selected ? 'text-blue-800' : 'text-blue-700'}`}>
          {selectable ? 'Tap anywhere to toggle selection' : 'Explore this college'}
        </div>
        <Link
          to={`/college/${encodeURIComponent(college.name)}`}
          onClick={(event) => event.stopPropagation()}
          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
        >
          View details
        </Link>
      </div>

      {selectable && (
        <motion.div
          layout
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 flex items-center justify-between rounded-xl border px-3 py-2.5 transition ${
            selected
              ? 'border-blue-200 bg-white/90'
              : 'border-slate-200 bg-slate-50'
          }`}
        >
          <p className={`text-sm ${selected ? 'text-blue-700' : 'text-slate-600'}`}>{selectionLabel}</p>
          <button
            type="button"
            onClick={handleSelectClick}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              selected
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {selected ? 'Selected' : 'Select'}
          </button>
        </motion.div>
      )}
    </motion.article>
  );
};

export default CollegeCard;
