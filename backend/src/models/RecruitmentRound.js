const mongoose = require('mongoose')
const { ROUND_STATUS, ROUND_TYPES, ROUND_RESULT } = require('../utils/constants')

const resultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    result: {
      type: String,
      enum: Object.values(ROUND_RESULT),
      default: ROUND_RESULT.PENDING,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    markedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: true }
)

const recruitmentRoundSchema = new mongoose.Schema(
  {
    driveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Drive',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Round name is required'],
      trim: true,
      maxlength: [80, 'Round name cannot exceed 80 characters'],
    },
    roundNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    type: {
      type: String,
      enum: ROUND_TYPES,
      required: [true, 'Round type is required'],
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    venue: {
      type: String,
      trim: true,
      default: '',
    },
    mode: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
      default: 'offline',
    },
    duration: {
      type: String,
      trim: true,
      default: '',
    },
    instructions: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: Object.values(ROUND_STATUS),
      default: ROUND_STATUS.SCHEDULED,
    },
    results: [resultSchema],
  },
  {
    timestamps: true,
  }
)

recruitmentRoundSchema.index({ driveId: 1 })
recruitmentRoundSchema.index({ driveId: 1, roundNumber: 1 })
recruitmentRoundSchema.index({ status: 1 })

module.exports = mongoose.model('RecruitmentRound', recruitmentRoundSchema)