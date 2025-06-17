"use client"

import { useState, useEffect, useCallback } from "react"
import { updateCryptoStatus } from "@/app/actions/admin"

interface CryptoAsset {
  id: string
  onRampSupported: boolean
  offRampSupported: boolean
  network?: string
  chain?: string
}

export function useCryptoAssets() {
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingAsset, setUpdatingAsset] = useState<string | null>(null)

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

  // Handle toggling onramp/offramp support
  const handleToggleSupport = useCallback(async (assetId: string, type: "onramp" | "offramp", newStatus: boolean) => {
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
  }, [])

  const refetch = useCallback(() => {
    window.location.reload()
  }, [])

  return {
    cryptoAssets,
    isLoading,
    error,
    updatingAsset,
    handleToggleSupport,
    refetch
  }
}