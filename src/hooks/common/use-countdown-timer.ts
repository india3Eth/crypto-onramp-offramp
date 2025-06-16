// src/hooks/use-countdown-timer.ts
import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for creating a countdown timer with automatic reset
 * 
 * @param initialTime Initial countdown time in seconds
 * @param onComplete Callback function to execute when countdown reaches zero
 * @param dependencies Array of dependencies to reset the timer when changed
 * @returns Current countdown value
 */
export function useCountdownTimer(
  initialTime: number, 
  onComplete: () => void, 
  dependencies: any[] = []
): number {
  const [countdown, setCountdown] = useState(initialTime);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset countdown to initial value when dependencies change
    setCountdown(initialTime);
    
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Set up the countdown interval
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // When countdown reaches 0, trigger the callback
          onComplete();
          return initialTime; // Reset to full value
        }
        return prev - 1;
      });
    }, 1000);
    
    // Cleanup on unmount or when dependencies change
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [...dependencies, initialTime, onComplete]);

  return countdown;
}