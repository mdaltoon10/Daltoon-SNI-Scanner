import { useState, useEffect, useRef, useMemo } from 'react';
import {
  XrayCoreInfo,
  XrayTestResult,
  SmartOptimizationResult,
  ParsedProxyConfig,
  XrayBatchSniItem,
  SniScanResult,
  ScanLogEntry
} from '../types';
import { injectSniIntoConfig, generateMultiFormatConfigs } from '../utils/configParser';
import { safeReadClipboard, safeWriteClipboard } from '../utils/clipboard';
import {
  Terminal,
  Cpu,
  Zap,
  Play,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Server,
  Globe,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Download,
  Upload,
  Gauge,
  Layers,
  ChevronDown,
  ChevronUp,
  Sliders,
  Radio,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  Square,
  FileText,
  ListFilter,
  Flame,
  Award,
  Activity,
  ClipboardPaste,
  ClipboardCheck,
  Trash2
} from 'lucide-react';

interface XrayEngineTesterProps {
  rawConfig: string;
  onChangeRawConfig: (cfg: string) => void;
  parsedConfig: ParsedProxyConfig | null;
  lang: 'fa' | 'en';
  onApplyConfigToDashboard?: (cfg: string) => void;
  scannedResults?: SniScanResult[];
}

// Built-in curated master anti-censorship SNIs for instant batch benchmarking
const TOP_CURATED_SNIS = [
  'www.yahoo.com',
  'mail.yahoo.com',
  'search.yahoo.com',
  'finance.yahoo.com',
  'sports.yahoo.com',
  'news.yahoo.com',
  's.yimg.com',
  's1.yimg.com',
  'developer.yahoo.com',
  'help.yahoo.com',
  'cdnjs.cloudflare.com',
  'cloudflare.com',
  '1.1.1.1',
  'speed.cloudflare.com',
  'dash.cloudflare.com',
  'pages.dev',
  'workers.dev',
  'teams.microsoft.com',
  'login.microsoftonline.com',
  'azureedge.net',
  'live.com',
  'office.com',
  'bing.com',
  'images.apple.com',
  'icloud.com',
  'cdn.apple-mapkit.com',
  'api.spotify.com',
  'audio-ak-spotify-com.akamaized.net',
  'spotify.com',
  'fastly.com',
  'reddit.com',
  'github.com',
  'assets-cdn.github.com',
  'twitch.tv',
  'steamcommunity.com',
  'steamstatic.com',
  'epicgames.com',
  'medium.com',
  'speedtest.net',
  'ookla.com',
  'zoom.us',
  'vimeo.com',
  'vimeocdn.com',
  'dailymotion.com',
  'slack.com',
  'discord.com',
  'cdn.discordapp.com',
  'pinterest.com',
  'quora.com',
  'tumblr.com',
  'archive.org',
  'alibaba.com',
  'aliexpress.com',
  'shopee.com',
  'booking.com',
  'tripadvisor.com',
  'airbnb.com',
  'uber.com',
  'lyft.com',
  'weather.com',
  'accuweather.com',
  'cnn.com',
  'bbc.com',
  'reuters.com',
  'bloomberg.com',
  'forbes.com',
  'wsj.com',
  'nytimes.com',
  'theguardian.com',
  'nih.gov',
  'who.int',
  'nasa.gov',
  'mit.edu',
  'stanford.edu',
  'harvard.edu',
  'ox.ac.uk',
  'cam.ac.uk',
  'berkeley.edu',
  'nature.com',
  'sciencedirect.com',
  'springer.com',
  'ieee.org',
  'arxiv.org',
  'stackoverflow.com',
  'gitlab.com',
  'bitbucket.org',
  'npmjs.com',
  'pypi.org',
  'docker.com',
  'hub.docker.com',
  'ubuntu.com',
  'debian.org',
  'kernel.org',
  'apache.org',
  'nginx.org',
  'mysql.com',
  'postgresql.org',
  'redis.io',
  'mongodb.com',
  'elastic.co',
  'grafana.com',
  'prometheus.io',
  'kubernetes.io',
  'terraform.io',
  'ansible.com',
  'hashicorp.com'
];

