"use client"

import React, { useState, useEffect } from "react"
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
  Download, 
  Filter, 
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Globe,
  CreditCard
} from "lucide-react"
import { updatePaymentMethodStatus } from "@/app/actions/admin/admin"
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

// Define payment method interface
interface PaymentMethod {
  id: string
  onRampSupported: boolean
  offRampSupported: boolean
  availableFiatCurrencies: string[]
  availableCountries: string[]
}

export function PaymentMethodsManagement() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [updatingMethod, setUpdatingMethod] = useState<string | null>(null)
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "onramp" | "offramp">("all")
  const [sortBy, setSortBy] = useState<"id" | "currencies">("id")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Fetch all payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch all payment methods with country data
        const response = await fetch("/api/crypto/payment-methods?includeCountries=true")
        
        if (!response.ok) {
          throw new Error("Failed to fetch payment methods")
        }
        
        const data = await response.json()
        
        if (!data.success) {
          throw new Error(data.error || "Failed to fetch payment methods")
        }
        
        setPaymentMethods(data.paymentMethods || [])
      } catch (error) {
        console.error("Error fetching payment methods:", error)
        setError("Failed to load payment methods. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPaymentMethods()
  }, [])
  
  // Function to handle sorting
  const handleSort = (column: "id" | "currencies") => {
    if (sortBy === column) {
      // Toggle direction if clicking the same column
      setSortDirection(prev => prev === "asc" ? "desc" : "asc")
    } else {
      // Set new column and default to ascending
      setSortBy(column)
      setSortDirection("asc")
    }
  }
  
  // Filter and sort payment methods
  const processedMethods = paymentMethods
    // First apply search filter
    .filter(method => 
      method.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    // Then apply onramp/offramp filter
    .filter(method => {
      if (filter === "all") return true
      if (filter === "onramp") return method.onRampSupported
      if (filter === "offramp") return method.offRampSupported
      return true
    })
    // Then sort
    .sort((a, b) => {
      let aValue, bValue
      
      if (sortBy === "id") {
        aValue = a.id
        bValue = b.id
      } else {
        aValue = a.availableFiatCurrencies.length.toString()
        bValue = b.availableFiatCurrencies.length.toString()
      }
      
      // Compare values based on sort direction
      const comparison = aValue.localeCompare(bValue)
      return sortDirection === "asc" ? comparison : -comparison
    })
  
  // Handle toggling onramp/offramp support
  const handleToggleSupport = async (methodId: string, type: "onramp" | "offramp", newStatus: boolean) => {
    try {
      setUpdatingMethod(methodId)
      
      // Update payment method status in the database
      const result = await updatePaymentMethodStatus(methodId, type, newStatus)
      
      if (result.success) {
        // Update local state
        setPaymentMethods(prev => prev.map(method => {
          if (method.id === methodId) {
            return {
              ...method,
              ...(type === "onramp" ? { onRampSupported: newStatus } : { offRampSupported: newStatus })
            }
          }
          return method
        }))
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error(`Error updating ${type} status for ${methodId}:`, error)
      // Revert the switch UI
      alert(`Failed to update ${methodId}: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setUpdatingMethod(null)
    }
  }
  
  // Toggle expanded view for a payment method
  const toggleExpand = (methodId: string) => {
    setExpandedMethod(prev => prev === methodId ? null : methodId)
  }
  
  // Handle exporting methods to CSV
  const handleExportCSV = () => {
    // Create CSV content
    let csvContent = "ID,OnRamp Supported,OffRamp Supported,Supported Currencies Count,Supported Countries Count\n"
    
    processedMethods.forEach(method => {
      csvContent += `${method.id},${method.onRampSupported},${method.offRampSupported},${method.availableFiatCurrencies.length},${method.availableCountries.length}\n`
    })
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'payment_methods.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading payment methods...</span>
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
            placeholder="Search payment methods..."
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
          <p className="text-sm text-blue-700 font-medium">Total Methods</p>
          <p className="text-2xl font-bold text-blue-700">{paymentMethods.length}</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-md p-3 text-center">
          <p className="text-sm text-green-700 font-medium">OnRamp Enabled</p>
          <p className="text-2xl font-bold text-green-700">{paymentMethods.filter(m => m.onRampSupported).length}</p>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-md p-3 text-center">
          <p className="text-sm text-purple-700 font-medium">OffRamp Enabled</p>
          <p className="text-2xl font-bold text-purple-700">{paymentMethods.filter(m => m.offRampSupported).length}</p>
        </div>
      </div>
      
      {/* Results info */}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>Showing {processedMethods.length} of {paymentMethods.length} payment methods</span>
        <span>{searchQuery && `Search: "${searchQuery}"`}</span>
      </div>
      
      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead 
                className="w-[250px] font-bold cursor-pointer"
                onClick={() => handleSort("id")}
              >
                <div className="flex items-center">
                  Payment Method
                  {sortBy === "id" && (
                    <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "transform rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="font-bold cursor-pointer"
                onClick={() => handleSort("currencies")}
              >
                <div className="flex items-center">
                  Supported Currencies
                  {sortBy === "currencies" && (
                    <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "transform rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="font-bold text-center">OnRamp Status</TableHead>
              <TableHead className="font-bold text-center">OffRamp Status</TableHead>
              <TableHead className="w-[80px] text-center font-bold">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedMethods.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  {searchQuery ? "No payment methods match your search" : "No payment methods found"}
                </TableCell>
              </TableRow>
            ) : (
              processedMethods.map((method) => (
                <React.Fragment key={method.id}>
                  <TableRow className={expandedMethod === method.id ? "bg-blue-50" : undefined}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
                        {method.id.replace(/_/g, ' ')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {method.availableFiatCurrencies.slice(0, 5).map(currency => (
                          <Badge key={currency} variant="secondary" className="bg-gray-100">
                            {currency}
                          </Badge>
                        ))}
                        {method.availableFiatCurrencies.length > 5 && (
                          <Badge variant="secondary" className="bg-gray-100">
                            +{method.availableFiatCurrencies.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        {updatingMethod === method.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Switch
                              checked={method.onRampSupported}
                              onCheckedChange={(checked: boolean) => handleToggleSupport(method.id, "onramp", checked)}
                              className="mr-2"
                            />
                            {method.onRampSupported ? (
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
                        {updatingMethod === method.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Switch
                              checked={method.offRampSupported}
                              onCheckedChange={(checked: boolean) => handleToggleSupport(method.id, "offramp", checked)}
                              className="mr-2"
                            />
                            {method.offRampSupported ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-400 hover:bg-transparent">Disabled</Badge>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(method.id)}
                        className="flex items-center justify-center w-full"
                      >
                        {expandedMethod === method.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded details row */}
                  {expandedMethod === method.id && (
                    <TableRow>
                      <TableCell colSpan={5} className="p-4 bg-gray-50">
                        <Card className="border-0 shadow-none">
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-lg flex items-center">
                              <Globe className="h-5 w-5 mr-2 text-blue-500" />
                              Payment Method Details
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <div className="grid md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-bold mb-2 text-gray-700">Supported Countries ({method.availableCountries.length})</h4>
                                <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto p-2 border rounded-md">
                                  {method.availableCountries.map(country => (
                                    <Badge key={country} variant="outline" className="bg-white">
                                      {country}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-bold mb-2 text-gray-700">Supported Currencies ({method.availableFiatCurrencies.length})</h4>
                                <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto p-2 border rounded-md">
                                  {method.availableFiatCurrencies.map(currency => (
                                    <Badge key={currency} variant="secondary" className="bg-white">
                                      {currency}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}