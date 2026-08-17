interface FooterProps {
  isScanning?: boolean;
  totalNodes?: number;
  activeNodes?: number;
  failedNodes?: number;
  totalTested?: number;
  lang: 'fa' | 'en';
}

export function Footer({
  isScanning = false,
  lang
}: FooterProps) {
  return (
    <footer className="h-14 sm:h-12 bg-[#050608] border-t border-cyan-900/40 flex flex-wrap items-center px-4 sm:px-6 justify-between text-[11px] text-slate-400 font-mono select-none z-10 gap-2">
      {/* Status */}
      <div className="flex items-center gap-2">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isScanning
              ? 'bg-cyan-400 animate-ping shadow-[0_0_10px_#06b6d4]'
              : 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
          }`}
        />
        <span className="text-slate-400">
          {lang === 'fa' ? 'وضعیت:' : 'Status:'}
        </span>
        <strong className={isScanning ? 'text-cyan-400 font-bold animate-pulse' : 'text-emerald-400 font-bold'}>
          {isScanning
            ? lang === 'fa'
              ? 'در حال اسکن زنده...'
              : 'Scanning...'
            : lang === 'fa'
            ? 'آماده تست'
            : 'Ready'}
        </strong>
      </div>

      {/* Developer By mDaltoon */}
      <div className="flex items-center gap-2">
        <span className="text-slate-400 font-medium">
          Developer By
        </span>
        <a
          href="https://t.me/mDaltoon"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-cyan-950/90 border border-cyan-500 text-cyan-300 font-bold hover:bg-[#0088cc] hover:text-white hover:border-cyan-300 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-105"
        >
          <svg className="w-3.5 h-3.5 fill-current text-[#29b6f6] group-hover:text-white" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
          </svg>
          <span>mDaltoon</span>
        </a>
      </div>
    </footer>
  );
}
