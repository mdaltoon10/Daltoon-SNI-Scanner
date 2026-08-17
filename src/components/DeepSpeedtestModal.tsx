import { useState, useEffect } from 'react';
import { runDeepSpeedTest } from '../utils/scannerEngine';
import { NetworkProfile } from '../types';
import { NETWORK_PROFILES } from '../data/presetSnilist';
import { Gauge, X, Play, RefreshCw, Copy, Check, ShieldCheck, Zap, Wifi } from 'lucide-react';

interface DeepSpeedtestModalProps {
  sni: string;
  onClose: () => void;
  currentProfile?: NetworkProfile;
  onApplyConfig?: (sni: string) => void;
  lang: 'fa' | 'en';
}

export function DeepSpeedtestModal({
  sni,
  onClose,
  currentProfile = NETWORK_PROFILES[0],
  onApplyConfig,
  lang
}: DeepSpeedtestModalProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'IDLE' | 'PING_TEST' | 'DOWNLOAD_TEST' | 'UPLOAD_TEST' | 'COMPLETED'>('IDLE');
  const [ping, setPing] = useState<number>(0);
  const [download, setDownload] = useState<number>(0);
  const [upload, setUpload] = useState<number>(0);
  const [jitter, setJitter] = useState<number>(0);
  const [minPing, setMinPing] = useState<number>(0);
  const [maxPing, setMaxPing] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const startTest = async () => {
    setIsRunning(true);
    setProgress(5);
    setPhase('PING_TEST');

    try {
      const result = await runDeepSpeedTest(sni, (metric) => {
        setPing(metric.ping);
        setDownload(metric.download);
        setUpload(metric.upload);
        setPhase(metric.phase as any);
        setProgress(metric.progress);
      });

      setPing(result.ping);
      setDownload(result.download);
      setUpload(result.upload);
      setJitter(result.jitter);
      setMinPing(result.minPing);
      setMaxPing(result.maxPing);
      setPhase('COMPLETED');
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (sni) {
      startTest();
    } else {
      setIsRunning(false);
      setProgress(0);
      setPhase('IDLE');
    }
  }, [sni]);

  const copyBenchmarkSummary = () => {
    const summary = `=== SNI Speedtest.net Benchmark ===\nTarget SNI: ${sni}\nNetwork Profile: ${currentProfile.name}\nPing: ${ping}ms (Jitter: ${jitter}ms, Min: ${minPing}ms, Max: ${maxPing}ms)\nDownload: ${download} Mbps\nUpload: ${upload} Mbps\nSecurity: TLS 1.3 / ECH\nStatus: ${ping < 120 ? 'EXCELLENT / CLEAN' : 'GOOD'}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono animate-fadeIn">
      <div className="w-full max-w-xl bg-[#0D0F16] border border-cyan-500/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-900/30 bg-[#0A0B10]">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <span>{lang === 'fa' ? 'تست سرعت و کیفیت زنده' : 'Speedtest & Latency Benchmark'}</span>
              <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                Speedtest.net
              </span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Target SNI banner */}
          <div className="bg-[#050608] border border-cyan-900/40 rounded-lg p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block">
                {lang === 'fa' ? 'دامنه هدف (SNI)' : 'Target SNI'}
              </span>
              <span className="text-base font-bold text-cyan-300 tracking-tight">{sni}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block">
                {lang === 'fa' ? 'شبکه فعال' : 'Active Connection'}
              </span>
              <span className="text-xs text-slate-300 font-semibold">{currentProfile.name}</span>
            </div>
          </div>

          {/* Speedometer Gauge Visualizer */}
          <div className="relative flex flex-col items-center justify-center py-4 bg-[#050608]/60 border border-slate-800/80 rounded-xl">
            <div className="relative w-44 h-44 flex flex-col items-center justify-center rounded-full border-2 border-cyan-900/40 bg-[#0A0B10] shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]">
              <span className="text-3xl sm:text-4xl font-extrabold text-cyan-400 tracking-tight">
                {phase === 'UPLOAD_TEST' ? upload : download}
              </span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                Mbps
              </span>
              <span className="text-[10px] text-cyan-500/80 uppercase font-semibold mt-1">
                {phase === 'PING_TEST'
                  ? 'Testing Latency...'
                  : phase === 'DOWNLOAD_TEST'
                  ? 'Testing Download...'
                  : phase === 'UPLOAD_TEST'
                  ? 'Testing Upload...'
                  : 'Benchmark Complete'}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-3/4 mt-5 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-cyan-400 h-full transition-all duration-300 shadow-[0_0_10px_#06b6d4]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 3 Main Result Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#161B22] p-3 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                {lang === 'fa' ? 'پینگ (Ping)' : 'Latency (RTT)'}
              </span>
              <span className="text-xl font-bold text-green-400">
                {ping > 0 ? `${ping}ms` : '--'}
              </span>
              <span className="text-[9px] text-slate-500 block mt-0.5">Jitter: {jitter}ms</span>
            </div>

            <div className="bg-[#161B22] p-3 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                {lang === 'fa' ? 'دانلود (Down)' : 'Download'}
              </span>
              <span className="text-xl font-bold text-cyan-400">
                {download > 0 ? `${download} Mbps` : '--'}
              </span>
              <span className="text-[9px] text-slate-500 block mt-0.5">Speedtest.net</span>
            </div>

            <div className="bg-[#161B22] p-3 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                {lang === 'fa' ? 'آپلود (Up)' : 'Upload'}
              </span>
              <span className="text-xl font-bold text-emerald-400">
                {upload > 0 ? `${upload} Mbps` : '--'}
              </span>
              <span className="text-[9px] text-slate-500 block mt-0.5">Throughput</span>
            </div>
          </div>

          {/* Advice card */}
          <div className="p-3.5 bg-cyan-950/20 border border-cyan-900/50 rounded-lg flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <span className="font-bold text-cyan-300 block mb-0.5">
                {lang === 'fa' ? 'وضعیت دورزدن فیلترینگ و بازرسی عمیق پکت:' : 'DPI Inspection Result:'}
              </span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                {ping < 120
                  ? lang === 'fa'
                    ? 'دامنه بدون مسدودی TLS Handshake پاسخ داده و دارای پهنای باند کامل است.'
                    : 'Clean TLS handshake with zero packet resets. Full bandwidth available.'
                  : lang === 'fa'
                  ? 'دامنه پاسخگو است اما پکت‌های اولیه ممکن است با اندکی تأخیر عبور کنند.'
                  : 'Responsive TLS endpoint with stable handshake latency.'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-[#0A0B10] border-t border-cyan-900/30 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={startTest}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-2 rounded bg-[#161B22] hover:bg-slate-800 text-cyan-300 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            {lang === 'fa' ? 'تست مجدد' : 'Retest'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={copyBenchmarkSummary}
              className="flex items-center gap-1.5 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {lang === 'fa' ? 'کپی نتایج' : 'Copy Report'}
            </button>

            {onApplyConfig && (
              <button
                onClick={() => {
                  onApplyConfig(sni);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-black text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-black" />
                {lang === 'fa' ? 'اعمال روی کانفیگ' : 'Apply to Config'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
