import { useState, useEffect } from 'react';
import { NETWORK_PROFILES } from '../data/presetSnilist';
import { NetworkProfile } from '../types';
import { ClientCarrierInfo } from '../utils/carrierDetector';
import { Radio, ShieldCheck, Clock, Globe2, Activity, Cpu, Sparkles, Wifi, Smartphone, RefreshCw } from 'lucide-react';

interface HeaderProps {
  currentProfile: NetworkProfile;
  onSelectProfile: (profile: NetworkProfile) => void;
  lang: 'fa' | 'en';
  onToggleLang: () => void;
  isScanning: boolean;
  onOpenSpeedFilterModal?: () => void;
  cleanSpeedCount?: number;
  carrierInfo?: ClientCarrierInfo | null;
  isDetectingCarrier?: boolean;
  onRefreshCarrier?: () => void;
}

export function Header({
  currentProfile,
  onSelectProfile,
  lang,
  onToggleLang,
  isScanning,
  onOpenSpeedFilterModal,
  cleanSpeedCount = 0,
  carrierInfo,
  isDetectingCarrier = false,
  onRefreshCarrier
}: HeaderProps) {
  const [timeStr, setTimeStr] = useState<string>('00:00:00');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0]);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 border-b border-cyan-900/30 bg-[#0D0F16] text-slate-300 font-mono select-none z-20 gap-3">
      {/* Brand */}
      <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-3.5 h-3.5 rounded-full ${
              isScanning
                ? 'bg-cyan-400 animate-ping shadow-[0_0_15px_rgba(6,182,212,1)]'
                : 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]'
            }`}
          />
          <div className="flex items-baseline gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tighter text-cyan-400 flex items-center gap-1.5">
              <Radio className="w-5 h-5 text-cyan-400" />
              Daltoon SNI Scanner
            </h1>
            <span className="text-[10px] sm:text-xs font-normal text-cyan-400/80 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
              REAL CLIENT PROBE
            </span>
          </div>
        </div>
      </div>

      {/* Network Interface & Telecom Auto-Detector (Speedtest style) */}
      <div className="flex items-center gap-3 sm:gap-6 text-[11px] uppercase tracking-widest flex-wrap">
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-1 text-[9px] text-slate-500">
            <span className="flex items-center gap-1 font-sans">
              <Activity className="w-3 h-3 text-cyan-500/70" />
              {lang === 'fa' ? 'اوپراتور اینترنت' : 'Network Carrier'}
            </span>
            {isDetectingCarrier ? (
              <span className="text-cyan-400 flex items-center gap-0.5 font-sans">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                <span>{lang === 'fa' ? 'در حال تشخیص...' : 'Detecting...'}</span>
              </span>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center gap-0.5 font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{lang === 'fa' ? 'شناسایی خودکار' : 'Auto Detect'}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {/* Operator Display Badge */}
            <div className="bg-[#050608] border border-cyan-500/40 rounded-lg px-2.5 py-1 text-cyan-300 text-xs font-sans font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
              <Smartphone className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>
                {isDetectingCarrier
                  ? lang === 'fa'
                    ? 'در حال استعلام شبکه...'
                    : 'Detecting...'
                  : currentProfile?.nameFa || carrierInfo?.matchedProfileNameFa || 'همراه اول (MCI)'}
              </span>
              <span className="text-[10px] font-normal text-slate-500 font-mono">
                ({currentProfile?.asn || carrierInfo?.as || 'AS44244'})
              </span>
            </div>

            {/* Quick 1-Tap Operator Selection Pills */}
            <div className="flex items-center gap-1 font-sans text-[10px]">
              {NETWORK_PROFILES.slice(0, 5).map((p) => {
                const isSelected = currentProfile?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectProfile(p)}
                    type="button"
                    className={`px-2 py-0.5 rounded transition-all cursor-pointer font-medium ${
                      isSelected
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-400 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-900/90 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'
                    }`}
                    title={p.nameFa}
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

            {onRefreshCarrier && (
              <button
                onClick={onRefreshCarrier}
                disabled={isDetectingCarrier}
                title={lang === 'fa' ? 'استعلام مجدد شبکه (Speedtest)' : 'Re-detect operator'}
                className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 rounded transition-colors cursor-pointer border border-cyan-950 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isDetectingCarrier ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            )}
          </div>
        </div>

        <div className="hidden sm:flex flex-col text-right">
          <span className="text-slate-500 text-[9px] flex items-center justify-end gap-1">
            <Clock className="w-3 h-3 text-cyan-500/70" />
            {lang === 'fa' ? 'ساعت محلی' : 'System Time'}
          </span>
          <span className="text-cyan-200 font-mono">{timeStr}</span>
        </div>

        {/* Language Switcher */}
        <button
          onClick={onToggleLang}
          id="lang-toggle-btn"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border border-cyan-900/60 bg-[#161B22] text-cyan-300 hover:bg-cyan-950/40 hover:text-white transition-all cursor-pointer"
          title="Toggle Language / تغییر زبان"
        >
          <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-sans font-medium">{lang === 'fa' ? 'English' : 'فارسی'}</span>
        </button>
      </div>
    </header>
  );
}

