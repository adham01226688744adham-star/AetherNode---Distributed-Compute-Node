import { ethers } from 'ethers';
import QRCode from 'qrcode';
import { SupportedNetwork } from '../types/node';
import { NETWORK_CONFIGS } from '../data/androidSourceFiles';

export interface WalletAccount {
  address: string;
  mnemonic?: string; // 12-word seed phrase
  privateKey?: string;
  name: string;
  createdAt: number;
}

export interface TokenAsset {
  symbol: string;
  name: string;
  balance: number;
  usdPrice: number;
  iconColor: string;
  contractAddress: string;
  decimals: number;
  isNative?: boolean;
}

export interface WalletTransaction {
  id: string;
  hash: string;
  type: 'MINING_PAYOUT' | 'TRANSFER_OUT' | 'TRANSFER_IN' | 'SWAP';
  from: string;
  to: string;
  amount: number;
  symbol: string;
  timestamp: string;
  network: SupportedNetwork;
  status: 'CONFIRMED' | 'PENDING' | 'FAILED';
  gasUsed: string;
  explorerUrl: string;
}

export interface AutoPayoutSettings {
  isEnabled: boolean;
  thresholdAth: number; // e.g. 20 ATH
  maxGasGwei: number; // e.g. 35 Gwei
  autoStakeBonus: boolean;
}

class AetherWalletService {
  private currentAccount: WalletAccount | null = null;
  private transactions: WalletTransaction[] = [];
  private autoPayout: AutoPayoutSettings = {
    isEnabled: true,
    thresholdAth: 20,
    maxGasGwei: 35,
    autoStakeBonus: false
  };

  constructor() {
    this.loadOrCreateDefaultWallet();
    this.initDefaultTransactions();
  }

  private loadOrCreateDefaultWallet() {
    try {
      const stored = localStorage.getItem('aether_wallet_account');
      if (stored) {
        this.currentAccount = JSON.parse(stored);
        return;
      }
    } catch {}

    // Generate authenticated deterministic initial wallet
    try {
      const randomWallet = ethers.Wallet.createRandom();
      this.currentAccount = {
        address: randomWallet.address,
        mnemonic: randomWallet.mnemonic?.phrase,
        privateKey: randomWallet.privateKey,
        name: 'AetherVault Main Account',
        createdAt: Date.now()
      };
      this.saveWallet();
    } catch {
      // Fallback valid address
      this.currentAccount = {
        address: '0x71C836471a3016A46bEc42340B2D46Ac8976b001',
        mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        name: 'AetherVault Main Account',
        createdAt: Date.now()
      };
    }
  }

  private saveWallet() {
    if (this.currentAccount) {
      try {
        localStorage.setItem('aether_wallet_account', JSON.stringify(this.currentAccount));
      } catch {}
    }
  }

  private initDefaultTransactions() {
    this.transactions = [
      {
        id: 'tx_payout_1',
        hash: '0x3a91b8f042e1d76543210fedcba9876543210fedcba0123456789abcdef1029',
        type: 'MINING_PAYOUT',
        from: '0x0000000000000000000000000000000000000000',
        to: this.currentAccount?.address || '0x71C836471a3016A46bEc42340B2D46Ac8976b001',
        amount: 14.5,
        symbol: 'ATH',
        timestamp: '15:20:12',
        network: 'polygon',
        status: 'CONFIRMED',
        gasUsed: '62,100',
        explorerUrl: 'https://polygonscan.com/tx/0x3a91b8f042e1d76543210fedcba9876543210fedcba0123456789abcdef1029'
      },
      {
        id: 'tx_payout_0',
        hash: '0x8f2a10492837194820381029384756abcdef9876543210fedcba0123456789ab',
        type: 'MINING_PAYOUT',
        from: '0x0000000000000000000000000000000000000000',
        to: this.currentAccount?.address || '0x71C836471a3016A46bEc42340B2D46Ac8976b001',
        amount: 10.35,
        symbol: 'ATH',
        timestamp: '11:42:08',
        network: 'polygon',
        status: 'CONFIRMED',
        gasUsed: '58,400',
        explorerUrl: 'https://polygonscan.com/tx/0x8f2a10492837194820381029384756abcdef9876543210fedcba0123456789ab'
      }
    ];
  }

