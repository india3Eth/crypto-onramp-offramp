/**
 * Utility function to format error messages consistently
 * @param error - The error object to format
 * @returns A formatted error message string
 */
export function formatErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}