const mongoose = require('mongoose');

const categoryCutoffSchema = new mongoose.Schema(
  {
    OC: {
      type: Number,
      min: 1,
      default: null,
    },
    BC: {
      type: Number,
      min: 1,
      default: null,
    },
    SC: {
      type: Number,
      min: 1,
      default: null,
    },
    ST: {
      type: Number,
      min: 1,
      default: null,
    },
    EWS: {
      type: Number,
      min: 1,
      default: null,
    },
  },
  { _id: false }
);

const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    courses: {
      type: [String],
      required: true,
      default: [],
    },
    cutoff_rank: {
      type: Number,
      required: true,
      min: 1,
    },
    cutoff: {
      type: categoryCutoffSchema,
      required: true,
      default: () => ({
        OC: null,
        BC: null,
        SC: null,
        ST: null,
        EWS: null,
      }),
    },
    fees: {
      type: Number,
      required: true,
      min: 0,
    },
    avg_package: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('College', collegeSchema);
