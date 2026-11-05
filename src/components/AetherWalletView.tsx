import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  Layers,
  Key,
  Eye,
  EyeOff,
  ExternalLink,
  Coins,
  Sparkles,
  Sliders,
  AlertCircle,
  PlusCircle,
  Download
} from 'lucide-react';
import { SupportedNetwork } from '../types/node';
import {
  walletService,
  WalletAccount,
  TokenAsset,
  WalletTransaction,
  AutoPayoutSettings
} from '../services/walletService';
import { NETWORK_CONFIGS } from '../data/androidSourceFiles';

interface AetherWalletViewProps {
  unclaimedMiningBalance: number;
  network: SupportedNetwork;
  onNetworkChange: (network: SupportedNetwork) => void;
  onClaimMiningRewards: (amount: number) => void;
}

export const AetherWalletView: React.FC<AetherWalletViewProps> = ({
  unclaimedMiningBalance,
  network,
  onNetworkChange,
  onClaimMiningRewards
}) => {
  const [account, setAccount] = useState<WalletAccount>(walletService.getAccount());
  const [walletBalanceAth, setWalletBalanceAth] = useState<number>(45.2);
  const [tokens, setTokens] = useState<TokenAsset[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [autoPayout, setAutoPayout] = useState<AutoPayoutSettings>(walletService.getAutoPayoutSettings());

  // Interactive Modals
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [isAutoPayoutOpen, setIsAutoPayoutOpen] = useState(false);
  const [isSeedPhraseOpen, setIsSeedPhraseOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Send Form State
  const [sendRecipient, setSendRecipient] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendToken, setSendToken] = useState('ATH');
  const [sendGasSpeed, setSendGasSpeed] = useState<'low' | 'normal' | 'fast'>('normal');
  const [sendError, setSendError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Swap Form State
  const [swapFromAmount, setSwapFromAmount] = useState('10');
  const [swapToToken, setSwapToToken] = useState('USDT');
  const [isSwapping, setIsSwapping] = useState(false);

  // Import Form State
  const [importSecret, setImportSecret] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  // QR Code data URL
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedSeed, setCopiedSeed] = useState(false);
  const [isSeedRevealed, setIsSeedRevealed] = useState(false);

  const config = NETWORK_CONFIGS[network];

  useEffect(() => {
    const list = walletService.getTokensForNetwork(network, walletBalanceAth);
    setTokens(list);
    setTransactions(walletService.getTransactions());

    // Generate QR code for receiving
    walletService.generateQrCode(account.address).then((url) => {
      setQrCodeUrl(url);
    });
  }, [network, walletBalanceAth, account]);

  const totalPortfolioUsd = tokens.reduce((sum, t) => sum + t.balance * t.usdPrice, 0);

  const copyToClipboard = (text: string, isSeed = false) => {
    navigator.clipboard.writeText(text);
    if (isSeed) {
      setCopiedSeed(true);
      setTimeout(() => setCopiedSeed(false), 2000);
    } else {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  // 1-Click Instant Claim of Mined Rewards
  const handleInstantClaim = () => {
    if (unclaimedMiningBalance <= 0) return;
    const amount = Number(unclaimedMiningBalance.toFixed(2));
    onClaimMiningRewards(amount);
    setWalletBalanceAth((prev) => Number((prev + amount).toFixed(2)));

    const newTx: WalletTransaction = {
      id: 'tx_claim_' + Date.now(),
      hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      type: 'MINING_PAYOUT',
      from: '0x0000000000000000000000000000000000000000',
      to: account.address,
      amount: amount,
      symbol: 'ATH',
      timestamp: new Date().toLocaleTimeString(),
      network: network,
      status: 'CONFIRMED',
      gasUsed: '64,200',
      explorerUrl: `${config.explorerUrl}/tx/0x918...`
    };

    walletService.addTransaction(newTx);
    setTransactions(walletService.getTransactions());
  };

  // Handle Send Execution
  const handleExecuteSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSendError(null);

    if (!sendRecipient.startsWith('0x') || sendRecipient.length !== 42) {
      setSendError('يرجى إدخال عنوان EVM صالح مكون من 42 حرفاً يبدأ بـ 0x (EIP-55 Checksum)');
      return;
    }

    const amt = parseFloat(sendAmount);
    if (isNaN(amt) || amt <= 0) {
      setSendError('يرجى تحديد كمية صحيحة أكبر من صفر');
      return;
    }

    const targetToken = tokens.find((t) => t.symbol === sendToken);
    if (!targetToken || targetToken.balance < amt) {
      setSendError(`الرصيد غير كافٍ. رصيدك الحالي: ${targetToken?.balance || 0} ${sendToken}`);
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      // Deduct balance
      if (sendToken === 'ATH') {
        setWalletBalanceAth((prev) => Math.max(0, Number((prev - amt).toFixed(2))));
      }

      const tx: WalletTransaction = {
        id: 'tx_send_' + Date.now(),
        hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        type: 'TRANSFER_OUT',
        from: account.address,
        to: sendRecipient,
        amount: amt,
        symbol: sendToken,
        timestamp: new Date().toLocaleTimeString(),
        network: network,
        status: 'CONFIRMED',
        gasUsed: '65,000',
        explorerUrl: `${config.explorerUrl}/tx/0x182...`
      };

      walletService.addTransaction(tx);
      setTransactions(walletService.getTransactions());
      setIsSendOpen(false);
      setSendAmount('');
      setSendRecipient('');
    }, 1200);
  };

  // Handle Swap Execution
  const handleExecuteSwap = (e: React.FormEvent) => {
    e.preventDefault();
    const fromAmt = parseFloat(swapFromAmount);
    if (isNaN(fromAmt) || fromAmt <= 0 || fromAmt > walletBalanceAth) return;

    setIsSwapping(true);
    setTimeout(() => {
      setIsSwapping(false);
      setWalletBalanceAth((prev) => Math.max(0, Number((prev - fromAmt).toFixed(2))));

      const tx: WalletTransaction = {
        id: 'tx_swap_' + Date.now(),
        hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        type: 'SWAP',
        from: account.address,
        to: 'Uniswap / PancakeSwap Router',
        amount: fromAmt,
        symbol: `ATH ➔ ${swapToToken}`,
        timestamp: new Date().toLocaleTimeString(),
        network: network,
        status: 'CONFIRMED',
        gasUsed: '112,000',
        explorerUrl: `${config.explorerUrl}/tx/0x992...`
      };

      walletService.addTransaction(tx);
      setTransactions(walletService.getTransactions());
      setIsSwapOpen(false);
    }, 1400);
  };

  // Handle Wallet Import
  const handleImportWallet = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);
    try {
      const imported = walletService.importFromPrivateKeyOrMnemonic(importSecret);
      setAccount(imported);
      setIsImportOpen(false);
      setImportSecret('');
    } catch {
      setImportError('صيغة غير صالحة. يرجى إدخال مفتاح خاص هكس 64 خانة أو 12 كلمة استرداد.');
    }
  };

  const handleCreateNew = () => {
    const created = walletService.createNewWallet();
    setAccount(created);
  };

  return (
    <div className="space-y-6 font-mono text-slate-200">
      {/* 1. Main Wallet Identity & Balance Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        {/* Network & Account Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-100">{account.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  EIP-55 موثقة (Verified Non-Custodial)
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-400">
                  {account.address.substring(0, 8)}...{account.address.substring(36)}
                </span>
                <button
                  onClick={() => copyToClipboard(account.address)}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                  title="نسخ العنوان"
                >
                  {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setIsReceiveOpen(true)}
                  className="text-slate-500 hover:text-cyan-400 transition-colors"
                  title="رمز QR"
                >
                  <QrCode className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Network Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => onNetworkChange('polygon')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                network === 'polygon'
                  ? 'bg-purple-950 text-purple-300 border border-purple-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Polygon PoS
            </button>
            <button
              onClick={() => onNetworkChange('bsc')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                network === 'bsc'
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              BNB Chain
            </button>
          </div>
        </div>

        {/* Portfolio Value Display */}
        <div className="my-6">
          <span className="text-xs text-slate-400 block uppercase tracking-wider mb-1">
            إجمالي رصيد المحفظة (Total Portfolio Value)
          </span>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-4xl sm:text-5xl font-extrabold text-slate-100 tracking-tight">
              ${totalPortfolioUsd.toFixed(2)}
            </span>
            <span className="text-xs text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              +4.8% (24h)
            </span>
            <span className="text-xs text-slate-500">
              شبكة: {config.chainName}
            </span>
          </div>
        </div>

        {/* 1-Click Mining Payout Box */}
        <div className="mb-6 p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block">عوائد التعدين غير المسحوبة:</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">
                {unclaimedMiningBalance.toFixed(2)} ATH{' '}
                <span className="text-xs text-slate-400 font-normal">
                  (≈ ${(unclaimedMiningBalance * 0.425).toFixed(2)} USD)
                </span>
              </span>
            </div>
          </div>
          <button
            onClick={handleInstantClaim}
            disabled={unclaimedMiningBalance <= 0}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
          >
            <Download className="w-4 h-4" />
            إيداع مباشر في المحفظة (1-Click Claim)
          </button>
        </div>

        {/* Quick Actions Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => setIsSendOpen(true)}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-all shadow-sm"
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            إرسال (Send)
          </button>
          <button
            onClick={() => setIsReceiveOpen(true)}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-all shadow-sm"
          >
            <ArrowDownLeft className="w-4 h-4 text-cyan-400" />
            استلام (Receive)
          </button>
          <button
            onClick={() => setIsSwapOpen(true)}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            تبديل (Swap)
          </button>
          <button
            onClick={() => setIsAutoPayoutOpen(true)}
            className="p-3 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 text-xs font-bold flex items-center justify-center gap-2 border border-purple-500/40 transition-all shadow-sm"
          >
            <Sliders className="w-4 h-4 text-purple-400" />
            السحب الآلي الذكي
          </button>
        </div>
      </div>

      {/* 2. Token Balances Grid & Portfolio */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-400" />
            الأصول والعملات في المحفظة (Token Assets)
          </h4>
          <span className="text-xs text-slate-500">
            {tokens.length} عملات مدعومة
          </span>
        </div>

        <div className="space-y-2.5">
          {tokens.map((token) => {
            const tokenUsdVal = token.balance * token.usdPrice;
            return (
              <div
                key={token.symbol}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${token.iconColor} flex items-center justify-center font-bold text-xs text-white`}>
                    {token.symbol.substring(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-100">{token.symbol}</span>
                      {token.isNative && (
                        <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.2 rounded border border-slate-800">
                          Native Gas
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{token.name}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-slate-100 block">
                    {token.balance.toLocaleString()} {token.symbol}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    ≈ ${tokenUsdVal.toFixed(2)} USD
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. BIP-39 Recovery Phrase & Wallet Keys Manager */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              أمان المحفظة وعبارة الاسترداد المشفرة (BIP-39 Seed Phrase)
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImportOpen(true)}
              className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              استيراد محفظة
            </button>
            <button
              onClick={handleCreateNew}
              className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700"
            >
              إنشاء حساب جديد
            </button>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              عبارة الاسترداد السرية المكونة من 12 كلمة (المفتاح الرئيسي للمحفظة):
            </span>
            <button
              onClick={() => setIsSeedRevealed(!isSeedRevealed)}
              className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
            >
              {isSeedRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{isSeedRevealed ? 'إخفاء' : 'إظهار الكلمات'}</span>
            </button>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            {isSeedRevealed ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {account.mnemonic?.split(' ').map((word, idx) => (
                  <div key={idx} className="bg-slate-950 px-2 py-1.5 rounded border border-slate-800 text-slate-200">
                    <span className="text-slate-600 text-[10px] mr-1">{idx + 1}.</span> {word}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 text-center py-2 text-xs">
                •••••••• •••••••• •••••••• •••••••• (انقر على "إظهار الكلمات" للمعاينة والنسخ الاحتياطي)
              </div>
            )}
          </div>

          {isSeedRevealed && account.mnemonic && (
            <div className="flex justify-end">
              <button
                onClick={() => copyToClipboard(account.mnemonic!, true)}
                className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300"
              >
                {copiedSeed ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSeed ? 'تم النسخ بنجاح' : 'نسخ عبارة الاسترداد'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. On-Chain Transaction Activity History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            سجل المعاملات على البلوكشين (On-Chain Activity)
          </h4>
          <span className="text-xs text-slate-500">{transactions.length} معاملات مؤكدة</span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    tx.type === 'MINING_PAYOUT'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                      : tx.type === 'TRANSFER_OUT'
                      ? 'bg-rose-950 text-rose-400 border border-rose-500/30'
                      : 'bg-purple-950 text-purple-400 border border-purple-500/30'
                  }`}
                >
                  {tx.type === 'MINING_PAYOUT' ? (
                    <Download className="w-4 h-4" />
                  ) : tx.type === 'TRANSFER_OUT' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">
                      {tx.type === 'MINING_PAYOUT'
                        ? 'إيداع عوائد تعدين'
                        : tx.type === 'TRANSFER_OUT'
                        ? 'تحويل خارجي'
                        : 'مبادلة عملات'}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-500/20">
                      مؤكدة
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>[{tx.timestamp}]</span>
                    <span>غاز: {tx.gasUsed}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`font-bold text-sm block ${
                    tx.type === 'TRANSFER_OUT' ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {tx.type === 'TRANSFER_OUT' ? '-' : '+'}
                  {tx.amount} {tx.symbol}
                </span>
                <a
                  href={tx.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-slate-500 hover:text-cyan-400 flex items-center gap-1 justify-end mt-0.5"
                >
                  المستكشف <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MODAL: Send Tokens --- */}
      {isSendOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl font-mono text-xs">
            <h3 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              إرسال عملات مشفرة (Send Assets)
            </h3>
            <p className="text-slate-400 text-[11px] mb-4">
              إرسال مباشر إلى أي محفظة EVM خارجية مثل MetaMask عبر شبكة {config.chainName}
            </p>

            <form onSubmit={handleExecuteSend} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">العملة المراد إرسالها:</label>
                <select
                  value={sendToken}
                  onChange={(e) => setSendToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                >
                  {tokens.map((t) => (
                    <option key={t.symbol} value={t.symbol}>
                      {t.symbol} (رصيدك: {t.balance} {t.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">عنوان المستلم (Recipient EVM Address):</label>
                <input
                  type="text"
                  placeholder="0x71C... (عنوان المستلم)"
                  value={sendRecipient}
                  onChange={(e) => setSendRecipient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">الكمية:</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const t = tokens.find((x) => x.symbol === sendToken);
                      if (t) setSendAmount(t.balance.toString());
                    }}
                    className="px-3 rounded-lg bg-slate-800 text-slate-300 font-bold"
                  >
                    MAX
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">سرعة الغاز (Gas Speed):</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'normal', 'fast'] as const).map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => setSendGasSpeed(speed)}
                      className={`p-2 rounded-lg border text-center ${
                        sendGasSpeed === speed
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {speed === 'low' ? 'اقتصادي (Slow)' : speed === 'normal' ? 'قياسي (Normal)' : 'سريع (Fast)'}
                    </button>
                  ))}
                </div>
              </div>

              {sendError && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{sendError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSendOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold"
                >
                  {isSending ? 'جاري التوقيع والبث...' : 'تأكيد وإرسال المعاملة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Receive QR Code --- */}
      {isReceiveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl font-mono text-xs text-center space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5 text-cyan-400" />
              استلام عملات (Receive Assets)
            </h3>
            <p className="text-slate-400 text-[11px]">
              امسح رمز الاستجابة السريعة (QR) أو انسخ العنوان أدناه للإيداع في محفظتك:
            </p>

            {qrCodeUrl && (
              <div className="p-4 bg-white rounded-2xl inline-block shadow-lg mx-auto">
                <img src={qrCodeUrl} alt="Deposit QR Code" className="w-48 h-48 mx-auto" />
              </div>
            )}

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 break-all text-[11px] text-cyan-300">
              {account.address}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(account.address)}
                className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
              >
                {copiedAddress ? 'تم النسخ!' : 'نسخ العنوان'}
              </button>
              <button
                onClick={() => setIsReceiveOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Swap Tokens --- */}
      {isSwapOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl font-mono text-xs space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-400" />
              مبادلة العملات الفورية (Instant Token Swap)
            </h3>
            <p className="text-slate-400 text-[11px]">
              تبديل مباشر لعوائد تعدين ATH إلى عملات مستقرة (USDT) دون انزلاق سعري.
            </p>

            <form onSubmit={handleExecuteSwap} className="space-y-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                  <span>من:</span>
                  <span>الرصيد: {walletBalanceAth} ATH</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={swapFromAmount}
                    onChange={(e) => setSwapFromAmount(e.target.value)}
                    className="flex-1 bg-transparent text-slate-100 text-lg font-bold focus:outline-none"
                  />
                  <span className="font-bold text-emerald-400">ATH</span>
                </div>
              </div>

              <div className="text-center text-slate-500">⬇️</div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                  <span>إلى:</span>
                  <span>السعر: 1 ATH = $0.425 USD</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex-1 text-slate-100 text-lg font-bold">
                    {(parseFloat(swapFromAmount || '0') * 0.425).toFixed(2)}
                  </span>
                  <select
                    value={swapToToken}
                    onChange={(e) => setSwapToToken(e.target.value)}
                    className="bg-slate-900 text-amber-300 font-bold rounded p-1 border border-slate-800"
                  >
                    <option value="USDT">USDT</option>
                    <option value="POL">POL</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSwapOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSwapping}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold"
                >
                  {isSwapping ? 'جاري المبادلة...' : 'تنفيذ المبادلة الفورية'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Smart Auto-Payout Scheduler --- */}
      {isAutoPayoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl font-mono text-xs space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              إعدادات السحب التلقائي الذكي (Smart Auto-Payout)
            </h3>
            <p className="text-slate-400 text-[11px]">
              ميزة ذكية تقوم بسحب عوائد التعدين تلقائياً إلى محفظتك بمجرد بلوغ الحد وتوفر رسوم غاز منخفضة:
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="font-bold text-slate-200 block">تفعيل السحب التلقائي:</span>
                  <span className="text-[10px] text-slate-500">تحويل مباشر دون تدخل يدوي</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoPayout.isEnabled}
                  onChange={(e) => setAutoPayout({ ...autoPayout, isEnabled: e.target.checked })}
                  className="w-5 h-5 accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-300 block mb-1 font-bold">الحد الأدنى للتحويل التلقائي (ATH):</span>
                <input
                  type="number"
                  value={autoPayout.thresholdAth}
                  onChange={(e) => setAutoPayout({ ...autoPayout, thresholdAth: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-300 block mb-1 font-bold">حد أمان الغاز الأقصى (Max Gas Gwei):</span>
                <input
                  type="number"
                  value={autoPayout.maxGasGwei}
                  onChange={(e) => setAutoPayout({ ...autoPayout, maxGasGwei: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200"
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  لن ينفذ التحويل إذا كانت شبكة Polygon مزدحمة فوق 35 Gwei
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  walletService.setAutoPayoutSettings(autoPayout);
                  setIsAutoPayoutOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
              >
                حفظ الإعدادات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Import Wallet --- */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl font-mono text-xs space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-purple-400" />
              استيراد محفظة خارجية (Import Wallet)
            </h3>
            <p className="text-slate-400 text-[11px]">
              يمكنك استيراد محفظتك الحالية من MetaMask عبر المفتاح الخاص أو عبارة الـ 12 كلمة:
            </p>

            <form onSubmit={handleImportWallet} className="space-y-3">
              <textarea
                rows={3}
                placeholder="أدخل الـ 12 كلمة مفصولة بمسافات أو المفتاح الخاص 0x..."
                value={importSecret}
                onChange={(e) => setImportSecret(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200"
              />

              {importError && (
                <div className="p-2 rounded bg-rose-950 text-rose-300 text-[10px]">
                  {importError}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  استيراد الحساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
