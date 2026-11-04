import React from 'react';
import { X, BookOpen, Cpu, ShieldCheck, Zap, Layers, Server } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-500/30 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-mono">
                System Engineering & Throttling Specifications
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Architectural breakdown of CPU duty cycles, Android 14 services, and Web3j
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-xs text-slate-300">
          {/* Section 1: Android 14 Foreground Service */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Server className="w-4 h-4" />
              <h4>1. OS Process Survival: Android 14+ Foreground Service</h4>
            </div>
            <p className="leading-relaxed text-slate-400">
              Android aggressively terminates background processes via the Low Memory Killer (LMK) and Doze Mode. To ensure the node operates continuously without eviction:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>
                <strong className="text-slate-100">Foreground Service Type:</strong> We declare <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded">android:foregroundServiceType="dataSync"</code> in accordance with Android 14 (API 34) platform policies.
              </li>
              <li>
                <strong className="text-slate-100">Persistent Notification:</strong> Bound to a dedicated low-importance NotificationChannel. Low importance prevents audible chimes while providing a permanent status anchor that informs the user of real-time hashrate.
              </li>
              <li>
                <strong className="text-slate-100">Partial WakeLock:</strong> Acquired with <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded">PowerManager.PARTIAL_WAKE_LOCK</code> with safe multi-hour timeout to allow cryptographic chunk processing when screen is off, while automatically releasing on service termination.
              </li>
            </ul>
          </div>

          {/* Section 2: Mathematical CPU Duty Cycle Throttling */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Cpu className="w-4 h-4" />
              <h4>2. Mathematical CPU Throttling (Strictly &lt; 50% CPU Cap)</h4>
            </div>
            <p className="leading-relaxed text-slate-400">
              Unlike gaming apps or runaway miners that cause thermal runaway, this node enforces two strict system constraints:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-amber-300 font-bold block mb-1">A. Core Allocation Cap</span>
                <p className="text-[11px] text-slate-400">
                  Worker threads are capped at <code className="text-cyan-300">max(1, Available Cores / 2)</code>. On an 8-core CPU (e.g., Snapdragon 8 Gen 2), exactly 4 worker threads run, leaving the remaining cores completely open for the Android UI and system threads.
                </p>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-amber-300 font-bold block mb-1">B. Cyclic Duty-Cycle Yield</span>
                <p className="text-[11px] text-slate-400">
                  Every worker runs within a 100ms periodic window:
                  <br />• <strong>15% Power:</strong> 15ms compute, 85ms coroutine delay.
                  <br />• <strong>30% Power:</strong> 30ms compute, 70ms coroutine delay.
                  <br />• <strong>45% Power:</strong> 45ms compute, 55ms coroutine delay (strictly &lt; 50%).
                </p>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              The <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">delay(sleepMs)</code> suspends the coroutine, freeing the kernel thread and dropping the CPU instruction pipeline into an idle state.
            </p>
          </div>

          {/* Section 3: Hardware Thermal Protection */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <h4>3. Thermal Watchdog & Battery Safeguards</h4>
            </div>
            <p className="leading-relaxed text-slate-400">
              The application listens to system hardware states via two mechanisms:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>
                <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">Intent.ACTION_BATTERY_CHANGED</code>: Monitors battery temperature in tenths of a degree Celsius and checks battery health flags.
              </li>
              <li>
                <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">PowerManager.OnThermalStatusChangedListener</code> (Android 10+): Triggers if the system reports <code className="text-rose-300">THERMAL_STATUS_SEVERE</code> or higher.
              </li>
              <li>
                <strong className="text-slate-100">Automatic Cooling Back-off:</strong> If temperature exceeds 42.0°C, the compute engine immediately introduces an extended 1500ms cooling delay until temperature returns below 39.0°C.
              </li>
            </ul>
          </div>

          {/* Section 4: Web3j Layer & Gas Economics */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <Layers className="w-4 h-4" />
              <h4>4. Web3 / MetaMask Layer-2 Token Withdrawals</h4>
            </div>
            <p className="leading-relaxed text-slate-400">
              To allow users to withdraw their earned tokens without spending $15+ in Ethereum L1 gas fees:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>
                <strong className="text-slate-100">Polygon PoS (Chain ID 137):</strong> Utilizes EIP-1559 transaction fees (Base Fee + Max Priority Fee). Typical withdrawal gas costs less than $0.003 USD.
              </li>
              <li>
                <strong className="text-slate-100">BNB Smart Chain (Chain ID 56):</strong> 3 Gwei gas price ensures standard BEP-20 transfers finalize in 3 seconds for under $0.02 USD.
              </li>
              <li>
                <strong className="text-slate-100">Web3j ABI Encoding:</strong> Encodes the ERC-20 method <code className="text-purple-300 bg-slate-900 px-1 py-0.5 rounded">transfer(address to, uint256 amount)</code> using 4-byte selector <code className="text-purple-300 bg-slate-900 px-1 py-0.5 rounded">0xa9059cbb</code>, signs the raw transaction offline, broadcasts it via JSON-RPC, and polls with a 60-second receipt processor.
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold transition-colors"
          >
            Close Specifications
          </button>
        </div>
      </div>
    </div>
  );
};