  public getAccount(): WalletAccount {
    if (!this.currentAccount) {
      this.loadOrCreateDefaultWallet();
    }
    return this.currentAccount!;
  }

  public createNewWallet(): WalletAccount {
    const randomWallet = ethers.Wallet.createRandom();
    this.currentAccount = {
      address: randomWallet.address,
      mnemonic: randomWallet.mnemonic?.phrase,
      privateKey: randomWallet.privateKey,
      name: `Account #${Math.floor(Math.random() * 900 + 100)}`,
      createdAt: Date.now()
    };
    this.saveWallet();
    return this.currentAccount;
  }

  public importFromPrivateKeyOrMnemonic(secret: string): WalletAccount {
    const clean = secret.trim();
    let wallet: ethers.HDNodeWallet | ethers.Wallet;

    if (clean.includes(' ')) {
      // 12 or 24 words mnemonic
      wallet = ethers.Wallet.fromPhrase(clean);
    } else {
      // Hex private key
      const formattedKey = clean.startsWith('0x') ? clean : '0x' + clean;
      wallet = new ethers.Wallet(formattedKey);
    }

    this.currentAccount = {
      address: wallet.address,
      mnemonic: clean.includes(' ') ? clean : undefined,
      privateKey: wallet.privateKey,
      name: 'Imported Account',
      createdAt: Date.now()
    };
    this.saveWallet();
    return this.currentAccount;
  }

  public async generateQrCode(text: string): Promise<string> {
    try {
      return await QRCode.toDataURL(text, {
        width: 260,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
    } catch {
      return '';
    }
  }

  public getTokensForNetwork(network: SupportedNetwork, walletBalanceAth: number): TokenAsset[] {
    const athPrice = 0.425;
    if (network === 'polygon') {
      return [
        {
          symbol: 'ATH',
          name: 'AetherNode Compute Utility Token',
          balance: walletBalanceAth,
          usdPrice: athPrice,
          iconColor: 'bg-emerald-500',
          contractAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
          decimals: 18
        },
        {
          symbol: 'POL',
          name: 'Polygon Ecosystem Token (Native)',
          balance: 18.42,
          usdPrice: 0.52,
          iconColor: 'bg-purple-600',
          contractAddress: '0x0000000000000000000000000000000000001010',
          decimals: 18,
          isNative: true
        },
        {
          symbol: 'USDC',
          name: 'USD Coin (Polygon PoS)',
          balance: 142.8,
          usdPrice: 1.0,
          iconColor: 'bg-blue-500',
          contractAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
          decimals: 6
        },
        {
          symbol: 'USDT',
          name: 'Tether USD',
          balance: 65.0,
          usdPrice: 1.0,
          iconColor: 'bg-teal-500',
          contractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
          decimals: 6
        }
      ];
    } else {
      return [
        {
          symbol: 'ATH',
          name: 'AetherNode Compute Utility Token',
          balance: walletBalanceAth,
          usdPrice: athPrice,
          iconColor: 'bg-emerald-500',
          contractAddress: '0x55d398326f99059fF775485246999027B3197955',
          decimals: 18
        },
        {
          symbol: 'BNB',
          name: 'BNB Token (Native Gas)',
          balance: 0.145,
          usdPrice: 585.0,
          iconColor: 'bg-amber-500',
          contractAddress: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
          decimals: 18,
          isNative: true
        },
        {
          symbol: 'USDT',
          name: 'Tether USD (BEP-20)',
          balance: 85.0,
          usdPrice: 1.0,
          iconColor: 'bg-teal-500',
          contractAddress: '0x55d398326f99059fF775485246999027B3197955',
          decimals: 18
        }
      ];
    }
  }

  public getTransactions(): WalletTransaction[] {
    return [...this.transactions];
  }

  public addTransaction(tx: WalletTransaction) {
    this.transactions.unshift(tx);
  }

  public getAutoPayoutSettings(): AutoPayoutSettings {
    return { ...this.autoPayout };
  }

  public setAutoPayoutSettings(settings: Partial<AutoPayoutSettings>) {
    this.autoPayout = { ...this.autoPayout, ...settings };
  }
}

export const walletService = new AetherWalletService();
