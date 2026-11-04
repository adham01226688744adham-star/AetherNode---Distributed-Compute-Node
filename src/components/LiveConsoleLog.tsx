import React, { useState } from 'react';
import { Terminal, Pause, Play, Trash2, CheckCircle2, ChevronRight } from 'lucide-react';
import { ChunkLogEntry } from '../types/node';

interface LiveConsoleLogProps {
  logs: ChunkLogEntry[];
  onClearLogs: () => void;
}

export const LiveConsoleLog: React.FC<LiveConsoleLogProps> = ({ logs, onClearLogs }) => {
  const [isPaused, setIsPaused] = useState(false);

  const displayedLogs = isPaused ? logs : logs;

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs uppercase font-mono tracking-wider text-slate-300 font-bold">
            Real Cryptographic Proof-of-Execution Stream
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-mono transition-all border ${
              isPaused
                ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            <span>{isPaused ? 'Resume' : 'Freeze'}</span>
          </button>
          <button
            onClick={onClearLogs}
            className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors"
            title="Clear Log Entries"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs max-h-56 overflow-y-auto space-y-1.5 border border-slate-800/80">
        {displayedLogs.length === 0 ? (
          <div className="text-slate-600 text-center py-6 text-xs font-mono">
            Waiting for next cryptographic chunk solve under difficulty target...
          </div>
        ) : (
          displayedLogs.map((log) => (
            <div
              key={log.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 px-2 rounded bg-slate-900/40 hover:bg-slate-900/80 transition-colors border-l-2 border-emerald-500"
            >
              <div className="flex items-center gap-2 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-slate-500 text-[11px]">[{log.timestamp}]</span>
                <span className="text-cyan-400 font-semibold">T#{log.threadId}</span>
                <span className="text-slate-400">CHUNK #{log.chunkIndex}</span>
                <span className="text-slate-600">NONCE:</span>
                <span className="text-amber-300">{log.nonce}</span>
                <span className="text-slate-600">HASH:</span>
                <span className="text-slate-200 truncate max-w-xs">{log.hash}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 text-[11px]">
                <span className="text-emerald-400 font-medium">Verified</span>
                <span className="text-slate-500">({log.timeSpentMs}ms)</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-2 text-[10px] font-mono text-slate-500 flex items-center justify-between">
        <span>Proof standard: SHA-256 chunk hash with leading zeros difficulty target</span>
        <span>Output: Deterministic cryptographic hash output</span>
      </div>
    </div>
  );
};
