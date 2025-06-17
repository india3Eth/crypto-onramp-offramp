"use client"

interface CryptoAsset {
  id: string
  onRampSupported: boolean
  offRampSupported: boolean
  network?: string
  chain?: string
}

interface CryptoStatsRowProps {
  cryptoAssets: CryptoAsset[]
}

export function CryptoStatsRow({ cryptoAssets }: CryptoStatsRowProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-blue-50 border border-blue-100 rounded-md p-3 text-center">
        <p className="text-sm text-blue-700 font-medium">Total Assets</p>
        <p className="text-2xl font-bold text-blue-700">{cryptoAssets.length}</p>
      </div>
      <div className="bg-green-50 border border-green-100 rounded-md p-3 text-center">
        <p className="text-sm text-green-700 font-medium">OnRamp Enabled</p>
        <p className="text-2xl font-bold text-green-700">{cryptoAssets.filter(a => a.onRampSupported).length}</p>
      </div>
      <div className="bg-purple-50 border border-purple-100 rounded-md p-3 text-center">
        <p className="text-sm text-purple-700 font-medium">OffRamp Enabled</p>
        <p className="text-2xl font-bold text-purple-700">{cryptoAssets.filter(a => a.offRampSupported).length}</p>
      </div>
    </div>
  )
}