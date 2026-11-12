import { useEffect, useRef } from 'react';
import type { Lang } from '../../data/i18n';
import type { OperationStep } from './workbenchData';
import LogoMark from './LogoMark';
import { ChevronRight, Loader2, SendHorizonal, Plus, Copy, RefreshCw, ListChecks, Layers, BarChart3, Lightbulb } from 'lucide-react';

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
  opsDone: number;
  totalDuration: string;
  contextLabel: string;
  onSend: (text: string) => void;
}

const quickActions = [
  { icon: ListChecks, zh: '规划深度技术长文大纲', en: 'Plan a deep tech outline' },
  { icon: Layers, zh: '手绘风格系统架构图', en: 'Hand-drawn architecture' },
  { icon: BarChart3, zh: '前沿方案评测 Benchmark', en: 'Benchmark frontiers' },
  { icon: Lightbulb, zh: '激活笔记灵感与双链重组', en: 'Spark notes & backlinks' },
];

export default function AiPanel({ lang, messages, running, opsDone, totalDuration, contextLabel, onSend }: Props) {
  const zh = lang === 'zh';
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, opsDone]);

  return (
    <div className="flex h-full flex-col">
      {/* header */}
      <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
        <span className="text-[11px] font-semibold">{zh ? 'AI 助手' : 'AI Assistant'}</span>
        <span className={`h-1.5 w-1.5 rounded-full ${running ? 'bg-amber-500' : 'bg-emerald-500'}`} style={running ? { animation: 'blink 1s step-end infinite' } : undefined} />
      </div>

      {/* messages / empty state */}
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {messages.length === 0 && (
          <div className="mt-10 flex flex-col items-center gap-3 px-3 text-center">
            <LogoMark size={40} className="rounded-xl shadow-sm" />
            <div>
              <p className="text-[12px] font-semibold">{zh ? 'aitower 创作伙伴' : 'aitower creative partner'}</p>
              <p className="mt-1 text-[9px] leading-relaxed text-muted-foreground">
                {zh ? '整理思想 · 总结资料 · 生成文章 · 手绘画图' : 'Organize thoughts · Synthesize docs · Write articles · Hand-drawn diagrams'}
              </p>
            </div>
            <div className="mt-2 flex w-full flex-col gap-1.5">
              {quickActions.map((q) => (
                <div key={q.zh} className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2 text-left text-[10px] font-medium shadow-2xs transition-all hover:-translate-y-px hover:shadow-sm">
                  <q.icon size={11} className="shrink-0 text-muted-foreground" />
                  <span className="truncate">{zh ? q.zh : q.en}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) =>
          m.role === 'user' ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[92%] rounded-xl rounded-br-sm bg-muted px-3 py-2 text-[11px] leading-relaxed font-medium text-foreground">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={m.id} className="space-y-2">
              {/* collapsible operations trace */}
              {m.operations && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[9px] font-medium text-muted-foreground">
                    <ChevronRight size={9} className={m.streaming ? '' : 'rotate-90'} />
                    {zh
                      ? `${m.streaming ? '正在运行' : '已运行'} ${m.operations.length} 项操作`
                      : `${m.streaming ? 'Running' : 'Ran'} ${m.operations.length} operations`}
                    <span className="text-muted-foreground/60">· {totalDuration}</span>
                    {m.streaming && <Loader2 size={9} className="animate-spin" />}
                  </div>
                  {m.operations.map((op, idx) => {
                    const done = !m.streaming || idx < opsDone;
                    const active = m.streaming && idx === opsDone;
                    if (!done && !active) return null;
                    return (
                      <div key={idx} className="flex items-center gap-1.5 pl-3.5 text-[9px] text-muted-foreground">
                        {active && <Loader2 size={9} className="shrink-0 animate-spin" />}
                        <span className="shrink-0">{op.label}</span>
                        {op.target && <span className="truncate rounded bg-muted px-1 py-px font-mono text-[8px]">{op.target}</span>}
                        {done && <span className="ml-auto shrink-0 text-[8px] text-muted-foreground/60">{op.duration}</span>}
                      </div>
                    );
                  })}
                </div>
              )}
              {/* reply */}
              {(!m.streaming || opsDone >= (m.operations?.length ?? 0)) && (
                <div className="text-[11px] leading-relaxed text-foreground">
                  {m.text}
                  {m.streaming && <span className="ml-0.5 inline-block h-3 w-px animate-blink bg-zinc-500 align-middle" />}
                </div>
              )}
              {!m.streaming && (
                <div className="flex items-center gap-2 text-muted-foreground/60">
                  <Copy size={9} />
                  <RefreshCw size={9} />
                </div>
              )}
            </div>
          ),
        )}
        <div ref={bottomRef} />
      </div>

      {/* context capsule + composer */}
      <div className="border-t border-border p-2.5">
        <div className="mb-2 inline-flex max-w-full items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1 text-[9px] text-muted-foreground shadow-2xs">
          <span className="h-1.5 w-1.5 shrink-0 rounded-sm bg-violet-500" />
          <span className="truncate">{contextLabel}</span>
          <span className="shrink-0 rounded bg-violet-100 px-1 text-[8px] font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
            {zh ? '总结' : 'Summarize'}
          </span>
        </div>
        <form
          className="rounded-xl border border-border bg-card"
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
            placeholder={zh ? '问问 AI、输入指令，或输入 / 载入多个专属技能…' : 'Ask AI, enter a command, or type / to load skills…'}
            className="w-full bg-transparent px-2.5 pt-2 pb-1 text-[10px] outline-none placeholder:text-muted-foreground/50"
          />
          <div className="flex items-center justify-between px-2 pb-1.5">
            <Plus size={11} className="text-muted-foreground/60" />
            <button type="submit" aria-label="send" className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
              <SendHorizonal size={10} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
