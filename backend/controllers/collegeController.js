const College = require('../models/College');

const VALID_CATEGORIES = ['OC', 'BC', 'SC', 'ST', 'EWS'];

const normalize = (value = '') => value.trim().toLowerCase();
const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toNumber = (value) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const normalizeCategory = (value = '') => {
  const normalizedValue = String(value || '').trim().toUpperCase();

  if (!normalizedValue) return 'OC';
  if (normalizedValue === 'GENERAL') return 'OC';
  if (normalizedValue === 'OBC') return 'BC';
  return VALID_CATEGORIES.includes(normalizedValue) ? normalizedValue : null;
};

const getCategoryCutoff = (college, category = 'OC') => {
  const safeCollege = college?.toObject?.() || college || {};

  return (
    toNumber(safeCollege?.cutoff?.[category]) ||
    toNumber(safeCollege?.cutoff?.OC) ||
    toNumber(safeCollege?.cutoff_rank) ||
    null
  );
};

const getAdmissionChance = (studentRank, categoryCutoff) => {
  if (!studentRank || !categoryCutoff) {
    return 'Cutoff unavailable';
  }

  if (studentRank <= categoryCutoff * 0.8) {
    return 'High chance';
  }

  if (studentRank <= categoryCutoff) {
    return 'Moderate chance';
  }

  return 'Low chance';
};

const getCollegeTag = (studentRank, collegeCutoff) => {
  if (!collegeCutoff) {
    return 'Info Unavailable';
  }

  if (collegeCutoff >= studentRank * 1.2) {
    return 'Safe';
  }

  if (collegeCutoff >= studentRank * 0.9) {
    return 'Target';
  }

  return 'Dream';
};

const decorateCollegeForCategory = (college, category, studentRank = null) => {
  const safeCollege = college.toObject?.() || college;
  const categoryCutoff = getCategoryCutoff(safeCollege, category);

  return {
    ...safeCollege,
    selectedCategory: category,
    categoryCutoff,
    admissionChance: studentRank ? getAdmissionChance(studentRank, categoryCutoff) : null,
    cutoffInfo: categoryCutoff
      ? `Cutoff for ${category} category: ${categoryCutoff.toLocaleString('en-IN')}`
      : `Cutoff for ${category} category: Not available`,
  };
};

const validateNumericInputs = ({ rank, budget }) => {
  const parsedRank = rank === undefined || rank === '' ? null : toNumber(rank);
  const parsedBudget = budget === undefined || budget === '' ? null : toNumber(budget);

  if (rank !== undefined && rank !== '' && (parsedRank === null || parsedRank < 1)) {
    return { error: 'rank must be a valid positive number.' };
  }

  if (budget !== undefined && budget !== '' && (parsedBudget === null || parsedBudget < 0)) {
    return { error: 'budget must be a valid non-negative number.' };
  }

  return { parsedRank, parsedBudget };
};

const getAllColleges = async (req, res, next) => {
  try {
    const { type, rank, budget, location, course, category } = req.query;
    const selectedCategory = normalizeCategory(category);

    if (!selectedCategory) {
      return res.status(400).json({
        success: false,
        message: `category must be one of: ${VALID_CATEGORIES.join(', ')}.`,
      });
    }

    const { parsedRank, parsedBudget, error } = validateNumericInputs({ rank, budget });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const query = {};

    if (type) {
      query.type = { $regex: new RegExp(`^${escapeRegex(type.trim())}$`, 'i') };
    }

    if (parsedBudget !== null) {
      query.fees = { $lte: parsedBudget };
    }

    if (location) {
      query.location = { $regex: new RegExp(`^${escapeRegex(location.trim())}$`, 'i') };
    }

    if (course) {
      query.courses = { $elemMatch: { $regex: new RegExp(`^${escapeRegex(course.trim())}$`, 'i') } };
    }

    const colleges = await College.find(query);
    const filteredColleges = colleges
      .map((college) => decorateCollegeForCategory(college, selectedCategory, parsedRank))
      .filter((college) => (parsedRank !== null ? (college.categoryCutoff || 0) >= parsedRank : true))
      .sort(
        (a, b) =>
          (a.categoryCutoff || a.cutoff_rank || 0) - (b.categoryCutoff || b.cutoff_rank || 0)
      );

    return res.status(200).json({
      success: true,
      count: filteredColleges.length,
      filters: { type, rank, budget, location, course, category: selectedCategory },
      data: filteredColleges,
    });
  } catch (error) {
    return next(error);
  }
};

