import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  addFavorite,
  fetchFavorites,
  getApiErrorMessage,
  removeFavorite,
} from '../services/api';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [favoritesError, setFavoritesError] = useState('');

  useEffect(() => {
    const loadFavorites = async () => {
      if (!isAuthenticated) {
        setFavorites([]);
        setFavoritesError('');
        setLoadingFavorites(false);
        return;
      }

      setLoadingFavorites(true);
      setFavoritesError('');

      try {
        const response = await fetchFavorites();
        setFavorites(response.data || []);
      } catch (error) {
        setFavorites([]);
        setFavoritesError(getApiErrorMessage(error, 'Unable to load favorites.'));
      } finally {
        setLoadingFavorites(false);
      }
    };

    loadFavorites();
  }, [isAuthenticated]);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((college) => String(college._id))),
    [favorites]
  );

  const isFavorite = (collegeId) => favoriteIds.has(String(collegeId));

  const toggleFavorite = async (college) => {
    if (!college?._id) return;

    const collegeId = String(college._id);
    const currentlyFavorite = isFavorite(collegeId);
    const previousFavorites = favorites;

    setFavoritesError('');

    if (currentlyFavorite) {
      setFavorites((prev) => prev.filter((item) => String(item._id) !== collegeId));

      try {
        await removeFavorite(collegeId);
      } catch (error) {
        setFavorites(previousFavorites);
        setFavoritesError(getApiErrorMessage(error, 'Unable to remove favorite.'));
        throw error;
      }

      return;
    }

    const optimisticFavorite = { ...college, isFavorite: true };
    setFavorites((prev) => [optimisticFavorite, ...prev.filter((item) => String(item._id) !== collegeId)]);

    try {
      const response = await addFavorite(collegeId);
      const savedCollege = response.data || optimisticFavorite;
      setFavorites((prev) => [
        savedCollege,
        ...prev.filter((item) => String(item._id) !== String(savedCollege._id)),
      ]);
    } catch (error) {
      setFavorites(previousFavorites);
      setFavoritesError(getApiErrorMessage(error, 'Unable to add favorite.'));
      throw error;
    }
  };

  const value = useMemo(
    () => ({
      favorites,
      favoriteIds,
      loadingFavorites,
      favoritesError,
      isFavorite,
      toggleFavorite,
      setFavoritesError,
    }),
    [favorites, favoriteIds, loadingFavorites, favoritesError]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider.');
  }

  return context;
};
