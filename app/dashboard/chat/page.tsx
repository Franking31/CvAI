// app/dashboard/chat/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useCVStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Send, Loader2, Trash2, Bot, User } from 'lucide-react';
import { toast } from 'sonner';
import AIProviderSelector from '@/app/components/AIProviderSelector';

export default function ChatPage() {
  const { profile, jobDescription, conversationHistory, addMessage, clearConversation, aiProvider, aiModel } =
    useCVStore();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

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
          profile,
          jobDescription,
          history: conversationHistory.map(({ role, content }) => ({ role, content })),
          message: trimmed,
          provider: aiProvider,
          model: aiModel,
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Ligne vide
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Titre ## ou ###
    if (line.startsWith('### ')) {
      elements.push(
        <p key={i} className="font-bold text-sm mt-2 mb-0.5">
          {parseInline(line.slice(4))}
        </p>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <p key={i} className="font-bold text-sm mt-2 mb-0.5">
          {parseInline(line.slice(3))}
        </p>
      );
    }
    // Ligne de séparation ---
    else if (/^[-*]{3,}$/.test(line.trim())) {
      elements.push(<hr key={i} className="border-current opacity-20 my-1" />);
    }
    // Bullet - ou *
    else if (/^[-*] /.test(line)) {
      const bullets: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        bullets.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="space-y-0.5 my-1 pl-3">
          {bullets.map((b, bi) => (
            <li key={bi} className="flex gap-2">
              <span className="opacity-50 shrink-0">•</span>
              <span>{parseInline(b)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }
    // Texte normal
    else {
      elements.push(
        <p key={i} className="leading-relaxed">
          {parseInline(line)}
        </p>
      );
    }

    i++;
  }

  return <div className="space-y-0.5 text-sm">{elements}</div>;
}

function parseInline(text: string): React.ReactNode {
  // Gère **gras** et *italique*
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
};

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col h-[calc(100vh-56px)]">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Assistant IA</h1>
          <p className="text-sm text-muted-foreground">
            Posez vos questions sur votre CV, l'offre d'emploi, ou demandez des conseils.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <AIProviderSelector />
          {conversationHistory.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { clearConversation(); toast.success('Conversation effacée'); }}
              className="text-muted-foreground"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Effacer
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <Card className="flex-1 overflow-y-auto p-4 space-y-4 mb-4">
        {conversationHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-3">
            <Bot className="w-12 h-12 opacity-20" />
            <div>
              <p className="font-medium">Bonjour ! Je suis CareerAI.</p>
              <p className="text-sm mt-1">
                Demandez-moi d'analyser votre profil, de suggérer des améliorations
                ou de vous préparer pour un entretien.
              </p>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              {[
                "Quelles compétences manquent dans mon profil ?",
                "Comment améliorer mon résumé professionnel ?",
                "Quels mots-clés sont importants pour cette offre ?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="text-sm text-primary border border-primary/30 rounded-lg px-4 py-2 hover:bg-primary/5 transition-colors text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {conversationHistory.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : 'bg-muted text-foreground rounded-bl-sm'
            }`}>
              {renderMarkdown(msg.content)}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              En train de réfléchir...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </Card>

      {/* Input */}
      <div className="flex gap-2 items-end">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Posez votre question... (Entrée pour envoyer, Maj+Entrée pour nouvelle ligne)"
          rows={2}
          className="resize-none flex-1"
        />
        <Button onClick={sendMessage} disabled={!input.trim() || loading} size="icon" className="h-[72px] w-12 shrink-0">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
      <p className="text-xs text-center text-muted-foreground mt-2">
        La conversation est sauvegardée automatiquement dans votre navigateur.
      </p>
    </div>
  );
}