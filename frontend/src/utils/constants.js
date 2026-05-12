export const ROLES = {
  OFFICER: 'officer',
  STUDENT: 'student',
}

export const DRIVE_STATUS = {
  DRAFT: 'draft',
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  CLOSED: 'closed',
  ARCHIVED: 'archived',
}

export const APPLICATION_STATUS = {
  APPLIED: 'applied',
  SHORTLISTED: 'shortlisted',
  IN_ROUNDS: 'in_rounds',
  PLACED: 'placed',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
}

export const BRANCHES = [
  'CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'MBA', 'MCA', 'CHEM', 'BIOTECH',
]

export const GENDERS = ['Male', 'Female', 'Other']

export const DRIVE_TYPES = ['tech', 'non-tech', 'both']

export const STATUS_COLORS = {
  draft:       'bg-gray-100 text-gray-600',
  upcoming:    'bg-blue-100 text-blue-700',
  active:      'bg-green-100 text-green-700',
  closed:      'bg-red-100 text-red-700',
  archived:    'bg-gray-200 text-gray-500',
  applied:     'bg-blue-100 text-blue-700',
  shortlisted: 'bg-yellow-100 text-yellow-700',
  in_rounds:   'bg-purple-100 text-purple-700',
  placed:      'bg-green-100 text-green-700',
  rejected:    'bg-red-100 text-red-700',
  withdrawn:   'bg-gray-100 text-gray-600',
}