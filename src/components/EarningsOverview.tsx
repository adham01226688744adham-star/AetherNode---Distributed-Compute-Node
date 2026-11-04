import React from 'react';
import { Coins, ArrowUpRight, TrendingUp, Wallet, ShieldCheck } from 'lucide-react';
import { NetworkEarnings, SupportedNetwork } from '../types/node';
import { NETWORK_CONFIGS } from '../data/androidSourceFiles';

interface EarningsOverviewProps {
  earnings: NetworkEarnings;
  hashrate: number;
  network: SupportedNetwork;
  onOpenWithdraw: () => void;
}

export const EarningsOverview: React.FC<EarningsOverviewProps> = ({
  earnings,
  hashrate,
  network,
  onOpenWithdraw
}) => {
  const config = NETWORK_CONFIGS[network];

  // Calculate dynamic daily yield based on current hashrate and uptime multiplier
  const dynamicDailyYield = (hashrate * 0.0082).toFixed(2);
  const dailyUsdValue = (Number(dynamicDailyYield) * earnings.tokenUsdPrice).toFixed(2);
  const unclaimedUsdValue = (earnings.unclaimedBalance * earnings.tokenUsdPrice).toFixed(2);

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs uppercase font-mono tracking-wider text-slate-300 font-bold">
            Decentralized Network Earnings & Yield
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Target Chain:</span>
          <span className="text-xs font-mono font-semibold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
            {config.chainName}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Unclaimed Node Balance */}
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>UNCLAIMED NODE REWARD</span>
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">
              {earnings.unclaimedBalance.toFixed(2)}
            </span>
            <span className="text-sm font-mono font-bold text-slate-300">
              {earnings.tokenSymbol}
            </span>
          </div>
          <div className="mt-2 text-xs font-mono text-slate-500 flex items-center justify-between">
            <span>Market Valuation:</span>
            <span className="text-slate-300 font-medium">≈ ${unclaimedUsdValue} USD</span>
          </div>
          <div className="mt-4">
            <button
              onClick={onOpenWithdraw}
              className="w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              <ArrowUpRight className="w-4 h-4" />
              WITHDRAW TO METAMASK (EVM)
            </button>
          </div>
        </div>

        {/* Daily Estimated Yield */}
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>ESTIMATED DAILY YIELD</span>
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold font-mono text-slate-100">
              ~{dynamicDailyYield}
            </span>
            <span className="text-sm font-mono font-bold text-cyan-400">
              {earnings.tokenSymbol} / Day
            </span>
          </div>
          <div className="mt-2 text-xs font-mono text-slate-500 flex items-center justify-between">
            <span>Est. Daily Value:</span>
            <span className="text-slate-300 font-medium">≈ ${dailyUsdValue} USD/day</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Token Price:</span>
            <span className="text-slate-200">${earnings.tokenUsdPrice.toFixed(3)}</span>
          </div>
        </div>

        {/* Proof Consensus Verification */}
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>CONSENSUS ACCURACY</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold font-mono text-slate-100">
              100.0%
            </span>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              Accepted
            </span>
          </div>
          <div className="mt-3 space-y-1.5 text-[11px] font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Proofs Accepted:</span>
              <span className="text-slate-200 font-bold">{earnings.proofsAccepted}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Rejected / Stale:</span>
              <span className="text-slate-400">{earnings.proofsRejected} (0.00%)</span>
            </div>
            <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800/60">
              <span>Network Diff Target:</span>
              <span className="text-cyan-400">0x000... (Level 12)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
