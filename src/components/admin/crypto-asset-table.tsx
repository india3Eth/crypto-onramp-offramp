"use client"

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowUpDown } from "lucide-react"

interface CryptoAsset {
  id: string
  onRampSupported: boolean
  offRampSupported: boolean
  network?: string
  chain?: string
}

interface CryptoAssetTableProps {
  assets: CryptoAsset[]
  updatingAsset: string | null
  sortBy: "id" | "network"
  sortDirection: "asc" | "desc"
  onSort: (column: "id" | "network") => void
  onToggleSupport: (assetId: string, type: "onramp" | "offramp", newStatus: boolean) => void
  searchQuery: string
}

export function CryptoAssetTable({
  assets,
  updatingAsset,
  sortBy,
  sortDirection,
  onSort,
  onToggleSupport,
  searchQuery
}: CryptoAssetTableProps) {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead 
              className="w-[180px] font-bold cursor-pointer"
              onClick={() => onSort("id")}
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
              onClick={() => onSort("network")}
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
          {assets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                {searchQuery ? "No cryptocurrencies match your search" : "No cryptocurrencies found"}
              </TableCell>
            </TableRow>
          ) : (
            assets.map((asset) => (
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
                          onCheckedChange={(checked: boolean) => onToggleSupport(asset.id, "onramp", checked)}
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
                          onCheckedChange={(checked: boolean) => onToggleSupport(asset.id, "offramp", checked)}
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
  )
}