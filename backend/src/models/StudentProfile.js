const mongoose = require('mongoose')
const { BRANCHES, GENDERS, PLACEMENT_STATUS } = require('../utils/constants')

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    branch: {
      type: String,
      required: [true, 'Branch is required'],
      enum: BRANCHES,
    },
    batch: {
      type: String,
      required: [true, 'Batch is required'],
      trim: true,
    },
    cgpa: {
      type: Number,
      required: [true, 'CGPA is required'],
      min: [0, 'CGPA cannot be less than 0'],
      max: [10, 'CGPA cannot exceed 10'],
    },
    activeBacklogs: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalBacklogs: {
      type: Number,
      default: 0,
      min: 0,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number'],
    },
    gender: {
      type: String,
      enum: GENDERS,
    },
    tenthPercent: {
      type: Number,
      min: 0,
      max: 100,
    },
    twelfthPercent: {
      type: Number,
      min: 0,
      max: 100,
    },
    resumeUrl: {
      type: String,
      default: null,
    },
    skills: {
      type: [String],
      default: [],
    },
    placementStatus: {
      type: String,
      enum: Object.values(PLACEMENT_STATUS),
      default: PLACEMENT_STATUS.NOT_PLACED,
    },
    placedAt: {
      type: String,
      default: null,
    },
    placedCTC: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

studentProfileSchema.index({ branch: 1 })
studentProfileSchema.index({ batch: 1 })
studentProfileSchema.index({ placementStatus: 1 })
studentProfileSchema.index({ cgpa: 1 })

module.exports = mongoose.model('StudentProfile', studentProfileSchema)