import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Heart,
  IndianRupee,
  MapPin,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import Badge from './Badge';

const formatCurrency = (value) => Number(value || 0).toLocaleString('en-IN');

const CollegeCard = ({
  college,
  showScore = false,
  category = 'OC',
  selectable = false,
  selected = false,
  onSelect,
  selectionLabel = 'Select for compare',
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(college?._id);
  const categoryCutoff = college?.categoryCutoff || college?.cutoff?.[category] || college?.cutoff_rank;
  const cutoffInfo =
    college?.cutoffInfo ||
    `Cutoff for ${category} category: ${
      categoryCutoff ? Number(categoryCutoff).toLocaleString('en-IN') : 'Not available'
    }`;
  const admissionChance = college?.admissionChance || null;

  const handleFavoriteClick = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      await toggleFavorite(college);
    } catch (error) {
      // Shared context handles the error state.
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.005, y: -1 }}
      whileTap={selectable ? { scale: 0.995 } : undefined}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      tabIndex={selectable ? 0 : undefined}
      role={selectable ? 'button' : undefined}
      aria-pressed={selectable ? selected : undefined}
      className={`group h-full overflow-hidden rounded-xl border bg-white shadow-sm transition duration-200 hover:shadow-sm ${
        selectable ? 'cursor-pointer' : ''
      } ${
        favorite
          ? 'border-rose-200 bg-rose-50/40'
          : selected
            ? 'border-blue-300 bg-blue-50/50'
            : 'border-slate-200'
      }`}
    >
      <div className="border-b border-slate-200 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {college.tag && <Badge label={college.tag} />}
            {selectable && (
              <span
                className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                  selected
                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                    : 'border-slate-300 bg-white text-slate-600'
                }`}
              >
                {selected ? 'Selected' : 'Compare'}
              </span>
            )}
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={handleFavoriteClick}
            aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
              favorite
                ? 'border-rose-200 bg-rose-500 text-white'
                : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Heart size={18} className={favorite ? 'fill-current' : ''} />
          </motion.button>
        </div>

        <div className="mt-4">
          <p className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin size={12} />
            {college.location}
          </p>
          <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-900">{college.name}</h3>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
            <p className="text-xs text-slate-500">Fees</p>
            <p className="mt-1 flex items-center text-sm font-semibold text-slate-800">
              <IndianRupee size={12} />
              {formatCurrency(college.fees)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
            <p className="text-xs text-slate-500">Avg Package</p>
            <p className="mt-1 flex items-center text-sm font-semibold text-slate-800">
              <IndianRupee size={12} />
              {formatCurrency(college.avg_package)}
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm">
          <p className="text-sm font-medium text-slate-700">{cutoffInfo}</p>
          {admissionChance && (
            <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              <Sparkles size={11} />
              Admission prediction: {admissionChance}
            </p>
          )}
        </div>

        {showScore && (
          <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-slate-700">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Trophy size={15} />
              Match Score
            </p>
            <p className="text-base font-bold">{college.score}/100</p>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className={`text-xs font-medium ${selected ? 'text-blue-800' : 'text-blue-700'}`}>
            {selectable ? 'Tap anywhere to toggle selection' : 'Explore this college'}
          </div>
          <Link
            to={`/college/${encodeURIComponent(college.name)}`}
            onClick={(event) => event.stopPropagation()}
            className="app-button-secondary px-3 py-2 text-xs"
          >
            View details
          </Link>
        </div>

        {selectable && (
          <motion.div
            layout
            animate={{ opacity: 1, y: 0 }}
            className={`mt-3 flex items-center justify-between rounded-lg border px-3 py-2.5 ${
              selected
                ? 'border-blue-200 bg-blue-50/80'
                : 'border-slate-200 bg-slate-50/80'
            }`}
          >
            <p className={`text-xs ${selected ? 'text-blue-700' : 'text-slate-600'}`}>{selectionLabel}</p>
            <button
              type="button"
              onClick={handleSelectClick}
              className={selected ? 'app-button-secondary px-3 py-2 text-xs' : 'app-button-primary px-3 py-2 text-xs'}
            >
              <CheckCircle2 size={14} />
              {selected ? 'Selected' : 'Select'}
            </button>
          </motion.div>
        )}
      </div>
    </motion.article>
  );
};

export default CollegeCard;
