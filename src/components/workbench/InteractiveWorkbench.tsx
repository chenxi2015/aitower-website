import { useEffect, useRef, useState } from 'react';
import type { Lang } from '../../data/i18n';
import { presets, type ModuleId, type PresetAction } from './workbenchData';
import NotesWorkspace from './NotesWorkspace';
import StudioWorkspace from './StudioWorkspace';
import AiPanel, { type ChatMessage } from './AiPanel';
import LogoMark from './LogoMark';
import {
  NotebookPen, PenTool, Crown, Sun, CircleHelp, SlidersHorizontal,
  SquarePen, History, PanelLeft, LayoutGrid, Puzzle, Wrench, Sparkles, Zap,
} from 'lucide-react';

interface Props {
  lang: Lang;
}

const dockIcons = [PanelLeft, LayoutGrid, Puzzle, SquarePen, Wrench, Zap];

// A faithful, interactive miniature of the aitower desktop app,
// redrawn from real product screenshots.
export default function InteractiveWorkbench({ lang }: Props) {
  const zh = lang === 'zh';
  const [module, setModule] = useState<ModuleId>('studio');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [running, setRunning] = useState(false);
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
    setMessages((prev) => [
      ...prev,
      { id: `u-${now}`, role: 'user', text: preset.prompt },
      { id: `a-${now}`, role: 'assistant', text: '', operations: preset.operations, streaming: true },
    ]);
    setOpsDone(0);

    preset.operations.forEach((_, idx) => {
      later(() => setOpsDone(idx + 1), 900 * (idx + 1));
    });

    const startTyping = 900 * preset.operations.length + 300;
    const chars = Array.from(preset.reply);
    const tickMs = zh ? 26 : 14;
    later(() => {
      chars.forEach((_, i) => {
        later(() => {
          const partial = chars.slice(0, i + 1).join('');
          setMessages((prev) => prev.map((m) => (m.id === `a-${now}` ? { ...m, text: partial } : m)));
        }, i * tickMs);
      });
      later(() => {
        setMessages((prev) => prev.map((m) => (m.id === `a-${now}` ? { ...m, streaming: false } : m)));
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

  const contextLabel = module === 'studio'
    ? (zh ? '未命名画板 按时打…' : 'Untitled board route…')
    : (zh ? '去 AI 味的写作.md' : 'writing-without-slop.md');

  return (
    <div className="flex overflow-hidden rounded-t-2xl rounded-b-none border border-border border-b-none bg-background text-left shadow-xl shadow-zinc-950/5">
      {/* slim icon dock */}
      {module === 'studio' && <div className="hidden w-9 shrink-0 flex-col items-center gap-1 border-r border-border py-2 sm:flex">
        {dockIcons.map((Icon, i) => (
          <div
            key={i}
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${'text-muted-foreground/70'}`}
          >
            <Icon size={13} />
          </div>
        ))}
      </div>}

      <div className="min-w-0 flex-1">
        {/* title bar */}
        <div className="flex items-center border-b border-border px-3 py-2">
          <div className="flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <i className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <i className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <LogoMark size={16} className="ml-2 rounded" />
          <span className="ml-1.5 text-[11px] font-bold tracking-tight">aitower</span>

          {/* centered module seg-tab */}
          <div className="seg-tab-group absolute left-1/2 -translate-x-1/2">
            <button className={`seg-tab ${module === 'notes' ? 'active' : ''}`} style={{ padding: '2px 12px', fontSize: 10 }} onClick={() => setModule('notes')}>
              <NotebookPen size={11} />
              {zh ? '笔记' : 'Notes'}
            </button>
            <button className={`seg-tab ${module === 'studio' ? 'active' : ''}`} style={{ padding: '2px 12px', fontSize: 10 }} onClick={() => setModule('studio')}>
              <PenTool size={11} />
              {zh ? '创作' : 'Studio'}
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2.5 text-muted-foreground">
            <Sun size={11} className="hidden sm:block" />
            <CircleHelp size={11} className="hidden sm:block" />
            <SlidersHorizontal size={11} className="hidden sm:block" />
          </div>
        </div>

        {/* body: workspace + AI panel */}
        <div className="grid h-[400px] grid-cols-1 md:h-[440px] md:grid-cols-[1fr_250px]">
          <div className="min-h-0 min-w-0">
            {module === 'notes' ? (
              <NotesWorkspace lang={lang} insertedImage={insertedImage} highlightedNoteId={highlightedNote} />
            ) : (
              <StudioWorkspace lang={lang} flowGenerated={flowGenerated} />
            )}
          </div>
          <div className="hidden min-h-0 border-l border-border md:block">
            <AiPanel
              lang={lang}
              messages={messages}
              running={running}
              opsDone={opsDone}
              totalDuration={zh ? '2分54秒' : '2m 54s'}
              contextLabel={contextLabel}
              onSend={handleCustomSend}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
