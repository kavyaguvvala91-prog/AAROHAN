import { motion } from 'framer-motion';
import { AlertTriangle, Heart } from 'lucide-react';
import CollegeCard from '../components/CollegeCard';
import Loader from '../components/Loader';
import { useFavorites } from '../context/FavoritesContext';

const Favorites = () => {
  const { favorites, loadingFavorites, favoritesError } = useFavorites();

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-rose-50 p-3 text-rose-500">
            <Heart size={22} className="fill-current" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Favorites</h1>
            <p className="mt-1 text-sm text-slate-600">
              View and manage all colleges you have saved.
            </p>
          </div>
        </div>
      </motion.section>

      {loadingFavorites && <Loader label="Loading favorite colleges..." />}

      {favoritesError && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertTriangle size={16} />
          {favoritesError}
        </div>
      )}

      {!loadingFavorites && !favoritesError && (
        <section>
          <p className="mb-4 text-xs text-slate-500">Showing {favorites.length} favorite college(s)</p>

          {!favorites.length ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
              No favorite colleges yet. Tap the heart icon on any college card to save it here.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
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
