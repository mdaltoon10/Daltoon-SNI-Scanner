import { useState, useEffect, useRef, useMemo } from 'react';
import { Sparkles, SlidersHorizontal } from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ActiveProbeFeed } from './components/ActiveProbeFeed';
import { DeepSpeedtestModal } from './components/DeepSpeedtestModal';
import { ConfigGeneratorModal } from './components/ConfigGeneratorModal';
import { CustomSniModal } from './components/CustomSniModal';
import { CleanSpeedFilterModal } from './components/CleanSpeedFilterModal';
import { OperatorDetectBanner } from './components/OperatorDetectBanner';
import { Footer } from './components/Footer';
import {
  SniItem,
  SniScanResult,
  ScanParameters,
  NetworkProfile,
  ParsedProxyConfig,
  ScanLogEntry
} from './types';
import { PRESET_SNI_LIST, NETWORK_PROFILES } from './data/presetSnilist';
import { probeSingleSni, fetchOnlineSnis, fetchGlobalSniUniverse } from './utils/scannerEngine';
import { parseProxyConfig, generateMultiFormatConfigs } from './utils/configParser';
import { detectClientOperator, ClientCarrierInfo, CARRIER_SIGNATURES } from './utils/carrierDetector';

export function App() {
  // 1. Core State
  const [lang, setLang] = useState<'fa' | 'en'>('fa');
  const [rawConfig, setRawConfig] = useState<string>('');
  const [parsedConfig, setParsedConfig] = useState<ParsedProxyConfig | null>(null);

  // Auto Operator / Carrier Detection State (Speedtest-like)
  const [carrierInfo, setCarrierInfo] = useState<ClientCarrierInfo | null>(null);
  const [isDetectingCarrier, setIsDetectingCarrier] = useState<boolean>(true);

  // Scan Parameters
  const [parameters, setParameters] = useState<ScanParameters>({
    concurrency: 8,
    category: 'all',
    timeoutMs: 3500,
    testPayloadMb: 2,
    packetSizeMtu: 1400,
    fragmentationMode: true,
    networkProfile: NETWORK_PROFILES[0].id
  });

  // Network Profile & User Preference Persistence
  const isUserManualRef = useRef<boolean>(!!localStorage.getItem('daltoon_selected_operator_id'));
  const [currentProfile, setCurrentProfile] = useState<NetworkProfile>(() => {
    const saved = localStorage.getItem('daltoon_selected_operator_id');
    if (saved) {
      const found = NETWORK_PROFILES.find((p) => p.id === saved);
      if (found) return found;
    }
    return NETWORK_PROFILES[0]; // MCI by default
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
      (r) => r.status === 'CLEAN' && (r.downloadSpeed || 0) >= 1.0 && (r.uploadSpeed || 0) >= 0.5
    ).length;
  }, [results]);

  // 2. Auto-Detect Carrier on App Load (Speedtest-like intelligence)
  const runCarrierDetection = async (overrideProfileId?: string, forceAutoRedetect = false) => {
    setIsDetectingCarrier(true);
    const minSpinPromise = new Promise((resolve) => setTimeout(resolve, 850));

    if (forceAutoRedetect) {
      isUserManualRef.current = false;
      localStorage.removeItem('daltoon_selected_operator_id');
    }

    try {
      const targetPref = overrideProfileId || (!forceAutoRedetect ? currentProfile?.id : undefined);
      const [detected] = await Promise.all([
        detectClientOperator(targetPref),
        minSpinPromise
      ]);

      if (overrideProfileId) {
        isUserManualRef.current = true;
        localStorage.setItem('daltoon_selected_operator_id', overrideProfileId);
      }

      // Auto-match network profile if detected (MCI, Irancell, Rightel, Shatel, Mokhaberat, etc.)
      const matchedProfile = NETWORK_PROFILES.find((p) => p.id === detected.matchedProfileId) || NETWORK_PROFILES[0];
      if (matchedProfile && (!isUserManualRef.current || forceAutoRedetect || overrideProfileId)) {
        setCurrentProfile(matchedProfile);
        setParameters((prev) => ({
          ...prev,
          networkProfile: matchedProfile.id,
          packetSizeMtu: matchedProfile.defaultMtu
        }));
      }

      setCarrierInfo(detected);
    } catch (err) {
      console.error('Error detecting carrier:', err);
    } finally {
      setIsDetectingCarrier(false);
    }
  };

  const handleSelectProfile = (profile: NetworkProfile) => {
    isUserManualRef.current = true;
    localStorage.setItem('daltoon_selected_operator_id', profile.id);

    setCurrentProfile(profile);
    setParameters((prev) => ({
      ...prev,
      networkProfile: profile.id,
      packetSizeMtu: profile.defaultMtu
    }));

    setCarrierInfo((prev) => {
      const isVpn = prev ? !prev.isIran : false;
      const displayFa = isVpn ? `${profile.nameFa} (VPN/خارج)` : profile.nameFa;
      const displayEn = isVpn ? `${profile.name} (VPN)` : profile.name;

      if (!prev) {
        return {
          ip: '127.0.0.1',
          isp: profile.name,
          org: profile.name,
          as: profile.asn,
          asname: profile.name,
          city: 'Tehran',
          region: 'Tehran',
          country: 'Iran',
          countryCode: 'IR',
          matchedProfileId: profile.id,
          matchedProfileName: displayEn,
          matchedProfileNameFa: displayFa,
          isIran: true,
          cellularOrMobile: true,
          detectedAt: new Date().toISOString(),
          source: 'Manual Selection'
        };
      }

      return {
        ...prev,
        matchedProfileId: profile.id,
        matchedProfileName: displayEn,
        matchedProfileNameFa: displayFa
      };
    });
  };

  useEffect(() => {
    runCarrierDetection();
  }, []);

  // 2b. Quick scan tailored to detected operator
  const handleQuickScanDetectedOperator = () => {
    // If operator has preferred categories, prioritize them or start full clean probe
    handleStartScan();
  };

  // 3. Parse config on change
  useEffect(() => {
    if (rawConfig.trim()) {
      const parsed = parseProxyConfig(rawConfig);
      setParsedConfig(parsed);
    } else {
      setParsedConfig(null);
    }
  }, [rawConfig]);

  // 3. Initialize results table from master list (preserving existing tested metrics)
  useEffect(() => {
    setResults((prev) => {
      const existingMap = new Map(prev.map((p) => [p.domain.toLowerCase(), p]));
      return sniMasterList.map((item) => {
        const existing = existingMap.get(item.domain.toLowerCase());
        if (existing) return existing;
        return {
          id: item.id,
          domain: item.domain,
          category: item.category,
          ping: null,
          downloadSpeed: null,
          uploadSpeed: null,
          fragmentationScore: 1,
          tlsVersion: 'TLS 1.3',
          status: 'IDLE',
          packetLoss: 0,
          jitter: 0
        };
      });
    });
  }, [sniMasterList]);

  // 4. Global Million-Scale Streamer (Yahoo, Cloudflare, Akamai, Fastly, Google, etc.)
  const handleFetchGlobalStream = async (category: string = 'all', count: number = 3500) => {
    setIsStreamingGlobal(true);
    try {
      const response = await fetchGlobalSniUniverse({
        category,
        limit: count,
        offset: 0,
        synthetic: true
      });

      if (response.domains && response.domains.length > 0) {
        const newItems: SniItem[] = response.domains.map((item, idx) => ({
          id: `global-${category}-${Date.now()}-${idx}`,
          domain: item.domain,
          category: item.category as any,
          recommendedProfile: 'Worldwide TLS 1.3 / ECH',
          description: `${item.cdn} (Worldwide Anycast Node)`
        }));

        setSniMasterList((prev) => {
          const existingDomains = new Set(prev.map((p) => p.domain.toLowerCase()));
          const uniqueNew = newItems.filter((i) => !existingDomains.has(i.domain.toLowerCase()));
          return [...prev, ...uniqueNew];
        });

        setGlobalStreamOffset((prev) => prev + count);
      }
    } catch (err) {
      console.error('Error streaming global SNIs:', err);
    } finally {
      setIsStreamingGlobal(false);
    }
  };

  // 5. Online SNI Fetcher (GitHub & curated dynamic sources)
  const handleFetchOnlineSnis = async (customUrl?: string) => {
    setIsFetchingOnline(true);
    try {
      const onlineDomains = await fetchOnlineSnis(customUrl);
      if (onlineDomains.length > 0) {
        const newItems: SniItem[] = onlineDomains.map((dom, idx) => ({
          id: `online-${Date.now()}-${idx}`,
          domain: dom,
          category: 'custom',
          recommendedProfile: 'IR-MCI / Irancell 4G/5G',
          description: 'Fetched live from online repository'
        }));

        // Merge with existing, filtering duplicates
        setSniMasterList((prev) => {
          const existingDomains = new Set(prev.map((p) => p.domain.toLowerCase()));
          const uniqueNew = newItems.filter((i) => !existingDomains.has(i.domain.toLowerCase()));
          return [...prev, ...uniqueNew];
        });

        setOnlineFetchCount(onlineDomains.length);
      }
    } catch (err) {
      console.error('Error fetching online SNIs:', err);
    } finally {
      setIsFetchingOnline(false);
    }
  };

  // 6. Add custom SNIs manually or from custom sub URL
  const handleAddCustomSnis = (domains: string[], category: string) => {
    const newItems: SniItem[] = domains.map((domain, index) => ({
      id: `custom-${Date.now()}-${index}`,
      domain: domain.trim(),
      category: category as any,
      recommendedProfile: currentProfile.name,
      description: 'Custom imported domain'
    }));

    setSniMasterList((prev) => [...newItems, ...prev]);
  };

  // 7. Filtered queue based on category
  const activeQueue = useMemo(() => {
    if (parameters.category === 'all') return sniMasterList;
    return sniMasterList.filter((item) => item.category === parameters.category);
  }, [sniMasterList, parameters.category]);

  // 8. Real Scanner Worker Loop with Concurrency Control & Live Execution Logging
  const handleStartScan = async () => {
    if (isScanning) return;
    setIsScanning(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const carrierName = carrierInfo?.matchedProfileNameFa || currentProfile?.nameFa || 'شبکه شما';
    const targetHost = parsedConfig?.server || '';
    const targetPort = parsedConfig?.port || 443;

    // Reset targeted items to TESTING
    setResults((prev) =>
      prev.map((r) => {
        const isInQueue = activeQueue.some((q) => q.id === r.id);
        if (isInQueue) {
          return { ...r, status: 'TESTING', ping: null, downloadSpeed: null, uploadSpeed: null };
        }
        return r;
      })
    );

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    // Initial start log
    setLiveLogs((prev) => [
      {
        id: `start-${Date.now()}`,
        time: timeStr,
        type: 'info' as const,
        domain: targetHost || 'Multi-CDN',
        message: targetHost
          ? `[START] شروع اسکن زنده روی هاست «${targetHost}:${targetPort}» با اپراتور «${carrierName}» (${activeQueue.length} دامنه)`
          : `[START] شروع اسکن زنده روی اپراتور «${carrierName}» (${activeQueue.length} دامنه در صف تست)`
      },
      ...prev
    ].slice(0, 500));

    const queue = [...activeQueue];
    // When proxy config is provided, run sequential test (concurrency 1 or low) so user sees each SNI tested and benchmarked one by one
    const concurrency = rawConfig.trim() ? 1 : Math.max(1, parameters.concurrency || 6);

    const worker = async () => {
      while (queue.length > 0 && !abortController.signal.aborted) {
        const item = queue.shift();
        if (!item) break;

        try {
          const scanResult = await probeSingleSni(item, parameters, {
            targetHost: targetHost || undefined,
            targetPort: targetPort || 443,
            carrierName,
            rawConfig: rawConfig.trim() || undefined,
            onLog: (newLog) => {
              setLiveLogs((prev) => [newLog, ...prev].slice(0, 500));
            }
          });
          if (abortController.signal.aborted) break;

          setResults((prev) =>
            prev.map((r) => (r.id === scanResult.id ? scanResult : r))
          );
        } catch {
          if (abortController.signal.aborted) break;
        }
      }
    };

    // Launch worker threads in parallel
    const workerPromises = Array.from({ length: concurrency }, () => worker());
    await Promise.all(workerPromises);

    setIsScanning(false);
  };

  const handleStopScan = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsScanning(false);
  };

  // 9. Export Generated Injected Configs
  const handleExportSnis = (snis: SniScanResult[], format: 'txt' | 'json' | 'vless') => {
    if (snis.length === 0) {
      alert(lang === 'fa' ? 'هیچ دامنه‌ای برای خروجی انتخاب نشده است.' : 'No domains to export.');
      return;
    }

    let content = '';
    let fileName = `sni-scan-export-${Date.now()}`;

    if (format === 'txt') {
      content = snis.map((s) => s.domain).join('\n');
      fileName += '.txt';
    } else if (format === 'json') {
      content = JSON.stringify(snis, null, 2);
      fileName += '.json';
    } else if (format === 'vless') {
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
      {/* 1. Sticky Header with Operator Profile, Mode Switch & Lang Switch */}
      <div className="sticky top-0 z-30 w-full backdrop-blur-md bg-[#0D0F16]/95 border-b border-cyan-900/30">
        <Header
          currentProfile={currentProfile}
          onSelectProfile={handleSelectProfile}
          lang={lang}
          onToggleLang={() => setLang(lang === 'fa' ? 'en' : 'fa')}
          isScanning={isScanning}
          onOpenSpeedFilterModal={() => setIsSpeedFilterModalOpen(true)}
          cleanSpeedCount={cleanSpeedCount}
          carrierInfo={carrierInfo}
          isDetectingCarrier={isDetectingCarrier}
          onRefreshCarrier={() => runCarrierDetection(undefined, true)}
        />
      </div>

      {/* 2. Main Workspace Layout (Unified, Fluid, Full Page Scrolling) */}
      <div className="flex-1 w-full max-w-[1800px] mx-auto p-3 sm:p-5 lg:p-6 space-y-5">
        {/* Speedtest-style Auto-Carrier Detection Banner */}
        <OperatorDetectBanner
          carrierInfo={carrierInfo}
          isDetecting={isDetectingCarrier}
          onRefreshDetection={() => runCarrierDetection(undefined, true)}
          currentProfile={currentProfile}
          onApplyProfile={(profileId) => {
            const found = NETWORK_PROFILES.find((p) => p.id === profileId);
            if (found) {
              handleSelectProfile(found);
            }
          }}
          lang={lang}
          onQuickScanOperator={handleQuickScanDetectedOperator}
          isScanning={isScanning}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
          {/* Left: Input, Controls & Online Fetcher (Sticky on Desktop) */}
          <Sidebar
            parameters={parameters}
            onChangeParameters={setParameters}
            rawConfig={rawConfig}
            onChangeRawConfig={setRawConfig}
            parsedConfig={parsedConfig}
            onStartScan={handleStartScan}
            onStopScan={handleStopScan}
            isScanning={isScanning}
            onOpenCustomModal={() => setIsCustomModalOpen(true)}
            onFetchOnlineSnis={() => handleFetchOnlineSnis()}
            isFetchingOnline={isFetchingOnline}
            onlineFetchCount={onlineFetchCount}
            currentProfile={currentProfile}
            lang={lang}
            totalSnisInQueue={activeQueue.length}
          />

          {/* Right: Live Benchmark Table & Speed Stats (Seamlessly Expanding) */}
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
                    ? 'لیست دامنه های سفارسی و تنظیم مقدار دانلود/اپلود اسپید تست'
                    : 'Custom Domains List & Speedtest Up/Down Config'}
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
            setActiveTab('xray_engine');
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
