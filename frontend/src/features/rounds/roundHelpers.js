export const ROUND_TYPE_LABELS = {
  aptitude:          'Aptitude Test',
  group_discussion:  'Group Discussion',
  technical:         'Technical Interview',
  hr:                'HR Interview',
  final:             'Final Round',
}

export const ROUND_TYPE_COLORS = {
  aptitude:          'blue',
  group_discussion:  'orange',
  technical:         'purple',
  hr:                'green',
  final:             'yellow',
}

export const ROUND_STATUS_CONFIG = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700'   },
  ongoing:   { label: 'Ongoing',   color: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700'  },
}

export const RESULT_CONFIG = {
  pass:    { label: 'Pass',    color: 'bg-green-100 text-green-700',  dot: 'bg-green-500'  },
  fail:    { label: 'Fail',    color: 'bg-red-100 text-red-600',     dot: 'bg-red-500'    },
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-500',   dot: 'bg-gray-400'   },
}

export const NEXT_ROUND_STATUS = {
  scheduled: 'ongoing',
  ongoing:   'completed',
}