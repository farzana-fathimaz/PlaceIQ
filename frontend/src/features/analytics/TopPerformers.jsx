const TopPerformers = ({ performers = [] }) => {
  if (!performers.length) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-gray-400">
        No placed students yet
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 text-gray-400 font-medium">#</th>
            <th className="text-left py-2 text-gray-400 font-medium">Student</th>
            <th className="text-left py-2 text-gray-400 font-medium">Branch</th>
            <th className="text-left py-2 text-gray-400 font-medium">CGPA</th>
            <th className="text-left py-2 text-gray-400 font-medium">Company</th>
            <th className="text-right py-2 text-gray-400 font-medium">CTC</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {performers.map((p, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              <td className="py-2 text-gray-400 font-medium">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
              </td>
              <td className="py-2">
                <p className="font-medium text-gray-800">{p.name}</p>
                <p className="text-gray-400">{p.rollNumber}</p>
              </td>
              <td className="py-2 text-gray-600">{p.branch}</td>
              <td className="py-2">
                <span className="font-semibold text-blue-600">{p.cgpa}</span>
              </td>
              <td className="py-2 text-gray-600 max-w-24 truncate">{p.company}</td>
              <td className="py-2 text-right">
                <span className="font-bold text-green-600">
                  {p.ctc > 0 ? `₹${p.ctc}L` : '—'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TopPerformers