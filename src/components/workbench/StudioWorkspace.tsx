import { useEffect, useState } from 'react';
import type { Lang } from '../../data/i18n';
import { Search, Plus, Minus, Maximize, LayoutGrid, Undo2, Redo2, PenTool, ChevronDown, Cloud, MousePointer2, Frame, Network, CircleHelp, Flag, Smartphone, Layers3, Lightbulb, ListChecks, Route, Map, Square, Workflow, GalleryVerticalEnd, FileImage, Columns3, Share2, Menu, Hand, Diamond, Circle, ArrowRight, Type, Image, Eraser, MoreHorizontal, Lock } from 'lucide-react';
import RoutePlannerCanvas from './RoutePlannerCanvas';

export type StudioPanelId = 'assets' | 'boards' | 'frames' | 'templates';

interface Props {
  lang: Lang;
  flowGenerated: boolean;
  panel: StudioPanelId;
  onPanelChange: (panel: StudioPanelId) => void;
}

const materialCards = [
  { color: 'bg-note-yellow/70', name: '基础组件' },
  { color: 'bg-card', name: 'Robots' },
  { color: 'bg-note-blue/60', name: 'Snowflake d…' },
  { color: 'bg-card', name: 'Stars' },
];

// Studio mode, redrawn from the real screenshot:
// material drawer (自有素材/官方素材) + dot-grid canvas with hand-drawn
// sticky notes and flowchart frames + bottom zoom bar.
export default function StudioWorkspace({ lang, flowGenerated, panel, onPanelChange }: Props) {
  const zh = lang === 'zh';
  const [assetTab, setAssetTab] = useState<'mine' | 'official'>('mine');
  const [boardTab, setBoardTab] = useState<'frames' | 'boards'>('frames');
  const [templateTab, setTemplateTab] = useState<'local' | 'cloud'>('local');
  const [selectedFrame, setSelectedFrame] = useState('Goals');
  const [selectedTemplate, setSelectedTemplate] = useState(zh ? '头脑风暴' : 'Brainstorm');
  useEffect(() => setSelectedTemplate(zh ? '头脑风暴' : 'Brainstorm'), [zh]);

  return (
    <div className="flex h-full flex-col">
      {/* board toolbar strip */}
      <div className="flex h-9 items-center gap-2 border-b border-black/[0.05] bg-white px-3.5 dark:border-white/[0.06] dark:bg-zinc-950/30">
        <PenTool size={10} className="shrink-0 text-muted-foreground/60" />
        <span className="max-w-40 truncate text-[10px] font-medium tracking-[-0.01em]">{zh ? '未命名画板 按时打算大叔大…' : 'Untitled board route-planner…'}</span>
        <span className="rounded-full border border-emerald-600/10 bg-emerald-500/10 px-1.5 py-px text-[8px] font-medium text-emerald-700 dark:text-emerald-300">
          {zh ? '笔记' : 'Note'}
        </span>
        <div className="seg-tab-group ml-1 hidden sm:inline-flex" style={{ padding: 1 }}>
          {['自适应', '3:4', '9:16', '16:9'].map((r, i) => (
            <span key={r} className={`seg-tab ${i === 0 ? 'active' : ''}`} style={{ padding: '1px 5px', fontSize: 8 }}>
              {zh ? r : ['Auto', '3:4', '9:16', '16:9'][i]}
            </span>
          ))}
        </div>
        <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-zinc-900 px-2.5 py-1 text-[9px] font-medium text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900">
          + {zh ? '新建画板' : 'New board'}
        </span>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* switchable studio drawer */}
        <div className="hidden w-36 shrink-0 flex-col border-r border-black/[0.05] bg-zinc-50/35 dark:border-white/[0.06] dark:bg-white/[0.01] sm:flex">
          {panel === 'assets' && <>
          <div className="p-2.5 pb-1.5">
            <div className="seg-tab-group flex w-full shadow-none" style={{ padding: 2 }}>
              <button type="button" onClick={() => setAssetTab('mine')} className={`seg-tab ${assetTab === 'mine' ? 'active' : ''} flex-1 justify-center`} style={{ padding: '3px 4px', fontSize: 9 }}>{zh ? '自有素材' : 'Mine'}</button>
              <button type="button" onClick={() => setAssetTab('official')} className={`seg-tab ${assetTab === 'official' ? 'active' : ''} flex-1 justify-center`} style={{ padding: '3px 4px', fontSize: 9 }}>{zh ? '官方素材' : 'Official'}</button>
            </div>
          </div>
          <div className="mx-2.5 my-1 flex items-center gap-1.5 rounded-md border border-black/[0.045] bg-white/70 px-2 py-1.5 dark:border-white/[0.06] dark:bg-white/[0.025]">
            <Search size={9} className="shrink-0 text-muted-foreground/60" />
            <span className="truncate text-[9px] text-muted-foreground/60">{zh ? '搜索素材、组件、图片…' : 'Search assets…'}</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 pb-1 pt-2">
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[8px] font-medium text-white dark:bg-zinc-200 dark:text-zinc-900">{zh ? '常用' : 'Freq'}</span>
            <span className="px-1 py-px text-[8px] text-muted-foreground">{zh ? '组件' : 'Parts'}</span>
            <span className="px-1 py-px text-[8px] text-muted-foreground">{zh ? '图片' : 'Imgs'}</span>
            <Plus size={9} className="ml-auto text-muted-foreground/70" />
          </div>
          <div className="grid flex-1 grid-cols-2 content-start gap-x-2 gap-y-3 overflow-hidden p-2.5">
            {(assetTab === 'mine' ? materialCards : [
              { color: 'bg-note-purple/50', name: zh ? '架构组件' : 'Architecture' },
              { color: 'bg-note-green/50', name: zh ? '手绘图标' : 'Hand-drawn' },
              { color: 'bg-note-pink/50', name: zh ? '便签胶带' : 'Sticky notes' },
              { color: 'bg-note-blue/50', name: zh ? '设备线框' : 'Devices' },
            ]).map((c) => (
              <div key={c.name} className="group flex cursor-default flex-col gap-1.5">
                <div className={`aspect-[4/3] rounded-[7px] border border-black/[0.045] ${c.color} shadow-[0_1px_2px_rgba(0,0,0,0.025)] transition-all group-hover:-translate-y-0.5 group-hover:shadow-sm dark:border-white/[0.06]`} />
                <span className="truncate text-[8px] text-muted-foreground">{c.name}</span>
              </div>
            ))}
          </div>
          </>}
          {panel === 'boards' && <StudioListPanel zh={zh} type="boards" tab={boardTab} onTab={setBoardTab} selected={selectedFrame} onSelect={setSelectedFrame} />}
          {panel === 'frames' && <StudioListPanel zh={zh} type="frames" tab="frames" onTab={() => onPanelChange('boards')} selected={selectedFrame} onSelect={setSelectedFrame} />}
          {panel === 'templates' && <StudioListPanel zh={zh} type="templates" tab={templateTab} onTab={setTemplateTab} selected={selectedTemplate} onSelect={setSelectedTemplate} />}
          <div className="mx-2.5 mb-2.5 flex items-center justify-between rounded-lg border border-black/[0.045] bg-white/60 px-2 py-1.5 text-[8px] text-muted-foreground/70 dark:border-white/[0.06] dark:bg-white/[0.02]">
            <span className="inline-flex items-center gap-1"><Cloud size={9} />{panel === 'assets' ? (zh ? '素材已同步' : 'Assets synced') : (zh ? '画板已保存' : 'Board saved')}</span>
            <ChevronDown size={9} />
          </div>
        </div>

        {/* canvas */}
        <div className="studio-canvas dot-grid relative flex-1 overflow-hidden bg-zinc-50/25 dark:bg-transparent">
          <div className="absolute left-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg border border-black/[0.055] bg-white/95 text-muted-foreground shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:border-white/[0.08] dark:bg-zinc-900/90"><Menu size={12} /></div>
          <div className="absolute left-1/2 top-3 z-10 flex h-7 -translate-x-1/2 items-center gap-0.5 rounded-lg border border-black/[0.055] bg-white/95 px-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:border-white/[0.08] dark:bg-zinc-900/90">
            {[Hand, MousePointer2, Square, Diamond, Circle, ArrowRight, Minus, PenTool, Type, Image, Eraser, MoreHorizontal].map((Icon, index) => <span key={index} className={`flex h-5 w-5 items-center justify-center rounded ${index === 1 ? 'bg-muted text-foreground' : 'text-muted-foreground/70'}`}><Icon size={11} /></span>)}
          </div>
          <RoutePlannerCanvas flowGenerated={flowGenerated} selectedFrame={selectedFrame} />
        </div>
      </div>

      {/* bottom canvas bar */}
      <div className="relative flex h-8 items-center justify-center border-t border-black/[0.05] bg-white text-muted-foreground dark:border-white/[0.06] dark:bg-zinc-950/30">
        <div className="flex items-center gap-1 rounded-lg border border-black/[0.045] bg-zinc-50/80 px-2 py-1 dark:border-white/[0.06] dark:bg-white/[0.025]">
          <Minus size={10} className="mx-1" />
          <span className="min-w-8 text-center text-[9px] font-medium tabular-nums">79%</span>
          <Plus size={10} className="mx-1" />
          <span className="mx-1 h-3 w-px bg-border" />
          <Maximize size={10} className="mx-1" />
          <LayoutGrid size={10} className="mx-1" />
          <Lock size={10} className="mx-1" />
        </div>
        <div className="absolute right-4 flex items-center gap-2.5 text-muted-foreground/60">
          <Undo2 size={10} />
          <Redo2 size={10} />
        </div>
      </div>
    </div>
  );
}

