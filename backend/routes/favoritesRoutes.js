const express = require('express');
const {
  addFavorite,
  getFavorites,
  removeFavorite,
} = require('../controllers/favoritesController');
const validateRequest = require('../middleware/validateRequest');
const { favoritesValidators } = require('../validation/apiValidators');

const router = express.Router();

router.post('/', favoritesValidators.add, validateRequest, addFavorite);
router.get('/', getFavorites);
router.delete('/:collegeId', favoritesValidators.remove, validateRequest, removeFavorite);

module.exports = router;
