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
  totalNodes = 250,
  activeNodes = 0,
  failedNodes = 0,
  totalTested = 0,
  lang
}: FooterProps) {
  return (
    <footer className="h-10 bg-[#050608] border-t border-cyan-900/30 flex items-center px-4 sm:px-6 justify-between text-[10px] text-slate-500 uppercase tracking-widest font-mono select-none z-10">
      <div className="flex items-center gap-4 sm:gap-6">
        <span>
          {lang === 'fa' ? 'تست شده:' : 'Tested:'}{' '}
          <strong className="text-slate-300 font-semibold">{totalTested || totalNodes}</strong>
        </span>
        <span>
          {lang === 'fa' ? 'وضعیت اسکن:' : 'Status:'}{' '}
          <strong className={isScanning ? 'text-cyan-400 font-semibold animate-pulse' : 'text-green-400 font-semibold'}>
            {isScanning
              ? lang === 'fa'
                ? 'در حال بنچمارک...'
                : 'Benchmarking...'
              : lang === 'fa'
              ? 'آماده'
              : 'Standby'}
          </strong>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            isScanning
              ? 'bg-cyan-400 animate-ping shadow-[0_0_8px_#06b6d4]'
              : 'bg-green-500 shadow-[0_0_5px_#22c55e]'
          }`}
        />
        <span className="text-slate-400">
          {lang === 'fa'
            ? 'تست آنلاین پینگ، دانلود و آپلود از Speedtest.net'
            : 'Online Ping, Download & Upload Benchmarks'}
        </span>
      </div>
    </footer>
  );
}
