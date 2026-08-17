export interface SniItem {
  id: string;
  domain: string;
  category:
    | 'cloudflare'
    | 'yahoo'
    | 'microsoft'
    | 'spotify'
    | 'amazon_fastly'
    | 'dev_github'
    | 'general'
    | 'custom'
    | 'akamai'
    | 'fastly'
    | 'google'
    | 'amazon'
    | 'apple'
    | string;
  description?: string;
  isPopular?: boolean;
  recommendedProfile?: string;
}

export type SniStatus = 'IDLE' | 'TESTING' | 'CLEAN' | 'THROTTLED' | 'BLOCKED' | 'TIMEOUT' | 'ERROR';

export interface SniScanResult {
  id: string;
  domain: string;
  category: string;
  ping: number | null; // in ms
  downloadSpeed: number | null; // in Mbps
  uploadSpeed: number | null; // in Mbps
  fragmentationScore: number; // 1 to 10
  tlsVersion: string; // TLS 1.3 / TLS 1.2
  status: SniStatus;
  packetLoss: number; // percentage
  jitter: number; // ms
  httpStatus?: number;
  testedAt?: Date;
  details?: string;
}

export interface NetworkProfile {
  id: string;
  name: string;
  nameFa: string;
  asn: string;
  defaultMtu: number;
  recommendedFrag: string;
  color: string;
}

export interface ScanParameters {
  concurrency: number;
  timeoutMs: number;
  packetSizeMtu: number;
  testPayloadMb: number;
  fragmentationMode: boolean;
  category: string;
  networkProfile: string;
}

export interface ParsedProxyConfig {
  raw: string;
  protocol: 'vless' | 'vmess' | 'trojan' | 'ss' | 'clash' | 'singbox' | 'unknown';
  server: string;
  port: string | number;
  sni: string;
  host: string;
  uuidOrPassword?: string;
  path?: string;
  type?: string;
  headerType?: string;
  security?: string;
  name?: string;
}

export interface XrayCoreInfo {
  installed: boolean;
  version: string;
  binaryPath: string;
  uptimeSeconds: number;
  activeTestCount: number;
  lastChecked: string;
}

export interface XrayTestResult {
  success: boolean;
  handshakeTimeMs: number;
  totalLatencyMs: number;
  httpStatus: number;
  realIp: string;
  country: string;
  colo: string;
  downloadSpeedMbps: number;
  uploadSpeedMbps: number;
  testedSni: string;
  testedProtocol: string;
  serverEndpoint: string;
  logs: string[];
  error?: string;
  configType: string;
}

export interface SmartOptimizationStep {
  step: string;
  description: string;
  candidate: string;
  ping: number | null;
  downloadSpeed: number | null;
  success: boolean;
  notes: string;
}

export interface SmartOptimizationResult {
  originalConfig: string;
  optimizedConfig: string;
  originalPing: number;
  originalSpeed: number;
  optimizedPing: number;
  optimizedSpeed: number;
  improvementPercentage: number;
  bestSni: string;
  fragmentApplied: boolean;
  score: number;
  steps: SmartOptimizationStep[];
  diagnostics: string;
}

export interface XrayBatchSniItem {
  id: string;
  sni: string;
  category?: string;
  success: boolean;
  status: 'CLEAN' | 'THROTTLED' | 'BLOCKED' | 'TIMEOUT' | 'TESTING' | 'IDLE';
  ping: number;
  downloadSpeedMbps: number;
  uploadSpeedMbps: number;
  realIp: string;
  country: string;
  colo: string;
  score: number;
  testedProtocol: string;
  injectedConfig: string;
  timestamp: string;
  error?: string;
}

export interface ScanLogEntry {
  id: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'inject' | 'speed';
  domain: string;
  host?: string;
  ping?: number | null;
  downloadSpeed?: number | null;
  message: string;
  details?: string;
}


