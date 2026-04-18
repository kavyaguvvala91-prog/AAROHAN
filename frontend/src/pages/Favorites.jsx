import { motion } from 'framer-motion';
import { AlertTriangle, Heart } from 'lucide-react';
import CollegeCard from '../components/CollegeCard';
import Loader from '../components/Loader';
import { useFavorites } from '../context/FavoritesContext';

const Favorites = () => {
  const { favorites, loadingFavorites, favoritesError } = useFavorites();

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="app-card bg-gradient-to-br from-rose-50/90 via-white to-violet-50/80 p-6 sm:p-8"
      >
        <div className="flex items-center gap-4">
          <div className="rounded-[1.25rem] bg-gradient-to-br from-rose-500 to-pink-500 p-3 text-white shadow-lg shadow-rose-200/50">
            <Heart size={24} className="fill-current" />
          </div>
          <div>
            <h1 className="app-section-heading">Favorites</h1>
            <p className="app-section-copy mt-2">
              Your saved colleges stay highlighted here so you can revisit and compare them quickly.
            </p>
          </div>
        </div>
      </motion.section>

      {loadingFavorites && <Loader label="Loading favorite colleges..." />}

      {favoritesError && (
        <div className="app-card flex items-center gap-2 border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-700">
          <AlertTriangle size={16} />
          {favoritesError}
        </div>
      )}

      {!loadingFavorites && !favoritesError && (
        <section className="space-y-4">
          <div className="app-card flex items-center justify-between px-5 py-4">
            <p className="text-sm font-semibold text-slate-800">Saved list</p>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Showing {favorites.length} favorite college(s)
            </p>
          </div>

          {!favorites.length ? (
            <div className="app-card border-dashed px-8 py-12 text-center text-sm text-slate-500">
              No favorite colleges yet. Tap the heart icon on any college card to save it here.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
              {favorites.map((college, index) => (
                <motion.div
                  key={college._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <CollegeCard college={college} />
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Favorites;
