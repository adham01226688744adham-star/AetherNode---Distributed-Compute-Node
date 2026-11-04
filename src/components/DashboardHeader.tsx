import React from 'react';
import { Play, Pause, Square, Cpu, Code2, BookOpen, Layers } from 'lucide-react';
import { NodeState, SupportedNetwork } from '../types/node';

interface DashboardHeaderProps {
  nodeState: NodeState;
  uptimeSeconds: number;
  network: SupportedNetwork;
  onToggleState: () => void;
  onStop: () => void;
  onNetworkChange: (network: SupportedNetwork) => void;
  onOpenCodeInspector: () => void;
  onOpenArchitecture: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  nodeState,
  uptimeSeconds,
  network,
  onToggleState,
  onStop,
  onNetworkChange,
  onOpenCodeInspector,
  onOpenArchitecture
}) => {
  const formatUptime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isRunning = nodeState === 'RUNNING';

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-20 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Persistent Foreground Notification Badge */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
            <Cpu className="w-5 h-5" />
            {isRunning && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 font-mono tracking-tight">
                AETHERNODE <span className="text-emerald-400 font-normal text-xs">// CLIENT v1.0.4</span>
              </h1>
              <span
                className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-semibold tracking-wide border ${
                  isRunning
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                }`}
              >
                {isRunning ? 'Foreground Service Active' : 'Node Paused'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-0.5">
              <span>UPTIME: <span className="text-slate-200">{formatUptime(uptimeSeconds)}</span></span>
              <span className="text-slate-700">•</span>
              <span>TYPE: <span className="text-slate-300">DATA_SYNC_SERVICE</span></span>
            </p>
          </div>
        </div>

        {/* Action Controls & Network Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* L2 Network Picker */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
            <button
              onClick={() => onNetworkChange('polygon')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all ${
                network === 'polygon'
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Polygon PoS
            </button>
            <button
              onClick={() => onNetworkChange('bsc')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all ${
                network === 'bsc'
                  ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
              BNB Chain
            </button>
          </div>

          {/* Engine Play/Pause & Stop */}
          <button
            onClick={onToggleState}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
              isRunning
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause Node
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Start Node
              </>
            )}
          </button>

          <button
            onClick={onStop}
            title="Stop Foreground Service"
            className="flex items-center justify-center p-1.5 rounded-lg text-xs font-mono border border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all"
          >
            <Square className="w-3.5 h-3.5" />
          </button>

          <div className="h-5 w-[1px] bg-slate-800 hidden sm:block" />

          {/* Android Source Code & Architecture Modals */}
          <button
            onClick={onOpenCodeInspector}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-900/40 transition-all shadow-sm"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Inspect</span> Android Code (7)
          </button>

          <button
            onClick={onOpenArchitecture}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Throttling</span> Specs
          </button>
        </div>
      </div>
    </header>
  );
};
