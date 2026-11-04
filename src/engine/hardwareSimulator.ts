import { HardwareTelemetryData, PowerBudgetPreset } from '../types/node';

export class HardwareMonitorWeb {
  private availableCores: number = 8;
  private activeThreads: number = 4;
  private cpuThrottlePct: PowerBudgetPreset = 30;

  private batteryLevel: number = 85;
  private batteryTemp: number = 29.4;
  private batteryHealth: 'GOOD' | 'OVERHEAT' | 'DEAD' | 'OVER_VOLTAGE' | 'UNSPECIFIED_FAILURE' = 'GOOD';
  private isCharging: boolean = false;
  private powerSource: 'AC' | 'USB' | 'WIRELESS' | 'BATTERY' = 'BATTERY';
  private thermalStatus: 'NOMINAL' | 'FAIR' | 'SERIOUS' | 'CRITICAL' = 'NOMINAL';

  private isRunning: boolean = false;
  private baseTemp: number = 29.0;
  private uptimeSeconds: number = 0;

  constructor() {
    if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) {
      this.availableCores = navigator.hardwareConcurrency;
    }
    // Limit active threads strictly to Available Cores / 2
    this.activeThreads = Math.max(1, Math.floor(this.availableCores / 2));
    this.initRealBatteryIfAvailable();
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

  public tick(): HardwareTelemetryData {
    if (this.isRunning) {
      this.uptimeSeconds++;
      // Thermodynamic model:
      // 15% budget: target ~32.5°C
      // 30% budget: target ~36.8°C
      // 45% budget: target ~40.2°C
      const targetTemp =
        this.baseTemp +
        (this.cpuThrottlePct === 15 ? 3.5 : this.cpuThrottlePct === 30 ? 7.8 : 11.2) +
        (this.isCharging ? 1.8 : 0);

      // Smooth thermodynamic approach
      const diff = targetTemp - this.batteryTemp;
      this.batteryTemp += diff * 0.04;
      // Add slight micro-fluctuations (0.1°C)
      this.batteryTemp += (Math.random() - 0.5) * 0.1;
    } else {
      // Cool down towards ambient base
      const diff = this.baseTemp - this.batteryTemp;
      this.batteryTemp += diff * 0.05;
    }

    // Determine thermal status
    if (this.batteryTemp >= 43.0) {
      this.thermalStatus = 'SERIOUS';
      this.batteryHealth = 'OVERHEAT';
    } else if (this.batteryTemp >= 39.5) {
      this.thermalStatus = 'FAIR';
      this.batteryHealth = 'GOOD';
    } else {
      this.thermalStatus = 'NOMINAL';
      this.batteryHealth = 'GOOD';
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
      powerSource: this.powerSource
    };
  }
}
