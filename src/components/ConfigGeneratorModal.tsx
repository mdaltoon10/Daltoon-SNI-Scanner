import { useState } from 'react';
import { ParsedProxyConfig } from '../types';
import { injectSniIntoConfig, generateClashYaml, generateSingboxJson } from '../utils/configParser';
import { X, Copy, Check, FileCode, CheckCircle2, ShieldCheck, Globe } from 'lucide-react';

interface ConfigGeneratorModalProps {
  sni: string;
  parsedConfig: ParsedProxyConfig | null;
  onClose: () => void;
  lang: 'fa' | 'en';
}

export function ConfigGeneratorModal({
  sni,
  parsedConfig,
  onClose,
  lang
}: ConfigGeneratorModalProps) {
  const [activeTab, setActiveTab] = useState<'vless' | 'clash' | 'singbox'>('vless');
  const [copied, setCopied] = useState(false);

  // Generate configs
  const vlessConfig = parsedConfig
    ? injectSniIntoConfig(parsedConfig, sni)
    : `vless://d2c18400-6c9a-4c28-98e3-0d33b5c19208@104.16.12.34:443?security=tls&encryption=none&headerType=none&type=tcp&sni=${sni}#Iran-SNI-${sni}`;

  const clashConfig = generateClashYaml(
    sni,
    parsedConfig?.server || '104.16.12.34',
    Number(parsedConfig?.port) || 443,
    parsedConfig?.uuidOrPassword || 'd2c18400-6c9a-4c28-98e3-0d33b5c19208'
  );

  const singboxConfig = generateSingboxJson(
    sni,
    parsedConfig?.server || '104.16.12.34',
    Number(parsedConfig?.port) || 443,
    parsedConfig?.uuidOrPassword || 'd2c18400-6c9a-4c28-98e3-0d33b5c19208'
  );

  const currentContent =
    activeTab === 'vless' ? vlessConfig : activeTab === 'clash' ? clashConfig : singboxConfig;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#0D0F16] border border-cyan-500/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-900/30 bg-[#0A0B10]">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-wide">
              {lang === 'fa' ? 'کانفیگ تولید شده با SNI برگزیده' : 'Injected Configuration Output'}
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
        <div className="p-6 space-y-4">
          {/* Target SNI Callout */}
          <div className="bg-[#050608] border border-cyan-900/50 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
              <span className="text-xs text-slate-300">
                {lang === 'fa' ? 'دامنه SNI تزریق شده:' : 'Injected SNI:'}
              </span>
              <span className="text-xs font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                {sni}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest hidden sm:inline">
              TLS 1.3 / Clean Path
            </span>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('vless')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'vless'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              VLESS / Trojan URI
            </button>
            <button
              onClick={() => setActiveTab('clash')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'clash'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Clash (YAML)
            </button>
            <button
              onClick={() => setActiveTab('singbox')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'singbox'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sing-box (JSON)
            </button>
          </div>

          {/* Config Output Box */}
          <div className="relative">
            <pre className="h-52 w-full bg-[#050608] border border-cyan-900/40 rounded-lg p-4 text-[11px] text-cyan-200/90 leading-relaxed font-mono overflow-auto whitespace-pre-wrap select-all">
              {currentContent}
            </pre>
          </div>

          {/* Info note */}
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center gap-2.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              {lang === 'fa'
                ? 'این کانفیگ را می‌توانید مستقیماً در کلاینت‌های V2RayN، Nekobox، v2rayNG، Clash یا Sing-box کپی و متصل شوید.'
                : 'Copy and import directly into V2RayN, Nekobox, v2rayNG, Clash Verge, or Sing-box.'}
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#0A0B10] border-t border-cyan-900/30 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-[#161B22] text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {lang === 'fa' ? 'بستن' : 'Close'}
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-5 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-black text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied
              ? lang === 'fa'
                ? 'کپی شد!'
                : 'Copied!'
              : lang === 'fa'
              ? 'کپی کانفیگ'
              : 'Copy Config'}
          </button>
        </div>
      </div>
    </div>
  );
}