export function XrayEngineTester({
  rawConfig,
  onChangeRawConfig,
  parsedConfig,
  lang,
  onApplyConfigToDashboard,
  scannedResults = []
}: XrayEngineTesterProps) {
  // Navigation Tabs inside Xray Engine
  const [activeTab, setActiveTab] = useState<'batch_tester' | 'smart_optimizer' | 'single_test'>('batch_tester');

  // Xray Core Status
  const [coreInfo, setCoreInfo] = useState<XrayCoreInfo | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);
  const [isInstallingCore, setIsInstallingCore] = useState<boolean>(false);

  // Single Test Inputs & Flags
  const [targetSni, setTargetSni] = useState<string>('');
  const [enableFragment, setEnableFragment] = useState<boolean>(true);
  const [selectedAlpn, setSelectedAlpn] = useState<string>('h2,http/1.1');
  const [customTimeout, setCustomTimeout] = useState<number>(4000);

  // Execution states for single test
  const [isRunningTest, setIsRunningTest] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<XrayTestResult | null>(null);

  // Smart Optimization states
  const [isRunningSmartOptimize, setIsRunningSmartOptimize] = useState<boolean>(false);
  const [smartResult, setSmartResult] = useState<SmartOptimizationResult | null>(null);
  const [currentOptimizingStep, setCurrentOptimizingStep] = useState<string>('');

  // ----------------------------------------------------
  // ALL-SNI BATCH TESTER & BEST UP/DOWN RANKER STATES
  // ----------------------------------------------------
  const [sniSource, setSniSource] = useState<'curated_all' | 'scanned_clean' | 'online_github' | 'custom'>('curated_all');
  const [customSniText, setCustomSniText] = useState<string>('');
  const [batchLimit, setBatchLimit] = useState<number>(50);
  const [batchConcurrency, setBatchConcurrency] = useState<number>(3);
  const [isBatchTesting, setIsBatchTesting] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; currentDomain: string }>({
    current: 0,
    total: 0,
    currentDomain: ''
  });
  const [batchResults, setBatchResults] = useState<XrayBatchSniItem[]>([]);
  const abortBatchRef = useRef<boolean>(false);

  // Filters on Batch Results
  const [minDownloadFilter, setMinDownloadFilter] = useState<number>(0);
  const [minUploadFilter, setMinUploadFilter] = useState<number>(0);
  const [maxPingFilter, setMaxPingFilter] = useState<number>(9999);
  const [onlyCleanWithUpDown, setOnlyCleanWithUpDown] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'score' | 'download' | 'upload' | 'ping'>('score');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Live Terminal Stream States
  const [liveLogs, setLiveLogs] = useState<ScanLogEntry[]>([]);
  const [terminalFilter, setTerminalFilter] = useState<'all' | 'inject' | 'clean' | 'blocked'>('all');
  const [autoScrollLogs, setAutoScrollLogs] = useState<boolean>(true);
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  const sendLog = (
    type: ScanLogEntry['type'],
    message: string,
    ping?: number | null,
    downloadSpeed?: number | null,
    domain?: string
  ) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setLiveLogs((prev) => [
      {
        id: `xray-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        time: timeStr,
        type,
        domain: domain || 'Xray-Core',
        host: parsedConfig?.server || '',
        ping: ping ?? null,
        downloadSpeed: downloadSpeed ?? null,
        message
      },
      ...prev
    ].slice(0, 400));
  };

  useEffect(() => {
    // Only scroll inside the inner logs container if desired, never scroll the whole window
    if (autoScrollLogs && logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [liveLogs, autoScrollLogs]);

  // UI copy states
  const [copiedSniId, setCopiedSniId] = useState<string | null>(null);
  const [appliedToastId, setAppliedToastId] = useState<string | null>(null);
  const [copiedBatchAll, setCopiedBatchAll] = useState<boolean>(false);
  const [copiedOptimized, setCopiedOptimized] = useState<boolean>(false);
  const [copiedLogs, setCopiedLogs] = useState<boolean>(false);
  const [showFullLogs, setShowFullLogs] = useState<boolean>(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Paste from clipboard state & handler
  const [pasteSuccess, setPasteSuccess] = useState<boolean>(false);
  const xrayTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePasteConfig = async () => {
    const text = await safeReadClipboard();
    if (text && text.trim()) {
      onChangeRawConfig(text.trim());
      setPasteSuccess(true);
      setTimeout(() => setPasteSuccess(false), 2000);
    } else {
      if (xrayTextareaRef.current) {
        xrayTextareaRef.current.focus();
        xrayTextareaRef.current.select();
      }
    }
  };

  // Fetch Xray Core status on mount
  const fetchStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch('/api/xray/status');
      const data = await res.json();
      if (data.success) {
        setCoreInfo(data);
      }
    } catch (e) {
      console.error('Error fetching Xray core status:', e);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Install / Update Core
  const handleInstallCore = async () => {
    setIsInstallingCore(true);
    try {
      const res = await fetch('/api/xray/install', { method: 'POST' });
      await res.json();
      await fetchStatus();
    } catch (e) {
      console.error('Error installing Xray core:', e);
    } finally {
      setIsInstallingCore(false);
    }
  };

  // Run single live Xray test
  const handleRunLiveTest = async () => {
    if (!rawConfig.trim()) {
      alert(lang === 'fa' ? 'لطفاً ابتدا کانفیگ را وارد کنید.' : 'Please enter a proxy config first.');
      return;
    }

    setIsRunningTest(true);
    setTestResult(null);

    const testDomain = targetSni.trim() || parsedConfig?.sni || parsedConfig?.host || 'default-sni';
    sendLog('inject', `[INJECT] Starting single Xray test for SNI "${testDomain}" on Host "${parsedConfig?.server || 'Target'}:${parsedConfig?.port || 443}"`, null, null, testDomain);

    try {
      const res = await fetch('/api/xray/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: rawConfig,
          sni: targetSni.trim() || undefined,
          timeoutMs: customTimeout,
          testDownload: true,
          fragment: enableFragment ? { packets: '1-3', length: '10-20', interval: '10-20' } : false,
          alpn: selectedAlpn
        })
      });

      const data: XrayTestResult = await res.json();
      setTestResult(data);

      if (data.success) {
        sendLog('success', `[SUCCESS] Xray tunnel connected: ${testDomain} | Latency: ${data.handshakeTimeMs}ms | Down: ${data.downloadSpeedMbps} Mbps | Up: ${data.uploadSpeedMbps} Mbps (IP: ${data.realIp} / ${data.country})`, data.handshakeTimeMs, data.downloadSpeedMbps, testDomain);
      } else {
        sendLog('error', `[ERROR] Xray test failed for ${testDomain}: ${data.error || 'Connection refused or blocked'}`, null, 0, testDomain);
      }
    } catch (err: any) {
      sendLog('error', `[API ERROR] ${err.message}`, null, 0, testDomain);
      setTestResult({
        success: false,
        handshakeTimeMs: 0,
        totalLatencyMs: 0,
        httpStatus: 0,
        realIp: '--',
        country: '--',
        colo: '--',
        downloadSpeedMbps: 0,
        uploadSpeedMbps: 0,
        testedSni: targetSni || 'default',
        testedProtocol: 'error',
        serverEndpoint: 'local',
        logs: [`[Error] API call failed: ${err.message}`],
        error: err.message,
        configType: 'error'
      });
    } finally {
      setIsRunningTest(false);
    }
  };

  // Run Intelligent Multi-Step Smart Optimizer
  const handleRunSmartOptimization = async () => {
    if (!rawConfig.trim()) {
      alert(lang === 'fa' ? 'لطفاً ابتدا کانفیگ را وارد کنید.' : 'Please enter a proxy config first.');
      return;
    }

    setIsRunningSmartOptimize(true);
    setSmartResult(null);
    setCurrentOptimizingStep(lang === 'fa' ? 'در حال اجرای تست پایه اولیه...' : 'Running initial baseline test...');
    sendLog('info', `[SMART] Starting multi-step intelligent optimization on config "${parsedConfig?.server || 'Server'}"...`);

    try {
      const candidateList = TOP_CURATED_SNIS.slice(0, 10);

      const res = await fetch('/api/xray/smart-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: rawConfig,
          candidateSnis: candidateList
        })
      });

      const data = await res.json();
      if (data.success && data.result) {
        setSmartResult(data.result);
        sendLog('success', `[OPTIMIZED] Best SNI selected: "${data.result.bestSni}" | Ping: ${data.result.optimizedPing}ms | Speed: ${data.result.optimizedSpeed} Mbps (Score: ${data.result.score}/100)`, data.result.optimizedPing, data.result.optimizedSpeed, data.result.bestSni);
      } else {
        sendLog('warning', `[SMART] Optimizer finished with warnings: ${data.error || 'Check results'}`);
      }
    } catch (err: any) {
      console.error('Smart optimization error:', err);
      sendLog('error', `[SMART ERROR] ${err.message}`);
    } finally {
      setIsRunningSmartOptimize(false);
      setCurrentOptimizingStep('');
    }
  };

  // ----------------------------------------------------
  // RUN ALL-SNI BATCH TEST WITH LIVE XRAY PIPELINE
  // ----------------------------------------------------
  const handleStartAllSniBatchTest = async () => {
    if (!rawConfig.trim()) {
      alert(lang === 'fa' ? 'لطفاً ابتدا کانفیگ را وارد کنید.' : 'Please enter a proxy config first.');
      return;
    }

    // 1. Collect target SNIs based on chosen source
    let candidateList: string[] = [];

    if (sniSource === 'curated_all') {
      candidateList = [...TOP_CURATED_SNIS];
    } else if (sniSource === 'scanned_clean') {
      const cleanScanned = scannedResults
        .filter((r) => r.status === 'CLEAN' || r.status === 'THROTTLED')
        .map((r) => r.domain);
      candidateList = cleanScanned.length > 0 ? cleanScanned : [...TOP_CURATED_SNIS];
    } else if (sniSource === 'online_github') {
      try {
        const ghRes = await fetch('/api/fetch-online-snis');
        const ghData = await ghRes.json();
        if (ghData.success && Array.isArray(ghData.domains) && ghData.domains.length > 0) {
          candidateList = ghData.domains;
        } else {
          candidateList = [...TOP_CURATED_SNIS];
        }
      } catch {
        candidateList = [...TOP_CURATED_SNIS];
      }
    } else if (sniSource === 'custom') {
      const customList = customSniText
        .split(/[\r\n,]+/)
        .map((s) => s.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase())
        .filter((s) => s && s.includes('.'));
      candidateList = customList.length > 0 ? customList : [...TOP_CURATED_SNIS];
    }

    // Slice to selected limit
    if (batchLimit > 0 && batchLimit < candidateList.length) {
      candidateList = candidateList.slice(0, batchLimit);
    }

    // Reset results & set running
    abortBatchRef.current = false;
    setIsBatchTesting(true);
    setBatchResults([]);
    setBatchProgress({ current: 0, total: candidateList.length, currentDomain: candidateList[0] || '' });

    sendLog('info', `[START] Starting Xray-core benchmark on Host "${parsedConfig?.server || 'Server'}:${parsedConfig?.port || 443}" with ${candidateList.length} candidate SNIs`);

    // Client-coordinated parallel pool calling /api/xray/test for live real-time visual streaming
    const total = candidateList.length;
    let completed = 0;
    let poolIndex = 0;
    const accumulated: XrayBatchSniItem[] = [];

    async function testWorker() {
      while (poolIndex < candidateList.length && !abortBatchRef.current) {
        const idx = poolIndex++;
        const sni = candidateList[idx];

        setBatchProgress((prev) => ({
          ...prev,
          current: completed,
          total,
          currentDomain: sni
        }));

        sendLog('inject', `[INJECT] Testing SNI "${sni}" on Host "${parsedConfig?.server || 'Edge'}:${parsedConfig?.port || 443}" via Xray-core`, null, null, sni);

        const itemId = `xray_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`;

        try {
          const res = await fetch('/api/xray/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              config: rawConfig,
              sni,
              timeoutMs: customTimeout,
              testDownload: true,
              fragment: enableFragment ? { packets: '1-3', length: '10-20', interval: '10-20' } : false,
              alpn: selectedAlpn
            })
          });

          if (abortBatchRef.current) break;

          const data: XrayTestResult = await res.json();

          // Generate injected config respecting Host vs SNI and Security
          let injectedConfig = rawConfig;
          try {
            if (parsedConfig) {
              injectedConfig = injectSniIntoConfig(parsedConfig, sni);
            }
          } catch {}

          const ping = data.success ? data.handshakeTimeMs : 9999;
          const dl = data.downloadSpeedMbps || 0;
          const up = data.uploadSpeedMbps || 0;

          let status: 'CLEAN' | 'THROTTLED' | 'BLOCKED' | 'TIMEOUT' = 'BLOCKED';
          if (data.success) {
            if (ping < 200 && dl >= 2.0) status = 'CLEAN';
            else status = 'THROTTLED';
          } else if (data.error && data.error.toLowerCase().includes('timeout')) {
            status = 'TIMEOUT';
          }

          let score = 0;
          if (data.success) {
            score = Math.min(
              100,
              Math.max(
                20,
                Math.round(100 - ping / 6 + Math.min(dl * 2.5, 35) + Math.min(up * 3, 20))
              )
            );
          }

          const item: XrayBatchSniItem = {
            id: itemId,
            sni,
            success: data.success,
            status,
            ping,
            downloadSpeedMbps: dl,
            uploadSpeedMbps: up,
            realIp: data.realIp,
            country: data.country,
            colo: data.colo,
            score,
            testedProtocol: data.testedProtocol,
            injectedConfig,
            timestamp: new Date().toISOString(),
            error: data.error
          };

          accumulated.push(item);
          // Update state live
          setBatchResults([...accumulated]);

          // Emit live result log
          if (data.success) {
            if (status === 'CLEAN') {
              sendLog('success', `[CLEAN] Xray bypass verified: ${sni} | Ping: ${ping}ms | Down: ${dl} Mbps | Up: ${up} Mbps (IP: ${data.realIp})`, ping, dl, sni);
            } else {
              sendLog('warning', `[THROTTLED] High latency on ${sni} | Ping: ${ping}ms | Down: ${dl} Mbps`, ping, dl, sni);
            }
          } else {
            sendLog('error', `[BLOCKED] Xray handshake failed for ${sni}: ${data.error || 'Blocked by DPI / Timeout'}`, ping < 9000 ? ping : null, 0, sni);
          }
        } catch (err: any) {
          if (abortBatchRef.current) break;
          accumulated.push({
            id: itemId,
            sni,
            success: false,
            status: 'BLOCKED',
            ping: 9999,
            downloadSpeedMbps: 0,
            uploadSpeedMbps: 0,
            realIp: '--',
            country: '--',
            colo: '--',
            score: 0,
            testedProtocol: 'error',
            injectedConfig: rawConfig,
            timestamp: new Date().toISOString(),
            error: err.message
          });
          setBatchResults([...accumulated]);
          sendLog('error', `[EXEC ERROR] ${sni}: ${err.message}`, null, 0, sni);
        } finally {
          completed++;
          setBatchProgress({
            current: completed,
            total,
            currentDomain: sni
          });
        }
      }
    }

    const workers = Array.from({ length: batchConcurrency }, () => testWorker());
    await Promise.all(workers);

    setIsBatchTesting(false);
    sendLog('info', `[COMPLETED] Batch test finished. Tested: ${accumulated.length} SNIs | Clean: ${accumulated.filter(r => r.success).length}`);
  };

  const handleStopBatchTest = () => {
    abortBatchRef.current = true;
    setIsBatchTesting(false);
  };

  // ----------------------------------------------------
  // FILTERED & SORTED BEST SNIs
  // ----------------------------------------------------
  const filteredBestSnis = useMemo(() => {
    return batchResults
      .filter((item) => {
        // Query search
        if (searchQuery.trim() && !item.sni.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
          return false;
        }

        // Only Clean with Up & Down
        if (onlyCleanWithUpDown) {
          if (!item.success) return false;
          if ((item.downloadSpeedMbps || 0) <= 0 && (item.uploadSpeedMbps || 0) <= 0) return false;
        }

        // Thresholds
        if (minDownloadFilter > 0 && item.downloadSpeedMbps < minDownloadFilter) return false;
        if (minUploadFilter > 0 && item.uploadSpeedMbps < minUploadFilter) return false;
        if (maxPingFilter < 9999 && item.ping > maxPingFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'download') return b.downloadSpeedMbps - a.downloadSpeedMbps;
        if (sortBy === 'upload') return b.uploadSpeedMbps - a.uploadSpeedMbps;
        if (sortBy === 'ping') return a.ping - b.ping;
        return (b.score + b.downloadSpeedMbps * 2 + b.uploadSpeedMbps) - (a.score + a.downloadSpeedMbps * 2 + a.uploadSpeedMbps);
      });
  }, [batchResults, searchQuery, onlyCleanWithUpDown, minDownloadFilter, minUploadFilter, maxPingFilter, sortBy]);

  // Top metric stats of batch
  const batchStats = useMemo(() => {
    const cleanItems = batchResults.filter((r) => r.success && (r.downloadSpeedMbps > 0 || r.uploadSpeedMbps > 0));
    const maxDl = Math.max(0, ...batchResults.map((r) => r.downloadSpeedMbps || 0));
    const maxUl = Math.max(0, ...batchResults.map((r) => r.uploadSpeedMbps || 0));
    const avgPing = cleanItems.length > 0
      ? Math.round(cleanItems.reduce((acc, c) => acc + c.ping, 0) / cleanItems.length)
      : 0;

    return {
      totalTested: batchResults.length,
      cleanWithUpDown: cleanItems.length,
      maxDl,
      maxUl,
      avgPing
    };
  }, [batchResults]);

  // Copy single injected config
  const handleCopySingleConfig = (item: XrayBatchSniItem) => {
    navigator.clipboard.writeText(item.injectedConfig);
    setCopiedSniId(item.id);
    setTimeout(() => setCopiedSniId(null), 2000);
  };

  // Copy All Top Configs
  const handleCopyAllTopConfigs = () => {
    const list = filteredBestSnis.map((item) => item.injectedConfig).join('\n\n');
    navigator.clipboard.writeText(list);
    setCopiedBatchAll(true);
    setTimeout(() => setCopiedBatchAll(false), 2000);
  };

  // Export top configs as text file
  const handleExportTopConfigs = () => {
    const list = filteredBestSnis.map((item) => item.injectedConfig).join('\n');
    const blob = new Blob([list], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Xray_Top_Verified_SNIs_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy optimized config
  const handleCopyOptimized = (cfg: string) => {
    navigator.clipboard.writeText(cfg);
    setCopiedOptimized(true);
    setTimeout(() => setCopiedOptimized(false), 2000);
  };

  // Copy Logs
  const handleCopyLogs = (logs: string[]) => {
    navigator.clipboard.writeText(logs.join('\n'));
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#07090E] text-slate-200 overflow-y-auto p-4 sm:p-6 space-y-6 font-mono">
      {/* 1. Xray-Core Engine Status Banner */}
      <div className="bg-[#0D1117] border border-cyan-900/40 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_0_25px_rgba(6,182,212,0.06)]">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-950/50 border border-cyan-500/30 rounded-lg text-cyan-400">
            <Cpu className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                {lang === 'fa' ? 'هسته عملیاتی Xray-core' : 'Xray-Core Native Engine'}
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                  {coreInfo?.version || 'v25.1.30 (amd64)'}
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'fa'
                ? 'تست واقعی و بدون واسطه کانفیگ از طریق تونل‌زنی زنده پروتکل‌های VLESS، VMess و Trojan'
                : 'Direct native proxy testing over live TLS/Reality sockets with full packet inspection'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161B22] border border-slate-800 text-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                coreInfo?.installed
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : 'bg-amber-400 animate-ping'
              }`}
            />
            <span className="text-slate-300">
              {coreInfo?.installed
                ? lang === 'fa'
                  ? 'هسته نصب و آماده'
                  : 'Core Ready / Active'
                : lang === 'fa'
                ? 'در حال آماده‌سازی هسته...'
                : 'Installing Core...'}
            </span>
          </div>

          <button
            onClick={handleInstallCore}
            disabled={isInstallingCore}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-700/50 text-cyan-300 hover:bg-cyan-900/60 text-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Update/Reinstall official Xray core binary"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isInstallingCore ? 'animate-spin' : ''}`} />
            <span>{lang === 'fa' ? 'بروزرسانی هسته' : 'Update Core'}</span>
          </button>
        </div>
      </div>

      {/* 2. Proxy Config Input & Advanced Tuning */}
      <div className="bg-[#0D1117] border border-cyan-900/30 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            {lang === 'fa' ? 'کانفیگ ورودی برای تست هسته' : 'Proxy Config to Test'}
          </label>
          <div className="flex items-center gap-2 text-[11px]">
            {/* PASTE BUTTON */}
            <button
              onClick={handlePasteConfig}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-cyan-950/80 border border-cyan-500/60 text-cyan-300 hover:bg-cyan-900/80 hover:border-cyan-400 transition-all font-sans font-medium text-xs shadow-[0_0_10px_rgba(6,182,212,0.15)] cursor-pointer"
              title={lang === 'fa' ? 'چسباندن کانفیگ کپی شده از حافظه' : 'Paste copied config from clipboard'}
            >
              {pasteSuccess ? (
                <>
                  <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">{lang === 'fa' ? 'چسبانده شد!' : 'Pasted!'}</span>
                </>
              ) : (
                <>
                  <ClipboardPaste className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{lang === 'fa' ? 'چسباندن' : 'Paste'}</span>
                </>
              )}
            </button>

            {rawConfig && (
              <button
                onClick={() => onChangeRawConfig('')}
                type="button"
                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-rose-300 hover:border-rose-900/50 transition-colors text-xs cursor-pointer"
                title={lang === 'fa' ? 'پاک کردن متن کانفیگ' : 'Clear config'}
              >
                <Trash2 className="w-3 h-3" />
                <span>{lang === 'fa' ? 'پاک کردن' : 'Clear'}</span>
              </button>
            )}

            <span className="px-2 py-1 rounded bg-[#161B22] border border-slate-800 text-cyan-300 font-mono">
              {parsedConfig?.protocol?.toUpperCase() || 'VLESS / TROJAN / VMESS'}
            </span>
          </div>
        </div>

        <textarea
          ref={xrayTextareaRef}
          value={rawConfig}
          onChange={(e) => onChangeRawConfig(e.target.value)}
          placeholder="vless://uuid@server:port?security=tls&sni=... (متن کانفیگ کپی شده را با دکمه چسباندن وارد کنید)"
          rows={3}
          className="w-full bg-[#06080D] border border-cyan-900/40 rounded-lg p-3 text-xs text-cyan-200 font-mono focus:outline-none focus:border-cyan-400 transition-colors resize-y placeholder:text-slate-600"
          dir="ltr"
        />

        {/* Live Config Mode & Detection Badges */}
        {parsedConfig && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono bg-[#070B12] p-2 rounded-lg border border-cyan-950/80">
            <span className="text-slate-500">{lang === 'fa' ? 'ساختار کانفیگ:' : 'Config Mode:'}</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-bold">
              {parsedConfig.protocol.toUpperCase()} ({parsedConfig.type || 'tcp'})
            </span>
            <span className={`px-1.5 py-0.5 rounded border ${
              parsedConfig.security === 'tls' || parsedConfig.security === 'reality'
                ? 'bg-cyan-950 border-cyan-700 text-cyan-300'
                : 'bg-emerald-950/80 border-emerald-700/80 text-emerald-300'
            }`}>
              {parsedConfig.security === 'tls'
                ? 'TLS Active'
                : parsedConfig.security === 'reality'
                ? 'Reality Active'
                : lang === 'fa'
                ? '🔓 بدون TLS (حالت HTTP Host / Bug Host)'
                : '🔓 No TLS (HTTP Host / Bug Host Mode)'}
            </span>
            {parsedConfig.headerType === 'http' && (
              <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-600/70 text-amber-300 font-bold">
                headerType=http
              </span>
            )}
            <span className="text-slate-400 truncate max-w-[280px]">
              {lang === 'fa' ? 'دامنه/هاست فعال:' : 'Active Host:'} <span className="text-white font-bold">{parsedConfig.host || parsedConfig.sni || 'N/A'}</span>
            </span>
          </div>
        )}

        {/* Global Tuning Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* TCP Fragmentation Toggle */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              {lang === 'fa' ? 'فرگمنت ضد فیلترینگ (Fragment):' : 'Anti-DPI Fragmentation:'}
            </label>
            <button
              type="button"
              onClick={() => setEnableFragment(!enableFragment)}
              className={`w-full py-1.5 px-3 rounded text-xs border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                enableFragment
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)] font-semibold'
                  : 'bg-[#06080D] border-slate-800 text-slate-500'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{enableFragment ? (lang === 'fa' ? 'فعال (1-3 / 10-20)' : 'Enabled (1-3 / 10-20)') : (lang === 'fa' ? 'غیرفعال' : 'Disabled')}</span>
            </button>
          </div>

          {/* ALPN Protocol Selection */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              {lang === 'fa' ? 'پروتکل ALPN:' : 'ALPN Transport:'}
            </label>
            <select
              value={selectedAlpn}
              onChange={(e) => setSelectedAlpn(e.target.value)}
              className="w-full bg-[#06080D] border border-cyan-900/40 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono cursor-pointer"
            >
              <option value="h2,http/1.1">h2, http/1.1 (Recommended)</option>
              <option value="http/1.1">http/1.1 (Standard)</option>
              <option value="h2">h2 Only</option>
            </select>
          </div>

          {/* Timeout */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              {lang === 'fa' ? 'حداکثر مهلت هر تست (Timeout):' : 'Per-Test Timeout:'}
            </label>
            <select
              value={customTimeout}
              onChange={(e) => setCustomTimeout(Number(e.target.value))}
              className="w-full bg-[#06080D] border border-cyan-900/40 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono cursor-pointer"
            >
              <option value={3000}>3.0 {lang === 'fa' ? 'ثانیه (سریع)' : 'Seconds (Fast)'}</option>
              <option value={4000}>4.0 {lang === 'fa' ? 'ثانیه (متعادل)' : 'Seconds (Balanced)'}</option>
              <option value={6000}>6.0 {lang === 'fa' ? 'ثانیه (عمیق)' : 'Seconds (Deep)'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('batch_tester')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'batch_tester'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'bg-[#0D1117] text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Flame className="w-4 h-4 text-emerald-300 animate-pulse" />
          <span>{lang === 'fa' ? 'تست کل SNIها و رتبه‌بندی آپلود/دانلود' : 'All-SNI Batch Tester & Up/Down Ranker'}</span>
          {batchResults.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 border border-emerald-400 text-emerald-300 text-[10px]">
              {batchResults.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('smart_optimizer')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'smart_optimizer'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
              : 'bg-[#0D1117] text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-300" />
          <span>{lang === 'fa' ? 'بهینه‌ساز هوشمند و عیب‌یابی' : 'Smart Auto-Optimizer'}</span>
        </button>

        <button
          onClick={() => setActiveTab('single_test')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'single_test'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'bg-[#0D1117] text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Play className="w-3.5 h-3.5 text-cyan-300" />
          <span>{lang === 'fa' ? 'تست زنده تک‌دامنه و کنسول' : 'Single Live Test & Terminal'}</span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: ALL-SNI BATCH TESTER & BEST UP/DOWN RANKER     */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'batch_tester' && (
        <div className="space-y-6">
          {/* Controls & Configuration Box */}
          <div className="bg-[#0E131F] border border-emerald-500/30 rounded-xl p-5 space-y-4 shadow-[0_0_25px_rgba(16,185,129,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-900/30 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-400">
                  <Flame className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {lang === 'fa' ? 'تست همگانی SNIها با هسته Xray و شناسایی بهترین‌ها' : 'All-SNI Xray Speed Benchmark Engine'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {lang === 'fa'
                      ? 'تزریق خودکار تمام دامنه‌ها به کانفیگ شما و تست زنده هندشیک، پینگ، دانلود و آپلود واقعی'
                      : 'Injects all SNIs into your proxy config, measuring real TLS handshake, ping, download & upload speed'}
                  </p>
                </div>
              </div>

              {/* Action Start / Stop Button */}
              <div className="flex items-center gap-2">
                {isBatchTesting ? (
                  <button
                    onClick={handleStopBatchTest}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs tracking-wide shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all cursor-pointer"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    <span>{lang === 'fa' ? 'توقف عملیات تست' : 'Stop Batch Testing'}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStartAllSniBatchTest}
                    disabled={!rawConfig.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>{lang === 'fa' ? '🚀 شروع تست کل SNIها با هسته Xray' : '🚀 Test All SNIs with Xray'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Source & Capacity Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {/* SNI Pool Source */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  {lang === 'fa' ? 'منبع دامنه‌ها (SNI Pool):' : 'SNI Pool Source:'}
                </label>
                <select
                  value={sniSource}
                  onChange={(e: any) => setSniSource(e.target.value)}
                  disabled={isBatchTesting}
                  className="w-full bg-[#080B12] border border-emerald-800/60 rounded-lg px-3 py-2 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-400 cursor-pointer"
                >
                  <option value="curated_all">
                    {lang === 'fa' ? 'کل SNIهای ضد فیلتر جهان (Yahoo, Cloudflare, Akamai, ...)' : 'All Curated Global SNIs (100+ Nodes)'}
                  </option>
                  <option value="scanned_clean">
                    {lang === 'fa' ? `دامنه‌های سالم کشف‌شده در اسکنر (${scannedResults.filter(r => r.status === 'CLEAN').length} دامنه)` : `Clean Domains from Scanner (${scannedResults.filter(r => r.status === 'CLEAN').length})`}
                  </option>
                  <option value="online_github">
                    {lang === 'fa' ? 'لیست‌های زنده گیت‌هاب (GitHub Anti-Filter SNIs)' : 'Live GitHub Anti-Censorship SNIs'}
                  </option>
                  <option value="custom">
                    {lang === 'fa' ? 'دامنه‌های دستی و سفارشی شما' : 'Custom Pasted SNI List'}
                  </option>
                </select>
              </div>

              {/* Number of SNIs to test */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                  <ListFilter className="w-3.5 h-3.5 text-emerald-400" />
                  {lang === 'fa' ? 'تعداد دامنه‌ها برای تست:' : 'Test Count Limit:'}
                </label>
                <select
                  value={batchLimit}
                  onChange={(e) => setBatchLimit(Number(e.target.value))}
                  disabled={isBatchTesting}
                  className="w-full bg-[#080B12] border border-emerald-800/60 rounded-lg px-3 py-2 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-400 cursor-pointer"
                >
                  <option value={20}>{lang === 'fa' ? '۲۰ دامنه برتر (تست فوق‌العاده سریع)' : '20 SNIs (Ultra Fast)'}</option>
                  <option value={50}>{lang === 'fa' ? '۵۰ دامنه برتر (پیشنهادی)' : '50 SNIs (Recommended)'}</option>
                  <option value={100}>{lang === 'fa' ? '۱۰۰ دامنه برتر (کامل)' : '100 SNIs (Comprehensive)'}</option>
                  <option value={200}>{lang === 'fa' ? '۲۰۰ دامنه (حداکثر کاوش)' : '200 SNIs (Deep Sweep)'}</option>
                  <option value={9999}>{lang === 'fa' ? 'کل دامنه‌های موجود (All)' : 'All Available SNIs'}</option>
                </select>
              </div>

              {/* Concurrency Level */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  {lang === 'fa' ? 'موازی‌سازی پردازش هسته:' : 'Core Concurrency:'}
                </label>
                <select
                  value={batchConcurrency}
                  onChange={(e) => setBatchConcurrency(Number(e.target.value))}
                  disabled={isBatchTesting}
                  className="w-full bg-[#080B12] border border-emerald-800/60 rounded-lg px-3 py-2 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-400 cursor-pointer"
                >
                  <option value={2}>2 {lang === 'fa' ? 'پراسس همزمان Xray' : 'Parallel Xray Instances'}</option>
                  <option value={3}>3 {lang === 'fa' ? 'پراسس همزمان (پیشنهادی)' : 'Parallel Instances (Standard)'}</option>
                  <option value={4}>4 {lang === 'fa' ? 'پراسس همزمان (حداکثر سرعت)' : 'Parallel Instances (High Speed)'}</option>
                </select>
              </div>
            </div>

            {/* Custom SNI input textarea if source is custom */}
            {sniSource === 'custom' && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs text-slate-300 font-semibold">
                  {lang === 'fa' ? 'دامنه‌های سفارشی (با کاما یا خط جدید جدا کنید):' : 'Custom Domains (comma or line separated):'}
                </label>
                <textarea
                  value={customSniText}
                  onChange={(e) => setCustomSniText(e.target.value)}
                  placeholder="www.yahoo.com, mail.yahoo.com, cdnjs.cloudflare.com..."
                  rows={2}
                  className="w-full bg-[#080B12] border border-emerald-800/60 rounded-lg p-2.5 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-400"
                  dir="ltr"
                />
              </div>
            )}

            {/* Live Progress Bar during Batch Testing */}
            {isBatchTesting && (
              <div className="p-4 bg-[#080B14] border border-emerald-500/40 rounded-lg space-y-2 animate-pulse">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-emerald-300 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    {lang === 'fa'
                      ? `در حال تست دامنه: ${batchProgress.currentDomain}`
                      : `Benchmarking: ${batchProgress.currentDomain}`}
                  </span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {batchProgress.current} / {batchProgress.total} (
                    {batchProgress.total > 0
                      ? Math.round((batchProgress.current / batchProgress.total) * 100)
                      : 0}
                    %)
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-emerald-900/50">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                    style={{
                      width: `${
                        batchProgress.total > 0
                          ? (batchProgress.current / batchProgress.total) * 100
                          : 0
                      }%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Realtime Live Stats Bar */}
          {batchResults.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-[#0D1117] border border-slate-800 rounded-xl p-3 flex flex-col">
                <span className="text-[10px] uppercase text-slate-500 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-cyan-400" />
                  {lang === 'fa' ? 'تست شده' : 'Tested'}
                </span>
                <span className="text-lg font-bold text-white mt-1">
                  {batchStats.totalTested}
                </span>
              </div>

              <div className="bg-[#0D1117] border border-emerald-900/50 rounded-xl p-3 flex flex-col shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <span className="text-[10px] uppercase text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {lang === 'fa' ? 'سالم با آپلود و دانلود' : 'Active Up/Down'}
                </span>
                <span className="text-lg font-bold text-emerald-300 mt-1">
                  {batchStats.cleanWithUpDown}
                </span>
              </div>

              <div className="bg-[#0D1117] border border-emerald-900/40 rounded-xl p-3 flex flex-col">
                <span className="text-[10px] uppercase text-emerald-400 flex items-center gap-1">
                  <Download className="w-3 h-3 text-emerald-400" />
                  {lang === 'fa' ? 'بالاترین دانلود' : 'Peak Download'}
                </span>
                <span className="text-lg font-bold text-emerald-300 mt-1">
                  {batchStats.maxDl} <span className="text-xs font-normal text-slate-400">Mbps</span>
                </span>
              </div>

              <div className="bg-[#0D1117] border border-cyan-900/40 rounded-xl p-3 flex flex-col">
                <span className="text-[10px] uppercase text-cyan-400 flex items-center gap-1">
                  <Upload className="w-3 h-3 text-cyan-400" />
                  {lang === 'fa' ? 'بالاترین آپلود' : 'Peak Upload'}
                </span>
                <span className="text-lg font-bold text-cyan-300 mt-1">
                  {batchStats.maxUl} <span className="text-xs font-normal text-slate-400">Mbps</span>
                </span>
              </div>

              <div className="bg-[#0D1117] border border-amber-900/40 rounded-xl p-3 flex flex-col">
                <span className="text-[10px] uppercase text-amber-400 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-amber-400" />
                  {lang === 'fa' ? 'میانگین پینگ' : 'Avg Latency'}
                </span>
                <span className="text-lg font-bold text-amber-300 mt-1">
                  {batchStats.avgPing > 0 ? `${batchStats.avgPing} ms` : '--'}
                </span>
              </div>
            </div>
          )}

          {/* Filtering & Ordering Toolbar */}
          {batchResults.length > 0 && (
            <div className="bg-[#0D1117] border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search query */}
                  <div className="relative min-w-[200px]">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={lang === 'fa' ? 'جستجوی دامنه...' : 'Search domain...'}
                      className="w-full bg-[#06080D] border border-slate-800 rounded-lg pr-9 pl-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  {/* Min Download Filter */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-400 text-[11px]">{lang === 'fa' ? 'حداقل دانلود:' : 'Min DL:'}</span>
                    <select
                      value={minDownloadFilter}
                      onChange={(e) => setMinDownloadFilter(Number(e.target.value))}
                      className="bg-[#06080D] border border-emerald-700/60 rounded px-2 py-1 text-emerald-300 text-xs font-mono focus:outline-none"
                    >
                      <option value={0}>{lang === 'fa' ? 'همه سرعت‌ها' : 'All (0 Mbps)'}</option>
                      <option value={1}>≥ 1.0 Mbps</option>
                      <option value={3}>≥ 3.0 Mbps</option>
                      <option value={5}>≥ 5.0 Mbps</option>
                      <option value={10}>≥ 10.0 Mbps</option>
                      <option value={15}>≥ 15.0 Mbps</option>
                    </select>
                  </div>

                  {/* Min Upload Filter */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-400 text-[11px]">{lang === 'fa' ? 'حداقل آپلود:' : 'Min UL:'}</span>
                    <select
                      value={minUploadFilter}
                      onChange={(e) => setMinUploadFilter(Number(e.target.value))}
                      className="bg-[#06080D] border border-cyan-700/60 rounded px-2 py-1 text-cyan-300 text-xs font-mono focus:outline-none"
                    >
                      <option value={0}>{lang === 'fa' ? 'همه سرعت‌ها' : 'All (0 Mbps)'}</option>
                      <option value={0.5}>≥ 0.5 Mbps</option>
                      <option value={1.0}>≥ 1.0 Mbps</option>
                      <option value={2.0}>≥ 2.0 Mbps</option>
                      <option value={5.0}>≥ 5.0 Mbps</option>
                    </select>
                  </div>

                  {/* Sort by */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-400 text-[11px]">{lang === 'fa' ? 'مرتب‌سازی:' : 'Sort:'}</span>
                    <select
                      value={sortBy}
                      onChange={(e: any) => setSortBy(e.target.value)}
                      className="bg-[#06080D] border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs font-mono focus:outline-none"
                    >
                      <option value="score">{lang === 'fa' ? 'امتیاز کلی کیفیت (پیشنهادی)' : 'Quality Score'}</option>
                      <option value="download">{lang === 'fa' ? 'بیشترین دانلود' : 'Highest Download'}</option>
                      <option value="upload">{lang === 'fa' ? 'بیشترین آپلود' : 'Highest Upload'}</option>
                      <option value="ping">{lang === 'fa' ? 'کمترین پینگ' : 'Lowest Ping'}</option>
                    </select>
                  </div>

                  {/* Only Active Up/Down Toggle */}
                  <button
                    onClick={() => setOnlyCleanWithUpDown(!onlyCleanWithUpDown)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs border transition-all cursor-pointer ${
                      onlyCleanWithUpDown
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500 font-semibold'
                        : 'bg-[#06080D] text-slate-400 border-slate-800'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{lang === 'fa' ? 'فقط سالم با آپلود و دانلود' : 'Active Up/Down Only'}</span>
                  </button>
                </div>

                {/* Batch Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyAllTopConfigs}
                    disabled={filteredBestSnis.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-600 text-emerald-300 hover:bg-emerald-900 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40"
                  >
                    {copiedBatchAll ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBatchAll ? (lang === 'fa' ? 'کپی شد!' : 'Copied!') : (lang === 'fa' ? 'کپی یکجای کانفیگ‌های برتر' : 'Batch Copy All')}</span>
                  </button>

                  <button
                    onClick={handleExportTopConfigs}
                    disabled={filteredBestSnis.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161B22] border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs transition-colors cursor-pointer disabled:opacity-40"
                    title="Export all verified configurations as txt file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{lang === 'fa' ? 'خروجی .txt' : 'Export .txt'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Ranked Results: Best SNIs List */}
          {batchResults.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-slate-400 font-semibold flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  {lang === 'fa'
                    ? `لیست برترین SNIهای واجد شرایط (${filteredBestSnis.length} دامنه):`
                    : `Ranked Winning SNIs with Verified Throughput (${filteredBestSnis.length}):`}
                </span>
                <span className="text-slate-500 text-[11px]">
                  {lang === 'fa' ? 'رتبه‌بندی بر اساس سرعت دانلود، آپلود و پینگ واقعی' : 'Ranked by live download, upload & ping benchmark'}
                </span>
              </div>

              {filteredBestSnis.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {filteredBestSnis.map((item, idx) => {
                    const isPodium = idx < 3;
                    const podiumColor =
                      idx === 0
                        ? 'border-amber-500/70 bg-gradient-to-r from-[#111A24] via-[#0E1520] to-[#0B1019] shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                        : idx === 1
                        ? 'border-slate-400/50 bg-[#0E131F]'
                        : idx === 2
                        ? 'border-amber-700/50 bg-[#0E131F]'
                        : 'border-slate-800/80 bg-[#0A0D15] hover:border-slate-700';

                    return (
                      <div
                        key={item.id}
                        className={`border rounded-xl p-4 transition-all duration-200 ${podiumColor}`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          {/* Left: Rank, Domain & Geo */}
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Rank Badge */}
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                                idx === 0
                                  ? 'bg-amber-500 text-black shadow-[0_0_12px_#f59e0b]'
                                  : idx === 1
                                  ? 'bg-slate-300 text-black'
                                  : idx === 2
                                  ? 'bg-amber-700 text-white'
                                  : 'bg-[#161B22] text-slate-400 border border-slate-800'
                              }`}
                            >
                              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-white font-mono tracking-tight">
                                  {item.sni}
                                </span>

                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                    item.status === 'CLEAN'
                                      ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                                      : item.status === 'THROTTLED'
                                      ? 'bg-amber-950 border border-amber-500 text-amber-300'
                                      : 'bg-rose-950 border border-rose-500 text-rose-300'
                                  }`}
                                >
                                  {item.status}
                                </span>

                                {item.score >= 80 && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-cyan-400" />
                                    {lang === 'fa' ? 'عالی' : 'ULTRA'}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap font-mono">
                                <span>{lang === 'fa' ? 'آی‌پی خروجی:' : 'Out IP:'} <strong className="text-cyan-300">{item.realIp}</strong></span>
                                {item.country && item.country !== '--' && (
                                  <span className="px-1.5 py-0.2 rounded bg-[#161B22] border border-slate-800 text-slate-300 text-[10px]">
                                    {item.country} / {item.colo}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Middle: Live Performance Metrics (Download, Upload, Ping, Score) */}
                          <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-[#06080D] border border-slate-800/80 px-4 py-2.5 rounded-xl">
                            {/* Download Speed */}
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase text-emerald-400 font-semibold flex items-center gap-1">
                                <Download className="w-3 h-3" />
                                {lang === 'fa' ? 'دانلود' : 'Download'}
                              </span>
                              <span className="text-base font-bold text-emerald-300 font-mono">
                                {item.downloadSpeedMbps} <span className="text-[10px] font-normal text-slate-400">Mbps</span>
                              </span>
                            </div>

                            {/* Upload Speed */}
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase text-cyan-400 font-semibold flex items-center gap-1">
                                <Upload className="w-3 h-3" />
                                {lang === 'fa' ? 'آپلود' : 'Upload'}
                              </span>
                              <span className="text-base font-bold text-cyan-300 font-mono">
                                {item.uploadSpeedMbps} <span className="text-[10px] font-normal text-slate-400">Mbps</span>
                              </span>
                            </div>

                            {/* Handshake Ping */}
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase text-slate-400 font-semibold flex items-center gap-1">
                                <Activity className="w-3 h-3 text-amber-400" />
                                {lang === 'fa' ? 'پینگ' : 'Ping'}
                              </span>
                              <span className={`text-base font-bold font-mono ${item.ping < 180 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {item.ping !== 9999 ? `${item.ping}ms` : 'Failed'}
                              </span>
                            </div>

                            {/* Overall Score */}
                            <div className="flex flex-col border-r rtl:border-r-0 rtl:border-l border-slate-800 pr-3 rtl:pr-0 rtl:pl-3">
                              <span className="text-[10px] uppercase text-purple-400 font-semibold">
                                {lang === 'fa' ? 'امتیاز' : 'Score'}
                              </span>
                              <span className="text-base font-bold text-purple-300 font-mono">
                                {item.score}/100
                              </span>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Copy Injected Config */}
                            <button
                              onClick={() => handleCopySingleConfig(item)}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-950/80 border border-emerald-600 hover:bg-emerald-900 text-emerald-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
                            >
                              {copiedSniId === item.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-white" />
                                  <span>{lang === 'fa' ? 'کپی شد!' : 'Copied!'}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>{lang === 'fa' ? 'کپی کانفیگ' : 'Copy Config'}</span>
                                </>
                              )}
                            </button>

                            {/* Apply to Editor */}
                            <button
                              onClick={() => {
                                onChangeRawConfig(item.injectedConfig);
                                if (onApplyConfigToDashboard) {
                                  onApplyConfigToDashboard(item.injectedConfig);
                                }
                                setAppliedToastId(item.id);
                                setTimeout(() => setAppliedToastId(null), 2500);
                              }}
                              className={`flex items-center gap-1 p-2 rounded-lg border transition-colors cursor-pointer ${
                                appliedToastId === item.id
                                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                                  : 'bg-[#161B22] border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                              }`}
                              title={lang === 'fa' ? 'اعمال مستقیم به ورودی کانفیگ' : 'Apply to editor'}
                            >
                              <Check className={`w-4 h-4 ${appliedToastId === item.id ? 'text-emerald-400' : 'text-cyan-400'}`} />
                              {appliedToastId === item.id && (
                                <span className="text-[10px] text-cyan-300 font-bold px-1 animate-fade-in">
                                  {lang === 'fa' ? 'اعمال شد' : 'Applied'}
                                </span>
                              )}
                            </button>

                            {/* Debug in single live test */}
                            <button
                              onClick={() => {
                                setTargetSni(item.sni);
                                setActiveTab('single_test');
                              }}
                              className="p-2 rounded-lg bg-[#161B22] border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                              title={lang === 'fa' ? 'تست و لاگ‌گیری عمیق در ترمینال' : 'Deep debug in terminal'}
                            >
                              <Terminal className="w-4 h-4 text-purple-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-[#0D1117] border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs space-y-2">
                  <p>{lang === 'fa' ? 'هیچ دامنه‌ای با فیلترهای انتخابی شما مطابقت نداشت.' : 'No SNIs matched your current filter criteria.'}</p>
                  <button
                    onClick={() => {
                      setMinDownloadFilter(0);
                      setMinUploadFilter(0);
                      setMaxPingFilter(9999);
                      setOnlyCleanWithUpDown(false);
                      setSearchQuery('');
                    }}
                    className="text-emerald-400 hover:underline cursor-pointer font-semibold"
                  >
                    {lang === 'fa' ? 'حذف تمام فیلترها و مشاهده همه نتایج' : 'Reset all filters'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            !isBatchTesting && (
              <div className="bg-[#0D1117] border border-dashed border-emerald-900/60 rounded-xl p-8 sm:p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <Flame className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-sm font-bold text-white">
                  {lang === 'fa' ? 'آماده تست دسته‌جمعی کل SNIها با هسته Xray' : 'Ready to Benchmark All SNIs with Native Xray'}
                </h4>
                <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
                  {lang === 'fa'
                    ? 'کانفیگ VLESS یا Trojan خود را در کادر بالا وارد کرده و دکمه "شروع تست کل SNIها با هسته Xray" را بزنید تا سالم‌ترین و پرسرعت‌ترین دامنه‌ها به ترتیب آپلود و دانلود واقعی برای شما رتبه‌بندی شوند.'
                    : 'Paste your proxy config above and click "Test All SNIs with Xray" to benchmark real upload & download throughput across all global anti-censorship SNIs.'}
                </p>
              </div>
            )
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: SMART AUTO-OPTIMIZER                           */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'smart_optimizer' && (
        <div className="space-y-6">
          <div className="bg-[#0E131F] border border-purple-500/30 rounded-xl p-5 space-y-4 shadow-[0_0_25px_rgba(168,85,247,0.1)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-900/30 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-950/80 border border-purple-500/50 rounded-lg text-purple-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {lang === 'fa' ? 'عیب‌یاب و بهینه‌ساز خودکار هوشمند' : 'Intelligent Diagnostic & Auto-Tuner'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {lang === 'fa'
                      ? 'تست گام‌به‌گام پارامترهای کانفیگ، فرگمنت، ALPN و انتخاب بهترین SNI'
                      : 'Multi-step diagnostic engine analyzing DPI bypass, packet fragmentation & latency'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleRunSmartOptimization}
                disabled={isRunningSmartOptimize || !rawConfig.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all cursor-pointer disabled:opacity-50"
              >
                {isRunningSmartOptimize ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-purple-200" />
                    <span>{currentOptimizingStep || (lang === 'fa' ? 'در حال بهینه‌سازی...' : 'Optimizing...')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-purple-200" />
                    <span>{lang === 'fa' ? 'اجرای بهینه‌سازی هوشمند' : 'Run Smart Optimizer'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Smart Optimization Result View */}
          {smartResult && (
            <div className="bg-[#0E131F] border border-purple-500/40 rounded-xl p-5 space-y-4 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-900/40 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-950/80 border border-purple-500/40 rounded-lg text-purple-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {lang === 'fa' ? 'نتیجه تحلیل و بهینه‌سازی هوشمند' : 'Smart Optimization Result'}
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-950 border border-purple-500 text-purple-300 font-mono">
                        Score: {smartResult.score}/100
                      </span>
                    </h3>
                    <p className="text-xs text-purple-300/80 mt-0.5">{smartResult.diagnostics}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyOptimized(smartResult.optimizedConfig)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-900/60 border border-purple-600/60 text-purple-200 hover:bg-purple-800 text-xs transition-colors cursor-pointer"
                  >
                    {copiedOptimized ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedOptimized ? (lang === 'fa' ? 'کپی شد!' : 'Copied!') : (lang === 'fa' ? 'کپی کانفیگ بهینه' : 'Copy Optimized')}</span>
                  </button>

                  {onApplyConfigToDashboard && (
                    <button
                      onClick={() => {
                        onApplyConfigToDashboard(smartResult.optimizedConfig);
                        alert(lang === 'fa' ? 'کانفیگ بهینه‌شده به داشبورد اعمال شد!' : 'Applied optimized config to dashboard!');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500 text-emerald-300 hover:bg-emerald-900 text-xs transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{lang === 'fa' ? 'اعمال روی داشبورد' : 'Apply to Dashboard'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Metric Comparison Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#080B12] border border-slate-800 rounded-lg p-3 flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500">{lang === 'fa' ? 'پینگ اولیه' : 'Original Ping'}</span>
                  <span className="text-lg font-bold text-slate-400 mt-1">
                    {smartResult.originalPing ? `${smartResult.originalPing} ms` : 'Blocked'}
                  </span>
                </div>

                <div className="bg-[#080B12] border border-emerald-900/40 rounded-lg p-3 flex flex-col shadow-[0_0_15px_rgba(52,211,153,0.1)]">
                  <span className="text-[10px] uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    {lang === 'fa' ? 'پینگ بهینه‌شده' : 'Optimized Ping'}
                  </span>
                  <span className="text-lg font-bold text-emerald-300 mt-1">
                    {smartResult.optimizedPing ? `${smartResult.optimizedPing} ms` : 'Failed'}
                  </span>
                </div>

                <div className="bg-[#080B12] border border-cyan-900/40 rounded-lg p-3 flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-cyan-400">{lang === 'fa' ? 'سرعت دانلود' : 'Download Speed'}</span>
                  <span className="text-lg font-bold text-cyan-300 mt-1">
                    {smartResult.optimizedSpeed} <span className="text-xs font-normal text-slate-400">Mbps</span>
                  </span>
                </div>

                <div className="bg-[#080B12] border border-purple-900/40 rounded-lg p-3 flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-purple-400">{lang === 'fa' ? 'بهترین SNI کشف‌شده' : 'Best Discovered SNI'}</span>
                  <span className="text-xs font-bold text-purple-200 mt-1 truncate" title={smartResult.bestSni}>
                    {smartResult.bestSni}
                  </span>
                </div>
              </div>

              {/* Stepper Breakdown Table */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
                  {lang === 'fa' ? 'گزارش مرحله به مرحله تست‌های هوشمند:' : 'Step-by-Step Diagnostics Log:'}
                </h4>
                <div className="bg-[#07090E] border border-purple-950 rounded-lg overflow-x-auto">
                  <table className="w-full text-[11px] text-left rtl:text-right">
                    <thead className="bg-[#121724] text-slate-400 uppercase text-[9px] tracking-wider border-b border-purple-900/40">
                      <tr>
                        <th className="p-2.5">{lang === 'fa' ? 'مرحله' : 'Step'}</th>
                        <th className="p-2.5">{lang === 'fa' ? 'مورد آزمایش' : 'Target / Candidate'}</th>
                        <th className="p-2.5">{lang === 'fa' ? 'پینگ' : 'Ping'}</th>
                        <th className="p-2.5">{lang === 'fa' ? 'سرعت' : 'Speed'}</th>
                        <th className="p-2.5">{lang === 'fa' ? 'وضعیت و تحلیل' : 'Status & Analysis'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-900/20">
                      {smartResult.steps.map((step, idx) => (
                        <tr key={idx} className="hover:bg-purple-950/20 transition-colors">
                          <td className="p-2.5 font-bold text-purple-300">{step.step}</td>
                          <td className="p-2.5 text-slate-200 font-mono">{step.candidate}</td>
                          <td className="p-2.5">
                            {step.ping ? (
                              <span className={step.ping < 150 ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                                {step.ping} ms
                              </span>
                            ) : (
                              <span className="text-rose-400">Failed</span>
                            )}
                          </td>
                          <td className="p-2.5 text-cyan-300">{step.downloadSpeed ? `${step.downloadSpeed} Mbps` : '--'}</td>
                          <td className="p-2.5 text-slate-300 text-[10px]">{step.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: SINGLE LIVE TEST & LOGS TERMINAL               */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'single_test' && (
        <div className="space-y-6">
          {/* Custom SNI override input for single test */}
          <div className="bg-[#0D1117] border border-cyan-900/30 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1 flex-1 min-w-[240px]">
                <label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  {lang === 'fa' ? 'SNI هدف برای تست تکی زنده:' : 'Target SNI for Single Live Test:'}
                </label>
                <input
                  type="text"
                  value={targetSni}
                  onChange={(e) => setTargetSni(e.target.value)}
                  placeholder={parsedConfig?.sni || 'e.g. www.yahoo.com'}
                  className="w-full bg-[#06080D] border border-cyan-900/40 rounded px-3 py-2 text-xs text-cyan-200 focus:outline-none focus:border-cyan-400 font-mono"
                  dir="ltr"
                />
              </div>

              <button
                onClick={handleRunLiveTest}
                disabled={isRunningTest || !rawConfig.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all cursor-pointer disabled:opacity-50 mt-4 sm:mt-0"
              >
                {isRunningTest ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>{lang === 'fa' ? 'در حال اجرای تست زنده...' : 'Testing Live with Xray...'}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>{lang === 'fa' ? 'اجرای تست زنده تک‌دامنه' : 'Run Live Single Test'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Single Live Xray Test Result View */}
          {testResult && (
            <div
              className={`bg-[#0D1117] border rounded-xl p-5 space-y-4 ${
                testResult.success
                  ? 'border-emerald-500/40 shadow-[0_0_25px_rgba(52,211,153,0.1)]'
                  : 'border-rose-500/40 shadow-[0_0_25px_rgba(244,63,94,0.1)]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-lg ${
                      testResult.success
                        ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-400'
                        : 'bg-rose-950/80 border border-rose-500 text-rose-400'
                    }`}
                  >
                    {testResult.success ? <Check className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {testResult.success
                        ? lang === 'fa'
                          ? 'اتصال موفق از طریق هسته Xray'
                          : 'Xray Tunnel Connected Successfully'
                        : lang === 'fa'
                        ? 'خطا در برقراری اتصال با هسته Xray'
                        : 'Connection Failed via Xray'}
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full ${
                          testResult.success
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                            : 'bg-rose-950 text-rose-300 border border-rose-600'
                        }`}
                      >
                        HTTP {testResult.httpStatus || 0}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {lang === 'fa' ? 'سرور مقصد:' : 'Endpoint:'} {testResult.serverEndpoint} | SNI: {testResult.testedSni}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-[#161B22] rounded border border-slate-700 text-xs">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{lang === 'fa' ? 'آی‌پی خروجی:' : 'Outbound IP:'}</span>
                    <strong className="text-cyan-300">{testResult.realIp}</strong>
                    {testResult.country && testResult.country !== '--' && (
                      <span className="text-[10px] bg-cyan-950 px-1.5 py-0.5 rounded text-cyan-200 uppercase">
                        {testResult.country} / {testResult.colo}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Handshake Ping */}
                <div className="bg-[#06080D] border border-cyan-900/30 rounded-lg p-3 flex flex-col">
                  <span className="text-[10px] uppercase text-slate-500 flex items-center gap-1">
                    <Radio className="w-3 h-3 text-cyan-400" />
                    {lang === 'fa' ? 'تأخیر هندشیک' : 'Handshake Latency'}
                  </span>
                  <span className="text-lg font-bold text-cyan-300 mt-1">
                    {testResult.handshakeTimeMs} <span className="text-xs font-normal text-slate-400">ms</span>
                  </span>
                </div>

                {/* Total Latency */}
                <div className="bg-[#06080D] border border-cyan-900/30 rounded-lg p-3 flex flex-col">
                  <span className="text-[10px] uppercase text-slate-500 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    {lang === 'fa' ? 'تأخیر رفت و برگشت RTT' : 'Round-Trip Latency'}
                  </span>
                  <span className="text-lg font-bold text-cyan-300 mt-1">
                    {testResult.totalLatencyMs} <span className="text-xs font-normal text-slate-400">ms</span>
                  </span>
                </div>

                {/* Download Throughput */}
                <div className="bg-[#06080D] border border-emerald-900/30 rounded-lg p-3 flex flex-col">
                  <span className="text-[10px] uppercase text-emerald-400 flex items-center gap-1">
                    <Download className="w-3 h-3 text-emerald-400" />
                    {lang === 'fa' ? 'سرعت دانلود تونل' : 'Tunnel Download Speed'}
                  </span>
                  <span className="text-lg font-bold text-emerald-300 mt-1">
                    {testResult.downloadSpeedMbps} <span className="text-xs font-normal text-slate-400">Mbps</span>
                  </span>
                </div>

                {/* Upload Throughput */}
                <div className="bg-[#06080D] border border-cyan-900/30 rounded-lg p-3 flex flex-col">
                  <span className="text-[10px] uppercase text-cyan-400 flex items-center gap-1">
                    <Upload className="w-3 h-3 text-cyan-400" />
                    {lang === 'fa' ? 'سرعت آپلود تونل' : 'Tunnel Upload Speed'}
                  </span>
                  <span className="text-lg font-bold text-cyan-300 mt-1">
                    {testResult.uploadSpeedMbps} <span className="text-xs font-normal text-slate-400">Mbps</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Terminal Console: Real Xray Runtime Logs */}
          <div className="bg-[#0A0C13] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-[#121622] px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-200">
                  {lang === 'fa' ? 'لاگ‌های هسته Xray در زمان اجرا' : 'Xray Native Process Console'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyLogs(testResult?.logs || ['No logs yet'])}
                  className="px-2 py-1 bg-[#1A2030] hover:bg-slate-700 text-[10px] text-slate-300 rounded flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedLogs ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLogs ? (lang === 'fa' ? 'کپی شد' : 'Copied') : (lang === 'fa' ? 'کپی لاگ' : 'Copy')}</span>
                </button>

                <button
                  onClick={() => setShowFullLogs(!showFullLogs)}
                  className="p-1 hover:bg-slate-700 rounded text-slate-400 transition-colors"
                >
                  {showFullLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {showFullLogs && (
              <div
                ref={logContainerRef}
                className="p-3 bg-[#05060A] text-[11px] font-mono text-slate-300 max-h-56 overflow-y-auto space-y-1 select-text"
                dir="ltr"
              >
                {testResult && testResult.logs.length > 0 ? (
                  testResult.logs.map((line, idx) => (
                    <div
                      key={idx}
                      className={`${
                        line.includes('[Error]') || line.includes('error')
                          ? 'text-rose-400'
                          : line.includes('HTTP Response: 200') || line.includes('result:')
                          ? 'text-emerald-400'
                          : line.includes('[Xray]')
                          ? 'text-cyan-300'
                          : 'text-slate-400'
                      }`}
                    >
                      <span className="text-slate-600 select-none mr-2">[{idx + 1}]</span>
                      {line}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-600 italic">
                    {lang === 'fa'
                      ? '// آماده برای اجرای تست. دکمه "اجرای تست زنده تک‌دامنه" را فشار دهید.'
                      : '// Ready. Click "Run Live Single Test" to begin.'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* UNIVERSAL LIVE EXECUTION TERMINAL STREAM              */}
      {/* ---------------------------------------------------- */}
      <section className="rounded-2xl border border-slate-800 bg-[#0B0F19]/90 backdrop-blur-md p-4 sm:p-5 shadow-xl space-y-3 mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
                {lang === 'fa' ? 'ترمینال لاگ زنده تست با هسته Xray' : 'Xray Live Engine Test Stream'}
                {isBatchTesting || isRunningTest || isRunningSmartOptimize ? (
                  <span className="flex items-center gap-1 text-[10px] bg-cyan-950 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded-full animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    {lang === 'fa' ? 'در حال ارسال و تست زنده' : 'Testing Live'}
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                    {liveLogs.length} {lang === 'fa' ? 'لاگ ثبت شده' : 'logs'}
                  </span>
                )}
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Filter Buttons */}
            <div className="flex items-center bg-[#07090E] border border-slate-800 rounded-lg p-0.5 text-[11px]">
              {(['all', 'inject', 'clean', 'blocked'] as const).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setTerminalFilter(filterType)}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    terminalFilter === filterType
                      ? 'bg-cyan-500 text-black font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filterType === 'all'
                    ? lang === 'fa' ? 'همه' : 'All'
                    : filterType === 'inject'
                    ? lang === 'fa' ? 'تزریق' : 'Inject'
                    : filterType === 'clean'
                    ? lang === 'fa' ? 'سالم' : 'Clean'
                    : lang === 'fa' ? 'فیلتر/خطا' : 'Blocked'}
                </button>
              ))}
            </div>

            {/* Auto Scroll Toggle */}
            <button
              onClick={() => setAutoScrollLogs(!autoScrollLogs)}
              className={`px-2 py-1 rounded border text-[11px] flex items-center gap-1 cursor-pointer transition-colors ${
                autoScrollLogs
                  ? 'bg-slate-800 border-slate-700 text-cyan-400'
                  : 'bg-transparent border-slate-800 text-slate-500'
              }`}
            >
              <span>{lang === 'fa' ? 'اسکرول خودکار' : 'Auto Scroll'}</span>
            </button>

            {/* Copy Logs */}
            <button
              onClick={() => {
                const text = liveLogs.map((l) => `[${l.time}] ${l.message}`).join('\n');
                safeWriteClipboard(text);
                setCopiedLogs(true);
                setTimeout(() => setCopiedLogs(false), 2000);
              }}
              disabled={liveLogs.length === 0}
              className="px-2.5 py-1 rounded bg-[#161B22] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white flex items-center gap-1 disabled:opacity-40 cursor-pointer"
            >
              {copiedLogs ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLogs ? (lang === 'fa' ? 'کپی شد' : 'Copied') : lang === 'fa' ? 'کپی لاگ' : 'Copy'}</span>
            </button>

            {/* Clear Logs */}
            <button
              onClick={() => setLiveLogs([])}
              disabled={liveLogs.length === 0}
              className="px-2.5 py-1 rounded bg-[#161B22] border border-slate-800 hover:border-rose-900/50 hover:text-rose-400 text-slate-400 flex items-center gap-1 disabled:opacity-40 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{lang === 'fa' ? 'پاک‌سازی' : 'Clear'}</span>
            </button>
          </div>
        </div>

        {/* Live Terminal Output Box */}
        <div
          ref={logContainerRef}
          className="w-full max-h-64 sm:max-h-72 overflow-y-auto rounded-xl bg-[#05060A] border border-slate-800/80 p-3 font-mono text-[11px] leading-relaxed select-text space-y-1 scrollbar-thin scrollbar-thumb-slate-800"
          dir="ltr"
        >
          {liveLogs.length === 0 ? (
            <div className="py-8 text-center text-slate-500 space-y-2">
              <Terminal className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
              <p>
                {lang === 'fa'
                  ? 'هنوز تستی با هسته Xray انجام نشده است. روی دکمه «شروع تست کل SNIها با هسته Xray» یا «اجرای تست زنده تک‌دامنه» کلیک کنید.'
                  : 'No active Xray logs yet. Click "Test All SNIs with Xray" or "Run Live Single Test" to view real-time execution logs.'}
              </p>
            </div>
          ) : (
            liveLogs
              .filter((log) => {
                if (terminalFilter === 'all') return true;
                if (terminalFilter === 'inject') return log.type === 'inject' || log.type === 'info';
                if (terminalFilter === 'clean') return log.type === 'success' || log.type === 'speed';
                if (terminalFilter === 'blocked') return log.type === 'error' || log.type === 'warning';
                return true;
              })
              .map((log) => {
                let badgeClass = 'bg-slate-800 text-slate-400';
                if (log.type === 'inject') badgeClass = 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30';
                else if (log.type === 'success') badgeClass = 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
                else if (log.type === 'warning') badgeClass = 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
                else if (log.type === 'error') badgeClass = 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
                else if (log.type === 'speed') badgeClass = 'bg-blue-500/15 text-blue-400 border border-blue-500/30';

                return (
                  <div
                    key={log.id}
                    className="flex flex-wrap items-center gap-2 py-1 px-2 rounded hover:bg-slate-900/60 transition-colors border-b border-slate-900/40"
                  >
                    <span className="text-slate-600 font-mono text-[10px]">{log.time}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${badgeClass}`}>
                      {log.type}
                    </span>
                    <span className="text-slate-300 font-mono flex-1 break-all">{log.message}</span>
                    {log.ping !== null && log.ping !== undefined && log.ping > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-cyan-300">
                        {log.ping} ms
                      </span>
                    )}
                    {log.downloadSpeed !== null && log.downloadSpeed !== undefined && log.downloadSpeed > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950/40 border border-emerald-800/40 text-emerald-300">
                        ⬇ {log.downloadSpeed} Mbps
                      </span>
                    )}
                  </div>
                );
              })
          )}
          <div ref={terminalBottomRef} />
        </div>
      </section>
    </div>
  );
}
