const RecruitmentRound = require('../models/RecruitmentRound')
const Application      = require('../models/Application')
const Drive            = require('../models/Drive')
const AppError         = require('../utils/AppError')
const { validateCreateRound, validateStatusTransition } = require('../validators/round.validator')

const getRoundsForDrive = async (driveId) => {
  const rounds = await RecruitmentRound.find({ driveId })
    .sort({ roundNumber: 1 })

  // Attach student info to results
  const populated = await RecruitmentRound.populate(rounds, [
    { path: 'results.studentId', select: 'name email' },
    { path: 'results.applicationId', select: 'status' },
  ])

  return populated
}

const getRoundById = async (roundId) => {
  const round = await RecruitmentRound.findById(roundId)
    .populate('results.studentId', 'name email')
    .populate('results.applicationId', 'status')

  if (!round) throw new AppError('Round not found', 404)
  return round
}

const createRound = async (data) => {
  validateCreateRound(data)

  const drive = await Drive.findById(data.driveId)
  if (!drive) throw new AppError('Drive not found', 404)

  // Auto-assign round number
  const lastRound = await RecruitmentRound.findOne({ driveId: data.driveId })
    .sort({ roundNumber: -1 })

  const roundNumber = lastRound ? lastRound.roundNumber + 1 : 1

  // Get students who are in_rounds status for this drive
  const inRoundApplications = await Application.find({
    driveId: data.driveId,
    status: { $in: ['in_rounds', 'shortlisted'] },
  }).populate('studentId', 'name email')

  const results = inRoundApplications.map((app) => ({
    studentId:     app.studentId._id,
    applicationId: app._id,
    result:        'pending',
    remarks:       '',
    markedAt:      null,
  }))

  const round = await RecruitmentRound.create({
    ...data,
    roundNumber,
    results,
  })

  // Link round to drive
  await Drive.findByIdAndUpdate(data.driveId, {
    $push: { rounds: round._id },
  })

  return round
}

const updateRound = async (roundId, data) => {
  const round = await RecruitmentRound.findById(roundId)
  if (!round) throw new AppError('Round not found', 404)

  if (round.status === 'completed') {
    throw new AppError('Cannot edit a completed round', 400)
  }

  const protectedFields = ['results', 'driveId', 'roundNumber']
  protectedFields.forEach((f) => delete data[f])

  Object.assign(round, data)
  await round.save()
  return round
}

const updateRoundStatus = async (roundId, newStatus) => {
  const round = await RecruitmentRound.findById(roundId)
  if (!round) throw new AppError('Round not found', 404)

  validateStatusTransition(round.status, newStatus)

  round.status = newStatus
  await round.save()
  return round
}

const deleteRound = async (roundId) => {
  const round = await RecruitmentRound.findById(roundId)
  if (!round) throw new AppError('Round not found', 404)

  if (round.status !== 'scheduled') {
    throw new AppError('Only scheduled rounds can be deleted', 400)
  }

  await Drive.findByIdAndUpdate(round.driveId, {
    $pull: { rounds: round._id },
  })

  await RecruitmentRound.findByIdAndDelete(roundId)
}

const markResults = async (roundId, resultsData, officerId) => {
  // resultsData: [{ applicationId, result, remarks }]
  const round = await RecruitmentRound.findById(roundId)
  if (!round) throw new AppError('Round not found', 404)

  if (round.status === 'scheduled') {
    throw new AppError('Mark the round as ongoing before recording results', 400)
  }

  const validResults = ['pass', 'fail', 'pending']

  for (const item of resultsData) {
    if (!validResults.includes(item.result)) {
      throw new AppError(`Invalid result value: ${item.result}`, 400)
    }

    const resultEntry = round.results.find(
      (r) => r.applicationId.toString() === item.applicationId
    )

    if (resultEntry) {
      resultEntry.result   = item.result
      resultEntry.remarks  = item.remarks || ''
      resultEntry.markedAt = new Date()
    }
  }

  await round.save()

  // Update application currentRound for students in this round
  for (const item of resultsData) {
    if (item.result === 'pass' || item.result === 'pending') {
      await Application.findByIdAndUpdate(item.applicationId, {
        currentRound: roundId,
      })
    }

    if (item.result === 'fail') {
      await Application.findByIdAndUpdate(item.applicationId, {
        status:      'rejected',
        currentRound: null,
        lastUpdatedBy: officerId,
      })

      // Add to status history
      const app = await Application.findById(item.applicationId)
      if (app) {
        app.statusHistory.push({
          status:    'rejected',
          changedBy: officerId,
          changedAt: new Date(),
          note:      `Failed in Round ${round.roundNumber}: ${round.name}. ${item.remarks || ''}`,
        })
        await app.save()
      }
    }
  }

  return round
}

const addStudentsToRound = async (roundId, applicationIds) => {
  const round = await RecruitmentRound.findById(roundId)
  if (!round) throw new AppError('Round not found', 404)

  for (const appId of applicationIds) {
    const exists = round.results.find(
      (r) => r.applicationId.toString() === appId
    )
    if (exists) continue

    const application = await Application.findById(appId)
      .populate('studentId', 'name email')

    if (!application) continue

    round.results.push({
      studentId:     application.studentId._id,
      applicationId: appId,
      result:        'pending',
      remarks:       '',
      markedAt:      null,
    })
  }

  await round.save()
  return round
}

const getRoundSummary = async (driveId) => {
  const rounds = await RecruitmentRound.find({ driveId }).sort({ roundNumber: 1 })

  return rounds.map((r) => ({
    _id:          r._id,
    name:         r.name,
    roundNumber:  r.roundNumber,
    type:         r.type,
    status:       r.status,
    scheduledAt:  r.scheduledAt,
    totalStudents: r.results.length,
    passed:       r.results.filter((res) => res.result === 'pass').length,
    failed:       r.results.filter((res) => res.result === 'fail').length,
    pending:      r.results.filter((res) => res.result === 'pending').length,
  }))
}

const getStudentRoundStatus = async (studentUserId, driveId) => {
  const application = await Application.findOne({
    studentId: studentUserId,
    driveId,
  })

  if (!application) return null

  const rounds = await RecruitmentRound.find({ driveId })
    .sort({ roundNumber: 1 })

  const studentRounds = rounds
    .map((round) => {
      const result = round.results.find(
        (r) => r.studentId.toString() === studentUserId
      )
      if (!result) return null
      return {
        roundId:     round._id,
        name:        round.name,
        roundNumber: round.roundNumber,
        type:        round.type,
        scheduledAt: round.scheduledAt,
        venue:       round.venue,
        mode:        round.mode,
        instructions: round.instructions,
        roundStatus: round.status,
        result:      result.result,
        remarks:     result.remarks,
        markedAt:    result.markedAt,
      }
    })
    .filter(Boolean)

  return {
    applicationStatus: application.status,
    currentRound:      application.currentRound,
    rounds:            studentRounds,
  }
}

module.exports = {
  getRoundsForDrive,
  getRoundById,
  createRound,
  updateRound,
  updateRoundStatus,
  deleteRound,
  markResults,
  addStudentsToRound,
  getRoundSummary,
  getStudentRoundStatus,
}