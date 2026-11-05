import React, { useState } from 'react';
import {
  Code2,
  Package,
  Download,
  Copy,
  Check,
  Search,
  FileCode,
  Terminal,
  ShieldCheck,
  BookOpen,
  Smartphone
} from 'lucide-react';
import JSZip from 'jszip';
import { ANDROID_SOURCE_FILES } from '../data/androidSourceFiles';

export const DeveloperHubView: React.FC = () => {
  const [selectedFileId, setSelectedFileId] = useState<string>(ANDROID_SOURCE_FILES[0].id);
  const [copiedFile, setCopiedFile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isZipping, setIsZipping] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const currentFile = ANDROID_SOURCE_FILES.find((f) => f.id === selectedFileId) || ANDROID_SOURCE_FILES[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const copyCommand = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleDownloadAllZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const appFolder = zip.folder('AetherNode-Android-Client');
      const srcFolder = appFolder?.folder('app/src/main/java/com/aethernode/client');

      ANDROID_SOURCE_FILES.forEach((file) => {
        if (file.filename === 'AndroidManifest.xml') {
          appFolder?.file('app/src/main/AndroidManifest.xml', file.content);
        } else if (file.filename === 'build.gradle.kts') {
          appFolder?.file('app/build.gradle.kts', file.content);
        } else if (file.filename === 'ComputeForegroundService.kt') {
          srcFolder?.folder('service')?.file('ComputeForegroundService.kt', file.content);
        } else if (file.filename === 'CryptoComputeEngine.kt') {
          srcFolder?.folder('computation')?.file('CryptoComputeEngine.kt', file.content);
        } else if (file.filename === 'SystemHardwareMonitor.kt') {
          srcFolder?.folder('hardware')?.file('SystemHardwareMonitor.kt', file.content);
        } else if (file.filename === 'ThermalProtectionWatchdog.kt') {
          srcFolder?.folder('hardware')?.file('ThermalProtectionWatchdog.kt', file.content);
        } else if (file.filename === 'MiningPoolClient.kt') {
          srcFolder?.folder('stratum')?.file('MiningPoolClient.kt', file.content);
        } else if (file.filename === 'Web3TransferManager.kt') {
          srcFolder?.folder('web3')?.file('Web3TransferManager.kt', file.content);
        } else if (file.filename === 'Web3SecurityVault.kt') {
          srcFolder?.folder('web3')?.file('Web3SecurityVault.kt', file.content);
        } else if (file.filename === 'ComputeDashboardUi.kt') {
          srcFolder?.folder('ui')?.file('ComputeDashboardUi.kt', file.content);
        } else if (file.filename === 'README-APK-BUILD.md') {
          appFolder?.file('README-APK-BUILD.md', file.content);
        }
      });

      appFolder?.file('settings.gradle.kts', `rootProject.name = "AetherNode"\ninclude(":app")\n`);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'AetherNode-Android-Full-Project.zip';
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

  const lines = currentFile.content.split('\n');
  const filteredLines = searchQuery
    ? lines
        .map((line, index) => ({ line, originalIndex: index + 1 }))
        .filter((item) => item.line.toLowerCase().includes(searchQuery.toLowerCase()))
    : lines.map((line, index) => ({ line, originalIndex: index + 1 }));

  return (
    <div className="space-y-6 font-mono text-slate-200">
      {/* Top Banner: APK & Build Center */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-slate-100">
                مركز تجميع وتثبيت تطبيق الأندرويد (APK Build Center)
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              مشروع Android Studio متكامل قابل للبناء المباشر بصيغة APK مع دعم Android 14+ (API 34)
            </p>
          </div>

          <button
            onClick={handleDownloadAllZip}
            disabled={isZipping}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>{isZipping ? 'جاري تحزيم المشروع...' : 'تنزيل المشروع كاملاً (.zip لـ Android Studio)'}</span>
          </button>
        </div>

        {/* Quick CLI Commands */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>أمر تجميع APK التجريبي (Debug APK):</span>
              <button
                onClick={() => copyCommand('./gradlew assembleDebug', 'debug')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                {copiedCmd === 'debug' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCmd === 'debug' ? 'تم النسخ' : 'نسخ'}</span>
              </button>
            </div>
            <div className="bg-slate-900 p-2 rounded text-emerald-300 font-mono text-[11px] select-all">
              ./gradlew assembleDebug
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>تثبيت مباشر بالهاتف عبر USB (ADB):</span>
              <button
                onClick={() => copyCommand('adb install -r app/build/outputs/apk/debug/app-debug.apk', 'adb')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                {copiedCmd === 'adb' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCmd === 'adb' ? 'تم النسخ' : 'نسخ'}</span>
              </button>
            </div>
            <div className="bg-slate-900 p-2 rounded text-cyan-300 font-mono text-[11px] select-all">
              adb install -r app/build/outputs/apk/debug/app-debug.apk
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Code Inspector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[700px]">
        {/* Files Explorer Bar */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-950 border-b border-slate-800 overflow-x-auto scrollbar-none">
          {ANDROID_SOURCE_FILES.map((file) => {
            const isSelected = file.id === selectedFileId;
            return (
              <button
                key={file.id}
                onClick={() => {
                  setSelectedFileId(file.id);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-slate-800 text-cyan-300 border-cyan-500/40 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{file.filename}</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-slate-900 text-slate-500 border border-slate-800">
                  {file.category}
                </span>
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
          <div className="text-slate-300 truncate max-w-lg">
            <span className="text-slate-500">الوصف: </span>
            <span>{currentFile.description}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="بحث داخل الملف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-md pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-44"
              />
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors border border-slate-700"
            >
              {copiedFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFile ? 'تم النسخ' : 'نسخ الكود'}</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto bg-[#080b11] p-4 font-mono text-xs select-text">
          <pre className="text-slate-200 leading-relaxed">
            {filteredLines.map(({ line, originalIndex }) => (
              <div key={originalIndex} className="flex hover:bg-slate-900/50 py-0.5 rounded px-1">
                <span className="text-slate-600 select-none w-10 text-right pr-4 shrink-0">
                  {originalIndex}
                </span>
                <span className="break-all whitespace-pre-wrap flex-1">{line}</span>
              </div>
            ))}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-5 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>اللغة: {currentFile.language.toUpperCase()} | متوافق مع Android 14</span>
          <span>إجمالي الملفات البرمجية المتاحة: {ANDROID_SOURCE_FILES.length} ملفات أصلية</span>
        </div>
      </div>
    </div>
  );
};
