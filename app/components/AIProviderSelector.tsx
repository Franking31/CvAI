// components/AIProviderSelector.tsx
'use client';

import { useCVStore, AI_PROVIDERS, type AIProvider } from '@/lib/store';
import { Cpu, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function AIProviderSelector() {
  const { aiProvider, aiModel, setAIProvider, setAIModel } = useCVStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const currentProvider = AI_PROVIDERS[aiProvider];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-sm font-medium"
      >
        <Cpu className="w-3.5 h-3.5 text-primary" />
        <span className="text-muted-foreground">{currentProvider.label}</span>
        <span className="text-xs text-muted-foreground/60">·</span>
        <span className="text-xs text-muted-foreground/80 max-w-[120px] truncate">{aiModel}</span>
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-72 rounded-xl border border-border bg-popover shadow-xl z-50 overflow-hidden">
          {(Object.entries(AI_PROVIDERS) as [AIProvider, typeof AI_PROVIDERS[AIProvider]][]).map(
            ([key, prov]) => (
              <div key={key}>
                {/* Provider header */}
                <div className="px-3 py-2 bg-muted/50 border-b border-border">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {prov.label}
                  </span>
                </div>

                {/* Models */}
                {prov.models.map((m) => {
                  const isActive = aiProvider === key && aiModel === m;
                  return (
                    <button
                      key={m}
                      onClick={() => {
                        setAIProvider(key);
                        setAIModel(m);
                        setOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between group ${
                        isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <span>{m}</span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}