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
      whileHover={{ scale: 1.03, y: -6 }}
      whileTap={selectable ? { scale: 0.995 } : undefined}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      tabIndex={selectable ? 0 : undefined}
      role={selectable ? 'button' : undefined}
      aria-pressed={selectable ? selected : undefined}
      className={`group h-full overflow-hidden rounded-[1.75rem] border bg-white/90 shadow-md transition duration-200 hover:shadow-xl ${
        selectable ? 'cursor-pointer' : ''
      } ${
        favorite
          ? 'border-rose-200/70 bg-rose-50/40'
          : selected
            ? 'border-blue-300 bg-blue-50/50'
            : 'border-white/70'
      }`}
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-violet-600 px-5 py-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.22),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),_transparent_32%)]" />

        <div className="relative flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {college.tag && <Badge label={college.tag} />}
            {selectable && (
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                  selected
                    ? 'border-blue-200 bg-blue-100 text-blue-700'
                    : 'border-white/30 bg-white/10 text-white'
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
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-sm transition ${
              favorite
                ? 'border-rose-200 bg-rose-500 text-white shadow-md shadow-rose-200/50'
                : 'border-white/30 bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            <Heart size={18} className={favorite ? 'fill-current' : ''} />
          </motion.button>
        </div>

        <div className="relative mt-10">
          <p className="flex items-center gap-1 text-sm text-blue-100">
            <MapPin size={14} />
            {college.location}
          </p>
          <h3 className="mt-2 text-xl font-bold tracking-tight text-white">{college.name}</h3>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-blue-100/60 bg-blue-50/70 p-3">
            <p className="text-slate-500">Fees</p>
            <p className="mt-1 flex items-center text-base font-semibold text-slate-800">
              <IndianRupee size={13} />
              {formatCurrency(college.fees)}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
            <p className="text-slate-500">Avg Package</p>
            <p className="mt-1 flex items-center text-base font-semibold text-emerald-700">
              <IndianRupee size={13} />
              {formatCurrency(college.avg_package)}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50/65 px-4 py-3 text-sm">
          <p className="font-medium text-slate-700">{cutoffInfo}</p>
          {admissionChance && (
            <p className="mt-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
              <Sparkles size={12} />
              Admission prediction: {admissionChance}
            </p>
          )}
        </div>

        {showScore && (
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-gradient-to-r from-blue-50 to-violet-50 px-4 py-3 text-blue-700">
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
            className="app-button-secondary px-4 py-2.5 text-slate-900 hover:text-slate-950"
          >
            View details
          </Link>
        </div>

        {selectable && (
          <motion.div
            layout
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 flex items-center justify-between rounded-2xl border px-4 py-3 ${
              selected
                ? 'border-blue-200 bg-blue-50/80'
                : 'border-slate-200 bg-slate-50/80'
            }`}
          >
            <p className={`text-sm ${selected ? 'text-blue-700' : 'text-slate-600'}`}>{selectionLabel}</p>
            <button
              type="button"
              onClick={handleSelectClick}
              className={selected ? 'app-button-secondary px-4 py-2' : 'app-button-primary px-4 py-2'}
            >
              <CheckCircle2 size={16} />
              {selected ? 'Selected' : 'Select'}
            </button>
          </motion.div>
        )}
      </div>
    </motion.article>
  );
};

export default CollegeCard;
