"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

// Custom hooks
import { useCryptoAssets } from "@/hooks/admin/use-crypto-assets"
import { useCryptoFilters } from "@/hooks/admin/use-crypto-filters"

// Components
import { CryptoControlsBar } from "@/components/admin/crypto-controls-bar"
import { CryptoStatsRow } from "@/components/admin/crypto-stats-row"
import { CryptoAssetTable } from "@/components/admin/crypto-asset-table"

export function CryptoManagement() {
  // Use custom hooks for data management
  const { cryptoAssets, isLoading, error, updatingAsset, handleToggleSupport, refetch } = useCryptoAssets()
  
  // Use custom hook for filtering and sorting
  const {
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    sortBy,
    sortDirection,
    handleSort,
    processedAssets,
    handleExportCSV
  } = useCryptoFilters(cryptoAssets)

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
          onClick={refetch}
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <CryptoControlsBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filter={filter}
        onFilterChange={setFilter}
        onExport={handleExportCSV}
      />
      
      <CryptoStatsRow cryptoAssets={cryptoAssets} />
      
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>Showing {processedAssets.length} of {cryptoAssets.length} assets</span>
        <span>{searchQuery && `Search: "${searchQuery}"`}</span>
      </div>
      
      <CryptoAssetTable
        assets={processedAssets}
        updatingAsset={updatingAsset}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        onToggleSupport={handleToggleSupport}
        searchQuery={searchQuery}
      />
    </div>
  )
}