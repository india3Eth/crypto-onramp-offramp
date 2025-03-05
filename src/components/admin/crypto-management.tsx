"use client"

import { useState, useEffect } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Loader2, 
  Search, 
  Check, 
  X,
  Download,
  Filter,
  ArrowUpDown
} from "lucide-react"
import { updateCryptoStatus } from "@/app/actions/admin"


// Define crypto asset interface
interface CryptoAsset {
  id: string
  onRampSupported: boolean
  offRampSupported: boolean
  network?: string
  chain?: string
}

export function CryptoManagement() {
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [updatingAsset, setUpdatingAsset] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "onramp" | "offramp">("all")
  const [sortBy, setSortBy] = useState<"id" | "network">("id")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Fetch all crypto assets
  useEffect(() => {
    const fetchCryptoAssets = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch from both onramp and offramp endpoints to get all assets
        const onrampResponse = await fetch("/api/crypto/onramp")
        const offrampResponse = await fetch("/api/crypto/offramp")
        
        if (!onrampResponse.ok || !offrampResponse.ok) {
          throw new Error("Failed to fetch crypto assets")
        }
        
        const onrampData = await onrampResponse.json()
        const offrampData = await offrampResponse.json()
        
        // Combine and deduplicate assets
        const onrampAssets = onrampData.success ? onrampData.cryptos : []
        const offrampAssets = offrampData.success ? offrampData.cryptos : []
        
        // Create a map to combine assets by ID
        const assetsMap = new Map<string, CryptoAsset>()
        
        onrampAssets.forEach((asset: CryptoAsset) => {
          assetsMap.set(asset.id, { 
            ...asset, 
            onRampSupported: true,
            offRampSupported: false
          })
        })
        
        offrampAssets.forEach((asset: CryptoAsset) => {
          if (assetsMap.has(asset.id)) {
            // Update existing asset
            const existingAsset = assetsMap.get(asset.id)!
            assetsMap.set(asset.id, {
              ...existingAsset,
              offRampSupported: true
            })
          } else {
            // Add new asset
            assetsMap.set(asset.id, {
              ...asset,
              onRampSupported: false,
              offRampSupported: true
            })
          }
        })
        
        // Convert map to array
        setCryptoAssets(Array.from(assetsMap.values()))
      } catch (error) {
        console.error("Error fetching crypto assets:", error)
        setError("Failed to load crypto assets. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCryptoAssets()
  }, [])
  
  // Function to handle sorting
  const handleSort = (column: "id" | "network") => {
    if (sortBy === column) {
      // Toggle direction if clicking the same column
      setSortDirection(prev => prev === "asc" ? "desc" : "asc")
    } else {
      // Set new column and default to ascending
      setSortBy(column)
      setSortDirection("asc")
    }
  }
  
  // Filter and sort assets
  const processedAssets = cryptoAssets
    // First apply search filter
    .filter(asset => 
      asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.network && asset.network.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (asset.chain && asset.chain.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    // Then apply onramp/offramp filter
    .filter(asset => {
      if (filter === "all") return true
      if (filter === "onramp") return asset.onRampSupported
      if (filter === "offramp") return asset.offRampSupported
      return true
    })
    // Then sort
    .sort((a, b) => {
      let aValue, bValue
      
      if (sortBy === "id") {
        aValue = a.id
        bValue = b.id
      } else {
        aValue = a.network || a.chain || ""
        bValue = b.network || b.chain || ""
      }
      
      // Compare values based on sort direction
      const comparison = aValue.localeCompare(bValue)
      return sortDirection === "asc" ? comparison : -comparison
    })
  
  // Handle toggling onramp/offramp support
  const handleToggleSupport = async (assetId: string, type: "onramp" | "offramp", newStatus: boolean) => {
    try {
      setUpdatingAsset(assetId)
      
      // Update asset status in the database
      const result = await updateCryptoStatus(assetId, type, newStatus)
      
      if (result.success) {
        // Update local state
        setCryptoAssets(prev => prev.map(asset => {
          if (asset.id === assetId) {
            return {
              ...asset,
              ...(type === "onramp" ? { onRampSupported: newStatus } : { offRampSupported: newStatus })
            }
          }
          return asset
        }))
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error(`Error updating ${type} status for ${assetId}:`, error)
      // Revert the switch UI
      alert(`Failed to update ${assetId}: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setUpdatingAsset(null)
    }
  }

  // Handle exporting assets to CSV
  const handleExportCSV = () => {
    // Create CSV content
    let csvContent = "ID,Network/Chain,OnRamp Supported,OffRamp Supported\n"
    
    processedAssets.forEach(asset => {
      csvContent += `${asset.id},${asset.network || asset.chain || ""},${asset.onRampSupported},${asset.offRampSupported}\n`
    })
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'crypto_assets.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading crypto assets...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-md">
        <p>{error}</p>
        <Button 
          variant="outline" 
          className="mt-2 border-red-200 text-red-600"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search cryptocurrencies..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          {/* Filter dropdown */}
          <div className="relative inline-block">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => setFilter(filter === "all" ? "onramp" : filter === "onramp" ? "offramp" : "all")}
            >
              <Filter className="h-4 w-4" />
              {filter === "all" ? "All" : filter === "onramp" ? "OnRamp" : "OffRamp"}
            </Button>
          </div>
          
          {/* Export button */}
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleExportCSV}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Stats row */}
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
      
      {/* Results info */}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>Showing {processedAssets.length} of {cryptoAssets.length} assets</span>
        <span>{searchQuery && `Search: "${searchQuery}"`}</span>
      </div>
      
      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead 
                className="w-[180px] font-bold cursor-pointer"
                onClick={() => handleSort("id")}
              >
                <div className="flex items-center">
                  Cryptocurrency
                  {sortBy === "id" && (
                    <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "transform rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="font-bold cursor-pointer"
                onClick={() => handleSort("network")}
              >
                <div className="flex items-center">
                  Network/Chain
                  {sortBy === "network" && (
                    <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "transform rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="font-bold text-center">OnRamp Status</TableHead>
              <TableHead className="font-bold text-center">OffRamp Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedAssets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  {searchQuery ? "No cryptocurrencies match your search" : "No cryptocurrencies found"}
                </TableCell>
              </TableRow>
            ) : (
              processedAssets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">
                    {asset.id}
                  </TableCell>
                  <TableCell>
                    {asset.network || asset.chain || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {updatingAsset === asset.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Switch
                            checked={asset.onRampSupported}
                            onCheckedChange={(checked: boolean) => handleToggleSupport(asset.id, "onramp", checked)}
                            className="mr-2"
                          />
                          {asset.onRampSupported ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-400 hover:bg-transparent">Disabled</Badge>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {updatingAsset === asset.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Switch
                            checked={asset.offRampSupported}
                            onCheckedChange={(checked: boolean) => handleToggleSupport(asset.id, "offramp", checked)}
                            className="mr-2"
                          />
                          {asset.offRampSupported ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-400 hover:bg-transparent">Disabled</Badge>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}