const ROLES = {
  OFFICER: 'officer',
  STUDENT: 'student',
}

const DRIVE_STATUS = {
  DRAFT: 'draft',
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  CLOSED: 'closed',
  ARCHIVED: 'archived',
}

const APPLICATION_STATUS = {
  APPLIED: 'applied',
  SHORTLISTED: 'shortlisted',
  IN_ROUNDS: 'in_rounds',
  PLACED: 'placed',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
}

const ROUND_STATUS = {
  SCHEDULED: 'scheduled',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
}

const ROUND_RESULT = {
  PASS: 'pass',
  FAIL: 'fail',
  PENDING: 'pending',
}

const PLACEMENT_STATUS = {
  NOT_PLACED: 'not_placed',
  PLACED: 'placed',
}

const NOTIFICATION_TYPES = {
  DRIVE_OPEN: 'drive_open',
  RESULT_PUBLISHED: 'result_published',
  APPLICATION_UPDATE: 'application_update',
  GENERAL: 'general',
}

const BRANCHES = [
  'CSE',
  'IT',
  'ECE',
  'EEE',
  'MECH',
  'CIVIL',
  'MBA',
  'MCA',
  'CHEM',
  'BIOTECH',
]

const GENDERS = ['Male', 'Female', 'Other']

const DRIVE_TYPES = ['tech', 'non-tech', 'both']

const ROUND_TYPES = [
  'aptitude',
  'group_discussion',
  'technical',
  'hr',
  'final',
]

module.exports = {
  ROLES,
  DRIVE_STATUS,
  APPLICATION_STATUS,
  ROUND_STATUS,
  ROUND_RESULT,
  PLACEMENT_STATUS,
  NOTIFICATION_TYPES,
  BRANCHES,
  GENDERS,
  DRIVE_TYPES,
  ROUND_TYPES,
}