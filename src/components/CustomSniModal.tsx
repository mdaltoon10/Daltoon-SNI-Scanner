import { useState } from 'react';
import { SniItem } from '../types';
import { PlusCircle, X, Check, ListFilter, Globe, DownloadCloud, Sparkles, ClipboardPaste } from 'lucide-react';
import { safeReadClipboard } from '../utils/clipboard';

interface CustomSniModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSnis: (snis: SniItem[]) => void;
  onFetchUrl?: (customUrl: string) => Promise<void>;
  lang: 'fa' | 'en';
}

export function CustomSniModal({
  isOpen,
  onClose,
  onAddSnis,
  onFetchUrl,
  lang
}: CustomSniModalProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'url'>('text');
  const [inputText, setInputText] = useState('');
  const [onlineUrl, setOnlineUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleImportText = () => {
    setErrorMsg('');
    const lines = inputText
      .split(/[\n,;\s]+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const validDomains: SniItem[] = [];
    const seen = new Set<string>();

    for (const raw of lines) {
      const clean = raw.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase();
      if (clean && clean.includes('.') && !seen.has(clean)) {
        seen.add(clean);
        validDomains.push({
          id: `custom_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          domain: clean,
          category: 'custom',
          description: 'Custom imported SNI'
        });
      }
    }

    if (validDomains.length === 0) {
      setErrorMsg(
        lang === 'fa'
          ? 'هیچ دامنه معتبری یافت نشد. لطفاً دامنه‌ها را به درستی وارد کنید (مثال: www.yahoo.com)'
          : 'No valid domains found. Please provide valid domain names.'
      );
      return;
    }

    onAddSnis(validDomains);
    setInputText('');
    onClose();
  };

  const handleImportUrl = async () => {
    if (!onlineUrl.trim()) {
      setErrorMsg(lang === 'fa' ? 'لطفاً لینک را وارد کنید.' : 'Please enter a valid URL.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      if (onFetchUrl) {
        await onFetchUrl(onlineUrl.trim());
      }
      onClose();
    } catch {
      setErrorMsg(lang === 'fa' ? 'خطا در دریافت لیست از آدرس.' : 'Failed to fetch list from URL.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono animate-fadeIn">
      <div className="w-full max-w-lg bg-[#0D0F16] border border-cyan-500/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-900/30 bg-[#0A0B10]">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-wide">
              {lang === 'fa' ? 'افزودن دامنه‌های SNI آنلاین یا دستی' : 'Import Custom SNIs / GitHub Repository'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Header */}
        <div className="flex border-b border-slate-800 bg-[#0A0B10] px-6">
          <button
            onClick={() => {
              setActiveTab('text');
              setErrorMsg('');
            }}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'text'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'fa' ? 'ورود دستی (Text / List)' : 'Manual Input'}
          </button>
          <button
            onClick={() => {
              setActiveTab('url');
              setErrorMsg('');
            }}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'url'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'fa' ? 'لینک مخزن گیت‌هاب / ساب‌دامین' : 'Online URL / GitHub Raw'}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {activeTab === 'text' ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-slate-400 font-medium">
                  {lang === 'fa'
                    ? 'لیست دامنه‌ها را وارد کنید (هر خط یک دامنه یا با ویرگول جدا شده):'
                    : 'Paste domain list (one per line, or comma-separated):'}
                </label>
                <button
                  type="button"
                  onClick={async () => {
                    const txt = await safeReadClipboard();
                    if (txt) setInputText((prev) => (prev ? `${prev}\n${txt}` : txt));
                  }}
                  className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 cursor-pointer font-sans"
                >
                  <ClipboardPaste className="w-3 h-3 text-cyan-400" />
                  <span>{lang === 'fa' ? 'چسباندن متن' : 'Paste'}</span>
                </button>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`www.yahoo.com\nsearch.yahoo.com\nskype.com\napi.spotify.com\nimages.google.com\nworkers.dev`}
                className="h-44 w-full bg-[#050608] border border-cyan-900/40 focus:border-cyan-500 rounded-lg p-3 text-xs text-cyan-200 font-mono placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-2 font-medium">
                  {lang === 'fa'
                    ? 'آدرس اینترنتی فایل حاوی لیست SNI را وارد کنید:'
                    : 'Enter Raw URL of SNI list file:'}
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="url"
                    value={onlineUrl}
                    onChange={(e) => setOnlineUrl(e.target.value)}
                    placeholder="https://raw.githubusercontent.com/.../sni_list.txt"
                    className="w-full bg-[#050608] border border-cyan-900/40 focus:border-cyan-500 rounded-lg pl-9 pr-3 py-2.5 text-xs text-cyan-200 font-mono placeholder-slate-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Sample Online Repo Buttons */}
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1.5">
                  {lang === 'fa' ? 'مخازن آماده تست شده:' : 'Curated Sources:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() =>
                      setOnlineUrl(
                        'https://raw.githubusercontent.com/vfarid/v2ray-share/master/anti-filter-sni.txt'
                      )
                    }
                    className="text-[10px] px-2 py-1 rounded bg-[#161B22] border border-slate-800 text-cyan-400 hover:border-cyan-700 cursor-pointer"
                  >
                    vfarid / anti-filter
                  </button>
                  <button
                    onClick={() =>
                      setOnlineUrl('https://raw.githubusercontent.com/ircfspace/warpplus/main/sni.txt')
                    }
                    className="text-[10px] px-2 py-1 rounded bg-[#161B22] border border-slate-800 text-cyan-400 hover:border-cyan-700 cursor-pointer"
                  >
                    ircfspace / warpplus
                  </button>
                  <button
                    onClick={() =>
                      setOnlineUrl(
                        'https://raw.githubusercontent.com/yebekhe/TelegramV2rayCollector/main/sub/sni_list.txt'
                      )
                    }
                    className="text-[10px] px-2 py-1 rounded bg-[#161B22] border border-slate-800 text-cyan-400 hover:border-cyan-700 cursor-pointer"
                  >
                    yebekhe / collector
                  </button>
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <p className="text-xs text-rose-400 bg-rose-950/30 border border-rose-900/50 p-2 rounded">
              {errorMsg}
            </p>
          )}

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ListFilter className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {lang === 'fa'
                ? 'پروتکل‌های http/https و مسیرهای اضافی به صورت خودکار تمیز می‌شوند.'
                : 'URL schemes and trailing paths will be automatically stripped.'}
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#0A0B10] border-t border-cyan-900/30 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-[#161B22] text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {lang === 'fa' ? 'انصراف' : 'Cancel'}
          </button>
          {activeTab === 'text' ? (
            <button
              onClick={handleImportText}
              className="flex items-center gap-1.5 px-5 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-black text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <Check className="w-4 h-4" />
              {lang === 'fa' ? 'افزودن به لیست اسکن' : 'Import to Scanner'}
            </button>
          ) : (
            <button
              onClick={handleImportUrl}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-black text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50"
            >
              <DownloadCloud className="w-4 h-4" />
              {isSubmitting
                ? lang === 'fa'
                  ? 'در حال دریافت...'
                  : 'Fetching...'
                : lang === 'fa'
                ? 'دریافت آنلاین و اسکن'
                : 'Fetch & Import'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
