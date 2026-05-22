import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-medium text-gray-700">{payload[0].name}</p>
      <p className="text-gray-500 mt-0.5">
        {payload[0].value} students ({payload[0].payload.pct}%)
      </p>
    </div>
  )
}

const RADIAN = Math.PI / 180
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, pct }) => {
  if (pct < 5) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x      = cx + radius * Math.cos(-midAngle * RADIAN)
  const y      = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text
      x={x} y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
    >
      {`${pct}%`}
    </text>
  )
}

const PlacementDonut = ({ placed = 0, total = 0 }) => {
  const notPlaced = total - placed
  const pct       = total > 0 ? parseFloat(((placed / total) * 100).toFixed(1)) : 0

  const data = [
    { name: 'Placed',     value: placed,    pct,           fill: '#16a34a' },
    { name: 'Not Placed', value: notPlaced, pct: 100 - pct, fill: '#e5e7eb' },
  ].filter((d) => d.value > 0)

  if (!total) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400">
        No student data yet
      </div>
    )
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={renderLabel}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-2xl font-bold text-gray-800">{pct}%</p>
        <p className="text-xs text-gray-400">Placed</p>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-5 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-600" />
          <span className="text-xs text-gray-500">Placed ({placed})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
          <span className="text-xs text-gray-500">Not Placed ({notPlaced})</span>
        </div>
      </div>
    </div>
  )
}

export default PlacementDonut