export type NodeState = 'RUNNING' | 'PAUSED' | 'THROTTLED' | 'STOPPED';

export type PowerBudgetPreset = 15 | 30 | 45;

export type SupportedNetwork = 'polygon' | 'bsc';

export interface HardwareTelemetryData {
  availableCores: number;
  activeThreads: number;
  cpuThrottlePct: PowerBudgetPreset;
  dutyActiveMs: number;
  dutySleepMs: number;
  cpuTemperature: number; // in Celsius
  thermalStatus: 'NOMINAL' | 'FAIR' | 'SERIOUS' | 'CRITICAL';
  batteryLevel: number; // 0 - 100%
  batteryTemperature: number; // in Celsius
  batteryHealth: 'GOOD' | 'OVERHEAT' | 'DEAD' | 'OVER_VOLTAGE' | 'UNSPECIFIED_FAILURE';
  isCharging: boolean;
  powerSource: 'AC' | 'USB' | 'WIRELESS' | 'BATTERY';
}

export interface CryptographicStats {
  hashrate: number; // in H/s
  hashrate1m: number;
  hashratePeak: number;
  totalHashes: number;
  verifiedChunks: number;
  difficultyTarget: string;
  currentNonce: number;
  lastBlockHash: string;
  lastChunkLatencyMs: number;
}

export interface NetworkEarnings {
  tokenSymbol: string;
  unclaimedBalance: number;
  dailyEstimatedYield: number;
  tokenUsdPrice: number;
  uptimeSeconds: number;
  networkDifficulty: number;
  proofsAccepted: number;
  proofsRejected: number;
}

export interface Web3Config {
  network: SupportedNetwork;
  chainId: number;
  chainName: string;
  rpcUrl: string;
  tokenAddress: string;
  symbol: string;
  decimals: number;
  explorerUrl: string;
  gasPriceGwei: number;
}

export interface SourceCodeFile {
  id: string;
  filename: string;
  language: 'kotlin' | 'xml' | 'groovy' | 'markdown';
  category: 'Service' | 'Computation' | 'Hardware' | 'Web3' | 'UI' | 'Manifest & Build';
  description: string;
  content: string;
}

export interface ChunkLogEntry {
  id: string;
  timestamp: string;
  chunkIndex: number;
  nonce: number;
  hash: string;
  timeSpentMs: number;
  status: 'VERIFIED' | 'SUBMITTED' | 'BATCHED';
  threadId: number;
}
