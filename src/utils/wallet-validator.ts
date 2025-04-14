/**
 * Utility for validating cryptocurrency wallet addresses
 */

// Define supported cryptocurrency chains
export type SupportedChain = 'ETH' | 'BTC' | 'SOL' | 'MATIC' | 'BNB' | 'BSC' | 'AVAX';

/**
 * Map crypto code to the corresponding validation chain
 */
export function mapCryptoToValidationChain(cryptoCode: string): SupportedChain {
  // Handle compound codes like USDC_ETH
  if (cryptoCode.includes('_')) {
    const [asset, chain] = cryptoCode.split('_');
    return chain as SupportedChain; // Use the chain for validation
  }
  
  // For BEP20/BSC tokens
  if (cryptoCode === 'BEP20' || cryptoCode === 'BSC') {
    return 'BNB';
  }
  
  // Handle specific cases
  const mappings: Record<string, SupportedChain> = {
    'USDC': 'ETH', // Default USDC to Ethereum if no chain specified
    'USDT': 'ETH', // Default USDT to Ethereum if no chain specified
    'USDT-BEP20': 'BNB',
    'USDC-BEP20': 'BNB',
  };
  
  return (mappings[cryptoCode] || cryptoCode) as SupportedChain;
}

/**
 * Validate a wallet address for a specific cryptocurrency
 */
export function validateWalletAddress(address: string, cryptoCode: string): {
  isValid: boolean;
  errorMessage?: string;
} {
  // Handle empty address
  if (!address.trim()) {
    return {
      isValid: false,
      errorMessage: 'Wallet address is required'
    };
  }
  
  // Map the crypto code to the validation chain
  const chain = mapCryptoToValidationChain(cryptoCode);
  
  // Use chain-specific validation
  switch(chain) {
    case 'ETH':
    case 'MATIC':
      return validateEthereumAddress(address);
    case 'BTC':
      return validateBitcoinAddress(address);
    case 'SOL':
      return validateSolanaAddress(address);
    case 'BNB':
    case 'BSC':
      return validateBinanceAddress(address);
    case 'AVAX':
      return validateAvaxAddress(address);
    default:
      // For other chains, perform basic validation
      return validateGenericAddress(address);
  }
}

/**
 * Validate Ethereum and EVM-compatible addresses
 */
function validateEthereumAddress(address: string): {
  isValid: boolean;
  errorMessage?: string;
} {
  // Check format: 0x followed by 40 hex characters
  if (!address.startsWith('0x') || address.length !== 42) {
    return {
      isValid: false,
      errorMessage: 'Invalid Ethereum address format (must start with 0x and be 42 characters)'
    };
  }
  
  // Check if address contains valid hex characters
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return {
      isValid: false,
      errorMessage: 'Ethereum address must contain only hex characters (0-9, a-f, A-F)'
    };
  }
  
  return { isValid: true };
}

/**
 * Validate Bitcoin addresses
 */
function validateBitcoinAddress(address: string): {
  isValid: boolean;
  errorMessage?: string;
} {
  // Very basic check for legacy, segwit, and native segwit addresses
  const legacyRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
  const segwitRegex = /^(bc1)[a-zA-HJ-NP-Z0-9]{25,90}$/;
  
  if (!legacyRegex.test(address) && !segwitRegex.test(address)) {
    return {
      isValid: false,
      errorMessage: 'Invalid Bitcoin address format'
    };
  }
  
  return { isValid: true };
}

/**
 * Validate Solana addresses
 */
function validateSolanaAddress(address: string): {
  isValid: boolean;
  errorMessage?: string;
} {
  // Solana addresses are 32-44 characters long base58 encoded strings
  if (address.length < 32 || address.length > 44) {
    return {
      isValid: false,
      errorMessage: 'Invalid Solana address length (must be 32-44 characters)'
    };
  }
  
  // Base58 check (contains only characters in the Base58 alphabet)
  const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
  if (!base58Regex.test(address)) {
    return {
      isValid: false,
      errorMessage: 'Solana address contains invalid characters'
    };
  }
  
  return { isValid: true };
}

/**
 * Validate Binance Smart Chain addresses (same as Ethereum)
 */
function validateBinanceAddress(address: string): {
  isValid: boolean;
  errorMessage?: string;
} {
  return validateEthereumAddress(address);
}

/**
 * Validate Avalanche addresses (same as Ethereum for C-Chain)
 */
function validateAvaxAddress(address: string): {
  isValid: boolean;
  errorMessage?: string;
} {
  return validateEthereumAddress(address);
}

/**
 * Validate generic address with basic checks
 */
function validateGenericAddress(address: string): {
  isValid: boolean;
  errorMessage?: string;
} {
  // Check minimum length
  if (address.length < 25) {
    return {
      isValid: false,
      errorMessage: 'Address is too short to be valid (minimum 25 characters)'
    };
  }
  
  // Check for special characters that are unlikely to be in any wallet address
  const invalidChars = /[^a-zA-Z0-9\-_.:/]/;
  if (invalidChars.test(address)) {
    return {
      isValid: false,
      errorMessage: 'Address contains invalid characters'
    };
  }
  
  // If we can't definitively say it's invalid, accept it
  return { isValid: true };
}