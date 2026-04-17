const express = require('express');
const {
  getAllColleges,
  filterColleges,
  recommendColleges,
  compareColleges,
} = require('../controllers/collegeController');

const router = express.Router();

router.get('/colleges', getAllColleges);
router.get('/colleges/filter', filterColleges);
router.post('/recommend', recommendColleges);
router.post('/compare', compareColleges);

module.exports = router;