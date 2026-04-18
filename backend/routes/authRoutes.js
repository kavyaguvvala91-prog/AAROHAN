const express = require('express');
const { loginUser, registerUser } = require('../controllers/authController');
const validateRequest = require('../middleware/validateRequest');
const { authValidators } = require('../validation/apiValidators');

const router = express.Router();

router.post('/register', authValidators.register, validateRequest, registerUser);
router.post('/login', authValidators.login, validateRequest, loginUser);

module.exports = router;
