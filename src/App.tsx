import React, { useState, useEffect, useRef } from 'react';
import { DashboardHeader } from './components/DashboardHeader';
import { NavigationTabBar, ActiveTab } from './components/NavigationTabBar';
import { HashrateMonitor } from './components/HashrateMonitor';
import { HardwareTelemetry } from './components/HardwareTelemetry';
import { CpuPowerSlider } from './components/CpuPowerSlider';
import { EarningsOverview } from './components/EarningsOverview';
import { LiveConsoleLog } from './components/LiveConsoleLog';
import { AetherWalletView } from './components/AetherWalletView';
import { DeveloperHubView } from './components/DeveloperHubView';
import { Web3WithdrawModal } from './components/Web3WithdrawModal';
import { CodeInspectorModal } from './components/CodeInspectorModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { ApkBuildModal } from './components/ApkBuildModal';
import { Web3SecurityModal } from './components/Web3SecurityModal';
import { CryptoComputeEngineWeb } from './engine/cryptoEngine';
import { HardwareMonitorWeb } from './engine/hardwareSimulator';
import {
  NodeState,
  PowerBudgetPreset,
  SupportedNetwork,
  CryptographicStats,
  HardwareTelemetryData,
  NetworkEarnings,
  ChunkLogEntry
} from './types/node';
import { Smartphone, Monitor } from 'lucide-react';

