import React from 'react';
import { Cpu, Thermometer, Wallet, Terminal, Package, ShieldCheck } from 'lucide-react';

export type ActiveTab = 'MINING' | 'HARDWARE' | 'WALLET' | 'TERMINAL' | 'DEVELOPER';

interface NavigationTabBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  unclaimedBalance: number;
  cpuTemperature: number;
  isThermalPaused: boolean;
  sharesAccepted: number;
}

export const NavigationTabBar: React.FC<NavigationTabBarProps> = ({
  activeTab,
  onTabChange,
  unclaimedBalance,
  cpuTemperature,
  isThermalPaused,
  sharesAccepted
}) => {
  const tabs: {
    id: ActiveTab;
    label: string;
    subLabel: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: string;
  }[] = [
    {
      id: 'MINING',
      label: 'التعدين والمعالجة',
      subLabel: 'Mining Dashboard',
      icon: <Cpu className="w-4 h-4" />,
      badge: `${sharesAccepted} أسهم`,
      badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
    },
    {
      id: 'HARDWARE',
      label: 'العتاد والحرارة',
      subLabel: 'Hardware & Thermal',
      icon: <Thermometer className="w-4 h-4" />,
      badge: isThermalPaused ? '⚠️ توقف حراري' : `${cpuTemperature.toFixed(1)}°C`,
      badgeColor: isThermalPaused
        ? 'bg-rose-950 text-rose-300 border-rose-500/50 animate-pulse'
        : cpuTemperature > 40
        ? 'bg-amber-950 text-amber-300 border-amber-500/40'
        : 'bg-slate-900 text-slate-300 border-slate-800'
    },
    {
      id: 'WALLET',
      label: 'محفظة AetherVault',
      subLabel: 'Web3 Crypto Wallet',
      icon: <Wallet className="w-4 h-4" />,
      badge: `${unclaimedBalance.toFixed(1)} ATH`,
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-500/40 font-bold'
    },
    {
      id: 'TERMINAL',
      label: 'سجل الكتل',
      subLabel: 'Stratum Stream',
      icon: <Terminal className="w-4 h-4" />
    },
    {
      id: 'DEVELOPER',
      label: 'المطور وAPK',
      subLabel: 'Source & Build',
      icon: <Package className="w-4 h-4" />
    }
  ];

  return (
    <nav className="bg-slate-950 border-b border-slate-800/80 sticky top-14 z-10 px-2 sm:px-6 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto scrollbar-none py-1.5 gap-1.5 sm:gap-2">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl font-mono text-xs whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-slate-800/90 text-slate-100 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/60'
              }`}
            >
              <div
                className={`p-1 rounded-md transition-colors ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-900 text-slate-500 group-hover:text-slate-400'
                }`}
              >
                {tab.icon}
              </div>
              <div className="text-left">
                <span className="block leading-none text-xs">{tab.label}</span>
                <span className="block text-[10px] text-slate-500 font-normal leading-tight mt-0.5">
                  {tab.subLabel}
                </span>
              </div>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ml-1 ${tab.badgeColor}`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
