const mongoose = require('mongoose')
const { BRANCHES } = require('../utils/constants')

const defaultEligibilitySchema = new mongoose.Schema(
  {
    minCGPA:          { type: Number, default: 6.0,  min: 0, max: 10 },
    maxBacklogs:      { type: Number, default: 0,    min: 0 },
    allowedBranches:  { type: [String], default: [...BRANCHES] },
    genderAllowed:    { type: String,  default: 'All' },
    tenthMin:         { type: Number, default: 60,   min: 0, max: 100 },
    twelfthMin:       { type: Number, default: 60,   min: 0, max: 100 },
    allowPlaced:      { type: Boolean, default: false },
  },
  { _id: false }
)

const settingsSchema = new mongoose.Schema(
  {
    collegeName: {
      type:      String,
      required:  [true, 'College name is required'],
      trim:      true,
      maxlength: [120, 'College name cannot exceed 120 characters'],
    },
    collegeCode: {
      type:  String,
      trim:  true,
      default: '',
    },
    logo: {
      type:    String,
      default: null,
    },
    address: {
      type:    String,
      trim:    true,
      default: '',
    },
    city: {
      type:    String,
      trim:    true,
      default: '',
    },
    state: {
      type:    String,
      trim:    true,
      default: '',
    },
    contactEmail: {
      type:    String,
      trim:    true,
      default: '',
      lowercase: true,
    },
    contactPhone: {
      type:    String,
      trim:    true,
      default: '',
    },
    website: {
      type:    String,
      trim:    true,
      default: '',
    },
    academicYear: {
      type:    String,
      trim:    true,
      default: '',
    },
    branches: {
      type:    [String],
      default: [...BRANCHES],
    },
    batches: {
      type:    [String],
      default: [],
    },
    defaultEligibility: {
      type:    defaultEligibilitySchema,
      default: () => ({}),
    },
    placementOfficerName: {
      type:    String,
      trim:    true,
      default: '',
    },
    naacGrade: {
      type:    String,
      trim:    true,
      default: '',
    },
    isSetupComplete: {
      type:    Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Settings', settingsSchema)