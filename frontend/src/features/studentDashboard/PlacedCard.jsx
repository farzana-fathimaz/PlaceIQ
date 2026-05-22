const PlacedCard = ({ company, ctc }) => (
  <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white overflow-hidden">
    {/* Background pattern */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full bg-white" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white" />
    </div>

    <div className="relative z-10">
      <div className="text-3xl mb-2">🎉</div>
      <h2 className="text-xl font-bold">Congratulations!</h2>
      <p className="text-green-100 text-sm mt-1">You have been placed successfully</p>

      <div className="mt-4 bg-white/20 rounded-xl p-4">
        <p className="text-xs text-green-100 uppercase tracking-wide font-medium">Company</p>
        <p className="text-lg font-bold mt-0.5">{company || '—'}</p>
        {ctc && ctc > 0 && (
          <>
            <p className="text-xs text-green-100 uppercase tracking-wide font-medium mt-3">Package</p>
            <p className="text-2xl font-bold mt-0.5">₹{ctc} <span className="text-base font-normal text-green-100">LPA</span></p>
          </>
        )}
      </div>

      <p className="text-xs text-green-100 mt-4">
        Your placement journey with PlaceIQ is complete. Best of luck ahead!
      </p>
    </div>
  </div>
)

export default PlacedCard