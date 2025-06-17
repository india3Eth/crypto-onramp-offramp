"use client"

import { useState, useMemo } from "react"
import { CryptoAsset } from "@/types/admin/crypto"

export function useCryptoFilters(cryptoAssets: CryptoAsset[]) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "onramp" | "offramp">("all")
  const [sortBy, setSortBy] = useState<"id" | "network">("id")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

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
  const processedAssets = useMemo(() => {
    return cryptoAssets
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
  }, [cryptoAssets, searchQuery, filter, sortBy, sortDirection])

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

  return {
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    sortBy,
    sortDirection,
    handleSort,
    processedAssets,
    handleExportCSV
  }
}