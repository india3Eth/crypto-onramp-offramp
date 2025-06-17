// Crypto asset interface used in admin components
export interface CryptoAsset {
  id: string;
  onRampSupported: boolean;
  offRampSupported: boolean;
  network?: string;
  chain?: string;
}