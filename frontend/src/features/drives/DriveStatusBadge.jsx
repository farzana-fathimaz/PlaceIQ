import Badge from '../../components/ui/Badge'

const config = {
  draft:    { label: 'Draft',    variant: 'default'  },
  upcoming: { label: 'Upcoming', variant: 'blue'     },
  active:   { label: 'Active',   variant: 'green'    },
  closed:   { label: 'Closed',   variant: 'red'      },
  archived: { label: 'Archived', variant: 'default'  },
}

const DriveStatusBadge = ({ status }) => {
  const c = config[status] || config.draft
  return <Badge variant={c.variant}>{c.label}</Badge>
}

export default DriveStatusBadge