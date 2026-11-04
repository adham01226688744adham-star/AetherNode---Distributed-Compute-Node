import React from 'react';
import { Gauge, ShieldAlert, Cpu, Sparkles } from 'lucide-react';
import { PowerBudgetPreset } from '../types/node';

interface CpuPowerSliderProps {
  currentBudget: PowerBudgetPreset;
  onChangeBudget: (budget: PowerBudgetPreset) => void;
}

export const CpuPowerSlider: React.FC<CpuPowerSliderProps> = ({
  currentBudget,
  onChangeBudget
}) => {
  const presets: { value: PowerBudgetPreset; label: string; desc: string; duty: string }[] = [
    {
      value: 15,
      label: 'LOW',
      desc: 'Cool & Power Saver',
      duty: '15ms Work / 85ms Delay'
    },
    {
      value: 30,
      label: 'BALANCED',
      desc: 'Optimal Sustained Yield',
      duty: '30ms Work / 70ms Delay'
    },
    {
      value: 45,
      label: 'MAX SAFE',
      desc: 'Strictly Capped <50%',
      duty: '45ms Work / 55ms Delay'
    }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs uppercase font-mono tracking-wider text-slate-300 font-bold">
            CPU Power Throttling Budget
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Current Budget:</span>
          <span className="text-sm font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
            {currentBudget}% CPU Ceiling
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
            &lt; 50% HARD CAP
          </span>
        </div>
      </div>

      {/* Preset Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {presets.map((preset) => {
          const isSelected = currentBudget === preset.value;
          return (
            <button
              key={preset.value}
              onClick={() => onChangeBudget(preset.value)}
              className={`text-left p-3.5 rounded-lg border transition-all relative ${
                isSelected
                  ? 'bg-amber-950/30 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30'
                  : 'bg-slate-950/40 border-slate-800/60 hover:border-slate-700/80 hover:bg-slate-950/70'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-bold text-slate-200">
                  {preset.label} ({preset.value}%)
                </span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                )}
              </div>
              <p className="text-[11px] font-mono text-slate-400 mb-2">{preset.desc}</p>
              <div className="text-[10px] font-mono bg-slate-900/90 text-amber-300/90 px-2 py-1 rounded border border-slate-800">
                {preset.duty}
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Range Control */}
      <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/60">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
          <span>THROTTLE PRESET SELECTION</span>
          <span className="text-slate-300 font-medium">Duty Cycle Ratio: {currentBudget} : {100 - currentBudget}</span>
        </div>

        <input
          type="range"
          min="15"
          max="45"
          step="15"
          value={currentBudget}
          onChange={(e) => onChangeBudget(Number(e.target.value) as PowerBudgetPreset)}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
        />

        <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-2">
          <span>Low (15% Power)</span>
          <span>Medium (30% Power)</span>
          <span className="text-amber-400/90 font-semibold">Max Safe (45% Power - Limit)</span>
        </div>
      </div>

      {/* Technical Throttling Explanation */}
      <div className="mt-4 flex items-start gap-2.5 p-3 rounded-lg bg-slate-950/30 border border-slate-800/50 text-[11px] font-mono text-slate-400">
        <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-200">Android Systems Throttling Guarantee:</strong> The background worker computes inside a 100ms cyclic window. For {currentBudget}% power, it executes cryptographic chunk verification for {currentBudget}ms and issues an explicit{' '}
          <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">delay({100 - currentBudget}ms)</code>. This yields the CPU back to the OS scheduler, eliminating thread starvation, preventing device lag, and keeping temperatures nominal.
        </p>
      </div>
    </div>
  );
};
