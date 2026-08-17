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
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-500/60 bg-gradient-to-r from-emerald-950/90 to-teal-950/90 text-emerald-300 hover:text-white hover:border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)] transition-all cursor-pointer hover:scale-105"
          title="Toggle Language / تغییر زبان"
        >
          <Globe2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-sans">{lang === 'fa' ? 'English' : 'فارسی'}</span>
        </button>

        {/* Telegram PV & GitHub Repository Links */}
        <div className="flex items-center gap-2 border-l border-cyan-900/50 pl-2.5">
          {/* Telegram */}
          <a
            href="https://t.me/mDaltoon"
            target="_blank"
            rel="noopener noreferrer"
            title="پیوی تلگرام / Telegram (mDaltoon)"
            className="flex items-center justify-center p-2 rounded-lg bg-[#0088cc] border border-cyan-300 text-white hover:bg-[#0099e6] hover:scale-110 transition-all shadow-[0_0_15px_rgba(0,136,204,0.6)] cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
          </a>

          {/* GitHub Repository */}
          <a
            href="https://github.com/mdaltoon10/Daltoon-SNI-Scanner"
            target="_blank"
            rel="noopener noreferrer"
            title="سورس پروژه در گیت‌هاب / GitHub Repository"
            className="flex items-center justify-center p-2 rounded-lg bg-gradient-to-r from-purple-900 to-indigo-900 border border-purple-500/70 text-purple-200 hover:text-white hover:border-purple-300 hover:from-purple-800 hover:to-indigo-800 transition-all hover:scale-110 shadow-[0_0_15px_rgba(168,85,247,0.4)] cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}

