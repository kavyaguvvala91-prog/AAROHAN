const mongoose = require('mongoose');

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
