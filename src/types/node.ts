export type NodeState = 'RUNNING' | 'PAUSED' | 'THROTTLED' | 'STOPPED' | 'THERMAL_PROTECTION_PAUSE';

export type PowerBudgetPreset = 15 | 30 | 45;

export type SupportedNetwork = 'polygon' | 'bsc';

export type PoolConnectionState = 'CONNECTED' | 'CONNECTING' | 'RECONNECTING' | 'DISCONNECTED' | 'ERROR';

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
  isThermalPaused: boolean;
  thermalPauseReason?: string;
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
  // Real Mining Fields
  poolConnectionState: PoolConnectionState;
  poolEndpoint: string;
  currentJobId: string;
  sharesAccepted: number;
  sharesRejected: number;
  networkBlockHeight: number;
  reconnectAttempts: number;
  lastShareLatencyMs: number;
}

export interface MiningJob {
  jobId: string;
  prevBlockHash: string;
  merkleRoot: string;
  blockHeight: number;
  difficultyBits: string;
  targetDifficulty: number;
  timestamp: number;
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

export interface Web3SecurityAudit {
  keyStorageEngine: 'Android Keystore / Hardware-backed TEE' | 'External Wallet / Non-custodial';
  privateKeyExposed: boolean;
  isChecksumVerified: boolean;
  antiReentrancyGuard: boolean;
  gasLimitCeiling: number;
  cooldownPeriodSeconds: number;
  dailyWithdrawalLimit: number;
  auditStatus: 'VERIFIED_SECURE' | 'SECURITY_WARNING';
  auditNotes: string[];
}

export interface ApkBuildInfo {
  versionName: string;
  versionCode: number;
  minSdk: number;
  targetSdk: number;
  gradleCommand: string;
  outputArtifact: string;
  sha256Checksum: string;
  buildStatus: 'READY_TO_BUILD' | 'BUILDING' | 'COMPILED_SUCCESS';
}

export interface SourceCodeFile {
  id: string;
  filename: string;
  language: 'kotlin' | 'xml' | 'groovy' | 'markdown';
  category: 'Service' | 'Computation' | 'Hardware' | 'Web3' | 'UI' | 'Manifest & Build' | 'Mining Protocol';
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
  status: 'VERIFIED' | 'SUBMITTED' | 'BATCHED' | 'SHARE_ACCEPTED' | 'SHARE_REJECTED';
  threadId: number;
  jobId?: string;
  difficulty?: number;
}
