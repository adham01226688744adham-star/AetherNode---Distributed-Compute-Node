import React, { useState } from 'react';
import { X, Wallet, ArrowUpRight, CheckCircle2, AlertCircle, ExternalLink, Copy, Check, ShieldCheck, Terminal } from 'lucide-react';
import { SupportedNetwork } from '../types/node';
import { web3Service } from '../services/web3Service';
import { NETWORK_CONFIGS } from '../data/androidSourceFiles';

interface Web3WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  unclaimedBalance: number;
  currentNetwork: SupportedNetwork;
  onSuccessfulWithdraw: (amount: number) => void;
}

export const Web3WithdrawModal: React.FC<Web3WithdrawModalProps> = ({
  isOpen,
  onClose,
  unclaimedBalance,
  currentNetwork,
  onSuccessfulWithdraw
}) => {
  const [network, setNetwork] = useState<SupportedNetwork>(currentNetwork);
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [amount, setAmount] = useState<number>(Number(unclaimedBalance.toFixed(2)));
  const [isConnectingMetaMask, setIsConnectingMetaMask] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [txResult, setTxResult] = useState<{
    txHash: string;
    blockNumber: number;
    gasUsed: string;
    explorerLink: string;
    calldata: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  if (!isOpen) return null;

  const config = NETWORK_CONFIGS[network];
  const isMetaMaskAvailable = web3Service.isMetaMaskInstalled();

  const handleConnectMetaMask = async () => {
    setIsConnectingMetaMask(true);
    setError(null);
    try {
      const { address } = await web3Service.connectMetaMask();
      setRecipientAddress(address);
      await web3Service.switchNetwork(network);
    } catch (err: any) {
      setError(err?.message || 'Failed to connect MetaMask');
    } finally {
      setIsConnectingMetaMask(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate 42-char EVM address
    if (!recipientAddress || !recipientAddress.startsWith('0x') || recipientAddress.length !== 42) {
      setError('Please provide a valid 42-character EVM address (e.g. 0x71C...897)');
      return;
    }

    if (amount <= 0 || amount > unclaimedBalance) {
      setError(`Withdrawal amount must be between 0.01 and ${unclaimedBalance.toFixed(2)} ATH`);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await web3Service.submitWithdrawal(network, recipientAddress, amount);
      setTxResult(result);
      onSuccessfulWithdraw(amount);
    } catch (err: any) {
      setError(err?.message || 'Failed to execute Web3j transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-mono">
                EVM Web3j Token Withdrawal
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Direct on-chain transfer to external MetaMask wallet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {txResult ? (
            /* Success State */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold font-mono text-emerald-300">
                  Transaction Confirmed On-Chain
                </h4>
                <p className="text-xs font-mono text-slate-300">
                  {amount} ATH successfully transferred to destination EVM wallet.
                </p>
              </div>

              {/* Receipt details */}
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2.5 font-mono text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>NETWORK:</span>
                  <span className="text-slate-200 font-bold">{config.chainName}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>BLOCK NUMBER:</span>
                  <span className="text-emerald-400 font-bold">#{txResult.blockNumber}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>GAS USED:</span>
                  <span className="text-slate-200">{txResult.gasUsed} Units</span>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-500 block mb-1">TRANSACTION HASH:</span>
                  <div className="flex items-center justify-between gap-2 bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-slate-300 truncate max-w-sm text-[11px]">
                      {txResult.txHash}
                    </span>
                    <button
                      onClick={() => copyToClipboard(txResult.txHash)}
                      className="text-slate-400 hover:text-slate-200 shrink-0"
                    >
                      {copiedHash ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block mb-1">RAW ERC-20 CALLDATA (0xa9059cbb):</span>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800 text-[10px] text-cyan-300 break-all font-mono">
                    {txResult.calldata}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <a
                  href={txResult.explorerLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on {network === 'polygon' ? 'PolygonScan' : 'BscScan'}
                </a>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleWithdraw} className="space-y-4">
              {/* Network Selection */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
                  1. Target Blockchain Network (Low Gas L2)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNetwork('polygon')}
                    className={`p-3 rounded-xl border text-left font-mono transition-all ${
                      network === 'polygon'
                        ? 'bg-purple-950/40 border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">Polygon PoS</span>
                      <span className="text-[10px] text-purple-300 bg-purple-900/60 px-1.5 py-0.5 rounded">
                        EIP-1559
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Est. Gas: &lt; $0.003</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNetwork('bsc')}
                    className={`p-3 rounded-xl border text-left font-mono transition-all ${
                      network === 'bsc'
                        ? 'bg-amber-950/40 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">BNB Chain</span>
                      <span className="text-[10px] text-amber-300 bg-amber-900/60 px-1.5 py-0.5 rounded">
                        BEP-20
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Est. Gas: &lt; $0.02</p>
                  </button>
                </div>
              </div>

              {/* Destination Address Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                    2. Recipient EVM Wallet Address
                  </label>
                  {isMetaMaskAvailable && (
                    <button
                      type="button"
                      onClick={handleConnectMetaMask}
                      disabled={isConnectingMetaMask}
                      className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      {isConnectingMetaMask ? 'Connecting...' : 'Connect MetaMask'}
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="0x71C...8976b (Your MetaMask address)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <p className="text-[10px] font-mono text-slate-500 mt-1">
                  Supports any EVM-compatible address on {config.chainName}.
                </p>
              </div>

              {/* Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                    3. Withdrawal Quantity
                  </label>
                  <span className="text-xs font-mono text-slate-400">
                    Available: <strong className="text-emerald-400">{unclaimedBalance.toFixed(2)} ATH</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      max={unclaimedBalance}
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-mono text-slate-500">
                      ATH
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAmount(Number(unclaimedBalance.toFixed(2)))}
                    className="px-3 py-2.5 rounded-lg bg-slate-800 text-slate-300 font-mono text-xs font-semibold hover:bg-slate-700"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 flex items-start gap-2 text-xs font-mono text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Web3j Technical Details Box */}
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Contract Standard:</span>
                  <span className="text-slate-200">ERC-20 (Decimals: 18)</span>
                </div>
                <div className="flex justify-between">
                  <span>RPC Provider:</span>
                  <span className="text-slate-400 truncate max-w-xs">{config.rpcUrl}</span>
                </div>
                <div className="flex justify-between">
                  <span>Signer Layer:</span>
                  <span className="text-cyan-400">Web3j FastRawTransactionManager</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || unclaimedBalance <= 0}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Executing Web3j Raw Transaction & Receipt Verification...
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4" />
                    CONFIRM & BROADCAST ON-CHAIN ({amount} ATH)
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
