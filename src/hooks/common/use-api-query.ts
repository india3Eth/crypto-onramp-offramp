import { useState, useEffect, useCallback } from 'react'

interface UseApiQueryOptions<T> {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  dependencies?: any[]
  enabled?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  transformResponse?: (data: any) => T
  initialData?: T | null
}

interface UseApiQueryResult<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useApiQuery<T = any>({
  url,
  method = 'GET',
  body,
  dependencies = [],
  enabled = true,
  onSuccess,
  onError,
  transformResponse,
  initialData = null,
}: UseApiQueryOptions<T>): UseApiQueryResult<T> {
  const [data, setData] = useState<T | null>(initialData)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      }
      
      if (method !== 'GET' && body) {
        options.body = JSON.stringify(body)
      }
      
      const response = await fetch(url, options)
      
      if (!response.ok) {
        throw new Error(response.statusText || `Failed to fetch data (${response.status})`)
      }
      
      const responseData = await response.json()
      
      if (!responseData.success) {
        throw new Error(responseData.error || 'API returned error status')
      }
      
      const result = transformResponse ? transformResponse(responseData) : responseData
      
      setData(result)
      onSuccess?.(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
    } finally {
      setIsLoading(false)
    }
  }, [url, method, body, enabled, onSuccess, onError, transformResponse])
  
  useEffect(() => {
    fetchData()
  }, [fetchData, ...dependencies])
  
  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  }
}