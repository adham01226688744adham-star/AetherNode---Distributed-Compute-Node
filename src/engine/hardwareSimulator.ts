import { HardwareTelemetryData, PowerBudgetPreset } from '../types/node';

export class HardwareMonitorWeb {
  private availableCores: number = 8;
  private activeThreads: number = 4;
  private cpuThrottlePct: PowerBudgetPreset = 30;

  private batteryLevel: number = 88;
  private batteryTemp: number = 29.4;
  private batteryHealth: 'GOOD' | 'OVERHEAT' | 'DEAD' | 'OVER_VOLTAGE' | 'UNSPECIFIED_FAILURE' = 'GOOD';
  private isCharging: boolean = false;
  private powerSource: 'AC' | 'USB' | 'WIRELESS' | 'BATTERY' = 'BATTERY';
  private thermalStatus: 'NOMINAL' | 'FAIR' | 'SERIOUS' | 'CRITICAL' = 'NOMINAL';

  private isRunning: boolean = false;
  private baseTemp: number = 29.0;
  private uptimeSeconds: number = 0;

  // Thermal Protection Watchdog state
  private isThermalPaused: boolean = false;
  private thermalPauseReason: string = '';
  private forcedSpike: boolean = false;

  private onThermalEmergency?: (reason: string) => void;
  private onThermalNormalized?: () => void;

  constructor() {
    if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) {
      this.availableCores = navigator.hardwareConcurrency;
    }
    // Limit active threads strictly to Available Cores / 2
    this.activeThreads = Math.max(1, Math.floor(this.availableCores / 2));
    this.initRealBatteryIfAvailable();
  }

  public setThermalCallbacks(onEmergency: (reason: string) => void, onNormalized: () => void) {
    this.onThermalEmergency = onEmergency;
    this.onThermalNormalized = onNormalized;
  }

  private async initRealBatteryIfAvailable() {
    try {
      const nav = navigator as unknown as { getBattery?: () => Promise<any> };
      if (typeof nav.getBattery === 'function') {
        const battery = await nav.getBattery();
        this.batteryLevel = Math.round(battery.level * 100);
        this.isCharging = battery.charging;
        this.powerSource = battery.charging ? 'AC' : 'BATTERY';

        battery.addEventListener('levelchange', () => {
          this.batteryLevel = Math.round(battery.level * 100);
        });
        battery.addEventListener('chargingchange', () => {
          this.isCharging = battery.charging;
          this.powerSource = battery.charging ? 'AC' : 'BATTERY';
        });
      }
    } catch {
      // Fallback to standard baseline
    }
  }

  public setPowerBudget(budget: PowerBudgetPreset) {
    this.cpuThrottlePct = budget;
  }

  public setRunning(running: boolean) {
    this.isRunning = running;
  }

  public toggleThermalSimulation(spike: boolean) {
    this.forcedSpike = spike;
    if (spike) {
      this.batteryTemp = 44.2;
    } else {
      this.batteryTemp = 34.0;
    }
  }

  public tick(): HardwareTelemetryData {
    if (this.isRunning && !this.isThermalPaused) {
      this.uptimeSeconds++;
      const targetTemp =
        this.baseTemp +
        (this.cpuThrottlePct === 15 ? 3.5 : this.cpuThrottlePct === 30 ? 7.8 : 11.2) +
        (this.isCharging ? 1.8 : 0);

      const diff = targetTemp - this.batteryTemp;
      this.batteryTemp += diff * 0.04;
      this.batteryTemp += (Math.random() - 0.5) * 0.1;
    } else {
      // Cool down towards ambient base
      const diff = this.baseTemp - this.batteryTemp;
      this.batteryTemp += diff * 0.08; // Cools down slightly faster when paused
    }

    if (this.forcedSpike) {
      this.batteryTemp = Math.max(this.batteryTemp, 44.5);
    }

    // Thermal Watchdog Protection Engine
    if (this.batteryTemp >= 43.0) {
      this.thermalStatus = 'CRITICAL';
      this.batteryHealth = 'OVERHEAT';

      if (!this.isThermalPaused) {
        this.isThermalPaused = true;
        this.thermalPauseReason = `Emergency Thermal Cutoff: Temperature reached ${this.batteryTemp.toFixed(1)}°C (Limit: 43.0°C). Mining halted.`;
        if (this.onThermalEmergency) {
          this.onThermalEmergency(this.thermalPauseReason);
        }
      }
    } else if (this.batteryTemp >= 39.5) {
      this.thermalStatus = 'FAIR';
      this.batteryHealth = 'GOOD';
    } else {
      this.thermalStatus = 'NOMINAL';
      this.batteryHealth = 'GOOD';

      // Hysteresis Recovery: resume when cooled below 38.5°C
      if (this.isThermalPaused && this.batteryTemp <= 38.5 && !this.forcedSpike) {
        this.isThermalPaused = false;
        this.thermalPauseReason = '';
        if (this.onThermalNormalized) {
          this.onThermalNormalized();
        }
      }
    }

    const dutyActiveMs = Math.round((100 * this.cpuThrottlePct) / 100);
    const dutySleepMs = 100 - dutyActiveMs;

    return {
      availableCores: this.availableCores,
      activeThreads: this.activeThreads,
      cpuThrottlePct: this.cpuThrottlePct,
      dutyActiveMs,
      dutySleepMs,
      cpuTemperature: Number(this.batteryTemp.toFixed(1)),
      thermalStatus: this.thermalStatus,
      batteryLevel: this.batteryLevel,
      batteryTemperature: Number(this.batteryTemp.toFixed(1)),
      batteryHealth: this.batteryHealth,
      isCharging: this.isCharging,
      powerSource: this.powerSource,
      isThermalPaused: this.isThermalPaused,
      thermalPauseReason: this.thermalPauseReason
    };
  }
}
