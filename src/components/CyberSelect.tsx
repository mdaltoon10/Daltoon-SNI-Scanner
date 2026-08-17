import React, { useState } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

export interface SelectOption<T = string | number> {
  value: T;
  label: string;
  badge?: string;
  icon?: React.ReactNode;
}

interface CyberSelectProps<T = string | number> {
  value: T;
  onChange: (val: T) => void;
  options: SelectOption<T>[];
  label?: string;
  title?: string;
  className?: string;
  buttonClassName?: string;
  variant?: 'compact' | 'full' | 'inline';
  disabled?: boolean;
}

export function CyberSelect<T extends string | number>({
  value,
  onChange,
  options,
  label,
  title,
  className = '',
  buttonClassName = '',
  variant = 'compact',
  disabled = false
}: CyberSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  const handleSelect = (val: T) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen(true);
        }}
        className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-[#07090F] border border-cyan-900/60 hover:border-cyan-400 text-cyan-300 text-xs font-mono transition-all shadow-sm select-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]'
        } ${variant === 'full' ? 'w-full py-2.5 px-3.5 bg-[#050608]' : ''} ${buttonClassName}`}
      >
        <div className="flex items-center gap-1.5 truncate">
          {selectedOption?.icon}
          <span className="truncate font-medium">{selectedOption?.label || String(value)}</span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-cyan-400 shrink-0 transition-transform duration-200" />
      </button>

      {/* Cyberpunk Modal / Bottom Sheet on Mobile & Styled Popover on Desktop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          {/* Backdrop dismiss */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          {/* Modal Content */}
          <div
            className="relative w-full max-w-sm max-h-[85vh] bg-[#07090F] border border-cyan-500/80 rounded-2xl shadow-[0_0_35px_rgba(6,182,212,0.35)] overflow-hidden flex flex-col font-mono text-slate-200 z-10 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-cyan-900/60 bg-gradient-to-r from-[#0B0E17] via-[#111624] to-[#0B0E17] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4] animate-pulse" />
                <span className="font-bold text-sm text-cyan-200 tracking-wide">
                  {title || label || 'انتخاب گزینه / Select Option'}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-500 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Options List */}
            <div className="p-3 overflow-y-auto max-h-[60vh] space-y-1.5 custom-scrollbar">
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left cursor-pointer group ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-950/90 to-blue-950/80 border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.25)] font-bold'
                        : 'bg-[#0D101A]/80 border-cyan-950/60 text-slate-300 hover:bg-cyan-950/40 hover:border-cyan-600/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {/* Radio Indicator */}
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-500 shadow-[0_0_8px_#06b6d4]'
                            : 'border-slate-600 group-hover:border-cyan-500'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                      </div>

                      <div className="flex flex-col truncate">
                        <span className="text-xs truncate">{opt.label}</span>
                        {opt.badge && (
                          <span className="text-[10px] text-cyan-400 font-normal mt-0.5">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-cyan-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-3 bg-[#05060A] border-t border-cyan-950/80 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400 text-xs font-semibold transition-all cursor-pointer"
              >
                بستن (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
