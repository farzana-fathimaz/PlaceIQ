const mongoose = require('mongoose')
const { DRIVE_STATUS, DRIVE_TYPES, BRANCHES, GENDERS } = require('../utils/constants')

const eligibilitySchema = new mongoose.Schema(
  {
    minCGPA:          { type: Number, default: 0, min: 0, max: 10 },
    maxBacklogs:      { type: Number, default: 0, min: 0 },
    allowedBranches:  { type: [String], enum: BRANCHES, default: BRANCHES },
    allowedBatches:   { type: [String], default: [] },
    genderAllowed:    { type: String, enum: ['All', ...GENDERS], default: 'All' },
    tenthMin:         { type: Number, default: 0, min: 0, max: 100 },
    twelfthMin:       { type: Number, default: 0, min: 0, max: 100 },
    allowPlaced:      { type: Boolean, default: false },
  },
  { _id: false }
)

const driveSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Drive title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      enum: DRIVE_TYPES,
      required: [true, 'Drive type is required'],
    },
    jobRole: {
      type: String,
      trim: true,
      default: '',
    },
    jobLocation: {
      type: String,
      trim: true,
      default: '',
    },
    salaryLPA: {
      type: String,
      default: '',
      trim: true,
    },
    driveDate: {
      type: Date,
      default: null,
    },
    lastApplyDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(DRIVE_STATUS),
      default: DRIVE_STATUS.DRAFT,
    },
    eligibility: {
      type: eligibilitySchema,
      default: () => ({}),
    },
    rounds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RecruitmentRound',
      },
    ],
    totalApplicants: {
      type: Number,
      default: 0,
    },
    totalPlaced: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

driveSchema.index({ status: 1 })
driveSchema.index({ company: 1 })
driveSchema.index({ type: 1 })
driveSchema.index({ createdAt: -1 })
driveSchema.index({ isArchived: 1 })

module.exports = mongoose.model('Drive', driveSchema)