import React from 'react';
import { Activity, ShieldCheck, Hash, Zap } from 'lucide-react';
import { CryptographicStats, NodeState } from '../types/node';

interface HashrateMonitorProps {
  stats: CryptographicStats;
  nodeState: NodeState;
}

export const HashrateMonitor: React.FC<HashrateMonitorProps> = ({ stats, nodeState }) => {
  const isRunning = nodeState === 'RUNNING';

  const formatHashrate = (rate: number) => {
    if (rate >= 1000000) return `${(rate / 1000000).toFixed(2)} MH/s`;
    if (rate >= 1000) return `${(rate / 1000).toFixed(2)} kH/s`;
    return `${rate.toLocaleString()} H/s`;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 shadow-lg relative overflow-hidden">
      {/* Background Subtle Gradient Grid */}
      <div className="absolute inset-0 bg-radial from-emerald-950/20 via-transparent to-transparent pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400 font-semibold">
              Live Cryptographic Processing Rate
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 tracking-tight">
              {formatHashrate(stats.hashrate)}
            </span>
            <span className="text-xs font-mono text-slate-400">
              Target: <span className="text-slate-200">{stats.difficultyTarget}x... (Diff: 12)</span>
            </span>
          </div>
        </div>

        {/* Secondary Hashrate Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="bg-slate-950/60 border border-slate-800/70 p-2.5 rounded-lg">
            <span className="text-slate-500 block text-[11px]">1-MIN AVERAGE</span>
            <span className="text-slate-200 font-semibold text-sm">
              {formatHashrate(stats.hashrate1m)}
            </span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/70 p-2.5 rounded-lg">
            <span className="text-slate-500 block text-[11px]">PEAK RATE</span>
            <span className="text-emerald-300 font-semibold text-sm">
              {formatHashrate(stats.hashratePeak)}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 font-mono text-xs">
        <div className="flex items-center gap-2.5 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="truncate">
            <div className="text-slate-500 text-[10px]">VERIFIED CHUNKS</div>
            <div className="text-slate-200 font-bold text-sm">
              {stats.verifiedChunks.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50">
          <Hash className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="truncate">
            <div className="text-slate-500 text-[10px]">TOTAL HASHES EVALUATED</div>
            <div className="text-slate-200 font-bold text-sm">
              {(stats.totalHashes / 1000).toFixed(1)}k
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="truncate">
            <div className="text-slate-500 text-[10px]">CURRENT NONCE</div>
            <div className="text-slate-200 font-bold text-sm truncate">
              #{stats.currentNonce}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <div className="truncate">
            <div className="text-slate-500 text-[10px]">EXECUTION LATENCY</div>
            <div className="text-slate-200 font-bold text-sm">
              {stats.lastChunkLatencyMs} ms / slice
            </div>
          </div>
        </div>
      </div>

      {/* Live Block Hash preview */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-1 text-slate-400">
        <span className="text-[11px] text-slate-500">LATEST PROOF-OF-COMPUTE CHUNK HASH:</span>
        <span className="text-emerald-400/90 font-medium truncate max-w-md bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
          {stats.lastBlockHash}
        </span>
      </div>
    </div>
  );
};
