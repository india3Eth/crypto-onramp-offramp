import { apiClient } from '@/lib/api-client';

// API paths
const API_PATHS = {
  FIAT_ACCOUNTS: '/v1/external/fiatAccounts',
  CUSTOMER_FIAT_ACCOUNTS: (customerId: string) => `/v1/external/customers/${customerId}/fiatAccounts`,
};

// Fiat account interfaces
export interface FiatAccountField {
  accountNumber?: string;
  recipientFullAddress?: string;
  recipientAddressCountry?: string;
}

export interface CreateFiatAccountRequest {
  customerId: string;
  type: 'SEPA';
  fiatAccountFields: FiatAccountField;
}

export interface CreateFiatAccountResponse {
  fiatAccountId: string;
  createdAt: string;
}

export interface SEPAAccountDetails {
  type: 'SEPA';
}

export interface CARDAccountDetails {
  type: 'CARD';
  country: string;
  currency: string;
  network: string;
  expiration: string;
  cardType: string;
  lastFour: string;
  token: string;
  isSingleUse: boolean;
}

export interface FiatAccount {
  fiatAccountId: string;
  createdAt: string;
  accountDetails: SEPAAccountDetails | CARDAccountDetails;
}

export interface GetFiatAccountsResponse {
  fiatAccounts: FiatAccount[];
}

export class FiatAccountService {
  /**
   * Create a new SEPA fiat account
   */
  async createSEPAAccount(
    customerId: string,
    accountFields: FiatAccountField
  ): Promise<CreateFiatAccountResponse> {
    try {
      const request: CreateFiatAccountRequest = {
        customerId,
        type: 'SEPA',
        fiatAccountFields: accountFields
      };

      return apiClient.request<CreateFiatAccountResponse>(
        'POST',
        API_PATHS.FIAT_ACCOUNTS,
        request
      );
    } catch (error) {
      console.error('Error creating SEPA account:', error);
      throw error;
    }
  }

  /**
   * Get all fiat accounts for a customer
   */
  async getUserFiatAccounts(customerId: string): Promise<FiatAccount[]> {
    try {
      const response = await apiClient.request<GetFiatAccountsResponse>(
        'GET',
        API_PATHS.CUSTOMER_FIAT_ACCOUNTS(customerId)
      );

      return response.fiatAccounts || [];
    } catch (error) {
      console.error('Error fetching user fiat accounts:', error);
      throw error;
    }
  }

  /**
   * Format account display name
   */
  formatAccountDisplayName(account: FiatAccount): string {
    if (account.accountDetails.type === 'SEPA') {
      return 'SEPA Bank Account';
    } else if (account.accountDetails.type === 'CARD') {
      const cardDetails = account.accountDetails as CARDAccountDetails;
      return `${cardDetails.cardType} Card ****${cardDetails.lastFour}`;
    }
    return 'Unknown Account';
  }

  /**
   * Get account type label
   */
  getAccountTypeLabel(account: FiatAccount): string {
    return account.accountDetails.type;
  }

  /**
   * Check if account is expired (for cards)
   */
  isAccountExpired(account: FiatAccount): boolean {
    if (account.accountDetails.type === 'CARD') {
      const cardDetails = account.accountDetails as CARDAccountDetails;
      const expirationDate = new Date(cardDetails.expiration);
      return expirationDate < new Date();
    }
    return false;
  }
}

// Export singleton instance
export const fiatAccountService = new FiatAccountService();