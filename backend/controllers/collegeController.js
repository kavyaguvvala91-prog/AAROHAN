const College = require('../models/College');

const normalize = (value = '') => value.trim().toLowerCase();
const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getCollegeTag = (studentRank, collegeCutoff) => {
  if (collegeCutoff >= studentRank * 1.2) {
    return 'Safe';
  }

  if (collegeCutoff >= studentRank * 0.9) {
    return 'Target';
  }

  return 'Dream';
};

const getAllColleges = async (req, res, next) => {
  try {
    const { type, rank, budget, location, course } = req.query;
    const query = {};

    if (type) {
      query.type = { $regex: new RegExp(`^${escapeRegex(type.trim())}$`, 'i') };
    }

    if (rank) {
      query.cutoff_rank = { $gte: Number(rank) };
    }

    if (budget) {
      query.fees = { $lte: Number(budget) };
    }

    if (location) {
      query.location = { $regex: new RegExp(`^${escapeRegex(location.trim())}$`, 'i') };
    }

    if (course) {
      query.courses = { $elemMatch: { $regex: new RegExp(`^${escapeRegex(course.trim())}$`, 'i') } };
    }

    const colleges = await College.find(query).sort({ cutoff_rank: 1 });
    return res.status(200).json({
      success: true,
      count: colleges.length,
      filters: { type, rank, budget, location, course },
      data: colleges,
    });
  } catch (error) {
    return next(error);
  }
};

const filterColleges = async (req, res, next) => {
  try {
    const { location, maxFees, course } = req.query;
    const query = {};

    if (location) {
      query.location = { $regex: new RegExp(`^${escapeRegex(location)}$`, 'i') };
    }

    if (maxFees) {
      query.fees = { $lte: Number(maxFees) };
    }

    if (course) {
      query.courses = { $elemMatch: { $regex: new RegExp(`^${escapeRegex(course)}$`, 'i') } };
    }

    const colleges = await College.find(query).sort({ fees: 1 });

    return res.status(200).json({
      success: true,
      count: colleges.length,
      filters: { location, maxFees, course },
      data: colleges,
    });
  } catch (error) {
    return next(error);
  }
};

const recommendColleges = async (req, res, next) => {
  try {
    const { rank, budget, location, course, category } = req.body;

    if (
      rank === undefined ||
      budget === undefined ||
      !location ||
      !course
    ) {
      return res.status(400).json({
        success: false,
        message: 'rank, budget, location, and course are required.',
      });
    }

    const studentRank = Number(rank);
    const studentBudget = Number(budget);

    if (Number.isNaN(studentRank) || Number.isNaN(studentBudget)) {
      return res.status(400).json({
        success: false,
        message: 'rank and budget must be valid numbers.',
      });
    }

    const colleges = await College.find();

    const scoredColleges = colleges
      .map((college) => {
        let score = 0;

        if (studentRank <= college.cutoff_rank) {
          score += 40;
        }

        if (college.fees <= studentBudget) {
          score += 30;
        }

        if (normalize(college.location) === normalize(location)) {
          score += 20;
        }

        const hasCourse = college.courses.some(
          (c) => normalize(c) === normalize(course)
        );

        if (hasCourse) {
          score += 10;
        }

        return {
          ...college.toObject(),
          score,
          tag: getCollegeTag(studentRank, college.cutoff_rank),
        };
      })
      .sort((a, b) => b.score - a.score || a.cutoff_rank - b.cutoff_rank);

    return res.status(200).json({
      success: true,
      user_input: { rank: studentRank, budget: studentBudget, location, course, category: category || '' },
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