const filterColleges = async (req, res, next) => {
  try {
    const { location, maxFees, course, rank, category } = req.query;
    const selectedCategory = normalizeCategory(category);

    if (!selectedCategory) {
      return res.status(400).json({
        success: false,
        message: `category must be one of: ${VALID_CATEGORIES.join(', ')}.`,
      });
    }

    const { parsedRank, parsedBudget, error } = validateNumericInputs({
      rank,
      budget: maxFees,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const query = {};

    if (location) {
      query.location = { $regex: new RegExp(`^${escapeRegex(location.trim())}$`, 'i') };
    }

    if (parsedBudget !== null) {
      query.fees = { $lte: parsedBudget };
    }

    if (course) {
      query.courses = { $elemMatch: { $regex: new RegExp(`^${escapeRegex(course.trim())}$`, 'i') } };
    }

    const colleges = await College.find(query);
    const filteredColleges = colleges
      .map((college) => decorateCollegeForCategory(college, selectedCategory, parsedRank))
      .filter((college) => (parsedRank !== null ? (college.categoryCutoff || 0) >= parsedRank : true))
      .sort((a, b) => (a.fees || 0) - (b.fees || 0));

    return res.status(200).json({
      success: true,
      count: filteredColleges.length,
      filters: { location, maxFees, course, rank, category: selectedCategory },
      data: filteredColleges,
    });
  } catch (error) {
    return next(error);
  }
};

const recommendColleges = async (req, res, next) => {
  try {
    const { rank, budget, location, course, category } = req.body;
    const selectedCategory = normalizeCategory(category);

    if (!selectedCategory) {
      return res.status(400).json({
        success: false,
        message: `category must be one of: ${VALID_CATEGORIES.join(', ')}.`,
      });
    }

    if (rank === undefined || budget === undefined || !location || !course) {
      return res.status(400).json({
        success: false,
        message: 'rank, budget, location, and course are required.',
      });
    }

    const { parsedRank: studentRank, parsedBudget: studentBudget, error } = validateNumericInputs({
      rank,
      budget,
    });

    if (error || studentRank === null || studentBudget === null) {
      return res.status(400).json({
        success: false,
        message: error || 'rank and budget must be valid numbers.',
      });
    }

    const colleges = await College.find();

    const scoredColleges = colleges
      .map((college) => {
        const categoryCutoff = getCategoryCutoff(college, selectedCategory);
        let score = 0;

        if (categoryCutoff && studentRank <= categoryCutoff) {
          score += 40;
        }

        if (college.fees <= studentBudget) {
          score += 30;
        }

        if (normalize(college.location) === normalize(location)) {
          score += 20;
        }

        const hasCourse = college.courses.some((item) => normalize(item) === normalize(course));

        if (hasCourse) {
          score += 10;
        }

        return {
          ...decorateCollegeForCategory(college, selectedCategory, studentRank),
          score,
          tag: getCollegeTag(studentRank, categoryCutoff),
        };
      })
      .sort(
        (a, b) =>
          b.score - a.score ||
          (a.categoryCutoff || a.cutoff_rank || 0) - (b.categoryCutoff || b.cutoff_rank || 0)
      );

    return res.status(200).json({
      success: true,
      user_input: {
        rank: studentRank,
        budget: studentBudget,
        location,
        course,
        category: selectedCategory,
      },
      count: scoredColleges.length,
      data: scoredColleges,
    });
  } catch (error) {
    return next(error);
  }
};

const compareColleges = async (req, res, next) => {
  try {
    const { colleges } = req.body;

    if (!Array.isArray(colleges) || colleges.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least two college names in the colleges array.',
      });
    }

    const selectedColleges = await College.find({
      name: { $in: colleges },
    });

    return res.status(200).json({
      success: true,
      requested: colleges,
      found: selectedColleges.length,
      data: selectedColleges,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllColleges,
  filterColleges,
  recommendColleges,
  compareColleges,
};
