const College = require('../models/College');
const {
  buildFallbackCollegeDetails,
  getCollegeDetailsFromPlaces,
  getNearbyPlacesForCollege,
} = require('../services/placesService');

const findCollegeByName = async (name) => {
  if (!name || !name.trim()) return null;

  return College.findOne({
    name: { $regex: new RegExp(`^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
  });
};

const getCollegeDetails = async (req, res, next) => {
  try {
    const { name } = req.query;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: 'College name is required.',
      });
    }

    const college = await findCollegeByName(String(name));

    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found.',
        college: null,
        images: [],
        reviews: [],
        nearby: {
          hostels: [],
          restaurants: [],
          transport: [],
        },
      });
    }

    const details = await getCollegeDetailsFromPlaces(college);
    const nearby = await getNearbyPlacesForCollege(college, details);

    return res.status(200).json({
      success: true,
      college: details.college,
      images: details.images,
      reviews: details.reviews || [],
      nearby,
      source: details.source === 'fallback' || nearby.source === 'fallback' ? 'fallback' : 'primary',
      externalDataAvailable: details.college.externalDataAvailable,
      fallback: !details.college.externalDataAvailable,
    });
  } catch (error) {
    return next(error);
  }
};

const getNearbyPlaces = async (req, res, next) => {
  try {
    const { name } = req.query;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: 'College name is required.',
      });
    }

    const college = await findCollegeByName(String(name));

    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found.',
        reviews: [],
        nearby: {
          hostels: [],
          restaurants: [],
          transport: [],
        },
      });
    }

    const details = await getCollegeDetailsFromPlaces(college);
    const nearby = await getNearbyPlacesForCollege(college, details);
    const fallback = buildFallbackCollegeDetails(college);

    return res.status(200).json({
      success: true,
      college: details.college || fallback.college,
      images: details.images || [],
      reviews: details.reviews || fallback.reviews || [],
      nearby,
      source: details.source === 'fallback' || nearby.source === 'fallback' ? 'fallback' : 'primary',
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getCollegeDetails,
  getNearbyPlaces,
};
