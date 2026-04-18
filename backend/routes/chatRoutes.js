const express = require('express');
const { chatWithGemini } = require('../controllers/chatController');
const validateRequest = require('../middleware/validateRequest');
const { chatValidators } = require('../validation/apiValidators');

const router = express.Router();

router.post('/', chatValidators.create, validateRequest, chatWithGemini);

module.exports = router;
