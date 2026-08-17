import { useState, useMemo, useEffect, useRef } from 'react';
import { SniScanResult, SniStatus, ParsedProxyConfig, ScanLogEntry } from '../types';
import { injectSniIntoConfig } from '../utils/configParser';
import {
  Search,
  ArrowUpDown,
  Download,
  Gauge,
  Zap,
  Copy,
  Check,
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Sparkles,
  Wifi,
  Cpu,
  Globe2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Flame,
  Radio,
  Layers,
  RefreshCw,
  Terminal,
  Trash2
} from 'lucide-react';
import { CyberSelect, SelectOption } from './CyberSelect';

interface ActiveProbeFeedProps {
  results: SniScanResult[];
  isScanning: boolean;
  onOpenSpeedTest: (sni: string) => void;
  onApplySniToConfig: (sni: string) => void;
  onExportSnis: (snis: SniScanResult[], format: 'txt' | 'json' | 'vless') => void;
  onFetchGlobalStream?: (category: string, count: number, offset?: number) => void;
  onOpenSpeedFilterModal?: () => void;
  isStreamingGlobal?: boolean;
  totalUniverseCount?: number;
  parsedConfig: ParsedProxyConfig | null;
  rawConfig: string;
  lang: 'fa' | 'en';
  liveLogs?: ScanLogEntry[];
  onClearLogs?: () => void;
}

const CATEGORY_CHIPS = [
  { id: 'all', nameEn: 'All SNIs', nameFa: 'همه دامنه‌های جهان (TLS 1.3)', icon: Globe2 },
  { id: 'yahoo', nameEn: 'Yahoo! Network', nameFa: 'یاهو (Yahoo World)', icon: Radio },
  { id: 'cloudflare', nameEn: 'Cloudflare Edge', nameFa: 'کلودفلر (Cloudflare)', icon: Flame },
  { id: 'akamai', nameEn: 'Akamai Global', nameFa: 'آکامای (Akamai)', icon: Layers },
  { id: 'fastly', nameEn: 'Fastly & GitHub', nameFa: 'فستلی و گیت‌هاب', icon: Zap },
  { id: 'google', nameEn: 'Google Edge', nameFa: 'گوگل (Google GWS)', icon: Sparkles },
  { id: 'microsoft', nameEn: 'Microsoft & Azure', nameFa: 'مایکروسافت و آژور', icon: Cpu },
  { id: 'amazon', nameEn: 'Amazon CloudFront', nameFa: 'آمازون (AWS)', icon: Wifi },
  { id: 'apple', nameEn: 'Apple CDN', nameFa: 'اپل (Apple)', icon: Globe2 },
  { id: 'spotify', nameEn: 'Spotify & Discord', nameFa: 'اسپاتیفای و دیسکورد', icon: Radio },
  { id: 'general', nameEn: 'Top World Infra', nameFa: 'زیرساخت‌های برتر جهان', icon: Layers }
];

