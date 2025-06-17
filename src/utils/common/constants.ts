/**
 * Common constants used throughout the application
 */

// Time constants
export const QUOTE_REFRESH_COUNTDOWN_SECONDS = 15;
export const JWT_EXPIRY_TIME = '1d';
export const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24; // 1 day in seconds

// Transaction constants
export const IFRAME_TIMEOUT_MS = 3000000; // 3000 seconds
export const IFRAME_SUCCESS_DELAY_MS = 500; // Delay before redirecting from iframe success detection
export const QUOTE_EXPIRY_MS = 10000; // 10 seconds

// UI Style constants
export const CARD_BRUTALIST_STYLE = "border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] bg-white";