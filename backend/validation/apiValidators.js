const { body, param, query } = require('express-validator');

const optionalTrimmedString = (builder) =>
  builder.optional().isString().trim().isLength({ min: 1 }).withMessage('Must be a non-empty string.');

const authValidators = {
  register: [
    body('name').isString().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters long.'),
    body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
    body('password')
      .isString()
      .isLength({ min: 6, max: 128 })
      .withMessage('Password must be 6-128 characters long.'),
  ],
  login: [
    body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
    body('password').isString().notEmpty().withMessage('Password is required.'),
  ],
};

const collegeValidators = {
  getAll: [
    optionalTrimmedString(query('type')),
    optionalTrimmedString(query('location')),
    optionalTrimmedString(query('course')),
    optionalTrimmedString(query('category')),
    query('rank').optional().isInt({ min: 1 }).withMessage('rank must be a positive number.'),
    query('budget').optional().isInt({ min: 0 }).withMessage('budget must be a non-negative number.'),
  ],
  filter: [
    optionalTrimmedString(query('location')),
    optionalTrimmedString(query('course')),
    optionalTrimmedString(query('category')),
    query('rank').optional().isInt({ min: 1 }).withMessage('rank must be a positive number.'),
    query('maxFees').optional().isInt({ min: 0 }).withMessage('maxFees must be a non-negative number.'),
  ],
  recommend: [
    body('rank').isInt({ min: 1 }).withMessage('rank must be a positive number.'),
    body('budget').isInt({ min: 0 }).withMessage('budget must be a non-negative number.'),
    body('location').isString().trim().notEmpty().withMessage('location is required.'),
    body('course').isString().trim().notEmpty().withMessage('course is required.'),
    body('category').optional().isString().trim().notEmpty().withMessage('category must be a string.'),
  ],
  compare: [
    body('colleges')
      .isArray({ min: 2 })
      .withMessage('Please provide at least two college names in the colleges array.'),
    body('colleges.*').isString().trim().notEmpty().withMessage('Each college name must be a non-empty string.'),
  ],
  details: [
    query('name').isString().trim().notEmpty().withMessage('College name is required.'),
  ],
};

const favoritesValidators = {
  add: [
    body('collegeId').isMongoId().withMessage('A valid collegeId is required.'),
  ],
  remove: [
    param('collegeId').isMongoId().withMessage('A valid collegeId is required.'),
  ],
};

const chatValidators = {
  create: [
    body('message').isString().trim().notEmpty().withMessage('A user message is required.'),
    body('history').optional().isArray().withMessage('history must be an array.'),
  ],
};

module.exports = {
  authValidators,
  chatValidators,
  collegeValidators,
  favoritesValidators,
};
