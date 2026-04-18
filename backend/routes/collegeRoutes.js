const express = require('express');
const {
  getAllColleges,
  filterColleges,
  recommendColleges,
  compareColleges,
} = require('../controllers/collegeController');
const {
  getCollegeDetails,
  getNearbyPlaces,
} = require('../controllers/collegeDetailsController');
const validateRequest = require('../middleware/validateRequest');
const { collegeValidators } = require('../validation/apiValidators');

const router = express.Router();

router.get('/colleges', collegeValidators.getAll, validateRequest, getAllColleges);
router.get('/colleges/filter', collegeValidators.filter, validateRequest, filterColleges);
router.get('/college-details', collegeValidators.details, validateRequest, getCollegeDetails);
router.get('/nearby', collegeValidators.details, validateRequest, getNearbyPlaces);
router.post('/recommend', collegeValidators.recommend, validateRequest, recommendColleges);
router.post('/compare', collegeValidators.compare, validateRequest, compareColleges);

module.exports = router;
