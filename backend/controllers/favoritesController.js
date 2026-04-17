const mongoose = require('mongoose');
const College = require('../models/College');
const Favorite = require('../models/Favorite');

const getUserId = (req) => req.user?._id;

const mapFavoritesToColleges = (favorites = []) =>
  favorites
    .map((favorite) => {
      const college =
        favorite.collegeId?.toObject?.() ||
        favorite.collegeId ||
        null;

      if (!college?._id) return null;

      return {
        ...college,
        isFavorite: true,
        favoriteCreatedAt: favorite.createdAt,
      };
    })
    .filter(Boolean);

const addFavorite = async (req, res, next) => {
  try {
    const { collegeId } = req.body;
    const userId = getUserId(req);

    if (!collegeId) {
      return res.status(400).json({
        success: false,
        message: 'collegeId is required.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(collegeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid collegeId.',
      });
    }

    const college = await College.findById(collegeId);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found.',
      });
    }

    const existingFavorite = await Favorite.findOne({ userId, collegeId });

    if (existingFavorite) {
      return res.status(200).json({
        success: true,
        message: 'College is already in favorites.',
        data: {
          ...college.toObject(),
          isFavorite: true,
          favoriteCreatedAt: existingFavorite.createdAt,
        },
      });
    }

    const favorite = await Favorite.create({ userId, collegeId });

    return res.status(201).json({
      success: true,
      message: 'College added to favorites.',
      data: {
        ...college.toObject(),
        isFavorite: true,
        favoriteCreatedAt: favorite.createdAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getFavorites = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const favorites = await Favorite.find({ userId })
      .sort({ createdAt: -1 })
      .populate('collegeId');

    return res.status(200).json({
      success: true,
      count: favorites.length,
      data: mapFavoritesToColleges(favorites),
    });
  } catch (error) {
    return next(error);
  }
};

const removeFavorite = async (req, res, next) => {
  try {
    const { collegeId } = req.params;
    const userId = getUserId(req);

    if (!mongoose.Types.ObjectId.isValid(collegeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid collegeId.',
      });
    }

    const removedFavorite = await Favorite.findOneAndDelete({ userId, collegeId });

    if (!removedFavorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'College removed from favorites.',
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  addFavorite,
  getFavorites,
  removeFavorite,
};
