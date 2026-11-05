import React, { useState } from 'react';
import { X, Package, Download, Terminal, CheckCircle2, ShieldCheck, Cpu, Smartphone, Copy, Check } from 'lucide-react';
import JSZip from 'jszip';
import { ANDROID_SOURCE_FILES } from '../data/androidSourceFiles';

interface ApkBuildModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkBuildModal: React.FC<ApkBuildModalProps> = ({ isOpen, onClose }) => {
  const [isZipping, setIsZipping] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCommand = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleDownloadCompleteProject = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const root = zip.folder('AetherNode-Android');

      // Top-level files
      root?.file('settings.gradle.kts', `rootProject.name = "AetherNode"\ninclude(":app")\n`);
      root?.file(
        'build.gradle.kts',
        `plugins {\n    alias(libs.plugins.android.application) apply false\n    alias(libs.plugins.kotlin.android) apply false\n    alias(libs.plugins.kotlin.compose) apply false\n}\n`
      );

      // App module
      const app = root?.folder('app');
      app?.file('build.gradle.kts', ANDROID_SOURCE_FILES.find((f) => f.filename === 'build.gradle.kts')?.content || '');
      app?.file('src/main/AndroidManifest.xml', ANDROID_SOURCE_FILES.find((f) => f.filename === 'AndroidManifest.xml')?.content || '');

      const javaSrc = app?.folder('src/main/java/com/aethernode/client');
      javaSrc?.folder('service')?.file('ComputeForegroundService.kt', ANDROID_SOURCE_FILES.find((f) => f.id === 'service')?.content || '');
      javaSrc?.folder('computation')?.file('CryptoComputeEngine.kt', ANDROID_SOURCE_FILES.find((f) => f.id === 'crypto')?.content || '');
      javaSrc?.folder('hardware')?.file('SystemHardwareMonitor.kt', ANDROID_SOURCE_FILES.find((f) => f.id === 'hardware')?.content || '');
      javaSrc?.folder('hardware')?.file('ThermalProtectionWatchdog.kt', ANDROID_SOURCE_FILES.find((f) => f.id === 'thermal_watchdog')?.content || '');
      javaSrc?.folder('stratum')?.file('MiningPoolClient.kt', ANDROID_SOURCE_FILES.find((f) => f.id === 'stratum')?.content || '');
      javaSrc?.folder('web3')?.file('Web3TransferManager.kt', ANDROID_SOURCE_FILES.find((f) => f.id === 'web3')?.content || '');
      javaSrc?.folder('web3')?.file('Web3SecurityVault.kt', ANDROID_SOURCE_FILES.find((f) => f.id === 'web3_vault')?.content || '');
      javaSrc?.folder('ui')?.file('ComputeDashboardUi.kt', ANDROID_SOURCE_FILES.find((f) => f.id === 'ui')?.content || '');

      // Build documentation
      root?.file('README-APK-BUILD.md', ANDROID_SOURCE_FILES.find((f) => f.id === 'apk_guide')?.content || '');

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'AetherNode-Android-APK-Source-Bundle.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">
                  APK Compilation & Installation Center
                </h3>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                  تجهيز نسخة APK
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ready-to-compile Gradle project for Android Studio / CLI Build
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
          {/* APK Specification Card */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-slate-200 font-bold border-b border-slate-800/80 pb-2">
              <span className="flex items-center gap-2 text-emerald-400">
                <Smartphone className="w-4 h-4" />
                Target Artifact Specifications
              </span>
              <span className="text-[11px] text-slate-400">Release Target 1.0.4</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">OUTPUT ARTIFACT</span>
                <span className="text-emerald-300 font-bold">app-debug.apk</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">MIN SDK / TARGET</span>
                <span className="text-slate-200 font-bold">SDK 26 / 34 (A14)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">ARCHITECTURE</span>
                <span className="text-cyan-300 font-bold">ARM64-v8a / x86_64</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">PROGUARD / R8</span>
                <span className="text-amber-300 font-bold">Shrinking Enabled</span>
              </div>
            </div>
          </div>

          {/* Quick Build Commands */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-cyan-400" />
              1-Command Build & Direct Installation
            </h4>

            {/* Assemble Debug Command */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>1. Compile installable Debug APK:</span>
                <button
                  onClick={() => copyCommand('./gradlew assembleDebug', 'debug')}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                >
                  {copiedCmd === 'debug' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCmd === 'debug' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="bg-slate-900 p-2.5 rounded font-mono text-emerald-300 text-xs select-all">
                ./gradlew assembleDebug
              </div>
              <p className="text-[10px] text-slate-500">
                Generates <code className="text-slate-300">app/build/outputs/apk/debug/app-debug.apk</code>.
              </p>
            </div>

            {/* Direct USB Install Command */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>2. Install to connected Android phone via ADB:</span>
                <button
                  onClick={() => copyCommand('adb install -r app/build/outputs/apk/debug/app-debug.apk', 'adb')}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                >
                  {copiedCmd === 'adb' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCmd === 'adb' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="bg-slate-900 p-2.5 rounded font-mono text-cyan-300 text-xs select-all">
                adb install -r app/build/outputs/apk/debug/app-debug.apk
              </div>
            </div>
          </div>

          {/* Android Studio Import Steps */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="text-slate-200 font-bold block">
              How to Open in Android Studio:
            </span>
            <ol className="list-decimal pl-5 space-y-1.5 text-slate-400 text-[11px]">
              <li>Click <strong>Download Android Project (.zip)</strong> below.</li>
              <li>Extract the zip folder to your computer.</li>
              <li>Open Android Studio $\rightarrow$ <strong>File $\rightarrow$ Open</strong> $\rightarrow$ Select the extracted folder.</li>
              <li>Wait for Gradle Sync to complete (uses JDK 17).</li>
              <li>Click the green <strong>Run (Play)</strong> icon or execute <strong>Build $\rightarrow$ Build APK(s)</strong>.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400">
            Includes all Kotlin, Stratum, Thermal, Web3, and Compose files.
          </div>
          <button
            onClick={handleDownloadCompleteProject}
            disabled={isZipping}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <Download className="w-4 h-4" />
            <span>{isZipping ? 'Generating Zip...' : 'Download Android Studio Project (.zip)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
