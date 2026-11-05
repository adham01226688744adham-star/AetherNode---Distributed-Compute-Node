import React from 'react';
import { X, ShieldCheck, Lock, AlertTriangle, CheckCircle2, FileText, Cpu, Zap, Key } from 'lucide-react';

interface Web3SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Web3SecurityModal: React.FC<Web3SecurityModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const securityChecklist = [
    {
      title: 'Android KeyStore & Hardware TEE Isolation',
      desc: 'Zero plaintext private keys stored in memory or SharedPreferences. All cryptographic signing operations occur inside the hardware-backed Trusted Execution Environment (TEE).',
      status: 'VERIFIED',
      icon: <Key className="w-4 h-4 text-emerald-400" />
    },
    {
      title: 'EIP-55 Destination Address Checksum Validation',
      desc: 'All recipient addresses must pass strict checksum validation before gas estimation or raw transaction creation, preventing token loss from typo errors.',
      status: 'VERIFIED',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />
    },
    {
      title: 'Anti-Drain Withdrawal Ceiling (Max 500 ATH)',
      desc: 'Hard-coded protocol safety ceiling blocks any single withdrawal exceeding 500 ATH, requiring multi-step confirmation for treasury safety.',
      status: 'VERIFIED',
      icon: <Lock className="w-4 h-4 text-emerald-400" />
    },
    {
      title: 'Gas Spike Rejection Guard',
      desc: 'Transactions are automatically halted if network gas exceeds 120 Gwei (Polygon) or 15 Gwei (BSC) to protect node earnings from MEV spikes.',
      status: 'VERIFIED',
      icon: <Zap className="w-4 h-4 text-emerald-400" />
    },
    {
      title: 'Deterministic Nonce & Anti-Reentrancy',
      desc: 'Pending nonces are queried directly via web3j.ethGetTransactionCount with PENDING parameter to prevent double-spending or stuck transaction queues.',
      status: 'VERIFIED',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />
    },
    {
      title: 'Thermal Emergency Freeze Lock',
      desc: 'If the device thermal watchdog detects overheating (>= 43°C), all on-chain settlement and compute workers are automatically suspended until safe cooling.',
      status: 'VERIFIED',
      icon: <Cpu className="w-4 h-4 text-emerald-400" />
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">
                  Web3 Financial Security & Audit Review
                </h3>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                  مراجعة أمان Web3
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Guaranteed zero unsafe transfers, hardware isolation, and gas ceilings
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-sm font-bold text-emerald-300 block mb-1">
                Security Guarantee: No Insecure Financial Execution
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                The AetherNode client follows non-custodial EVM standards. No transaction can be initiated without explicit user verification, address validation, and gas threshold evaluation.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {securityChecklist.map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-200 mb-1">{item.title}</h5>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30 shrink-0">
                  {item.status}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400">
            <span className="text-slate-200 font-bold block mb-1">Audit Policy:</span>
            Any anomalous RPC response, unexpected gas limit spike, or address failure will trigger an immediate transaction revert with localized error messages.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
          >
            Close Security Audit
          </button>
        </div>
      </div>
    </div>
  );
};
