import { useEffect, useRef, useState } from 'react';
import type { Lang } from '../../data/i18n';
import { presets, type ModuleId, type PresetAction } from './workbenchData';
import NotesWorkspace from './NotesWorkspace';
import StudioWorkspace from './StudioWorkspace';
import AiPanel, { type ChatMessage } from './AiPanel';
import { NotebookPen, PenTool, Wand2 } from 'lucide-react';

interface Props {
  lang: Lang;
}

// A faithful, interactive miniature of the aitower desktop app:
// two modules (notes / studio) + a working AI assistant panel with
// typewriter streaming, tool-call steps and canvas side effects.
export default function InteractiveWorkbench({ lang }: Props) {
  const zh = lang === 'zh';
  const [module, setModule] = useState<ModuleId>('studio');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [running, setRunning] = useState(false);
  const [runningOps, setRunningOps] = useState<NonNullable<ChatMessage['operations']>>([]);
  const [opsDone, setOpsDone] = useState(0);
  const [flowGenerated, setFlowGenerated] = useState(false);
  const [insertedImage, setInsertedImage] = useState(false);
  const [highlightedNote, setHighlightedNote] = useState<string | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };
  useEffect(() => clearTimers, []);

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };

  const applyEffect = (effect: PresetAction['effect']) => {
    if (effect === 'add_flow_nodes') setFlowGenerated(true);
    if (effect === 'insert_image') setInsertedImage(true);
    if (effect === 'highlight_note') {
      setHighlightedNote('n1');
      later(() => setHighlightedNote(null), 4000);
    }
  };

  const runPreset = (preset: PresetAction) => {
    if (running) return;
    clearTimers();
    setRunning(true);
    setModule(preset.module);

    const now = Date.now();
    const userMsg: ChatMessage = { id: `u-${now}`, role: 'user', text: preset.prompt };
    const aiMsg: ChatMessage = {
      id: `a-${now}`,
      role: 'assistant',
      text: '',
      operations: preset.operations,
      streaming: true,
    };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setRunningOps(preset.operations);
    setOpsDone(0);

    // Steps complete one by one…
    preset.operations.forEach((_, idx) => {
      later(() => setOpsDone(idx + 1), 900 * (idx + 1));
    });

    // …then the reply streams in character by character
    const startTyping = 900 * preset.operations.length + 300;
    const chars = Array.from(preset.reply);
    const tickMs = zh ? 26 : 14;
    later(() => {
      chars.forEach((_, i) => {
        later(() => {
          const partial = chars.slice(0, i + 1).join('');
          setMessages((prev) => prev.map((m) => (m.id === aiMsg.id ? { ...m, text: partial } : m)));
        }, i * tickMs);
      });
      later(() => {
        setMessages((prev) => prev.map((m) => (m.id === aiMsg.id ? { ...m, streaming: false } : m)));
        setRunning(false);
        applyEffect(preset.effect);
      }, chars.length * tickMs + 200);
    }, startTyping);
  };

  const handleCustomSend = (text: string) => {
    if (running) return;
    const now = Date.now();
    setMessages((prev) => [
      ...prev,
      { id: `u-${now}`, role: 'user', text },
      {
        id: `a-${now}`,
        role: 'assistant',
        text: zh
          ? '这是网页里的微缩演示。完整能力（跨笔记检索、画板起草、导出插入）都在桌面客户端里 —— 点击下方按钮免费下载体验。'
          : 'This is a miniature web demo. The full capabilities — cross-note retrieval, board drafting, one-click insert — live in the desktop app. Download it below to try for real.',
      },
    ]);
  };

  const list = presets[lang];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-xl shadow-zinc-950/5">
      {/* window chrome + module switcher */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <i className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <i className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <i className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="seg-tab-group mx-auto">
          <button
            className={`seg-tab ${module === 'notes' ? 'active' : ''}`}
            onClick={() => setModule('notes')}
          >
            <NotebookPen size={12} />
            {zh ? '笔记' : 'Notes'}
          </button>
          <button
            className={`seg-tab ${module === 'studio' ? 'active' : ''}`}
            onClick={() => setModule('studio')}
          >
            <PenTool size={12} />
            {zh ? '创作' : 'Studio'}
          </button>
        </div>
        <span className="hidden rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground sm:block">
          v0.1.9
        </span>
      </div>

      {/* three-column body */}
      <div className="grid h-[420px] grid-cols-1 md:h-[460px] md:grid-cols-[1fr_240px]">
        <div className="min-h-0">
          {module === 'notes' ? (
            <NotesWorkspace lang={lang} insertedImage={insertedImage} highlightedNote={highlightedNote} />
          ) : (
            <StudioWorkspace lang={lang} flowGenerated={flowGenerated} />
          )}
        </div>
        <div className="hidden min-h-0 border-l border-border md:block">
          <AiPanel
            lang={lang}
            messages={messages}
            running={running}
            runningOps={runningOps}
            opsDone={opsDone}
            onSend={handleCustomSend}
          />
        </div>
      </div>

      {/* quick actions */}
      <div className="flex flex-wrap items-center gap-2 border-t border-border bg-muted/30 px-4 py-3">
        <span className="mr-1 hidden items-center gap-1 text-[11px] font-medium text-muted-foreground sm:flex">
          <Wand2 size={12} />
          {zh ? '试试预设指令：' : 'Try a preset:'}
        </span>
        {list.map((p) => (
          <button
            key={p.id}
            onClick={() => runPreset(p)}
            disabled={running}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-medium text-foreground shadow-2xs transition-all hover:-translate-y-px hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
