import { CryptographicStats, ChunkLogEntry, PowerBudgetPreset } from '../types/node';

// Lightweight fast pure-JS SHA-256 fallback for rapid microsecond loops
function sha256Sync(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i: number;
  let j: number;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let compositeClearHex = '0123456789abcdef';

  let currentLength = ascii.length;
  for (i = 0; i < currentLength; i++) {
    const charCode = ascii.charCodeAt(i);
    const wordIndex = i >> 2;
    words[wordIndex] = (words[wordIndex] || 0) | (charCode << (24 - (i % 4) * 8));
  }

  const bitLengthIndex = ((currentLength + 8) >> 6) * 16 + 15;
  words[currentLength >> 2] = (words[currentLength >> 2] || 0) | (0x80 << (24 - (currentLength % 4) * 8));
  words[bitLengthIndex] = asciiBitLength;

  const w: number[] = new Array(64);

  for (i = 0; i <= bitLengthIndex; i += 16) {
    const oldHash = hash.slice(0);

    for (j = 0; j < 64; j++) {
      if (j < 16) {
        w[j] = words[i + j] || 0;
      } else {
        const s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        const s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
      }

      const s1 = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 = (hash[7] + s1 + ch + k[j] + w[j]) | 0;
      const s0 = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = (s0 + maj) | 0;

      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }

    for (j = 0; j < 8; j++) {
      hash[j] = (hash[j] + oldHash[j]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const byte = (hash[i] >> (j * 8)) & 255;
      result += compositeClearHex.charAt((byte >> 4) & 15) + compositeClearHex.charAt(byte & 15);
    }
  }

  return result;
}

export class CryptoComputeEngineWeb {
  private isRunning: boolean = false;
  private powerBudget: PowerBudgetPreset = 30; // 15%, 30%, or 45% strictly < 50%
  private activeThreads: number = 2;
  private totalCores: number = 4;

  private totalHashes: number = 0;
  private verifiedChunks: number = 0;
  private currentNonce: number = Math.floor(Math.random() * 1000000);
  private difficultyTarget: string = '000'; // Real target: proof accepted when hash starts with 000
  private lastBlockHash: string = '000a4b7f8c9e012d456789abcdef1029384756abcdef9876543210fedcba';
  private lastChunkLatencyMs: number = 18;

  private hashrateInstant: number = 0;
  private hashrate1m: number = 0;
  private hashratePeak: number = 0;
  private hashrateHistory: number[] = [];

  private timerId: number | null = null;
  private chunkLogs: ChunkLogEntry[] = [];
  private onStatsUpdate?: (stats: CryptographicStats, logs: ChunkLogEntry[]) => void;

  constructor(cores: number = 4) {
    this.totalCores = cores;
    this.activeThreads = Math.max(1, Math.floor(cores / 2));
  }

  public setPowerBudget(budget: PowerBudgetPreset) {
    // Strictly capped to under 50%
    if (budget > 45) {
      this.powerBudget = 45;
    } else {
      this.powerBudget = budget;
    }
  }

  public getPowerBudget(): PowerBudgetPreset {
    return this.powerBudget;
  }

  public getDutyCycle(): { activeMs: number; sleepMs: number } {
    const cycleMs = 100;
    const activeMs = Math.round((cycleMs * this.powerBudget) / 100);
    const sleepMs = cycleMs - activeMs;
    return { activeMs, sleepMs };
  }

  public subscribe(callback: (stats: CryptographicStats, logs: ChunkLogEntry[]) => void) {
    this.onStatsUpdate = callback;
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.runComputeCycle();
  }

  public stop() {
    this.isRunning = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.hashrateInstant = 0;
    this.emitStats();
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  private runComputeCycle() {
    if (!this.isRunning) return;

    const { activeMs, sleepMs } = this.getDutyCycle();
    const cycleStart = performance.now();
    let hashesInCycle = 0;

    // Active computational window (e.g. 15ms, 30ms, or 45ms)
    // Run real SHA-256 batch across active worker thread nonces
    while (performance.now() - cycleStart < activeMs) {
      for (let t = 0; t < this.activeThreads; t++) {
        this.currentNonce++;
        const chunkPayload = `block-aether:${this.lastBlockHash}:${this.currentNonce}:${t}:${Date.now()}`;
        const hash = sha256Sync(chunkPayload);
        hashesInCycle++;

        // Real difficulty check: leading zeros match target
        if (hash.startsWith(this.difficultyTarget)) {
          this.verifiedChunks++;
          this.lastBlockHash = hash;
          this.lastChunkLatencyMs = Math.round(performance.now() - cycleStart);

          const log: ChunkLogEntry = {
            id: 'chk_' + Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toLocaleTimeString(),
            chunkIndex: this.verifiedChunks,
            nonce: this.currentNonce,
            hash: hash,
            timeSpentMs: this.lastChunkLatencyMs,
            status: 'VERIFIED',
            threadId: t
          };

          this.chunkLogs.unshift(log);
          if (this.chunkLogs.length > 30) {
            this.chunkLogs.pop();
          }
        }
      }
    }

    this.totalHashes += hashesInCycle;

    // Calculate instantaneous hashrate (hashes per second in the active window)
    const activeTimeSec = (performance.now() - cycleStart) / 1000;
    if (activeTimeSec > 0) {
      const rawRate = hashesInCycle / activeTimeSec;
      // Weighted smoothing
      this.hashrateInstant = Math.round(this.hashrateInstant * 0.7 + rawRate * 0.3);
      if (this.hashrateInstant > this.hashratePeak) {
        this.hashratePeak = this.hashrateInstant;
      }

      this.hashrateHistory.push(this.hashrateInstant);
      if (this.hashrateHistory.length > 20) {
        this.hashrateHistory.shift();
      }
      this.hashrate1m = Math.round(
        this.hashrateHistory.reduce((a, b) => a + b, 0) / this.hashrateHistory.length
      );
    }

    this.emitStats();

    // Forced Duty Cycle Sleep: Yield CPU back to browser event loop
    // Guarantees CPU power stays strictly below 50%
    this.timerId = window.setTimeout(() => {
      this.runComputeCycle();
    }, sleepMs);
  }

  private emitStats() {
    if (this.onStatsUpdate) {
      this.onStatsUpdate(
        {
          hashrate: this.isRunning ? this.hashrateInstant : 0,
          hashrate1m: this.isRunning ? this.hashrate1m : 0,
          hashratePeak: this.hashratePeak,
          totalHashes: this.totalHashes,
          verifiedChunks: this.verifiedChunks,
          difficultyTarget: this.difficultyTarget,
          currentNonce: this.currentNonce,
          lastBlockHash: this.lastBlockHash,
          lastChunkLatencyMs: this.lastChunkLatencyMs
        },
        [...this.chunkLogs]
      );
    }
  }
}
