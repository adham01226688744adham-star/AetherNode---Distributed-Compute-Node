import React from 'react';
import { Cpu, Thermometer, BatteryCharging, Battery, AlertTriangle, CheckCircle2, Flame, ShieldAlert, RotateCcw } from 'lucide-react';
import { HardwareTelemetryData } from '../types/node';

interface HardwareTelemetryProps {
  telemetry: HardwareTelemetryData;
  onSimulateHeatSpike?: (spike: boolean) => void;
  isSimulatingHeat?: boolean;
}

export const HardwareTelemetry: React.FC<HardwareTelemetryProps> = ({
  telemetry,
  onSimulateHeatSpike,
  isSimulatingHeat
}) => {
  const getTempColor = (celsius: number) => {
    if (celsius >= 42.0) return 'text-rose-400 border-rose-500/40 bg-rose-950/30';
    if (celsius >= 38.0) return 'text-amber-400 border-amber-500/40 bg-amber-950/30';
    return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
  };

  const getThermalBadge = (status: HardwareTelemetryData['thermalStatus']) => {
    switch (status) {
      case 'CRITICAL':
      case 'SERIOUS':
        return {
          label: status,
          className: 'bg-rose-950/80 text-rose-300 border-rose-500/50',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
        };
      case 'FAIR':
        return {
          label: 'ELEVATED (FAIR)',
          className: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        };
      case 'NOMINAL':
      default:
        return {
          label: 'NOMINAL (OPTIMAL)',
          className: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        };
    }
  };

  const thermalInfo = getThermalBadge(telemetry.thermalStatus);

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs uppercase font-mono tracking-wider text-slate-300 font-bold">
            Hardware & Thermal Telemetry Subsystem (مراقبة المعالج والحرارة)
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {onSimulateHeatSpike && (
            <button
              onClick={() => onSimulateHeatSpike(!isSimulatingHeat)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono border transition-all ${
                isSimulatingHeat
                  ? 'bg-rose-950/90 text-rose-300 border-rose-500/50 font-bold'
                  : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-amber-300'
              }`}
              title="Test the emergency thermal shutdown and automatic cooling resumption"
            >
              <Flame className="w-3 h-3 text-rose-400" />
              <span>{isSimulatingHeat ? 'إلغاء اختبار الحرارة' : 'اختبار الحماية الحرارية (44°C)'}</span>
            </button>
          )}

          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono border font-semibold ${thermalInfo.className}`}>
            {thermalInfo.icon}
            <span>{thermalInfo.label}</span>
          </div>
        </div>
      </div>

      {/* Emergency Thermal Pause Alert Banner */}
      {telemetry.isThermalPaused && (
        <div className="mb-4 p-3.5 rounded-lg bg-rose-950/60 border border-rose-500/60 flex items-start gap-3 text-xs font-mono animate-pulse">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="text-rose-200 font-bold block mb-0.5">
              ⚠️ تنبيه أمان: تم إيقاف المعالجة والتعدين تلقائيًا بسبب ارتفاع الحرارة!
            </span>
            <p className="text-rose-300/90 text-[11px]">
              {telemetry.thermalPauseReason || `الحرارة الحالية (${telemetry.cpuTemperature}°C) تجاوزت حد الأمان (43.0°C). ستستأنف الخدمة العمل تلقائيًا بمجرد انخفاض الحرارة دون 38.5°C.`}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Core Allocation & Thread Cap */}
        <div className="bg-slate-950/50 border border-slate-800/60 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>ACTIVE THREADS</span>
            <span className="text-[10px] text-cyan-400 font-bold">CORES / 2 LIMIT</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {telemetry.activeThreads}
            </span>
            <span className="text-xs font-mono text-slate-500">
              / {telemetry.availableCores} Cores Available
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-1">
            {Array.from({ length: telemetry.availableCores }).map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-xs transition-colors ${
                  i < telemetry.activeThreads
                    ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                    : 'bg-slate-800'
                }`}
                title={`Core ${i + 1}: ${i < telemetry.activeThreads ? 'Allocated Coroutine Worker' : 'Idle Reserved for OS'}`}
              />
            ))}
          </div>
          <p className="text-[10px] font-mono text-slate-500 mt-2">
            محدد لمنع تعليق النظام أو بطء الواجهة
          </p>
        </div>

        {/* Temperature & Thermal Status */}
        <div className="bg-slate-950/50 border border-slate-800/60 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>CPU / BATTERY TEMP</span>
            <Thermometer className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {telemetry.cpuTemperature.toFixed(1)}°C
            </span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${getTempColor(telemetry.cpuTemperature)}`}>
              {telemetry.cpuTemperature < 38 ? 'SAFE AMBIENT' : telemetry.cpuTemperature < 42 ? 'WARM' : 'THROTTLED'}
            </span>
          </div>
          <div className="mt-3 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>حد الإيقاف التلقائي:</span>
            <span className="text-slate-300 font-semibold">43.0°C</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                telemetry.cpuTemperature > 42 ? 'bg-rose-500' : telemetry.cpuTemperature > 38 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, ((telemetry.cpuTemperature - 25) / 25) * 100))}%` }}
            />
          </div>
        </div>

        {/* Battery Health & Charge Status */}
        <div className="bg-slate-950/50 border border-slate-800/60 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>BATTERY STATUS</span>
            {telemetry.isCharging ? (
              <BatteryCharging className="w-4 h-4 text-emerald-400 animate-pulse" />
            ) : (
              <Battery className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {telemetry.batteryLevel}%
            </span>
            <span className="text-xs font-mono text-emerald-400 font-medium">
              {telemetry.isCharging ? 'AC Powered (شاحن)' : 'Discharging (بطارية)'}
            </span>
          </div>
          <div className="mt-3 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>حالة البطارية:</span>
            <span className="text-emerald-400 font-semibold">{telemetry.batteryHealth}</span>
          </div>
          <p className="text-[10px] font-mono text-slate-500 mt-1">
            Intent.ACTION_BATTERY_CHANGED
          </p>
        </div>

        {/* Throttled Duty Cycle Breakdown */}
        <div className="bg-slate-950/50 border border-slate-800/60 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>DUTY CYCLE REGULATION</span>
            <span className="text-[10px] text-amber-400 font-semibold">{telemetry.cpuThrottlePct}% BUDGET</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {telemetry.dutyActiveMs}ms
            </span>
            <span className="text-xs font-mono text-slate-500">
              Work / {telemetry.dutySleepMs}ms Sleep
            </span>
          </div>
          <div className="mt-2.5 flex h-2 rounded overflow-hidden">
            <div
              className="bg-amber-400 transition-all duration-300"
              style={{ width: `${telemetry.dutyActiveMs}%` }}
              title={`Active compute work: ${telemetry.dutyActiveMs}ms`}
            />
            <div
              className="bg-emerald-600/40 transition-all duration-300"
              style={{ width: `${telemetry.dutySleepMs}%` }}
              title={`Yield sleep delay: ${telemetry.dutySleepMs}ms`}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2">
            <span className="text-amber-400 font-medium">Compute: {telemetry.dutyActiveMs}%</span>
            <span className="text-emerald-400 font-medium">Forced Idle: {telemetry.dutySleepMs}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
