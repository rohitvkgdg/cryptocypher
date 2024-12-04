export type Chain = 'ETH' | 'BTC' | 'SOL' | 'DOT';

export interface Wallet {
  id: string;
  chain: Chain;
  address: string;
}

export interface Account {
  id: string;
  keyPhrase: string;
  wallets: Wallet[];
}

const chains: Chain[] = ['ETH', 'BTC', 'SOL', 'DOT'];

export function generateKeyPhrase(): string {
  const words = [
    'apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew',
    'kiwi', 'lemon', 'mango', 'nectarine', 'orange', 'papaya', 'quince', 'raspberry'
  ];
  return Array.from({ length: 12 }, () => words[Math.floor(Math.random() * words.length)]).join(' ');
}

export function generateWalletAddress(keyPhrase: string, chain: Chain): string {
  const hash = Array.from(keyPhrase + chain + Date.now().toString()).reduce(
    (hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0,
    0
  );
  return `${chain}-${Math.abs(hash).toString(16).padStart(34, '0')}`;
}