function StudioListPanel({ zh, type, tab, onTab, selected, onSelect }: {
  zh: boolean;
  type: 'boards' | 'frames' | 'templates';
  tab: string;
  onTab: (tab: string) => void;
  selected: string;
  onSelect: (item: string) => void;
}) {
  const frameItems = [
    { icon: Frame, name: zh ? '完整画板' : 'Full board', detail: zh ? '5 个框架 · 58 个元素' : '5 frames · 58 elements' },
    { icon: Flag, name: 'Goals', detail: zh ? '6 个元素' : '6 elements' },
    { icon: Network, name: 'User Flow', detail: zh ? '24 个元素' : '24 elements' },
    { icon: Smartphone, name: 'Driver Screen', detail: zh ? '9 个元素' : '9 elements' },
    { icon: CircleHelp, name: 'Open Questions', detail: zh ? '8 个元素' : '8 elements' },
    { icon: Layers3, name: 'Decisions', detail: zh ? '6 个元素' : '6 elements' },
  ];
  const templateItems = [
    { icon: Lightbulb, name: zh ? '头脑风暴' : 'Brainstorm', detail: zh ? '便签发散' : 'Sticky ideation' },
    { icon: Network, name: zh ? '思维导图' : 'Mind map', detail: zh ? '主题分支网络' : 'Branching topics' },
    { icon: ListChecks, name: zh ? '任务看板' : 'Task board', detail: zh ? '待办、进行中与完成' : 'Track task progress' },
    { icon: Route, name: zh ? '用户旅程图' : 'User journey', detail: zh ? '阶段体验与痛点' : 'Stages and pain points' },
    { icon: Workflow, name: zh ? '流程图' : 'Flowchart', detail: zh ? '步骤流转与决策分支' : 'Flows and decisions' },
    { icon: Map, name: zh ? '产品路线图' : 'Roadmap', detail: zh ? '规划排期与时间线' : 'Plan releases over time' },
    { icon: Square, name: zh ? '空白画板' : 'Blank board', detail: zh ? '空白独立框架' : 'Start from scratch' },
  ];
  const isTemplates = type === 'templates';
  const isBoards = type === 'boards' && tab === 'boards';
  const items = isTemplates ? templateItems : isBoards ? [
    { icon: Network, name: zh ? '微服务架构演进' : 'Microservices evolution', detail: zh ? '12 个元素 · 刚刚编辑' : '12 elements · edited now' },
    { icon: Share2, name: zh ? 'RAG 流程图' : 'RAG pipeline', detail: zh ? '8 个元素 · 昨天' : '8 elements · yesterday' },
    { icon: FileImage, name: zh ? '金句卡片 · 三月' : 'Quote cards · March', detail: zh ? '21 个元素 · 3 天前' : '21 elements · 3 days ago' },
    { icon: Columns3, name: zh ? '产品对比矩阵' : 'Product matrix', detail: zh ? '6 个元素 · 上周' : '6 elements · last week' },
  ] : frameItems;
  return <div className="min-h-0 flex-1 overflow-y-auto">
    <div className="p-2.5 pb-1.5">
      <div className="seg-tab-group flex w-full shadow-none" style={{ padding: 2 }}>
        {isTemplates ? <>
          <button type="button" onClick={() => onTab('local')} className={`seg-tab ${tab === 'local' ? 'active' : ''} flex-1 justify-center`} style={{ padding: '3px 4px', fontSize: 9 }}>{zh ? '本地模板' : 'Local'}</button>
          <button type="button" onClick={() => onTab('cloud')} className={`seg-tab ${tab === 'cloud' ? 'active' : ''} flex-1 justify-center`} style={{ padding: '3px 4px', fontSize: 9 }}>{zh ? '官方云端' : 'Cloud'}</button>
        </> : <>
          <button type="button" onClick={() => onTab('frames')} className={`seg-tab ${tab === 'frames' ? 'active' : ''} flex-1 justify-center`} style={{ padding: '3px 4px', fontSize: 9 }}>{zh ? '框架' : 'Frames'}</button>
          <button type="button" onClick={() => onTab('boards')} className={`seg-tab ${tab === 'boards' ? 'active' : ''} flex-1 justify-center`} style={{ padding: '3px 4px', fontSize: 9 }}>{zh ? '画板列表' : 'Boards'}</button>
        </>}
      </div>
    </div>
    <div className="mx-2.5 my-1 flex items-center gap-1.5 rounded-md border border-black/[0.045] bg-white/70 px-2 py-1.5 dark:border-white/[0.06] dark:bg-white/[0.025]"><Search size={9} className="text-muted-foreground/60" /><span className="text-[9px] text-muted-foreground/60">{isTemplates ? (zh ? '搜索模板…' : 'Search templates…') : isBoards ? (zh ? '搜索画板…' : 'Search boards…') : (zh ? '搜索框架…' : 'Search frames…')}</span></div>
    {isTemplates && <div className="mx-2.5 mt-2 rounded-lg border border-dashed border-border bg-white/50 p-3 text-center dark:bg-white/[0.015]"><GalleryVerticalEnd size={14} className="mx-auto text-muted-foreground/50" /><p className="mt-1.5 text-[8px] font-medium">{zh ? '暂存画板模板' : 'Saved board templates'}</p><p className="mt-1 text-[7px] leading-3 text-muted-foreground/60">{zh ? '将常用画板保存为模板，随时复用。' : 'Save useful boards to reuse later.'}</p></div>}
    <p className="px-3 pb-1 pt-3 text-[8px] font-medium text-muted-foreground">{isTemplates ? (zh ? '预设结构 9' : '9 preset structures') : isBoards ? (zh ? '全部画板 4' : '4 boards') : (zh ? '画板结构' : 'Board structure')}</p>
    <div className="px-1.5 pb-2">
      {items.map((item) => <button type="button" key={item.name} onClick={() => onSelect(item.name)} className={`flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-left transition-colors ${selected === item.name ? 'bg-white shadow-sm ring-1 ring-black/[0.045] dark:bg-white/[0.06] dark:ring-white/[0.06]' : 'hover:bg-black/[0.025] dark:hover:bg-white/[0.03]'}`}>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-black/[0.045] bg-white text-muted-foreground dark:border-white/[0.06] dark:bg-white/[0.025]"><item.icon size={10} /></span>
        <span className="min-w-0"><span className="block truncate text-[9px] font-medium">{item.name}</span><span className="mt-0.5 block truncate text-[7px] text-muted-foreground/65">{item.detail}</span></span>
      </button>)}
    </div>
  </div>;
}
