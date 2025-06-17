// KYC types
export interface KYCSubmission {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  countryOfResidence: string;
}

export type KYCStatus = 
  | "IN_REVIEW"
  | "COMPLETED"
  | "UPDATE_REQUIRED"
  | "FAILED";

// KYC Level Limit types
export interface KycLevelLimit {
  reserveTransactions: number;
  reserveAmount: number;
  maxTransactions: number;
  maxAmount: number;
  period: string;
}

export interface KycLimits {
  current: {
    levelName: string;
    levelLimits: KycLevelLimit[];
  };
  next: {
    levelNames: string[] | null;
    levelLimits: Record<string, any> | null;
  };
}

// KYC Limit Check Result
export interface KycLimitCheckResult {
  success: boolean;
  limitExceeded: boolean;
  message: string;
  currentAmount?: number;
  maxAllowedAmount?: number;
  currency?: string;
  baseCurrency?: string;
  exchangeRate?: number;
  currentLevel?: string;
  nextLevel?: string;
  period?: string;
  remainingTransactions?: number;
}