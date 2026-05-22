const KPICard = ({ label, value, sub, color = 'blue', icon }) => {
  const colors = {
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   icon: 'bg-blue-100'   },
    green:  { bg: 'bg-green-50',  text: 'text-green-700',  icon: 'bg-green-100'  },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'bg-purple-100' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-700', icon: 'bg-orange-100' },
    red:    { bg: 'bg-red-50',    text: 'text-red-600',    icon: 'bg-red-100'    },
    gray:   { bg: 'bg-gray-50',   text: 'text-gray-700',   icon: 'bg-gray-100'   },
  }

  const c = colors[color] || colors.blue

  return (
    <div className={`${c.bg} rounded-xl p-4 border border-gray-100`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        {icon && (
          <div className={`w-9 h-9 rounded-lg ${c.icon} flex items-center justify-center`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

export default KPICard