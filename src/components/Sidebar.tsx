import { useState, useRef } from 'react';
import { ScanParameters, ParsedProxyConfig } from '../types';
import {
  Play,
  Square,
  Settings2,
  Sliders,
  FileCode,
  PlusCircle,
  CheckCircle2,
  DownloadCloud,
  Globe,
  Sparkles,
  Server,
  ClipboardPaste,
  ClipboardCheck,
  Trash2
} from 'lucide-react';
import { CyberSelect, SelectOption } from './CyberSelect';
import { safeReadClipboard } from '../utils/clipboard';

interface SidebarProps {
  parameters: ScanParameters;
  onChangeParameters: (params: ScanParameters) => void;
  rawConfig: string;
  onChangeRawConfig: (cfg: string) => void;
  parsedConfig: ParsedProxyConfig | null;
  onStartScan: () => void;
  onStopScan: () => void;
  isScanning: boolean;
  onOpenCustomModal: () => void;
  onFetchOnlineSnis: () => void;
  isFetchingOnline: boolean;
  onlineFetchCount: number;
  lang: 'fa' | 'en';
  totalSnisInQueue: number;
}

export function Sidebar({
  parameters,
  onChangeParameters,
  rawConfig,
  onChangeRawConfig,
  parsedConfig,
  onStartScan,
  onStopScan,
  isScanning,
  onOpenCustomModal,
  onFetchOnlineSnis,
  isFetchingOnline,
  onlineFetchCount,
  lang,
  totalSnisInQueue
}: SidebarProps) {
  const [configViewMode, setConfigViewMode] = useState<'text' | 'visual'>('text');
  const [pasteSuccess, setPasteSuccess] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePasteConfig = async () => {
    const text = await safeReadClipboard();
    if (text && text.trim()) {
      onChangeRawConfig(text.trim());
      setPasteSuccess(true);
      setTimeout(() => setPasteSuccess(false), 2000);
    } else {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    }
  };

  const categoryOptions: SelectOption<string>[] = [
    { value: 'all', label: lang === 'fa' ? 'همه دامنه‌ها (All SNIs)' : 'All SNIs (Full Pool)', badge: 'TLS 1.3' },
    { value: 'yahoo', label: 'Yahoo & Search Portals (www.yahoo.com)', badge: 'High Stability' },
    { value: 'cloudflare', label: 'Cloudflare Edge & Workers', badge: 'CDN Edge' },
    { value: 'microsoft', label: 'Microsoft / Skype / Teams', badge: 'Enterprise' },
    { value: 'spotify', label: 'Spotify / Discord / Media', badge: 'Streaming' },
    { value: 'amazon_fastly', label: 'Amazon AWS & Fastly CDNs', badge: 'Global' },
    { value: 'dev_github', label: 'GitHub & Developer CDNs', badge: 'Dev' },
    { value: 'general', label: 'Apple & Global Edge CDNs', badge: 'Worldwide' },
    { value: 'custom', label: lang === 'fa' ? 'دامنه‌های آنلاین و دستی' : 'Online / Custom Imported', badge: 'Custom' },
  ];

  const concurrencyOptions: SelectOption<number>[] = [
    { value: 4, label: '4 Threads', badge: lang === 'fa' ? 'سبک / گوشی‌های ضعیف‌تر' : 'Low CPU' },
    { value: 8, label: '8 Threads', badge: lang === 'fa' ? 'پیش‌فرض استاندارد' : 'Standard' },
    { value: 16, label: '16 Threads', badge: lang === 'fa' ? 'سرعت بالا' : 'Fast' },
    { value: 32, label: '32 Threads', badge: lang === 'fa' ? 'فوق سریع توربو' : 'Turbo' },
  ];

  const payloadOptions: SelectOption<number>[] = [
    { value: 2, label: '2 MB Fast', badge: lang === 'fa' ? 'تست سریع' : 'Fast Probe' },
    { value: 5, label: '5 MB Standard', badge: lang === 'fa' ? 'تست استاندارد' : 'Standard' },
    { value: 10, label: '10 MB Deep', badge: lang === 'fa' ? 'تست دقیق و عمیق' : 'Deep Accurate' },
  ];

  const timeoutOptions: SelectOption<number>[] = [
    { value: 2500, label: '2500 ms', badge: lang === 'fa' ? 'سریع' : 'Fast' },
    { value: 3500, label: '3500 ms', badge: lang === 'fa' ? 'استاندارد' : 'Balanced' },
    { value: 5000, label: '5000 ms', badge: lang === 'fa' ? 'شبکه‌های کند' : 'Slow Network' },
  ];

  return (
    <aside className="bg-[#0D0F16] border border-cyan-900/30 rounded-xl p-4 sm:p-5 flex flex-col gap-5 text-slate-300 font-mono shadow-xl lg:sticky lg:top-20">
      {/* 1. Configuration Input Block */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
          <label className="text-[10px] uppercase text-slate-400 font-semibold tracking-widest flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            {lang === 'fa' ? 'کانفیگ پایه Xray' : 'Base Xray Config'}
          </label>
          <div className="flex items-center gap-1 text-[10px]">
            {/* PASTE BUTTON */}
            <button
              onClick={handlePasteConfig}
              type="button"
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-600/70 text-cyan-300 hover:bg-cyan-900 transition-all font-sans text-[10px] font-bold cursor-pointer"
              title={lang === 'fa' ? 'چسباندن کانفیگ کپی شده' : 'Paste config'}
            >
              {pasteSuccess ? (
                <>
                  <ClipboardCheck className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">{lang === 'fa' ? 'چسبانده شد' : 'Pasted'}</span>
                </>
              ) : (
                <>
                  <ClipboardPaste className="w-3 h-3 text-cyan-400" />
                  <span>{lang === 'fa' ? 'چسباندن' : 'Paste'}</span>
                </>
              )}
            </button>

            {rawConfig && (
              <button
                onClick={() => onChangeRawConfig('')}
                type="button"
                className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 text-[10px] cursor-pointer"
                title={lang === 'fa' ? 'پاک کردن' : 'Clear'}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}

            <button
              onClick={() => setConfigViewMode('text')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                configViewMode === 'text'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Raw
            </button>
            <button
              onClick={() => setConfigViewMode('visual')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                configViewMode === 'visual'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Info
            </button>
          </div>
        </div>

        {configViewMode === 'text' ? (
          <textarea
            ref={textareaRef}
            value={rawConfig}
            onChange={(e) => onChangeRawConfig(e.target.value)}
            placeholder="vless://uuid@server:443?security=tls&sni=...#Iran"
            className="h-32 sm:h-36 w-full bg-[#050608] border border-cyan-900/40 focus:border-cyan-400 rounded p-3 text-[11px] text-cyan-300/90 leading-relaxed font-mono resize-none focus:outline-none transition-colors"
          />
        ) : (
          <div className="h-32 sm:h-36 w-full bg-[#050608] border border-cyan-900/40 rounded p-3 text-[11px] text-slate-300 leading-relaxed overflow-y-auto space-y-1.5">
            {parsedConfig ? (
              <>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-500">Protocol:</span>
                  <span className="text-cyan-400 uppercase font-bold">{parsedConfig.protocol}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-500">Server:</span>
                  <span className="text-slate-200 truncate max-w-[140px]">{parsedConfig.server}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-500">Port:</span>
                  <span className="text-slate-200">{parsedConfig.port}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Active SNI:</span>
                  <span className="text-green-400 truncate max-w-[130px]">{parsedConfig.sni || 'None'}</span>
                </div>
              </>
            ) : (
              <p className="text-slate-500 text-xs italic">
                {lang === 'fa'
                  ? 'کانفیگ VLESS یا Trojan خود را وارد کنید تا پارس شود.'
                  : 'Enter your VLESS/Trojan URL to parse.'}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-cyan-500" />
            {parsedConfig ? `Parsed: ${parsedConfig.protocol.toUpperCase()}` : 'Ready for injection'}
          </span>
          <button
            onClick={() =>
              onChangeRawConfig(
                'vless://d2c18400-6c9a-4c28-98e3-0d33b5c19208@104.16.12.34:443?security=tls&encryption=none&headerType=none&type=tcp&sni=www.yahoo.com#Iran-Node-Sample'
              )
            }
            className="text-cyan-400 hover:underline cursor-pointer"
          >
            {lang === 'fa' ? 'نمونه پیش‌فرض' : 'Load Sample'}
          </button>
        </div>
      </div>

      {/* 2. Online Fetching & Curated Repos */}
      <div className="bg-[#050608]/90 border border-cyan-950 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] uppercase text-cyan-400 font-semibold tracking-widest flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            {lang === 'fa' ? 'دریافت آنلاین لیست SNI' : 'Online SNI Fetcher'}
          </label>
          {onlineFetchCount > 0 && (
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
              +{onlineFetchCount} Online
            </span>
          )}
        </div>

        <button
          onClick={onFetchOnlineSnis}
          disabled={isFetchingOnline}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded border border-cyan-800 bg-[#161B22] hover:bg-cyan-950/70 text-cyan-300 text-xs font-semibold tracking-wider transition-all cursor-pointer disabled:opacity-50"
        >
          <DownloadCloud className={`w-3.5 h-3.5 ${isFetchingOnline ? 'animate-bounce text-cyan-400' : ''}`} />
          {isFetchingOnline
            ? lang === 'fa'
              ? 'در حال دریافت آنلاین از گیت‌هاب...'
              : 'Fetching from GitHub...'
            : lang === 'fa'
            ? 'بروزرسانی آنلاین دامنه‌ها (GitHub)'
            : 'Fetch Online SNI List (GitHub)'}
        </button>

        <button
          onClick={onOpenCustomModal}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded border border-slate-800 bg-[#0D0F16] hover:bg-slate-900 text-slate-300 text-[11px] transition-all cursor-pointer"
        >
          <PlusCircle className="w-3 h-3 text-cyan-400" />
          {lang === 'fa' ? 'افزودن دامنه‌های دلخواه یا ساب' : 'Import Custom / Sub URL'}
        </button>
      </div>

      {/* 3. Category Selector with CyberSelect */}
      <div>
        <label className="text-[10px] uppercase text-slate-400 font-semibold mb-2 block tracking-widest flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          {lang === 'fa' ? 'فیلتر دسته‌بندی SNI' : 'SNI Category Pool'}
        </label>
        <CyberSelect
          value={parameters.category}
          onChange={(val) => onChangeParameters({ ...parameters, category: val as string })}
          options={categoryOptions}
          title={lang === 'fa' ? 'انتخاب دسته‌بندی دامنه‌های SNI' : 'Select SNI Category Pool'}
          variant="full"
        />
      </div>

      {/* 4. Scan Parameters with CyberSelect */}
      <div>
        <label className="text-[10px] uppercase text-slate-400 font-semibold mb-2 block tracking-widest flex items-center gap-1.5">
          <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
          {lang === 'fa' ? 'تنظیمات تست سرعت و پینگ' : 'Speedtest & Probe Config'}
        </label>
        <div className="space-y-2.5 bg-[#050608]/80 border border-slate-800/80 rounded-lg p-3">
          {/* Concurrency */}
          <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
            <span className="text-xs text-slate-400">{lang === 'fa' ? 'همزمانی (Threads)' : 'Concurrency'}</span>
            <CyberSelect
              value={parameters.concurrency}
              onChange={(val) => onChangeParameters({ ...parameters, concurrency: Number(val) })}
              options={concurrencyOptions}
              title={lang === 'fa' ? 'انتخاب تعداد نخ‌های پردازش همزمان' : 'Select Concurrency Threads'}
            />
          </div>

          {/* Test Payload Size */}
          <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
            <span className="text-xs text-slate-400">{lang === 'fa' ? 'حجم تست اسپیدتست' : 'Speedtest Payload'}</span>
            <CyberSelect
              value={parameters.testPayloadMb}
              onChange={(val) => onChangeParameters({ ...parameters, testPayloadMb: Number(val) })}
              options={payloadOptions}
              title={lang === 'fa' ? 'حجم فایل تست دانلود و آپلود' : 'Select Speedtest Payload Size'}
            />
          </div>

          {/* Timeout */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">{lang === 'fa' ? 'تایم‌اوت پروب' : 'Timeout'}</span>
            <CyberSelect
              value={parameters.timeoutMs}
              onChange={(val) => onChangeParameters({ ...parameters, timeoutMs: Number(val) })}
              options={timeoutOptions}
              title={lang === 'fa' ? 'حداکثر زمان انتظار پاسخ پروب' : 'Select Probe Timeout'}
            />
          </div>
        </div>
      </div>

      {/* Launch / Abort CTA */}
      <div className="mt-auto pt-2">
        {isScanning ? (
          <button
            onClick={onStopScan}
            id="stop-scan-btn"
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-widest text-xs rounded transition-all shadow-[0_0_20px_rgba(225,29,72,0.3)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Square className="w-4 h-4 fill-white" />
            {lang === 'fa' ? 'توقف اسکن و تست' : 'Abort Active Scan'}
          </button>
        ) : (
          <button
            onClick={onStartScan}
            id="init-scanner-btn"
            className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-black font-bold uppercase tracking-widest text-xs rounded transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-black" />
            {lang === 'fa'
              ? `شروع اسکن آنلاین (${totalSnisInQueue} دامنه)`
              : `Initialize Scanner (${totalSnisInQueue})`}
          </button>
        )}
      </div>
    </aside>
  );
}
