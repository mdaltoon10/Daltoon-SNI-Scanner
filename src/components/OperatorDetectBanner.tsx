import { useState } from 'react';
import { ClientCarrierInfo } from '../utils/carrierDetector';
import { NetworkProfile } from '../types';
import { NETWORK_PROFILES } from '../data/presetSnilist';
import {
  Wifi,
  Smartphone,
  Globe,
  Activity,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Server,
  Radio,
  Sparkles,
  Layers,
  Check
} from 'lucide-react';

interface OperatorDetectBannerProps {
  carrierInfo: ClientCarrierInfo | null;
  isDetecting: boolean;
  onRefreshDetection: () => void;
  currentProfile: NetworkProfile;
  onApplyProfile: (profileId: string) => void;
  lang: 'fa' | 'en';
  onQuickScanOperator: () => void;
  isScanning: boolean;
}

export function OperatorDetectBanner({
  carrierInfo,
  isDetecting,
  onRefreshDetection,
  currentProfile,
  onApplyProfile,
  lang,
  onQuickScanOperator,
  isScanning
}: OperatorDetectBannerProps) {
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  if (isDismissed) return null;

  return (
    <div
      id="operator-detector-banner"
      className="relative overflow-hidden bg-gradient-to-r from-[#07131F] via-[#09182B] to-[#0A1220] border border-cyan-500/40 rounded-xl p-4 sm:p-5 shadow-[0_0_35px_rgba(6,182,212,0.12)] font-mono select-none"
    >
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#0891b2_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left / Main Telecom Info (Like Speedtest UI) */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="relative">
            <div className="p-3 bg-cyan-950/80 border border-cyan-400/50 rounded-xl text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              {carrierInfo?.cellularOrMobile ? (
                <Smartphone className="w-6 h-6 animate-pulse text-cyan-400" />
              ) : (
                <Wifi className="w-6 h-6 animate-pulse text-cyan-400" />
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#09182B]"></span>
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-cyan-400 bg-cyan-950/90 border border-cyan-700/50 px-2 py-0.5 rounded flex items-center gap-1 font-sans">
                <Activity className="w-3 h-3 text-cyan-400" />
                {lang === 'fa' ? 'شناسایی خودکار اوپراتور اینترنت (Speedtest Live)' : 'Auto Carrier Detect (Speedtest Live)'}
              </span>

              {carrierInfo && (
                <span className="text-[10px] text-slate-400 bg-slate-900/90 border border-slate-800 px-2 py-0.5 rounded flex items-center gap-1 font-sans">
                  <MapPin className="w-2.5 h-2.5 text-rose-400" />
                  {carrierInfo.city}, {carrierInfo.countryCode}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2 font-sans">
                {isDetecting ? (
                  <span className="text-cyan-300 animate-pulse flex items-center gap-1.5 text-sm font-sans">
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                    {lang === 'fa' ? 'در حال استعلام شبکه و اوپراتور سیم‌کارت/وای‌فای...' : 'Detecting your ISP/Mobile Carrier...'}
                  </span>
                ) : (
                  <>
                    <span className="text-cyan-300 text-lg sm:text-xl font-black">
                      {currentProfile?.nameFa || carrierInfo?.matchedProfileNameFa || 'همراه اول (MCI)'}
                    </span>
                    <span className="text-xs font-normal text-slate-400 font-mono">
                      ({currentProfile?.asn || carrierInfo?.as || 'AS44244'})
                    </span>
                  </>
                )}
              </h2>
            </div>

            {/* Quick Operator Pills inside Banner */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 font-sans text-[11px]">
              <span className="text-slate-400 text-[10px] ml-1">{lang === 'fa' ? 'تغییر دستی اوپراتور:' : 'Manual Switch:'}</span>
              {NETWORK_PROFILES.slice(0, 5).map((p) => {
                const isSelected = currentProfile?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onApplyProfile(p.id)}
                    type="button"
                    className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer font-bold ${
                      isSelected
                        ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.5)] border border-cyan-300'
                        : 'bg-slate-900/90 text-slate-300 border border-slate-700 hover:border-cyan-500/50 hover:text-cyan-300'
                    }`}
                  >
                    {p.id === 'mci'
                      ? 'همراه اول'
                      : p.id === 'irancell'
                      ? 'ایرانسل'
                      : p.id === 'rightel'
                      ? 'رایتل'
                      : p.id === 'shatel'
                      ? 'شاتل'
                      : 'مخابرات'}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1 font-mono">
                <Globe className="w-3 h-3 text-slate-500" />
                <span className="text-slate-300">{String(carrierInfo?.ip || 'Detecting IP...')}</span>
              </span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="text-slate-400 truncate max-w-[220px] font-sans">
                {typeof carrierInfo?.isp === 'string' ? carrierInfo.isp : String(carrierInfo?.isp || 'ISP Provider')}
              </span>
              {carrierInfo?.isIran ? (
                <span className="px-1.5 py-0.2 rounded bg-rose-950/70 border border-rose-600/50 text-rose-300 text-[10px] font-semibold font-sans">
                  🇮🇷 {lang === 'fa' ? 'شبکه داخلی ایران' : 'Iran Network'}
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded bg-cyan-950/70 border border-cyan-600/50 text-cyan-300 text-[10px] font-semibold font-sans">
                  🌐 {lang === 'fa' ? 'اتصال از طریق VPN / آی‌پی خارجی' : 'Foreign IP / VPN Active'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right / Quick Action Buttons (Start Scan on Selected Carrier) */}
        <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
          <button
            onClick={onRefreshDetection}
            disabled={isDetecting}
            className="p-2.5 rounded-lg bg-[#0E1626] border border-cyan-500/50 text-cyan-300 hover:text-white hover:bg-cyan-950/60 text-xs transition-all cursor-pointer disabled:opacity-50 shadow-sm"
            title={lang === 'fa' ? 'استعلام مجدد شبکه (Speedtest)' : 'Re-detect Carrier'}
          >
            <RefreshCw className={`w-4 h-4 ${isDetecting ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Quick Scan for this carrier */}
          <button
            onClick={onQuickScanOperator}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-extrabold tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer disabled:opacity-50 active:scale-95 font-sans"
          >
            <Zap className="w-4 h-4 fill-white animate-pulse" />
            <span>
              {lang === 'fa'
                ? `⚡ اسکن هوشمند ویژه ${currentProfile?.nameFa || carrierInfo?.matchedProfileNameFa || 'این اوپراتور'}`
                : `⚡ Fast Scan for ${currentProfile?.name || carrierInfo?.matchedProfileName || 'Detected ISP'}`}
            </span>
          </button>
        </div>
      </div>

      {/* Auto-Applied Profile Bar & Recommendation */}
      <div className="mt-3 pt-3 border-t border-cyan-900/40 flex flex-wrap items-center justify-between gap-2 text-[11px] font-sans">
        <div className="flex items-center gap-2 text-cyan-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {lang === 'fa'
              ? `پروفایل شبکه روی «${currentProfile?.nameFa || carrierInfo?.matchedProfileNameFa}» همگام شد (توصیه فرگمنت: ${currentProfile?.recommendedFrag || '1-3, 5-10ms'})`
              : `Active profile synced to ${currentProfile?.name || carrierInfo?.matchedProfileName} (Recommended Frag: ${currentProfile?.recommendedFrag || '1-3, 5-10ms'})`}
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-[10px] text-slate-500 font-mono">
            MTU: {currentProfile?.defaultMtu || 1450}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-[10px] text-slate-500 font-mono">
            ASN: {currentProfile?.asn || 'AS44244'}
          </span>
        </div>
      </div>
    </div>
  );
}
