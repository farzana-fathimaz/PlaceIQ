import Badge from '../../components/ui/Badge'

const config = {
  applied:     { label: 'Applied',     variant: 'blue'    },
  shortlisted: { label: 'Shortlisted', variant: 'yellow'  },
  in_rounds:   { label: 'In Rounds',   variant: 'purple'  },
  placed:      { label: 'Placed',      variant: 'green'   },
  rejected:    { label: 'Rejected',    variant: 'red'     },
  withdrawn:   { label: 'Withdrawn',   variant: 'default' },
}

const ApplicationStatusBadge = ({ status }) => {
  const c = config[status] || config.applied
  return <Badge variant={c.variant}>{c.label}</Badge>
}

export default ApplicationStatusBadge