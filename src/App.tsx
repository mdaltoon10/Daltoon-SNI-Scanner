import { useState, useRef, useMemo, useEffect } from 'react';
import { Sparkles, SlidersHorizontal } from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ActiveProbeFeed } from './components/ActiveProbeFeed';
import { DeepSpeedtestModal } from './components/DeepSpeedtestModal';
import { ConfigGeneratorModal } from './components/ConfigGeneratorModal';
import { CustomSniModal } from './components/CustomSniModal';
import { CleanSpeedFilterModal } from './components/CleanSpeedFilterModal';
import { Footer } from './components/Footer';
import {
  SniItem,
  SniScanResult,
  ScanParameters,
  ParsedProxyConfig,
  ScanLogEntry
} from './types';
import { PRESET_SNI_LIST } from './data/presetSnilist';
import { probeSingleSni, fetchOnlineSnis, fetchGlobalSniUniverse } from './utils/scannerEngine';
import { parseProxyConfig, generateMultiFormatConfigs } from './utils/configParser';

export function App() {
  // Theme State ('dark' | 'light')
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('daltoon_theme');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    } else {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem('daltoon_theme', nextTheme);
    } catch {
      // Ignore
    }
  };

  // 1. Core State
  const [lang, setLang] = useState<'fa' | 'en'>('fa');
  const [rawConfig, setRawConfig] = useState<string>('');
  const [parsedConfig, setParsedConfig] = useState<ParsedProxyConfig | null>(null);

  // Scan Parameters
  const [parameters, setParameters] = useState<ScanParameters>({
    concurrency: 8,
    category: 'all',
    timeoutMs: 3500,
    testPayloadMb: 2,
    packetSizeMtu: 1400,
    fragmentationMode: true,
    networkProfile: 'default'
  });

  // SNI Master List & Results
  const [sniMasterList, setSniMasterList] = useState<SniItem[]>(PRESET_SNI_LIST);
  const [results, setResults] = useState<SniScanResult[]>([]);
  const [liveLogs, setLiveLogs] = useState<ScanLogEntry[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isFetchingOnline, setIsFetchingOnline] = useState<boolean>(false);
  const [onlineFetchCount, setOnlineFetchCount] = useState<number>(0);
  const [isStreamingGlobal, setIsStreamingGlobal] = useState<boolean>(false);
  const [globalStreamOffset, setGlobalStreamOffset] = useState<number>(0);

  // Modals State
  const [selectedSpeedTestSni, setSelectedSpeedTestSni] = useState<string | null>(null);
  const [selectedConfigSni, setSelectedConfigSni] = useState<string | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [isSpeedFilterModalOpen, setIsSpeedFilterModalOpen] = useState<boolean>(false);

  // Abort controller for scanner queue
  const abortControllerRef = useRef<AbortController | null>(null);

  // Compute number of clean speed SNIs
  const cleanSpeedCount = useMemo(() => {
    return results.filter(
      (r) => Boolean(r.testedAt) && r.status === 'CLEAN' && (r.downloadSpeed || 0) >= 1.0 && (r.uploadSpeed || 0) >= 0.5
    ).length;
  }, [results]);

  // Handle Raw Config Change & Auto Parsing
  const handleConfigChange = (cfg: string) => {
    setRawConfig(cfg);
    if (!cfg.trim()) {
      setParsedConfig(null);
      return;
    }
    const parsed = parseProxyConfig(cfg);
    setParsedConfig(parsed);
  };

  // Add Custom SNIs from manual import or Github repos
  const handleAddCustomSnis = (domains: string[], category: string = 'custom') => {
    const newItems: SniItem[] = domains.map((domain, index) => ({
      id: `custom-${Date.now()}-${index}`,
      domain: domain.trim().toLowerCase(),
      category,
      isPopular: true,
      description: 'دامنه‌ سفارشی / آنلاین کاربر'
    }));

    const existingDomains = new Set(sniMasterList.map((s) => s.domain.toLowerCase()));
    const filteredNew = newItems.filter((item) => !existingDomains.has(item.domain));

    if (filteredNew.length > 0) {
      setSniMasterList((prev) => [...filteredNew, ...prev]);
    }
  };

  // Fetch online SNIs
  const handleFetchOnlineSnis = async (customUrl?: string) => {
    setIsFetchingOnline(true);
    try {
      const fetched = await fetchOnlineSnis(customUrl);
      if (fetched && fetched.length > 0) {
        handleAddCustomSnis(fetched, 'online_github');
        setOnlineFetchCount(fetched.length);
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        handleScanLog({
          id: `log-${Date.now()}`,
          time: timeStr,
          type: 'info',
          domain: 'GitHub-Update',
          host: 'GitHub API',
          ping: null,
          downloadSpeed: null,
          message: `[بروزرسانی آنلاین] ${fetched.length} دامنه جدید از مخازن آنلاین گیت‌هاب دریافت و به لیست اضافه شد.`
        });
      }
    } catch (err) {
      console.error('Error fetching online SNIs:', err);
    } finally {
      setIsFetchingOnline(false);
    }
  };

  // Infinite Global SNI Feed Streamer
  const handleFetchGlobalStream = async (category: string = 'all', limit: number = 200, offset?: number) => {
    setIsStreamingGlobal(true);
    const currentOffset = offset !== undefined ? offset : globalStreamOffset;
    try {
      const res = await fetchGlobalSniUniverse({
        category,
        offset: currentOffset,
        limit,
        synthetic: true
      });

      if (res && res.domains.length > 0) {
        const mapped: SniItem[] = res.domains.map((d, i) => ({
          id: `global-${currentOffset + i}`,
          domain: d.domain,
          category: d.category,
          isPopular: d.isPopular,
          description: d.cdn
        }));

        const existingSet = new Set(sniMasterList.map((s) => s.domain.toLowerCase()));
        const unique = mapped.filter((m) => !existingSet.has(m.domain.toLowerCase()));

        setSniMasterList((prev) => [...prev, ...unique]);
        setGlobalStreamOffset(currentOffset + limit);

        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        handleScanLog({
          id: `log-${Date.now()}`,
          time: timeStr,
          type: 'info',
          domain: 'Global-Stream',
          host: 'Worldwide Nodes',
          ping: null,
          downloadSpeed: null,
          message: `[دریافت دامنه‌ها] ${unique.length} دامنه جدید TLS 1.3 جهان به صف اضافه شد.`
        });
      }
    } catch (err) {
      console.error('Failed to stream global SNIs:', err);
    } finally {
      setIsStreamingGlobal(false);
    }
  };

  // Filter Active Queue based on category
  const activeQueue = useMemo(() => {
    if (parameters.category === 'all') return sniMasterList;
    return sniMasterList.filter((item) => item.category === parameters.category);
  }, [sniMasterList, parameters.category]);

  // Log handler
  const handleScanLog = (log: ScanLogEntry) => {
    setLiveLogs((prev) => [log, ...prev.slice(0, 150)]);
  };

  // Start Real Client-Side Scanner
  const handleStartScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    abortControllerRef.current = new AbortController();

    const initialResults: SniScanResult[] = activeQueue.map((item) => ({
      id: item.id,
      domain: item.domain,
      category: item.category,
      ping: null,
      downloadSpeed: null,
      uploadSpeed: null,
      fragmentationScore: null,
      tlsVersion: null,
      status: 'IDLE' as any,
      packetLoss: 0,
      jitter: 0,
      httpStatus: 0
    }));
    setResults(initialResults);

    // Concurrency Worker Pool
    const queue = [...activeQueue];
    const concurrency = Math.min(parameters.concurrency || 8, queue.length);

    const runWorker = async () => {
      while (queue.length > 0) {
        if (abortControllerRef.current?.signal.aborted) break;

        const item = queue.shift();
        if (!item) break;

        try {
          const res = await probeSingleSni(item, parameters, {
            targetHost: parsedConfig?.server,
            targetPort: parsedConfig?.port,
            rawConfig: rawConfig,
            onLog: handleScanLog
          });

          setResults((prev) =>
            prev.map((r) => (r.id === res.id ? { ...res, testedAt: new Date() } : r))
          );
        } catch (err) {
          console.error(`Error scanning ${item.domain}:`, err);
        }
      }
    };

    const workers = Array.from({ length: concurrency }).map(() => runWorker());
    await Promise.all(workers);

    setIsScanning(false);
  };

  // Stop Active Scan
  const handleStopScan = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsScanning(false);
  };

  // Export SNIs / VLESS
  const handleExportSnis = (
    targetSnis?: SniScanResult[] | 'clean' | 'all' | 'vless' | 'top_speed',
    format: 'txt' | 'json' | 'vless' = 'txt'
  ) => {
    let snis: SniScanResult[] = [];
    let exportType = 'export';

    if (Array.isArray(targetSnis)) {
      snis = targetSnis.length > 0 ? targetSnis : results;
      exportType = format;
    } else {
      const type = targetSnis || 'clean';
      exportType = type;
      if (type === 'clean') {
        snis = results.filter((r) => r.status === 'CLEAN');
      } else if (type === 'top_speed') {
        snis = results.filter((r) => r.status === 'CLEAN' && (r.downloadSpeed || 0) >= 1.0);
      } else {
        snis = results;
      }
    }

    if (snis.length === 0) {
      snis = results;
    }

    let content = '';
    let fileName = `daltoon-snis-${exportType}-${new Date().toISOString().slice(0, 10)}`;

    if (format === 'json') {
      content = JSON.stringify(snis, null, 2);
      fileName += '.json';
    } else if (format === 'vless' || exportType === 'vless') {
      if (parsedConfig) {
        content = snis
          .map((s) => {
            const multi = generateMultiFormatConfigs(parsedConfig, s.domain);
            return `# SNI: ${s.domain} (Ping: ${s.ping}ms, Down: ${s.downloadSpeed}Mbps)\n${multi.vless}`;
          })
          .join('\n\n');
      } else {
        content = snis
          .map(
            (s) =>
              `vless://d2c18400-6c9a-4c28-98e3-0d33b5c19208@104.16.12.34:443?security=tls&encryption=none&headerType=none&type=tcp&sni=${s.domain}#Iran-SNI-${s.domain}`
          )
          .join('\n');
      }
      fileName += '-vless.txt';
    } else {
      content = snis.map((s) => s.domain).join('\n');
      fileName += '.txt';
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen w-full bg-[#07080D] text-slate-300 font-mono flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* 1. Header */}
      <div className="sticky top-0 z-30 w-full backdrop-blur-md bg-[#0D0F16]/95 border-b border-cyan-900/30">
        <Header
          lang={lang}
          onToggleLang={() => setLang(lang === 'fa' ? 'en' : 'fa')}
          isScanning={isScanning}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
      </div>

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 w-full max-w-[1800px] mx-auto p-3 sm:p-5 lg:p-6 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
          {/* Left: Input, Controls & Online Fetcher (Sticky on Desktop) */}
          <Sidebar
            parameters={parameters}
            onChangeParameters={setParameters}
            rawConfig={rawConfig}
            onChangeRawConfig={handleConfigChange}
            parsedConfig={parsedConfig}
            onStartScan={handleStartScan}
            onStopScan={handleStopScan}
            isScanning={isScanning}
            onOpenCustomModal={() => setIsCustomModalOpen(true)}
            onFetchOnlineSnis={() => handleFetchOnlineSnis()}
            isFetchingOnline={isFetchingOnline}
            onlineFetchCount={onlineFetchCount}
            lang={lang}
            totalSnisInQueue={activeQueue.length}
          />

          {/* Right: Live Benchmark Table & Speed Stats */}
          <ActiveProbeFeed
            results={results}
            isScanning={isScanning}
            onOpenSpeedTest={(sni) => setSelectedSpeedTestSni(sni)}
            onApplySniToConfig={(sni) => setSelectedConfigSni(sni)}
            onExportSnis={handleExportSnis}
            onFetchGlobalStream={handleFetchGlobalStream}
            onOpenSpeedFilterModal={() => setIsSpeedFilterModalOpen(true)}
            isStreamingGlobal={isStreamingGlobal}
            parsedConfig={parsedConfig}
            rawConfig={rawConfig}
            lang={lang}
            liveLogs={liveLogs}
            onClearLogs={() => setLiveLogs([])}
          />
        </div>

        {/* Bottom Section: لیست دامنه های سفارسی و تنظیم مقدار دانلود/اپلود اسپید تست */}
        <div className="w-full bg-gradient-to-r from-[#0B0F17] via-[#0E1524] to-[#0B0F17] p-4 sm:p-5 rounded-2xl border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-wrap items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-950 to-cyan-950 border border-emerald-500/50 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {lang === 'fa'
                    ? 'لیست دامنه‌های تمیز و تنظیم مقدار دانلود/آپلود اسپیدتست'
                    : 'Clean Domains List & Speedtest Thresholds'}
                </h3>
                <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-700/80 px-2.5 py-0.5 rounded-full font-bold">
                  {cleanSpeedCount} {lang === 'fa' ? 'دامنه واجد شرایط' : 'Qualified'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                {lang === 'fa'
                  ? 'مشاهده و فیلتر زنده دامنه‌ها بر اساس حداقل سرعت دانلود و آپلود واقعی و دریافت کانفیگ آماده'
                  : 'Filter endpoints by custom upload/download thresholds and copy instant configs'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end shrink-0">
            <button
              onClick={() => setIsSpeedFilterModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-black font-bold text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.35)] cursor-pointer active:scale-95"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>
                {lang === 'fa'
                  ? 'باز کردن تنظیمات و لیست دامنه‌ها'
                  : 'Open Domains List & Config'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Footer with Telemetry Logs & Status */}
      <Footer isScanning={isScanning} lang={lang} totalTested={results.filter((r) => r.ping !== null).length} />

      {/* Modal 1: Deep Speedtest Gauge */}
      {selectedSpeedTestSni && (
        <DeepSpeedtestModal
          sni={selectedSpeedTestSni}
          onClose={() => setSelectedSpeedTestSni(null)}
          lang={lang}
        />
      )}

      {/* Modal 2: Multi-Format Config Generator */}
      {selectedConfigSni && (
        <ConfigGeneratorModal
          sni={selectedConfigSni}
          parsedConfig={parsedConfig}
          onClose={() => setSelectedConfigSni(null)}
          lang={lang}
        />
      )}

      {/* Modal 3: Import Custom SNIs / GitHub Repository */}
      {isCustomModalOpen && (
        <CustomSniModal
          isOpen={isCustomModalOpen}
          onClose={() => setIsCustomModalOpen(false)}
          onAddSnis={(newSnis) => {
            const domains = newSnis.map((s) => s.domain);
            handleAddCustomSnis(domains, 'custom');
          }}
          onFetchUrl={async (url) => {
            await handleFetchOnlineSnis(url);
          }}
          lang={lang}
        />
      )}

      {/* Modal 4: Verified Clean SNIs with Custom Up/Down Speed Thresholds */}
      {isSpeedFilterModalOpen && (
        <CleanSpeedFilterModal
          isOpen={isSpeedFilterModalOpen}
          onClose={() => setIsSpeedFilterModalOpen(false)}
          results={results}
          parsedConfig={parsedConfig}
          rawConfig={rawConfig}
          onApplySniToConfig={(sni) => setSelectedConfigSni(sni)}
          onTestWithXray={(sni) => {
            let targetCfg = rawConfig;
            if (parsedConfig) {
              const multi = generateMultiFormatConfigs(parsedConfig, sni);
              targetCfg = multi.vless;
            } else {
              targetCfg = `vless://d2c18400-6c9a-4c28-98e3-0d33b5c19208@104.16.12.34:443?security=tls&encryption=none&headerType=none&type=tcp&sni=${sni}#Iran-SNI-${sni}`;
            }
            setRawConfig(targetCfg);
            setSelectedConfigSni(sni);
          }}
          onOpenSpeedTest={(sni) => setSelectedSpeedTestSni(sni)}
          onExportSnis={handleExportSnis}
          lang={lang}
        />
      )}
    </div>
  );
}

export default App;
