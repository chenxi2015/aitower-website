import { useEffect, useRef, useState } from 'react';
import type { Lang } from '../../data/i18n';
import { presets, type ModuleId, type PresetAction } from './workbenchData';
import NotesWorkspace from './NotesWorkspace';
import StudioWorkspace from './StudioWorkspace';
import AiPanel, { type ChatMessage } from './AiPanel';
import LogoMark from './LogoMark';
import ToolWorkspace, { type ToolWorkspaceId } from './ToolWorkspace';
import type { StudioPanelId } from './StudioWorkspace';
import MobileWorkspace from './MobileWorkspace';
import {
  NotebookPen, PenTool, Sun, CircleHelp, SlidersHorizontal,
  PanelLeft, LayoutGrid, Frame, SquarePen, Wrench, Zap,
} from 'lucide-react';

interface Props {
  lang: Lang;
}

type StudioView = StudioPanelId | ToolWorkspaceId;

// A faithful, interactive miniature of the aitower desktop app,
// redrawn from real product screenshots.
export default function InteractiveWorkbench({ lang }: Props) {
  const zh = lang === 'zh';
  const [module, setModule] = useState<ModuleId>('studio');
  const [studioView, setStudioView] = useState<StudioView>('assets');
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

  const dockItems = [
    { id: 'boards' as const, icon: PanelLeft, zh: '画板列表', en: 'Board list' },
    { id: 'frames' as const, icon: LayoutGrid, zh: '画板框架', en: 'Board frames' },
    { id: 'templates' as const, icon: Frame, zh: '画板模板', en: 'Board templates' },
    { id: 'assets' as const, icon: SquarePen, zh: '素材库', en: 'Asset library' },
    { id: 'images' as const, icon: Wrench, zh: '图片工具箱', en: 'Image tools' },
    { id: 'skills' as const, icon: Zap, zh: '智能体技能库', en: 'Agent skills' },
  ];

  const contextLabel = module === 'studio'
    ? (zh ? '未命名画板 按时打…' : 'Untitled board route…')
    : (zh ? '去 AI 味的写作.md' : 'writing-without-slop.md');

  return (
    <>
    <div className="h-[478px] w-full px-1 pb-5 sm:hidden">
      <MobileWorkspace lang={lang} />
    </div>
    <div className="hero-workbench relative hidden overflow-hidden rounded-t-[18px] rounded-b-none border border-black/[0.08] border-b-0 bg-background text-left shadow-[0_32px_80px_-32px_rgba(39,39,42,0.24),0_8px_24px_-12px_rgba(39,39,42,0.12)] dark:border-white/10 dark:shadow-[0_32px_80px_-28px_rgba(0,0,0,0.7)] sm:flex">
      {/* slim icon dock */}
      {module === 'studio' && <div className="hidden w-10 shrink-0 flex-col items-center gap-1.5 border-r border-black/[0.055] bg-zinc-50/50 py-3 dark:border-white/[0.06] dark:bg-white/[0.015] sm:flex">
        {dockItems.map((item) => (
          <button
            type="button"
            key={item.id}
            aria-label={zh ? item.zh : item.en}
            title={zh ? item.zh : item.en}
            aria-pressed={studioView === item.id}
            onClick={() => setStudioView(item.id)}
            className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-[7px] transition-colors ${studioView === item.id ? 'bg-white text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.04] dark:bg-white/10 dark:ring-white/[0.06]' : 'text-muted-foreground/60 hover:bg-black/[0.035] hover:text-foreground dark:hover:bg-white/[0.06]'}`}
          >
            <item.icon size={13} />
          </button>
        ))}
      </div>}

      <div className="min-w-0 flex-1">
        {/* title bar */}
        <div className="flex h-12 items-center border-b border-black/[0.055] bg-white/90 px-4 dark:border-white/[0.06] dark:bg-zinc-950/50">
          <div className="flex items-center gap-2">
            <i className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <i className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <i className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="hidden items-center sm:flex">
            <LogoMark size={17} className="ml-3 rounded" />
            <span className="ml-1.5 text-[11px] font-semibold tracking-[-0.01em]">aitower</span>
          </div>

          {/* centered module seg-tab */}
          <div className="seg-tab-group absolute left-1/2 -translate-x-1/2 shadow-none">
            <button className={`seg-tab ${module === 'notes' ? 'active' : ''}`} style={{ padding: '2px 12px', fontSize: 10 }} onClick={() => setModule('notes')}>
              <NotebookPen size={11} />
              {zh ? '笔记' : 'Notes'}
            </button>
            <button className={`seg-tab ${module === 'studio' ? 'active' : ''}`} style={{ padding: '2px 12px', fontSize: 10 }} onClick={() => setModule('studio')}>
              <PenTool size={11} />
              {zh ? '创作' : 'Studio'}
            </button>
          </div>

          <div className="ml-auto flex items-center gap-3.5 text-muted-foreground/70">
            <Sun size={11} className="hidden sm:block" />
            <CircleHelp size={11} className="hidden sm:block" />
            <SlidersHorizontal size={11} className="hidden sm:block" />
          </div>
        </div>

        {/* body: workspace + AI panel */}
        <div className="grid h-[400px] grid-cols-1 md:h-[456px] md:grid-cols-[1fr_258px]">
          <div className="min-h-0 min-w-0">
            {module === 'notes' ? (
              <NotesWorkspace lang={lang} insertedImage={insertedImage} highlightedNoteId={highlightedNote} />
            ) : studioView === 'images' || studioView === 'skills' ? (
              <ToolWorkspace lang={lang} view={studioView} />
            ) : (
              <StudioWorkspace lang={lang} flowGenerated={flowGenerated} panel={studioView} onPanelChange={setStudioView} />
            )}
          </div>
          <div className="hidden min-h-0 border-l border-black/[0.055] bg-zinc-50/30 dark:border-white/[0.06] dark:bg-white/[0.01] md:block">
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
    </>
  );
}
