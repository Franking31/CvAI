// app/dashboard/chat/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useCVStore } from '@/lib/store';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Trash2, Bot, User, MessageSquare, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import AIProviderSelector from '@/app/components/AIProviderSelector';

function parseInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') { i++; continue; }
    if (line.startsWith('### ') || line.startsWith('## ')) {
      elements.push(<p key={i} className="font-bold text-sm mt-2 mb-0.5">{parseInline(line.slice(line.startsWith('### ') ? 4 : 3))}</p>);
    } else if (/^[-*]{3,}$/.test(line.trim())) {
      elements.push(<hr key={i} className="border-current opacity-20 my-1" />);
    } else if (/^[-*] /.test(line)) {
      const bullets: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) { bullets.push(lines[i].slice(2)); i++; }
      elements.push(
        <ul key={`ul-${i}`} className="space-y-0.5 my-1 pl-3">
          {bullets.map((b, bi) => <li key={bi} className="flex gap-2"><span className="opacity-50 shrink-0">•</span><span>{parseInline(b)}</span></li>)}
        </ul>
      );
      continue;
    } else {
      elements.push(<p key={i} className="leading-relaxed">{parseInline(line)}</p>);
    }
    i++;
  }
  return <div className="space-y-0.5 text-sm">{elements}</div>;
}

const SUGGESTIONS = [
  "Quelles compétences manquent dans mon profil ?",
  "Comment améliorer mon résumé professionnel ?",
  "Quels mots-clés sont importants pour cette offre ?",
  "Prépare-moi pour un entretien sur ce poste.",
];

export default function ChatPage() {
  const { profile, jobDescription, conversationHistory, addMessage, clearConversation, aiProvider, aiModel } = useCVStore();
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    addMessage({ role: 'user', content: trimmed });
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile, jobDescription,
          history: conversationHistory.map(({ role, content }) => ({ role, content })),
          message: trimmed, provider: aiProvider, model: aiModel,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      addMessage({ role: 'assistant', content: data.reply });
    } catch (err: any) {
      toast.error('Erreur', { description: err.message });
      addMessage({ role: 'assistant', content: "Désolé, une erreur s'est produite. Réessayez." });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="bg-background flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
      <div className="max-w-3xl w-full mx-auto px-4 flex flex-col flex-1 py-4 gap-4 min-h-0">

        {/* ── Hero header — PAS de overflow-hidden ── */}
        <div className="relative rounded-2xl border border-border bg-card p-5 shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none rounded-2xl" />
          <div className="relative flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4 text-cyan-500" />
              </div>
              <div>
                <h1 className="font-bold text-base">Assistant IA</h1>
                <p className="text-xs text-muted-foreground">Posez vos questions sur votre CV ou préparez votre entretien.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* z-50 pour que le dropdown passe au-dessus */}
              <div className="relative z-50">
                <AIProviderSelector />
              </div>
              {conversationHistory.length > 0 && (
                <button
                  onClick={() => { clearConversation(); toast.success('Conversation effacée'); }}
                  className="flex items-center gap-1.5 px-3 h-8 text-xs font-medium text-muted-foreground hover:text-rose-400 border border-border rounded-lg hover:border-rose-400/30 hover:bg-rose-500/5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Effacer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 rounded-2xl border border-border bg-card flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            {/* Empty state */}
            {conversationHistory.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-5 py-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center">
                  <Bot className="w-8 h-8 text-cyan-500" />
                </div>
                <div>
                  <p className="font-semibold text-base">Bonjour ! Je suis CareerAI.</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xs">Analysez votre profil, obtenez des conseils ou préparez votre entretien.</p>
                </div>
                <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                      className="text-sm text-left px-4 py-2.5 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-all">
                      <Sparkles className="w-3 h-3 inline mr-2 text-primary" />{s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {conversationHistory.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-cyan-500" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm shadow-primary/20'
                    : 'bg-muted/70 border border-border text-foreground rounded-bl-sm'
                }`}>
                  {renderMarkdown(msg.content)}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-primary flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading dots */}
            {loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-cyan-500" />
                </div>
                <div className="bg-muted/70 border border-border rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2.5 text-sm text-muted-foreground">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  En train de réfléchir...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input — intégré dans la card, donc overflow-hidden ici c'est ok (le dropdown est dans le header au-dessus) */}
          <div className="border-t border-border p-3 flex gap-2 items-end bg-card shrink-0">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question... (Entrée pour envoyer, Maj+Entrée pour nouvelle ligne)"
              rows={2}
              className="resize-none flex-1 border-border bg-muted/30 focus-visible:border-primary/50 text-sm min-h-[64px]"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground shrink-0">
          Conversation sauvegardée automatiquement · {conversationHistory.length} message{conversationHistory.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}