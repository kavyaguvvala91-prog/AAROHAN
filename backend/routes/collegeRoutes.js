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

const router = express.Router();

router.get('/colleges', getAllColleges);
router.get('/colleges/filter', filterColleges);
router.get('/college-details', getCollegeDetails);
router.get('/nearby', getNearbyPlaces);
router.post('/recommend', recommendColleges);
router.post('/compare', compareColleges);

module.exports = router;
