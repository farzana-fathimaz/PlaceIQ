const mongoose = require('mongoose')
const { APPLICATION_STATUS } = require('../utils/constants')

const applicationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    driveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Drive',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.APPLIED,
    },
    currentRound: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecruitmentRound',
      default: null,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    statusHistory: [
      {
        status:    { type: String },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changedAt: { type: Date, default: Date.now },
        note:      { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
)

// One student can apply to a drive only once
applicationSchema.index({ studentId: 1, driveId: 1 }, { unique: true })
applicationSchema.index({ driveId: 1 })
applicationSchema.index({ studentId: 1 })
applicationSchema.index({ status: 1 })
applicationSchema.index({ appliedAt: -1 })

module.exports = mongoose.model('Application', applicationSchema)