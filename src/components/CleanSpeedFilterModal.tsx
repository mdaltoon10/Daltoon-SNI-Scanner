import React, { useState, useMemo, useEffect } from 'react';
import { SniScanResult, ParsedProxyConfig } from '../types';
import { injectSniIntoConfig, generateMultiFormatConfigs } from '../utils/configParser';
import {
  Sparkles,
  Zap,
  ArrowDownCircle,
  ArrowUpCircle,
  Copy,
  Check,
  Download,
  CheckCircle2,
  Filter,
  Layers,
  Cpu,
  Gauge,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Save,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { CyberSelect, SelectOption } from './CyberSelect';

interface CleanSpeedFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: SniScanResult[];
  parsedConfig: ParsedProxyConfig | null;
  rawConfig: string;
  onApplySniToConfig: (sni: string) => void;
  onTestWithXray?: (sni: string) => void;
  onOpenSpeedTest: (sni: string) => void;
  onExportSnis: (snis: SniScanResult[], format: 'txt' | 'json' | 'vless') => void;
  lang: 'fa' | 'en';
}

const STORAGE_KEY = 'sni_speed_filter_prefs_v1';

export function CleanSpeedFilterModal({
  isOpen,
  onClose,
  results,
  parsedConfig,
  rawConfig,
  onApplySniToConfig,
  onTestWithXray,
  onOpenSpeedTest,
  onExportSnis,
  lang
}: CleanSpeedFilterModalProps) {
  // Load saved preferences or defaults
  const [minDownloadMbps, setMinDownloadMbps] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.minDownloadMbps === 'number') return parsed.minDownloadMbps;
      }
    } catch {}
    return 3.0;
  });

  const [minUploadMbps, setMinUploadMbps] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.minUploadMbps === 'number') return parsed.minUploadMbps;
      }
    } catch {}
    return 1.0;
  });

  const [maxPingMs, setMaxPingMs] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.maxPingMs === 'number') return parsed.maxPingMs;
      }
    } catch {}
    return 300;
  });

  const [requireBoth, setRequireBoth] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'download' | 'upload' | 'ping'>('download');
  const [showFilters, setShowFilters] = useState<boolean>(true);
  const [saveToast, setSaveToast] = useState<boolean>(false);

  // Auto-save thresholds to localStorage whenever changed
  const handleSavePreferences = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          minDownloadMbps,
          minUploadMbps,
          maxPingMs,
          sortBy
        })
      );
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2000);
    } catch (e) {
      console.error('Failed to save filter preferences', e);
    }
  };

  // Filter clean tested SNIs that meet user-defined download/upload limits
  const qualifiedList = useMemo(() => {
    return results
      .filter((r) => {
        if (r.status === 'IDLE' || r.status === 'TESTING' || r.status === 'BLOCKED' || r.status === 'TIMEOUT') return false;

        const dl = r.downloadSpeed || 0;
        const up = r.uploadSpeed || 0;
        const p = r.ping || 9999;

        if (p > maxPingMs) return false;

        if (requireBoth) {
          return dl >= minDownloadMbps && up >= minUploadMbps;
        } else {
          return dl >= minDownloadMbps || up >= minUploadMbps;
        }
      })
      .sort((a, b) => {
        if (sortBy === 'download') {
          return (b.downloadSpeed || 0) - (a.downloadSpeed || 0);
        } else if (sortBy === 'upload') {
          return (b.uploadSpeed || 0) - (a.uploadSpeed || 0);
        } else {
          return (a.ping || 9999) - (b.ping || 9999);
        }
      });
  }, [results, minDownloadMbps, minUploadMbps, maxPingMs, requireBoth, sortBy]);

  if (!isOpen) return null;

  const handleCopyConfig = (domain: string, id: string) => {
    const configToCopy = parsedConfig
      ? injectSniIntoConfig(parsedConfig, domain)
      : `vless://8e93d46e-96fe-4ae9-91a6-97893991db03@matin.daltoonserver.ir:23614?security=&encryption=none&host=${domain}&headerType=http&type=tcp#Host-${domain}`;

    navigator.clipboard.writeText(configToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleBatchCopyAllConfigs = () => {
    if (qualifiedList.length === 0) return;
    const all = qualifiedList
      .map((item) => {
        if (parsedConfig) {
          return injectSniIntoConfig(parsedConfig, item.domain);
        }
        return `vless://8e93d46e-96fe-4ae9-91a6-97893991db03@matin.daltoonserver.ir:23614?security=&encryption=none&host=${item.domain}&headerType=http&type=tcp#Host-${item.domain}`;
      })
      .join('\n');

    navigator.clipboard.writeText(all);
    setCopiedId('ALL_BATCH');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const sortOptions: SelectOption<'download' | 'upload' | 'ping'>[] = [
    { value: 'download', label: lang === 'fa' ? 'بیشترین دانلود' : 'Top Download', badge: 'Download' },
    { value: 'upload', label: lang === 'fa' ? 'بیشترین آپلود' : 'Top Upload', badge: 'Upload' },
    { value: 'ping', label: lang === 'fa' ? 'کمترین پینگ' : 'Lowest Ping', badge: 'Ping' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md font-mono animate-fadeIn select-text overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#0D0F16] border border-cyan-500/40 rounded-2xl shadow-[0_0_60px_rgba(6,182,212,0.25)] flex flex-col my-auto max-h-[92vh] sm:max-h-[90vh] overflow-hidden">
        
        {/* Header - Fixed at Top */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-cyan-900/40 bg-gradient-to-r from-[#090B10] via-[#101422] to-[#090B10] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-600/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                  {lang === 'fa'
                    ? 'لیست دامنه‌های سالم و تنظیم سرعت دانلود/آپلود'
                    : 'Clean Domains & Speed Filter'}
                </h3>
                <span className="text-[11px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-700/80 px-2 py-0.5 rounded-full font-bold">
                  {qualifiedList.length} {lang === 'fa' ? 'مورد سالم' : 'Qualified'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate hidden sm:block">
                {lang === 'fa'
                  ? 'فیلتر هوشمند دامنه‌هایی با سرعت دانلود و آپلود واقعی و بدون اختلال'
                  : 'Instant list of domains passing live throughput benchmarks'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-1.5 px-2.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500 text-xs text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              title={lang === 'fa' ? 'تغییر تنظیمات فیلتر' : 'Toggle Filters'}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">{lang === 'fa' ? 'تنظیم حد نصاب' : 'Filter Limits'}</span>
              {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Container covering both Filter and Results */}
        <div className="flex-1 overflow-y-auto overscroll-contain min-h-0 flex flex-col">
          
          {/* Collapsible Thresholds Control Box */}
          {showFilters && (
            <div className="p-3 sm:p-4 border-b border-slate-800/90 bg-[#080A10] shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{lang === 'fa' ? 'تعیین حداقل سرعت مجاز (دانلود، آپلود، پینگ):' : 'Speed & Latency Thresholds:'}</span>
                </div>

                <button
                  onClick={handleSavePreferences}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-700 text-[11px] text-cyan-300 hover:text-white font-semibold transition-all cursor-pointer"
                >
                  {saveToast ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-300">{lang === 'fa' ? 'ذخیره شد!' : 'Saved!'}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3" />
                      <span>{lang === 'fa' ? 'ذخیره تنظیمات' : 'Save Defaults'}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Min Download Slider */}
                <div className="bg-[#121622] p-3 rounded-xl border border-slate-700/80 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <ArrowDownCircle className="w-3.5 h-3.5 text-emerald-400" />
                      {lang === 'fa' ? 'حداقل دانلود:' : 'Min Download:'}
                    </span>
                    <span className="text-emerald-400 font-bold font-mono text-sm bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-700/50">
                      {minDownloadMbps} Mbps
                    </span>
                  </div>

                  <div className="pt-1 pb-1" dir="ltr">
                    <input
                      type="range"
                      min="0.5"
                      max="50"
                      step="0.5"
                      value={minDownloadMbps}
                      onChange={(e) => setMinDownloadMbps(Number(e.target.value))}
                      className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                    />

                    <div className="relative h-4 mt-1 text-[9px] text-slate-500 font-mono select-none">
                      <span className="absolute left-0 transform">0.5M</span>
                      <span
                        className={`absolute -translate-x-1/2 cursor-pointer transition-colors ${
                          minDownloadMbps >= 10 ? 'text-emerald-400 font-bold' : 'hover:text-slate-300'
                        }`}
                        style={{ left: `${((10 - 0.5) / 49.5) * 100}%` }}
                        onClick={() => setMinDownloadMbps(10)}
                      >
                        10M
                      </span>
                      <span
                        className={`absolute -translate-x-1/2 cursor-pointer transition-colors ${
                          minDownloadMbps >= 25 ? 'text-emerald-400 font-bold' : 'hover:text-slate-300'
                        }`}
                        style={{ left: `${((25 - 0.5) / 49.5) * 100}%` }}
                        onClick={() => setMinDownloadMbps(25)}
                      >
                        25M
                      </span>
                      <span className="absolute right-0 transform">50M</span>
                    </div>
                  </div>
                </div>

                {/* 2. Min Upload Slider */}
                <div className="bg-[#121622] p-3 rounded-xl border border-slate-700/80 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <ArrowUpCircle className="w-3.5 h-3.5 text-cyan-400" />
                      {lang === 'fa' ? 'حداقل آپلود:' : 'Min Upload:'}
                    </span>
                    <span className="text-cyan-400 font-bold font-mono text-sm bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-700/50">
                      {minUploadMbps} Mbps
                    </span>
                  </div>

                  <div className="pt-1 pb-1" dir="ltr">
                    <input
                      type="range"
                      min="0.2"
                      max="20"
                      step="0.2"
                      value={minUploadMbps}
                      onChange={(e) => setMinUploadMbps(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                    />

                    <div className="relative h-4 mt-1 text-[9px] text-slate-500 font-mono select-none">
                      <span className="absolute left-0 transform">0.2M</span>
                      <span
                        className={`absolute -translate-x-1/2 cursor-pointer transition-colors ${
                          minUploadMbps >= 5 ? 'text-cyan-400 font-bold' : 'hover:text-slate-300'
                        }`}
                        style={{ left: `${((5 - 0.2) / 19.8) * 100}%` }}
                        onClick={() => setMinUploadMbps(5)}
                      >
                        5M
                      </span>
                      <span
                        className={`absolute -translate-x-1/2 cursor-pointer transition-colors ${
                          minUploadMbps >= 10 ? 'text-cyan-400 font-bold' : 'hover:text-slate-300'
                        }`}
                        style={{ left: `${((10 - 0.2) / 19.8) * 100}%` }}
                        onClick={() => setMinUploadMbps(10)}
                      >
                        10M
                      </span>
                      <span className="absolute right-0 transform">20M</span>
                    </div>
                  </div>
                </div>

                {/* 3. Max Ping Slider */}
                <div className="bg-[#121622] p-3 rounded-xl border border-slate-700/80 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-yellow-400" />
                      {lang === 'fa' ? 'حداکثر پینگ مجاز:' : 'Max Latency:'}
                    </span>
                    <span className="text-yellow-400 font-bold font-mono text-sm bg-yellow-950/60 px-2 py-0.5 rounded border border-yellow-700/50">
                      {maxPingMs} ms
                    </span>
                  </div>

                  <div className="pt-1 pb-1" dir="ltr">
                    <input
                      type="range"
                      min="50"
                      max="600"
                      step="25"
                      value={maxPingMs}
                      onChange={(e) => setMaxPingMs(Number(e.target.value))}
                      className="w-full accent-yellow-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                    />

                    <div className="relative h-4 mt-1 text-[9px] text-slate-500 font-mono select-none">
                      <span className="absolute left-0 transform">50ms</span>
                      <span
                        className={`absolute -translate-x-1/2 cursor-pointer transition-colors ${
                          maxPingMs <= 200 ? 'text-yellow-400 font-bold' : 'hover:text-slate-300'
                        }`}
                        style={{ left: `${((200 - 50) / 550) * 100}%` }}
                        onClick={() => setMaxPingMs(200)}
                      >
                        200ms
                      </span>
                      <span
                        className={`absolute -translate-x-1/2 cursor-pointer transition-colors ${
                          maxPingMs <= 400 ? 'text-yellow-400 font-bold' : 'hover:text-slate-300'
                        }`}
                        style={{ left: `${((400 - 50) / 550) * 100}%` }}
                        onClick={() => setMaxPingMs(400)}
                      >
                        400ms
                      </span>
                      <span className="absolute right-0 transform">600ms</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Presets & Sort Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-400 text-[11px]">{lang === 'fa' ? 'پروفایل‌های آماده:' : 'Presets:'}</span>
                  <button
                    onClick={() => {
                      setMinDownloadMbps(1.0);
                      setMinUploadMbps(0.4);
                      setMaxPingMs(400);
                    }}
                    className={`px-2 py-0.5 border rounded text-[11px] cursor-pointer transition-colors ${
                      minDownloadMbps === 1.0 && maxPingMs === 400
                        ? 'bg-cyan-900 border-cyan-500 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {lang === 'fa' ? 'استاندارد (۱M+)' : 'Standard (1M+)'}
                  </button>
                  <button
                    onClick={() => {
                      setMinDownloadMbps(5.0);
                      setMinUploadMbps(2.0);
                      setMaxPingMs(200);
                    }}
                    className={`px-2 py-0.5 border rounded text-[11px] font-semibold cursor-pointer transition-colors ${
                      minDownloadMbps === 5.0 && maxPingMs === 200
                        ? 'bg-cyan-900 border-cyan-400 text-cyan-200'
                        : 'bg-cyan-950/80 border-cyan-800/80 text-cyan-300 hover:bg-cyan-900'
                    }`}
                  >
                    {lang === 'fa' ? '⚡ پرسرعت (۵M+)' : '⚡ Fast (5M+)'}
                  </button>
                  <button
                    onClick={() => {
                      setMinDownloadMbps(15.0);
                      setMinUploadMbps(5.0);
                      setMaxPingMs(120);
                    }}
                    className={`px-2 py-0.5 border rounded text-[11px] font-semibold cursor-pointer transition-colors ${
                      minDownloadMbps === 15.0 && maxPingMs === 120
                        ? 'bg-emerald-900 border-emerald-400 text-emerald-200'
                        : 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300 hover:bg-emerald-900'
                    }`}
                  >
                    {lang === 'fa' ? '🚀 اولترا (۱۵M+)' : '🚀 Ultra (15M+)'}
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[11px]">{lang === 'fa' ? 'مرتب‌سازی:' : 'Sort By:'}</span>
                  <CyberSelect
                    value={sortBy}
                    onChange={(val) => setSortBy(val as any)}
                    options={sortOptions}
                    title={lang === 'fa' ? 'مرتب‌سازی نتایج بر اساس' : 'Sort Results By'}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Results List Section */}
          <div className="p-3 sm:p-4 space-y-2.5">
            {qualifiedList.length === 0 ? (
              <div className="py-10 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                <Filter className="w-8 h-8 text-slate-600" />
                <p className="text-sm font-semibold text-slate-400">
                  {lang === 'fa'
                    ? 'هیچ دامنه‌ای با شرایط انتخابی شما (دانلود/آپلود/پینگ) یافت نشد.'
                    : 'No SNI matches your speed criteria yet.'}
                </p>
                <p className="text-xs text-slate-500 max-w-md">
                  {lang === 'fa'
                    ? 'می‌توانید اسلایدرهای حداقل دانلود یا آپلود را کمی کاهش دهید یا دکمه "شروع اسکن آنلاین" را بزنید تا دامنه‌های بیشتری بنچمارک شوند.'
                    : 'Lower the threshold sliders above or start an active scan to benchmark more endpoints.'}
                </p>
              </div>
            ) : (
              qualifiedList.map((item, index) => {
                const isCopied = copiedId === item.id;
                return (
                  <div
                    key={item.id}
                    className="p-3 bg-[#080A10] hover:bg-[#101422] border border-slate-800/80 hover:border-cyan-500/50 rounded-xl transition-all flex flex-wrap items-center justify-between gap-3 shadow-sm group"
                  >
                    {/* Left: Domain Name & Rank Badge */}
                    <div className="flex items-center gap-2.5 min-w-[200px]">
                      <span className={`w-6 h-6 rounded-full border text-[11px] font-bold flex items-center justify-center shrink-0 ${
                        index === 0
                          ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                          : index === 1
                          ? 'bg-slate-800 border-slate-500 text-slate-200'
                          : index === 2
                          ? 'bg-orange-950/80 border-orange-600 text-orange-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors font-mono truncate max-w-[220px] sm:max-w-xs">
                            {item.domain}
                          </span>
                          <span className="inline-flex items-center gap-0.5 text-[9px] text-green-400 bg-green-950/60 border border-green-800/80 px-1.5 py-0.2 rounded-full font-bold">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            CLEAN
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {item.category} • TLS 1.3 • Jitter: {item.jitter}ms
                        </span>
                      </div>
                    </div>

                    {/* Middle: Performance Badges (Download, Upload, Ping) */}
                    <div className="flex items-center gap-2">
                      {/* Download */}
                      <div className="bg-[#121622] px-2.5 py-1 rounded-lg border border-emerald-900/50 text-right min-w-[75px]">
                        <span className="block text-[8px] text-slate-400 uppercase tracking-wider flex items-center gap-0.5 justify-end">
                          <ArrowDownCircle className="w-2.5 h-2.5 text-emerald-400" />
                          DL
                        </span>
                        <span className="text-xs sm:text-sm text-emerald-400 font-bold font-mono">
                          {item.downloadSpeed} <span className="text-[9px] text-slate-500 font-normal">Mbps</span>
                        </span>
                      </div>

                      {/* Upload */}
                      <div className="bg-[#121622] px-2.5 py-1 rounded-lg border border-cyan-900/50 text-right min-w-[75px]">
                        <span className="block text-[8px] text-slate-400 uppercase tracking-wider flex items-center gap-0.5 justify-end">
                          <ArrowUpCircle className="w-2.5 h-2.5 text-cyan-400" />
                          UL
                        </span>
                        <span className="text-xs sm:text-sm text-cyan-300 font-bold font-mono">
                          {item.uploadSpeed} <span className="text-[9px] text-slate-500 font-normal">Mbps</span>
                        </span>
                      </div>

                      {/* Ping */}
                      <div className="bg-[#121622] px-2.5 py-1 rounded-lg border border-slate-700/80 text-right min-w-[65px]">
                        <span className="block text-[8px] text-slate-400 uppercase tracking-wider flex items-center gap-0.5 justify-end">
                          <Gauge className="w-2.5 h-2.5 text-yellow-400" />
                          Ping
                        </span>
                        <span className="text-xs sm:text-sm text-yellow-400 font-bold font-mono">
                          {item.ping}ms
                        </span>
                      </div>
                    </div>

                    {/* Right: Instant 1-Click Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      {/* Copy Injected Config */}
                      <button
                        onClick={() => handleCopyConfig(item.domain, item.id)}
                        title={lang === 'fa' ? 'کپی کانفیگ با این دامنه' : 'Copy Config with this Domain'}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-400" />
                            <span>{lang === 'fa' ? 'کپی شد!' : 'Copied!'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{lang === 'fa' ? 'کپی' : 'Copy'}</span>
                          </>
                        )}
                      </button>

                      {/* Apply & Generate */}
                      <button
                        onClick={() => {
                          onApplySniToConfig(item.domain);
                          onClose();
                        }}
                        title={lang === 'fa' ? 'اعمال مستقیم به کانفیگ' : 'Apply to Config'}
                        className="p-1.5 rounded-lg bg-[#121622] hover:bg-[#1a2133] border border-slate-700 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
                      >
                        <Zap className="w-4 h-4 text-cyan-400" />
                      </button>

                      {/* Test with Xray */}
                      {onTestWithXray && (
                        <button
                          onClick={() => {
                            onTestWithXray(item.domain);
                            onClose();
                          }}
                          title={lang === 'fa' ? 'تست و اجرا در هسته Xray' : 'Test in Xray Core'}
                          className="p-1.5 rounded-lg bg-purple-950/70 hover:bg-purple-900 border border-purple-800 text-purple-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Cpu className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Actions: Sticky at Bottom */}
        <div className="p-3 sm:p-4 border-t border-slate-800/90 bg-[#090B10] flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="text-xs text-slate-400 hidden sm:block">
            <span>
              {lang === 'fa'
                ? `تعداد ${qualifiedList.length} دامنه با حد نصاب انتخابی شما آماده استفاده است.`
                : `${qualifiedList.length} verified fast endpoints ready.`}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
            {/* Batch Copy All */}
            <button
              onClick={handleBatchCopyAllConfigs}
              disabled={qualifiedList.length === 0}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 border border-cyan-600/80 text-cyan-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md disabled:opacity-40"
            >
              {copiedId === 'ALL_BATCH' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span>{lang === 'fa' ? 'همه کپی شدند!' : 'All Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    {lang === 'fa'
                      ? `کپی یکجای همه (${qualifiedList.length})`
                      : `Copy All (${qualifiedList.length})`}
                  </span>
                </>
              )}
            </button>

            {/* Export as file */}
            <button
              onClick={() => onExportSnis(qualifiedList, 'vless')}
              disabled={qualifiedList.length === 0}
              className="flex items-center gap-1 px-3 py-2 bg-[#121622] hover:bg-[#1a2133] border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">{lang === 'fa' ? 'دانلود فایل' : 'Download'}</span>
            </button>

            {/* Save & Close */}
            <button
              onClick={() => {
                handleSavePreferences();
                onClose();
              }}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium cursor-pointer transition-colors"
            >
              {lang === 'fa' ? 'ذخیره و بستن' : 'Save & Close'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