export default function App() {
  // Navigation State (5 Dedicated Menus/Tabs)
  const [activeTab, setActiveTab] = useState<ActiveTab>('MINING');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Engine and Hardware singletons
  const engineRef = useRef<CryptoComputeEngineWeb | null>(null);
  const hardwareRef = useRef<HardwareMonitorWeb | null>(null);

  // Application State
  const [nodeState, setNodeState] = useState<NodeState>('RUNNING');
  const [currentBudget, setCurrentBudget] = useState<PowerBudgetPreset>(30);
  const [network, setNetwork] = useState<SupportedNetwork>('polygon');
  const [uptimeSeconds, setUptimeSeconds] = useState<number>(142);
  const [isSimulatingHeat, setIsSimulatingHeat] = useState<boolean>(false);

  // Modals
  const [isWithdrawOpen, setIsWithdrawOpen] = useState<boolean>(false);
  const [isCodeInspectorOpen, setIsCodeInspectorOpen] = useState<boolean>(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState<boolean>(false);
  const [isApkBuildOpen, setIsApkBuildOpen] = useState<boolean>(false);
  const [isWeb3SecurityOpen, setIsWeb3SecurityOpen] = useState<boolean>(false);

  // Telemetry & Cryptographic Data
  const [cryptoStats, setCryptoStats] = useState<CryptographicStats>({
    hashrate: 0,
    hashrate1m: 0,
    hashratePeak: 0,
    totalHashes: 18450,
    verifiedChunks: 42,
    difficultyTarget: '000',
    currentNonce: 849204,
    lastBlockHash: '000a4b7f8c9e012d456789abcdef1029384756abcdef9876543210fedcba',
    lastChunkLatencyMs: 16,
    poolConnectionState: 'CONNECTED',
    poolEndpoint: 'stratum+tcp://pool.aethernode.network:3333',
    currentJobId: 'job_9a4f2b8',
    sharesAccepted: 14,
    sharesRejected: 0,
    networkBlockHeight: 842918,
    reconnectAttempts: 0,
    lastShareLatencyMs: 42
  });

  const [hardwareTelemetry, setHardwareTelemetry] = useState<HardwareTelemetryData>({
    availableCores: 8,
    activeThreads: 4,
    cpuThrottlePct: 30,
    dutyActiveMs: 30,
    dutySleepMs: 70,
    cpuTemperature: 33.4,
    thermalStatus: 'NOMINAL',
    batteryLevel: 88,
    batteryTemperature: 33.4,
    batteryHealth: 'GOOD',
    isCharging: false,
    powerSource: 'BATTERY',
    isThermalPaused: false,
    thermalPauseReason: ''
  });

  const [logs, setLogs] = useState<ChunkLogEntry[]>([
    {
      id: 'init_1',
      timestamp: '08:52:10',
      chunkIndex: 42,
      nonce: 849204,
      hash: '000a4b7f8c9e012d456789abcdef1029384756abcdef9876543210fedcba',
      timeSpentMs: 16,
      status: 'SHARE_ACCEPTED',
      threadId: 2,
      jobId: 'job_9a4f2b8',
      difficulty: 12.0
    },
    {
      id: 'init_2',
      timestamp: '08:52:04',
      chunkIndex: 41,
      nonce: 848911,
      hash: '000c829e1fa2034b58c709e913a481c4fa9201e74fbbd9283719482038102938',
      timeSpentMs: 14,
      status: 'SHARE_ACCEPTED',
      threadId: 0,
      jobId: 'job_9a4f2b8',
      difficulty: 12.0
    }
  ]);

  const [earnings, setEarnings] = useState<NetworkEarnings>({
    tokenSymbol: 'ATH',
    unclaimedBalance: 24.85,
    dailyEstimatedYield: 8.42,
    tokenUsdPrice: 0.425,
    uptimeSeconds: 142,
    networkDifficulty: 12,
    proofsAccepted: 42,
    proofsRejected: 0
  });

  // Initialize background engine on mount
  useEffect(() => {
    const hw = new HardwareMonitorWeb();
    hardwareRef.current = hw;
    hw.setPowerBudget(30);
    hw.setRunning(true);

    const engine = new CryptoComputeEngineWeb(hw.tick().availableCores);
    engineRef.current = engine;
    engine.setPowerBudget(30);

    // Register thermal emergency watchdog callbacks
    hw.setThermalCallbacks(
      (reason) => {
        engine.triggerThermalHalt(reason);
        setNodeState('THERMAL_PROTECTION_PAUSE');
      },
      () => {
        engine.triggerThermalResume();
        setNodeState('RUNNING');
      }
    );

    engine.subscribe((stats, newLogs) => {
      setCryptoStats(stats);
      if (newLogs.length > 0) {
        setLogs(newLogs);
      }
    });

    engine.start();

    // Hardware Telemetry & Uptime Interval (1000ms tick)
    const interval = setInterval(() => {
      if (hardwareRef.current) {
        const tele = hardwareRef.current.tick();
        setHardwareTelemetry(tele);
      }

      setUptimeSeconds((prev) => {
        const next = prev + 1;
        if (engineRef.current?.getIsRunning()) {
          setEarnings((earn) => ({
            ...earn,
            unclaimedBalance: Number((earn.unclaimedBalance + 0.0003).toFixed(4)),
            proofsAccepted: earn.proofsAccepted + (next % 15 === 0 ? 1 : 0)
          }));
        }
        return next;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      engine.stop();
    };
  }, []);

  // Handle Power Budget Changes
  const handleBudgetChange = (newBudget: PowerBudgetPreset) => {
    setCurrentBudget(newBudget);
    if (engineRef.current) {
      engineRef.current.setPowerBudget(newBudget);
    }
    if (hardwareRef.current) {
      hardwareRef.current.setPowerBudget(newBudget);
    }
  };

  // Handle Node Start / Pause
  const handleToggleState = () => {
    if (!engineRef.current || !hardwareRef.current) return;

    if (nodeState === 'RUNNING') {
      engineRef.current.stop();
      hardwareRef.current.setRunning(false);
      setNodeState('PAUSED');
    } else {
      engineRef.current.start();
      hardwareRef.current.setRunning(true);
      setNodeState('RUNNING');
    }
  };

  const handleStop = () => {
    if (!engineRef.current || !hardwareRef.current) return;
    engineRef.current.stop();
    hardwareRef.current.setRunning(false);
    setNodeState('STOPPED');
  };

  const handleReconnectPool = () => {
    if (engineRef.current) {
      engineRef.current.reconnectPool();
    }
  };

  const handleSimulateHeatSpike = (spike: boolean) => {
    setIsSimulatingHeat(spike);
    if (hardwareRef.current) {
      hardwareRef.current.toggleThermalSimulation(spike);
    }
  };

  const handleClaimMiningRewards = (amount: number) => {
    setEarnings((prev) => ({
      ...prev,
      unclaimedBalance: Math.max(0, Number((prev.unclaimedBalance - amount).toFixed(2)))
    }));
  };

  // Render content according to active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'MINING':
        return (
          <div className="space-y-6">
            <HashrateMonitor stats={cryptoStats} nodeState={nodeState} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CpuPowerSlider
                currentBudget={currentBudget}
                onChangeBudget={handleBudgetChange}
              />
              <EarningsOverview
                earnings={earnings}
                hashrate={cryptoStats.hashrate}
                network={network}
                onOpenWithdraw={() => setActiveTab('WALLET')}
              />
            </div>
          </div>
        );

      case 'HARDWARE':
        return (
          <div className="space-y-6">
            <HardwareTelemetry
              telemetry={hardwareTelemetry}
              onSimulateHeatSpike={handleSimulateHeatSpike}
              isSimulatingHeat={isSimulatingHeat}
            />
            <CpuPowerSlider
              currentBudget={currentBudget}
              onChangeBudget={handleBudgetChange}
            />
          </div>
        );

      case 'WALLET':
        return (
          <AetherWalletView
            unclaimedMiningBalance={earnings.unclaimedBalance}
            network={network}
            onNetworkChange={(net) => setNetwork(net)}
            onClaimMiningRewards={handleClaimMiningRewards}
          />
        );

      case 'TERMINAL':
        return (
          <div className="space-y-4">
            <LiveConsoleLog logs={logs} onClearLogs={() => setLogs([])} />
          </div>
        );

      case 'DEVELOPER':
        return <DeveloperHubView />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* 1. Top Persistent Application Bar */}
      <DashboardHeader
        nodeState={nodeState}
        uptimeSeconds={uptimeSeconds}
        network={network}
        onToggleState={handleToggleState}
        onStop={handleStop}
        onNetworkChange={(net) => setNetwork(net)}
        onOpenCodeInspector={() => setActiveTab('DEVELOPER')}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenApkBuild={() => setIsApkBuildOpen(true)}
        onOpenWeb3Security={() => setIsWeb3SecurityOpen(true)}
        onReconnectPool={handleReconnectPool}
        isThermalPaused={hardwareTelemetry.isThermalPaused}
      />

      {/* 2. Structured Tab Navigation Bar (No single monolithic scroll) */}
      <NavigationTabBar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        unclaimedBalance={earnings.unclaimedBalance}
        cpuTemperature={hardwareTelemetry.cpuTemperature}
        isThermalPaused={hardwareTelemetry.isThermalPaused}
        sharesAccepted={cryptoStats.sharesAccepted}
      />

      {/* 3. Viewport Mode Switcher & Real Throttling Banner */}
      <div className="bg-slate-950/70 border-b border-slate-900 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
            <span>نظام AetherNode للتعدين والمحافظ:</span>
            <span className="text-slate-200 font-semibold">
              تعدين حقيقي Double-SHA256d • محفظة AetherVault المعتمدة • قوائم منظمة
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 rounded p-0.5 border border-slate-800 text-[11px]">
              <button
                onClick={() => setViewMode('desktop')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                  viewMode === 'desktop'
                    ? 'bg-slate-800 text-slate-200 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Monitor className="w-3 h-3" />
                عرض اللوحة (Tabs)
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                  viewMode === 'mobile'
                    ? 'bg-slate-800 text-slate-200 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                إطار هاتف Android 14
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Tabbed Workspace Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {viewMode === 'mobile' ? (
          /* Mobile / Android Device Frame View with working Tabs */
          <div className="flex flex-col items-center justify-center py-4">
            <div className="text-center mb-3 text-xs font-mono text-slate-400">
              واجهة Android الأصلية بتصميم Jetpack Compose Material 3 (AetherNode)
            </div>
            <div className="w-full max-w-md bg-slate-900 border-4 border-slate-800 rounded-[38px] p-3 shadow-2xl overflow-hidden ring-1 ring-slate-700/50">
              {/* Phone Speaker & Camera Notch */}
              <div className="w-24 h-4 bg-slate-950 mx-auto rounded-full mb-3 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-slate-900" />
              </div>

              {/* In-Device Screen Content */}
              <div className="space-y-4 max-h-[750px] overflow-y-auto pr-1">
                {renderTabContent()}
              </div>

              {/* Android System Navigation Bar */}
              <div className="w-32 h-1 bg-slate-700 mx-auto rounded-full mt-3" />
            </div>
          </div>
        ) : (
          /* Desktop Structured Tab View */
          <div>{renderTabContent()}</div>
        )}
      </main>

      {/* Global Modals */}
      <Web3WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        unclaimedBalance={earnings.unclaimedBalance}
        currentNetwork={network}
        onSuccessfulWithdraw={handleClaimMiningRewards}
      />

      <CodeInspectorModal
        isOpen={isCodeInspectorOpen}
        onClose={() => setIsCodeInspectorOpen(false)}
      />

      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      <ApkBuildModal
        isOpen={isApkBuildOpen}
        onClose={() => setIsApkBuildOpen(false)}
      />

      <Web3SecurityModal
        isOpen={isWeb3SecurityOpen}
        onClose={() => setIsWeb3SecurityOpen(false)}
      />
    </div>
  );
}
