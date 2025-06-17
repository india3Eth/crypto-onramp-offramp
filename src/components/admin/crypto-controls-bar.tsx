"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, Download } from "lucide-react"
import { CryptoAsset } from "@/types/admin/crypto"

interface CryptoControlsBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  filter: "all" | "onramp" | "offramp"
  onFilterChange: (filter: "all" | "onramp" | "offramp") => void
  onExport: () => void
}

export function CryptoControlsBar({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  onExport
}: CryptoControlsBarProps) {
  const handleFilterClick = () => {
    const nextFilter = filter === "all" ? "onramp" : filter === "onramp" ? "offramp" : "all"
    onFilterChange(nextFilter)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between">
      <div className="relative flex-grow max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search cryptocurrencies..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex gap-2">
        {/* Filter dropdown */}
        <div className="relative inline-block">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleFilterClick}
          >
            <Filter className="h-4 w-4" />
            {filter === "all" ? "All" : filter === "onramp" ? "OnRamp" : "OffRamp"}
          </Button>
        </div>
        
        {/* Export button */}
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={onExport}
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  )
}