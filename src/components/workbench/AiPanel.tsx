import { useEffect, useRef } from 'react';
import type { Lang } from '../../data/i18n';
import type { OperationStep } from './workbenchData';
import { Wrench, Search, BookOpen, Loader2, SendHorizonal } from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  operations?: OperationStep[];
  streaming?: boolean;
}

interface Props {
  lang: Lang;
  messages: ChatMessage[];
  running: boolean;
  runningOps: OperationStep[];
  opsDone: number;
  onSend: (text: string) => void;
}

const opIcon = (type: OperationStep['type']) =>
  type === 'tool' ? <Wrench size={10} /> : type === 'search' ? <Search size={10} /> : <BookOpen size={10} />;

export default function AiPanel({ lang, messages, running, runningOps, opsDone, onSend }: Props) {
  const zh = lang === 'zh';
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, opsDone]);

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* header */}
      <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
        <span className={`h-1.5 w-1.5 rounded-full ${running ? 'bg-amber-500' : 'bg-emerald-500'}`} style={running ? { animation: 'blink 1s step-end infinite' } : undefined} />
        <span className="text-[10px] font-semibold">{zh ? 'AI 助手' : 'AI Assistant'}</span>
        {running && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[8px] font-medium text-muted-foreground">
            <Loader2 size={8} className="animate-spin" />
            {zh ? '生成中' : 'Running'}
          </span>
        )}
      </div>

      {/* messages */}
      <div className="flex-1 space-y-2.5 overflow-y-auto p-2.5">
        {messages.length === 0 && (
          <div className="mt-6 px-2 text-center">
            <p className="text-[10px] font-medium text-muted-foreground">{zh ? 'aitower 创作伙伴' : 'Your aitower partner'}</p>
            <p className="mt-1 text-[9px] leading-relaxed text-muted-foreground/60">
              {zh ? '去 AI 味的思想脚手架 · 手绘风配图与架构' : 'A thinking scaffold · hand-drawn figures'}
            </p>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : ''}>
            {m.role === 'user' ? (
              <div className="max-w-[90%] rounded-xl rounded-br-sm bg-primary px-2.5 py-1.5 text-[10px] leading-relaxed text-primary-foreground">
                {m.text}
              </div>
            ) : (
              <div className="max-w-full space-y-1.5">
                {/* operation steps */}
                {m.operations && (
                  <div className="space-y-1">
                    {m.operations.map((op, idx) => {
                      const done = !m.streaming || idx < opsDone;
                      const active = m.streaming && idx === opsDone;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[9px] transition-all ${
                            done
                              ? 'border-border bg-card text-muted-foreground'
                              : active
                                ? 'border-indigo-300 bg-indigo-50/60 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300'
                                : 'border-border/50 text-muted-foreground/40'
                          }`}
                        >
                          {active ? <Loader2 size={10} className="animate-spin" /> : opIcon(op.type)}
                          <span className="flex-1 truncate font-mono">{op.label}</span>
                          {done && <span className="shrink-0 text-[8px] text-muted-foreground/60">{op.duration}</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* reply text */}
                {(!m.streaming || opsDone >= (m.operations?.length ?? 0)) && (
                  <div className="rounded-xl rounded-tl-sm border border-border bg-card px-2.5 py-1.5 text-[10px] leading-relaxed text-foreground">
                    {m.text}
                    {m.streaming && <span className="ml-0.5 inline-block h-2.5 w-px animate-blink bg-zinc-500 align-middle" />}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* composer */}
      <div className="border-t border-border p-2">
        <form
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            const v = inputRef.current?.value.trim();
            if (v && !running) {
              onSend(v);
              if (inputRef.current) inputRef.current.value = '';
            }
          }}
        >
          <input
            ref={inputRef}
            placeholder={zh ? '输入指令…' : 'Ask anything…'}
            className="flex-1 bg-transparent text-[10px] outline-none placeholder:text-muted-foreground/50"
          />
          <button type="submit" className="text-muted-foreground transition-colors hover:text-foreground" aria-label="send">
            <SendHorizonal size={11} />
          </button>
        </form>
      </div>
    </div>
  );
}