export function ActiveProbeFeed({
  results,
  isScanning,
  onOpenSpeedTest,
  onApplySniToConfig,
  onExportSnis,
  onFetchGlobalStream,
  onOpenSpeedFilterModal,
  isStreamingGlobal = false,
  totalUniverseCount = 1000000,
  parsedConfig,
  rawConfig,
  lang,
  liveLogs = [],
  onClearLogs
}: ActiveProbeFeedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CLEAN' | 'THROTTLED' | 'BLOCKED'>('ALL');
  const [activeCategoryChip, setActiveCategoryChip] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'ping' | 'download' | 'upload' | 'domain'>('ping');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedLogs, setCopiedLogs] = useState<boolean>(false);
  const [logFilter, setLogFilter] = useState<'ALL' | 'INJECT' | 'CLEAN' | 'BLOCKED'>('ALL');
  const [autoScrollLogs, setAutoScrollLogs] = useState<boolean>(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs to top or bottom when new logs arrive
  useEffect(() => {
    if (autoScrollLogs && logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [liveLogs, autoScrollLogs]);

  // User-defined Speed Filtering State directly in the Feed
  const [minDownloadFilter, setMinDownloadFilter] = useState<number>(0);
  const [minUploadFilter, setMinUploadFilter] = useState<number>(0);
  const [isSpeedFilterExpanded, setIsSpeedFilterExpanded] = useState<boolean>(false);

  // Pagination State for massive smooth rendering
  const [pageSize, setPageSize] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Count SNIs with active Up/Down
  const activeUpDownCount = useMemo(() => {
    return results.filter(
      (r) => r.status !== 'IDLE' && r.status !== 'TESTING' && r.status !== 'BLOCKED' &&
             (r.downloadSpeed || 0) > 0.5 && (r.uploadSpeed || 0) > 0.2
    ).length;
  }, [results]);

  // Compute live metrics
  const { successRate, avgLatency, topDownload, cleanCount, testedCount, totalCount } = useMemo(() => {
    const tested = results.filter((r) => r.status !== 'IDLE' && r.status !== 'TESTING');
    if (tested.length === 0) {
      return { successRate: 0, avgLatency: 0, topDownload: 0, cleanCount: 0, testedCount: 0, totalCount: results.length };
    }

    const cleanList = tested.filter((r) => r.status === 'CLEAN');
    const rate = Math.round((cleanList.length / tested.length) * 1000) / 10;

    const validPings = tested.map((r) => r.ping).filter((p): p is number => p !== null && p > 0);
    const avg = validPings.length > 0 ? Math.round(validPings.reduce((a, b) => a + b, 0) / validPings.length) : 0;

    const maxDl = Math.max(...tested.map((r) => r.downloadSpeed || 0), 0);

    return {
      successRate: rate,
      avgLatency: avg,
      topDownload: maxDl,
      cleanCount: cleanList.length,
      testedCount: tested.length,
      totalCount: results.length
    };
  }, [results]);

  // Filter and sort items (including Min Download & Min Upload thresholds)
  const filteredResults = useMemo(() => {
    return results
      .filter((item) => {
        const matchesCategory =
          activeCategoryChip === 'all' ||
          item.category.toLowerCase().includes(activeCategoryChip.toLowerCase()) ||
          (activeCategoryChip === 'yahoo' && (item.domain.includes('yahoo') || item.domain.includes('yimg'))) ||
          (activeCategoryChip === 'cloudflare' && (item.domain.includes('cloudflare') || item.domain.includes('workers.dev') || item.domain.includes('pages.dev') || item.domain.includes('warp'))) ||
          (activeCategoryChip === 'akamai' && (item.domain.includes('akamai') || item.domain.includes('edgekey') || item.domain.includes('edgesuite'))) ||
          (activeCategoryChip === 'fastly' && (item.domain.includes('fastly') || item.domain.includes('github'))) ||
          (activeCategoryChip === 'google' && (item.domain.includes('google') || item.domain.includes('gstatic'))) ||
          (activeCategoryChip === 'microsoft' && (item.domain.includes('microsoft') || item.domain.includes('skype') || item.domain.includes('azure') || item.domain.includes('live.com'))) ||
          (activeCategoryChip === 'amazon' && (item.domain.includes('amazon') || item.domain.includes('cloudfront') || item.domain.includes('twitch'))) ||
          (activeCategoryChip === 'apple' && (item.domain.includes('apple') || item.domain.includes('mzstatic') || item.domain.includes('icloud'))) ||
          (activeCategoryChip === 'spotify' && (item.domain.includes('spotify') || item.domain.includes('discord'))) ||
          (activeCategoryChip === 'general' && (item.category === 'general' || item.domain.includes('cisco') || item.domain.includes('zoom') || item.domain.includes('oracle') || item.domain.includes('speedtest')));

        const matchesSearch =
          searchQuery.trim() === '' ||
          item.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === 'ALL' ||
          (statusFilter === 'CLEAN' && item.status === 'CLEAN') ||
          (statusFilter === 'THROTTLED' && item.status === 'THROTTLED') ||
          (statusFilter === 'BLOCKED' && (item.status === 'BLOCKED' || item.status === 'TIMEOUT'));

        // Speed thresholds filter
        const matchesSpeed =
          (minDownloadFilter === 0 || (item.downloadSpeed || 0) >= minDownloadFilter) &&
          (minUploadFilter === 0 || (item.uploadSpeed || 0) >= minUploadFilter);

        return matchesCategory && matchesSearch && matchesStatus && matchesSpeed;
      })
      .sort((a, b) => {
        if (sortBy === 'domain') {
          return a.domain.localeCompare(b.domain);
        }

        // Sorting by lowest ping first (Fastest response)
        if (sortBy === 'ping') {
          const aHasPing = a.ping !== null && a.ping > 0 && a.status !== 'BLOCKED' && a.status !== 'TIMEOUT';
          const bHasPing = b.ping !== null && b.ping > 0 && b.status !== 'BLOCKED' && b.status !== 'TIMEOUT';
          if (aHasPing && !bHasPing) return -1;
          if (!aHasPing && bHasPing) return 1;

          const valA = a.ping !== null && a.ping > 0 ? a.ping : 999999;
          const valB = b.ping !== null && b.ping > 0 ? b.ping : 999999;
          return valA - valB;
        }

        // Sorting by highest download speed first
        if (sortBy === 'download') {
          const dlA = a.downloadSpeed ?? 0;
          const dlB = b.downloadSpeed ?? 0;
          if (dlA > 0 && dlB <= 0) return -1;
          if (dlA <= 0 && dlB > 0) return 1;
          return dlB - dlA;
        }

        // Sorting by highest upload speed first
        if (sortBy === 'upload') {
          const ulA = a.uploadSpeed ?? 0;
          const ulB = b.uploadSpeed ?? 0;
          if (ulA > 0 && ulB <= 0) return -1;
          if (ulA <= 0 && ulB > 0) return 1;
          return ulB - ulA;
        }

        return 0;
      });
  }, [results, searchQuery, statusFilter, activeCategoryChip, minDownloadFilter, minUploadFilter, sortBy]);

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, activeCategoryChip, minDownloadFilter, minUploadFilter, pageSize]);

  // Calculate paginated slice
  const totalPages = Math.max(1, Math.ceil(filteredResults.length / pageSize));
  const paginatedItems = useMemo(() => {
    if (pageSize >= 10000) return filteredResults;
    const start = (currentPage - 1) * pageSize;
    return filteredResults.slice(start, start + pageSize);
  }, [filteredResults, currentPage, pageSize]);

  const handleCopyInjectedConfig = (domain: string, id: string) => {
    const configToCopy = parsedConfig
      ? injectSniIntoConfig(parsedConfig, domain)
      : `vless://d2c18400-6c9a-4c28-98e3-0d33b5c19208@104.16.12.34:443?security=tls&encryption=none&headerType=none&type=tcp&sni=${domain}#Iran-SNI-${domain}`;

    navigator.clipboard.writeText(configToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: SniStatus) => {
    switch (status) {
      case 'CLEAN':
        return (
          <span className="inline-flex items-center gap-1 bg-green-500/10 border border-green-500/30 text-green-400 px-2 py-0.5 rounded text-[10px] font-bold">
            <CheckCircle className="w-3 h-3" />
            CLEAN (سالم)
          </span>
        );
      case 'THROTTLED':
        return (
          <span className="inline-flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-2 py-0.5 rounded text-[10px] font-bold">
            <AlertTriangle className="w-3 h-3" />
            THROTTLED
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="inline-flex items-center gap-1 bg-red-500/10 border border-red-500/30 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold">
            <XCircle className="w-3 h-3" />
            BLOCKED
          </span>
        );
      case 'TIMEOUT':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 px-2 py-0.5 rounded text-[10px] font-bold">
            <Clock className="w-3 h-3" />
            TIMEOUT
          </span>
        );
      case 'TESTING':
        return (
          <span className="inline-flex items-center gap-1 bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 px-2 py-0.5 rounded text-[10px] animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            {lang === 'fa' ? 'در حال تست سرعت...' : 'BENCHMARKING...'}
          </span>
        );
      default:
        return (
          <span className="bg-slate-800 text-slate-500 px-2 py-0.5 rounded text-[10px]">
            IDLE
          </span>
        );
    }
  };

  const sortOptions: SelectOption<string>[] = [
    { value: 'ping', label: lang === 'fa' ? 'کمترین پینگ (Fastest)' : 'Lowest Ping', badge: lang === 'fa' ? 'سریع‌ترین زمان پاسخ' : 'Lowest Latency' },
    { value: 'download', label: lang === 'fa' ? 'بیشترین دانلود (Download)' : 'Highest Download', badge: lang === 'fa' ? 'بیشترین مگابایت دانلود' : 'Max Download' },
    { value: 'upload', label: lang === 'fa' ? 'بیشترین آپلود (Upload)' : 'Highest Upload', badge: lang === 'fa' ? 'بیشترین مگابایت آپلود' : 'Max Upload' },
    { value: 'domain', label: lang === 'fa' ? 'نام دامنه (A-Z)' : 'Domain Name', badge: lang === 'fa' ? 'ترتیب الفبا' : 'Alphabetical' },
  ];

  const pageSizeOptions: SelectOption<number>[] = [
    { value: 25, label: '25', badge: lang === 'fa' ? '۲۵ مورد' : '25 items' },
    { value: 50, label: '50', badge: lang === 'fa' ? '۵۰ مورد' : '50 items' },
    { value: 100, label: '100', badge: lang === 'fa' ? '۱۰۰ مورد' : '100 items' },
    { value: 250, label: '250', badge: lang === 'fa' ? '۲۵۰ مورد' : '250 items' },
    { value: 500, label: '500', badge: lang === 'fa' ? '۵۰۰ مورد' : '500 items' },
    { value: 10000, label: lang === 'fa' ? 'همه (All)' : 'All', badge: lang === 'fa' ? 'تمام لیست' : 'Full List' },
  ];

  const minDownloadOptions: SelectOption<number>[] = [
    { value: 0, label: lang === 'fa' ? 'همه سرعت‌ها' : 'All Speeds (0 Mbps)' },
    { value: 1, label: '≥ 1.0 Mbps' },
    { value: 3, label: '≥ 3.0 Mbps' },
    { value: 5, label: '≥ 5.0 Mbps' },
    { value: 10, label: '≥ 10.0 Mbps' },
    { value: 20, label: '≥ 20.0 Mbps' },
  ];

  const minUploadOptions: SelectOption<number>[] = [
    { value: 0, label: lang === 'fa' ? 'همه سرعت‌ها' : 'All Speeds (0 Mbps)' },
    { value: 0.5, label: '≥ 0.5 Mbps' },
    { value: 1.0, label: '≥ 1.0 Mbps' },
    { value: 2.0, label: '≥ 2.0 Mbps' },
    { value: 5.0, label: '≥ 5.0 Mbps' },
  ];

  return (
    <section className="flex flex-col w-full bg-[#0A0B10] text-slate-300 font-mono rounded-xl border border-cyan-900/30 shadow-xl overflow-hidden">
      {/* 1. Header & Live Metric KPI Badges */}
      <div className="p-4 sm:p-6 border-b border-cyan-900/30 flex flex-wrap justify-between items-center gap-4 bg-gradient-to-r from-[#0D0F16] via-[#111420] to-[#0D0F16]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-light text-white tracking-tight flex items-center gap-2">
              <Radio className="w-5 h-5 text-cyan-400" />
              Active Probe <span className="text-cyan-400 italic font-semibold">Speedtest Feed</span>
            </h2>
            <div className="flex items-center gap-1 text-[10px] text-cyan-300 bg-cyan-950/80 border border-cyan-800 px-2.5 py-0.5 rounded-full">
              <Wifi className="w-3 h-3 text-cyan-400" />
              <span>TLS 1.3 & Xray Multi-Core</span>
            </div>
            {isScanning && (
              <span className="flex items-center gap-1.5 text-[11px] text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2.5 py-0.5 rounded-full animate-pulse">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                {lang === 'fa' ? 'اسکن زنده فعال است' : 'Live Speed Scanning'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
            {lang === 'fa'
              ? 'پایش یکپارچه و تست زنده پینگ، آپلود و دانلود روی تمام SNIهای جهانی (یاهو، کلودفلر، آکامای، فستلی و +۱,۰۰۰,۰۰۰ سرور)'
              : 'Unified live benchmark of worldwide TLS endpoints (Yahoo, Cloudflare, Akamai, Fastly, Google & 1,000,000+ nodes)'}
          </p>
        </div>

        {/* Live KPI Cards */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="bg-[#161B22]/90 px-3 sm:px-4 py-2 rounded-lg border border-slate-700/80 shadow-sm min-w-[95px]">
            <span className="block text-[9px] text-slate-400 uppercase tracking-wider">
              {lang === 'fa' ? 'نرخ موفقیت' : 'Success Rate'}
            </span>
            <span className="text-lg sm:text-xl text-green-400 font-bold">
              {successRate > 0 ? `${successRate}%` : '--'}
            </span>
          </div>

          <div className="bg-[#161B22]/90 px-3 sm:px-4 py-2 rounded-lg border border-slate-700/80 shadow-sm min-w-[95px]">
            <span className="block text-[9px] text-slate-400 uppercase tracking-wider">
              {lang === 'fa' ? 'میانگین پینگ' : 'Avg Latency'}
            </span>
            <span className="text-lg sm:text-xl text-cyan-400 font-bold">
              {avgLatency > 0 ? `${avgLatency}ms` : '--'}
            </span>
          </div>

          <div className="bg-[#161B22]/90 px-3 sm:px-4 py-2 rounded-lg border border-slate-700/80 shadow-sm min-w-[95px]">
            <span className="block text-[9px] text-slate-400 uppercase tracking-wider">
              {lang === 'fa' ? 'بیشترین دانلود' : 'Peak Down'}
            </span>
            <span className="text-lg sm:text-xl text-emerald-400 font-bold">
              {topDownload > 0 ? `${topDownload}M` : '--'}
            </span>
          </div>

          <div className="bg-[#161B22]/90 px-3 sm:px-4 py-2 rounded-lg border border-slate-700/80 shadow-sm min-w-[110px]">
            <span className="block text-[9px] text-slate-400 uppercase tracking-wider">
              {lang === 'fa' ? 'سالم / تست‌شده' : 'Clean / Tested'}
            </span>
            <span className="text-lg sm:text-xl text-slate-200 font-bold">
              <span className="text-emerald-400">{cleanCount}</span> / {testedCount}{' '}
              <span className="text-xs text-slate-500 font-normal">({totalCount})</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Global Streamer & Live Multi-Universe Fetcher Bar */}
      <div className="px-4 sm:px-6 py-3 border-b border-cyan-900/30 bg-[#07090F] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <Globe2 className="w-4 h-4 text-cyan-400" />
            {lang === 'fa' ? 'دیتابیس میلیونی SNI جهان:' : 'Worldwide 1M SNI Database:'}
          </span>

          {/* 1-Click Fetch Global Batches */}
          {onFetchGlobalStream && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => onFetchGlobalStream('all', 1000)}
                disabled={isStreamingGlobal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-950 to-cyan-950 hover:from-emerald-900 hover:to-cyan-900 border border-emerald-500/70 text-emerald-200 rounded-md text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {isStreamingGlobal
                    ? lang === 'fa' ? 'در حال بارگذاری کل دامنه‌ها...' : 'Loading Global SNIs...'
                    : lang === 'fa' ? '🌍 دریافت ۱۰۰۰ دامنه TLS 1.3 جهان' : '🌍 Stream 1,000 Global TLS 1.3'}
                </span>
              </button>

              <button
                onClick={() => onFetchGlobalStream(activeCategoryChip, 500)}
                disabled={isStreamingGlobal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 border border-cyan-700/70 text-cyan-200 rounded-md text-xs font-medium shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isStreamingGlobal ? 'animate-spin' : ''}`} />
                <span>
                  {isStreamingGlobal
                    ? lang === 'fa' ? 'در حال دریافت...' : 'Fetching Stream...'
                    : lang === 'fa' ? '+۵۰۰ دامنه دسته انتخابی' : '+500 Category SNIs'}
                </span>
              </button>

              <button
                onClick={() => onFetchGlobalStream(activeCategoryChip, 2000)}
                disabled={isStreamingGlobal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/70 text-purple-200 rounded-md text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
              >
                <Flame className="w-3.5 h-3.5 text-purple-400" />
                <span>{lang === 'fa' ? '+۲۰۰۰ دامنه سریع جهان' : '+2000 Fast Endpoints'}</span>
              </button>

              <button
                onClick={() => onFetchGlobalStream('yahoo', 500)}
                disabled={isStreamingGlobal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800/70 text-amber-200 rounded-md text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
              >
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'fa' ? 'کل شبکه یاهو جهان' : 'All Yahoo World Nodes'}</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-[11px]">
            {lang === 'fa' ? 'بیش از ۱,۰۰۰,۰۰۰ دامنه TLS در دسترس' : '1,000,000+ TLS Nodes Available'}
          </span>
        </div>
      </div>

      {/* 3. Category Filter Chips (Yahoo, Cloudflare, Akamai, etc.) */}
      <div className="px-4 sm:px-6 py-2.5 border-b border-slate-800/80 bg-[#0B0D14] flex items-center gap-2 overflow-x-auto no-scrollbar">
        {CATEGORY_CHIPS.map((chip) => {
          const Icon = chip.icon;
          const isActive = activeCategoryChip === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => setActiveCategoryChip(chip.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.2)] font-semibold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{lang === 'fa' ? chip.nameFa : chip.nameEn}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Control Toolbar: Search, Status, Sort, Page Size, Export */}
      <div className="px-4 sm:px-6 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-[#0A0B10]">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'fa' ? 'فیلتر سریع نام دامنه یا دسته...' : 'Filter SNI domain or provider...'}
              className="w-full bg-[#050608] border border-cyan-900/40 rounded-lg pl-8 pr-3 py-1.5 text-xs text-cyan-200 font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center bg-[#050608] border border-slate-800 rounded-lg p-0.5 text-xs">
            {(['ALL', 'CLEAN', 'THROTTLED', 'BLOCKED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md transition-colors text-[11px] cursor-pointer ${
                  statusFilter === st
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Sort, Page Size, Speed Filter & Export CTAs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Trigger: Modal for Verified Clean SNIs */}
          {onOpenSpeedFilterModal && (
            <button
              onClick={onOpenSpeedFilterModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-950 to-teal-950 hover:from-emerald-900 hover:to-teal-900 border border-emerald-600 text-emerald-300 hover:text-white rounded-lg text-xs transition-all cursor-pointer font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>{lang === 'fa' ? 'لیست سالم‌ها با سرعت انتخابی' : 'Clean SNIs Menu'}</span>
              {activeUpDownCount > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-400 text-black text-[10px] font-bold rounded-full font-mono">
                  {activeUpDownCount}
                </span>
              )}
            </button>
          )}

          {/* Toggle Inline Speed Thresholds Filter */}
          <button
            onClick={() => setIsSpeedFilterExpanded(!isSpeedFilterExpanded)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border transition-all cursor-pointer ${
              minDownloadFilter > 0 || minUploadFilter > 0 || isSpeedFilterExpanded
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500 font-semibold shadow-sm'
                : 'bg-[#050608] text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Filter className="w-3 h-3 text-cyan-400" />
            <span>{lang === 'fa' ? 'فیلتر مگابایت (Up/Down)' : 'Speed Filter'}</span>
            {(minDownloadFilter > 0 || minUploadFilter > 0) && (
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
            )}
          </button>

          {/* Page Size Selector with CyberSelect */}
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span className="text-[10px] text-slate-500 uppercase">{lang === 'fa' ? 'نمایش:' : 'Show:'}</span>
            <CyberSelect
              value={pageSize}
              onChange={(val) => setPageSize(Number(val))}
              options={pageSizeOptions}
              title={lang === 'fa' ? 'تعداد دامنه‌ها در هر صفحه' : 'Select Page Size'}
            />
          </div>

          {/* Sort Selector with CyberSelect */}
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <CyberSelect
              value={sortBy}
              onChange={(val) => setSortBy(val as any)}
              options={sortOptions}
              title={lang === 'fa' ? 'مرتب‌سازی نتایج بر اساس' : 'Sort Results By'}
            />
          </div>

          {/* Export Injected Configs */}
          <button
            onClick={() => onExportSnis(filteredResults.filter((r) => r.status === 'CLEAN'), 'vless')}
            title="Export Clean Injected VLESS Configs"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/90 border border-cyan-700 hover:border-cyan-400 text-cyan-300 hover:text-white rounded-lg text-xs transition-all cursor-pointer font-semibold shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'fa' ? 'خروجی سالم‌ها (VLESS)' : 'Export Clean'}</span>
          </button>
        </div>
      </div>

      {/* 4.5 Inline Speed Filter Bar (When Expanded) */}
      {isSpeedFilterExpanded && (
        <div className="px-4 sm:px-6 py-2.5 border-b border-cyan-900/40 bg-[#070A12] flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="text-cyan-300 font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              {lang === 'fa' ? 'فیلتر حداقل سرعت آپلود و دانلود:' : 'Filter Min Up/Down Speed:'}
            </span>

            {/* Min Download */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px]">{lang === 'fa' ? 'حداقل دانلود:' : 'Min DL:'}</span>
              <CyberSelect
                value={minDownloadFilter}
                onChange={(val) => setMinDownloadFilter(Number(val))}
                options={minDownloadOptions}
                title={lang === 'fa' ? 'حداقل سرعت دانلود' : 'Minimum Download Speed'}
              />
            </div>

            {/* Min Upload */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px]">{lang === 'fa' ? 'حداقل آپلود:' : 'Min UL:'}</span>
              <CyberSelect
                value={minUploadFilter}
                onChange={(val) => setMinUploadFilter(Number(val))}
                options={minUploadOptions}
                title={lang === 'fa' ? 'حداقل سرعت آپلود' : 'Minimum Upload Speed'}
              />
            </div>

            {(minDownloadFilter > 0 || minUploadFilter > 0) && (
              <button
                onClick={() => {
                  setMinDownloadFilter(0);
                  setMinUploadFilter(0);
                }}
                className="text-[11px] text-rose-400 hover:underline cursor-pointer"
              >
                {lang === 'fa' ? 'حذف فیلتر سرعت' : 'Clear Speed Filter'}
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            {lang === 'fa'
              ? `${filteredResults.length} دامنه با سرعت بالا یافت شد`
              : `${filteredResults.length} matching fast nodes`}
          </div>
        </div>
      )}

      {/* 5. Realtime Results Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse select-text">
          <thead className="bg-[#0D0F16] border-b border-slate-800">
            <tr className="text-[10px] uppercase text-slate-400 tracking-wider">
              <th className="py-3 px-4 font-medium">{lang === 'fa' ? 'دامنه SNI و شبکه' : 'SNI Endpoint & CDN'}</th>
              <th className="py-3 px-3 font-medium">{lang === 'fa' ? 'پینگ (Ping)' : 'Ping'}</th>
              <th className="py-3 px-3 font-medium">{lang === 'fa' ? 'دانلود (Down)' : 'Download'}</th>
              <th className="py-3 px-3 font-medium">{lang === 'fa' ? 'آپلود (Up)' : 'Upload'}</th>
              <th className="py-3 px-3 font-medium text-center">{lang === 'fa' ? 'فرگمنت' : 'Frag.'}</th>
              <th className="py-3 px-3 font-medium text-center">{lang === 'fa' ? 'وضعیت' : 'Status'}</th>
              <th className="py-3 px-4 font-medium text-right">{lang === 'fa' ? 'عملیات و تست با Xray' : 'Action & Xray Test'}</th>
            </tr>
          </thead>
          <tbody className="text-[12px] divide-y divide-slate-800/50">
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-slate-600">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Filter className="w-8 h-8 text-slate-700" />
                    <span>
                      {lang === 'fa'
                        ? 'هیچ نتیجه‌ای با فیلتر انتخابی یافت نشد.'
                        : 'No SNI matches the current filter.'}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedItems.map((item) => {
                const isItemCopied = copiedId === item.id;
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-cyan-500/5 transition-colors group border-b border-slate-800/30"
                  >
                    {/* SNI Endpoint */}
                    <td className="py-3 px-4 text-cyan-100 font-medium">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-200 group-hover:text-cyan-300 font-mono tracking-tight transition-colors font-semibold">
                          {item.domain}
                        </span>
                        <span className="text-[9px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 uppercase">
                          {item.category}
                        </span>
                      </div>
                    </td>

                    {/* Ping */}
                    <td className="py-3 px-3">
                      {item.ping !== null && item.ping > 0 ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold ${
                              item.ping < 60
                                ? 'text-green-400'
                                : item.ping < 160
                                ? 'text-cyan-400'
                                : item.ping < 350
                                ? 'text-yellow-400'
                                : 'text-red-400'
                            }`}
                          >
                            {item.ping}ms
                          </span>
                          {/* Latency meter */}
                          <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className={`h-full rounded-full ${
                                item.ping < 60
                                  ? 'bg-green-400'
                                  : item.ping < 160
                                  ? 'bg-cyan-400'
                                  : item.ping < 350
                                  ? 'bg-yellow-400'
                                  : 'bg-red-400'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(10, 100 - item.ping / 4))}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-[11px] italic">--</span>
                      )}
                    </td>

                    {/* Download Speed */}
                    <td className="py-3 px-3">
                      {item.downloadSpeed !== null && item.downloadSpeed > 0 ? (
                        <span
                          className={`font-bold ${
                            item.downloadSpeed > 15
                              ? 'text-emerald-400'
                              : item.downloadSpeed > 5
                              ? 'text-cyan-300'
                              : item.downloadSpeed > 1
                              ? 'text-yellow-400'
                              : 'text-red-400'
                          }`}
                        >
                          {item.downloadSpeed} <span className="text-[10px] text-slate-500 font-normal">Mbps</span>
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[11px] italic">--</span>
                      )}
                    </td>

                    {/* Upload Speed */}
                    <td className="py-3 px-3">
                      {item.uploadSpeed !== null && item.uploadSpeed > 0 ? (
                        <span className="text-slate-300 font-medium">
                          {item.uploadSpeed} <span className="text-[10px] text-slate-500 font-normal">Mbps</span>
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[11px] italic">--</span>
                      )}
                    </td>

                    {/* Fragmentation Index */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1 text-[11px]">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.fragmentationScore <= 2
                              ? 'bg-green-400 shadow-[0_0_6px_#4ade80]'
                              : item.fragmentationScore <= 5
                              ? 'bg-yellow-400'
                              : 'bg-red-400'
                          }`}
                        />
                        <span className="text-slate-400 font-mono">
                          {item.fragmentationScore}/10
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1-Click Direct Copy Injected Config */}
                        <button
                          onClick={() => handleCopyInjectedConfig(item.domain, item.id)}
                          title={lang === 'fa' ? 'کپی کانفیگ با این SNI' : 'Copy Injected VLESS Config'}
                          className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                        >
                          {isItemCopied ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Deep Speedtest Modal */}
                        <button
                          onClick={() => onOpenSpeedTest(item.domain)}
                          title={lang === 'fa' ? 'اسپیدتست پیشرفته (Speedtest.net)' : 'Deep Speedtest Benchmark'}
                          className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                        >
                          <Gauge className="w-3.5 h-3.5" />
                        </button>

                        {/* Multi-Format Config Generator */}
                        <button
                          onClick={() => onApplySniToConfig(item.domain)}
                          title={lang === 'fa' ? 'ساخت و خروجی کانفیگ چندگانه' : 'Multi-format Config Generator'}
                          className="p-1.5 rounded bg-cyan-950/80 border border-cyan-800 hover:border-cyan-400 text-cyan-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 6. High-Performance Pagination & Range Controller */}
      {filteredResults.length > 0 && (
        <div className="p-4 border-t border-slate-800 bg-[#0D0F16] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              {lang === 'fa'
                ? `نمایش ${(currentPage - 1) * pageSize + 1} تا ${Math.min(
                    currentPage * pageSize,
                    filteredResults.length
                  )} از ${filteredResults.length} دامنه (${results.length} کل دامنه‌ها)`
                : `Showing ${(currentPage - 1) * pageSize + 1} - ${Math.min(
                    currentPage * pageSize,
                    filteredResults.length
                  )} of ${filteredResults.length} filtered items (${results.length} total in memory)`}
            </span>
          </div>

          {/* Pagination Navigation */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1 rounded bg-[#161B22] border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded bg-[#161B22] border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 bg-slate-900 border border-cyan-900/60 rounded text-cyan-300 font-bold">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded bg-[#161B22] border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1 rounded bg-[#161B22] border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 7. REAL-TIME LIVE EXECUTION LOG TERMINAL */}
      <div className="border-t border-slate-800 bg-[#080A10] p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-200">
                  {lang === 'fa' ? 'لاگ زنده و ترکینگ تزریق SNI' : 'Live SNI Injection & Speedtest Stream'}
                </span>
                {isScanning && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse font-mono font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    {lang === 'fa' ? 'در حال تست زنده از اینترنت شما' : 'Probing Live via your Network'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {lang === 'fa'
                  ? `تزریق دامنه روی هاست (${parsedConfig?.server || 'Auto-Edge'}) و تست واقعی پینگ و اسپیدتست از اینترنت موبایل/وای‌فای شما`
                  : `Real socket handshake & download benchmark from your active connection`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Filter buttons */}
            <div className="flex items-center bg-[#111622] rounded-lg p-0.5 border border-slate-800 text-[11px]">
              {(['ALL', 'INJECT', 'CLEAN', 'BLOCKED'] as const).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setLogFilter(filterType)}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    logFilter === filterType
                      ? 'bg-cyan-500 text-black font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filterType === 'ALL'
                    ? lang === 'fa'
                      ? 'همه'
                      : 'All'
                    : filterType === 'INJECT'
                    ? lang === 'fa'
                      ? 'تزریق'
                      : 'Inject'
                    : filterType === 'CLEAN'
                    ? lang === 'fa'
                      ? 'سالم'
                      : 'Clean'
                    : lang === 'fa'
                    ? 'فیلتر/خطا'
                    : 'Blocked'}
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
                navigator.clipboard.writeText(text);
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
            {onClearLogs && (
              <button
                onClick={onClearLogs}
                disabled={liveLogs.length === 0}
                className="px-2.5 py-1 rounded bg-[#161B22] border border-slate-800 hover:border-rose-900/50 hover:text-rose-400 text-slate-400 flex items-center gap-1 disabled:opacity-40 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === 'fa' ? 'پاک‌سازی' : 'Clear'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Terminal Output Box */}
        <div
          ref={logContainerRef}
          className="w-full max-h-64 sm:max-h-72 overflow-y-auto rounded-xl bg-[#05060A] border border-slate-800/80 p-3 font-mono text-[11px] leading-relaxed select-text space-y-1 scrollbar-thin scrollbar-thumb-slate-800"
        >
          {liveLogs.length === 0 ? (
            <div className="py-8 text-center text-slate-500 space-y-2">
              <Terminal className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
              <p>
                {lang === 'fa'
                  ? 'هنوز تستی انجام نشده است. روی دکمه «شروع اسکن و تست» در منوی کناری کلیک کنید تا لاگ زنده نمایش داده شود.'
                  : 'No active probe logs yet. Click "Start Scan" to view real-time execution logs.'}
              </p>
            </div>
          ) : (
            liveLogs
              .filter((log) => {
                if (logFilter === 'ALL') return true;
                if (logFilter === 'INJECT') return log.type === 'inject' || log.type === 'info';
                if (logFilter === 'CLEAN') return log.type === 'success' || log.type === 'speed';
                if (logFilter === 'BLOCKED') return log.type === 'error' || log.type === 'warning';
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
        </div>
      </div>
    </section>
  );
}
