import { useState } from 'react';
import type { Lang } from '../../data/i18n';
import LogoMark from './LogoMark';
import {
  Check, ChevronDown, ChevronRight, Clipboard, Copy, FilePlus2,
  FileText, Folder, History, Image, MessageSquareText, MoreHorizontal,
  Pin, Plus, RefreshCw, Send, Settings, SquarePen, Upload,
  Video, FileType, SendHorizontal, Globe, SlidersHorizontal, Eye, Trash2,
} from 'lucide-react';

type MobileTab = 'agents' | 'notes' | 'drop' | 'tools';

const tabs: Array<{ id: MobileTab; zh: string; en: string }> = [
  { id: 'agents', zh: 'Agents', en: 'Agents' },
  { id: 'notes', zh: '笔记', en: 'Notes' },
  { id: 'drop', zh: '投递', en: 'Drop' },
  { id: 'tools', zh: '工具', en: 'Tools' },
];

const agentItems = [
  { zh: '顺便给我总结一下今天的 GitHub 提交内容，我要写周报', en: 'Summarize today’s GitHub commits for my weekly report', metaZh: '笔记 · 2 条消息 · 5 小时前', metaEn: 'Notes · 2 messages · 5h ago' },
  { zh: '给我在笔记中找点灵感', en: 'Find inspiration in my notes', metaZh: '笔记 · 2 条消息 · 5 小时前', metaEn: 'Notes · 2 messages · 5h ago' },
  { zh: '最新的 Google 新模型新闻内容给我找一下，然后生成…', en: 'Find the latest Google model news, then create…', metaZh: '笔记 · 2 条消息 · 10 小时前', metaEn: 'Notes · 2 messages · 10h ago' },
  { zh: '给我总结一下 Claude Fable 5.2 最新模型的能力，整成…', en: 'Summarize Claude Fable 5.2’s latest capabilities…', metaZh: '笔记 · 6 条消息 · 22 小时前', metaEn: 'Notes · 6 messages · 22h ago' },
  { zh: '基于伪人迷城这个名称给我写一个悬疑短剧大纲', en: 'Write a mystery short-drama outline based on this title', metaZh: '笔记 · 10 条消息 · 22 小时前', metaEn: 'Notes · 10 messages · 22h ago' },
];

const noteItems = [
  { name: '2_1Password Emergency Kit-ethanchan_1', zh: 'Inbox · 1 小时前', en: 'Inbox · 1h ago' },
  { name: '【电影级Claude二创】克劳德的救赎【AI全民制作…', zh: 'Inbox · 2 小时前', en: 'Inbox · 2h ago' },
  { name: '【电影级Claude二创】克劳德的救赎【AI全民制作…', zh: 'Inbox · 2 小时前', en: 'Inbox · 2h ago' },
  { name: '网站备案办事指南_1', zh: 'Inbox · 5 小时前', en: 'Inbox · 5h ago' },
  { name: '网站备案办事指南', zh: 'Inbox · 5 小时前', en: 'Inbox · 5h ago' },
];

function AgentsPanel({ zh }: { zh: boolean }) {
  const [draft, setDraft] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <div className="flex min-h-0 flex-1 flex-col px-2.5 pb-2">
      <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-black/[0.065] bg-white dark:border-white/[0.08] dark:bg-white/[0.025]">
        {agentItems.map((item) => (
          <button type="button" key={item.zh} className="group flex w-full items-center gap-2 border-b border-black/[0.045] px-3 py-3 text-left last:border-0 hover:bg-muted/40 dark:border-white/[0.05]">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[10px] font-medium leading-4">{zh ? item.zh : item.en}</span>
              <span className="mt-1 block text-[7.5px] text-muted-foreground/70">{zh ? item.metaZh : item.metaEn}</span>
            </span>
            <ChevronRight size={11} className="shrink-0 text-muted-foreground/35" />
          </button>
        ))}
        <button type="button" className="flex w-full items-center gap-1 px-3 py-2.5 text-[8px] text-muted-foreground/70"><ChevronDown size={9} />{zh ? '显示其余 6 个会话' : 'Show 6 more sessions'}</button>
      </div>
      <form className="mt-2 rounded-xl border border-black/[0.075] bg-white px-2.5 py-2 shadow-[0_2px_10px_rgba(0,0,0,0.035)] dark:border-white/[0.09] dark:bg-white/[0.025]" onSubmit={(event) => { event.preventDefault(); if (draft.trim()) { setSent(true); setDraft(''); } }}>
        <div className="flex items-center gap-2">
          <SparklesIcon />
          <input value={draft} onChange={(event) => { setDraft(event.target.value); setSent(false); }} placeholder={zh ? '后台速问 Agent（回车直接执行）…' : 'Quick ask Agent (Enter to run)…'} className="min-w-0 flex-1 bg-transparent text-[9px] outline-none placeholder:text-muted-foreground/55" />
          <button type="submit" aria-label={zh ? '执行' : 'Run'} className="flex h-6 items-center gap-1 rounded-lg bg-zinc-700 px-2.5 text-[8px] text-white dark:bg-zinc-200 dark:text-zinc-900"><Send size={9} />{zh ? '执行' : 'Run'}</button>
        </div>
        {sent && <p className="mt-1.5 flex items-center gap-1 pl-5 text-[7px] text-emerald-600"><Check size={8} />{zh ? '已提交后台会话' : 'Sent to background session'}</p>}
      </form>
    </div>
  );
}

function SparklesIcon() {
  return <MessageSquareText size={12} className="shrink-0 text-muted-foreground/60" />;
}

function NotesPanel({ zh }: { zh: boolean }) {
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  return (
    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-2.5 pb-2">
      <div className="rounded-xl border border-black/[0.075] bg-white p-2.5 dark:border-white/[0.08] dark:bg-white/[0.025]">
        <textarea value={note} onChange={(event) => { setNote(event.target.value); setSaved(false); }} placeholder={zh ? '闪念速记：随手记一条，自动写入 Vault / Inbox.md…' : 'Quick note: save a thought to Vault / Inbox.md…'} className="h-16 w-full resize-none bg-transparent text-[9px] leading-4 outline-none placeholder:text-muted-foreground/55" />
        <div className="flex items-center justify-between">
          <button type="button" className="flex items-center gap-1 text-[8px] text-muted-foreground/70"><Clipboard size={10} />{zh ? '贴入剪贴板' : 'Paste clipboard'}</button>
          <button type="button" onClick={() => { if (note.trim()) { setSaved(true); setNote(''); } }} className="flex items-center gap-1 rounded-lg bg-zinc-700 px-2.5 py-1.5 text-[8px] text-white dark:bg-zinc-200 dark:text-zinc-900"><Plus size={9} />{zh ? '记入 Inbox' : 'Save to Inbox'}</button>
        </div>
        {saved && <p className="mt-2 flex items-center gap-1 text-[7px] text-emerald-600"><Check size={8} />{zh ? '已保存到 Inbox.md' : 'Saved to Inbox.md'}</p>}
      </div>
      <div className="overflow-hidden rounded-xl border border-black/[0.065] bg-white dark:border-white/[0.08] dark:bg-white/[0.025]">
        {noteItems.map((item, index) => (
          <button type="button" key={`${item.name}-${index}`} className="flex w-full items-center gap-2 border-b border-black/[0.045] px-2.5 py-2.5 text-left last:border-0 hover:bg-muted/40 dark:border-white/[0.05]">
            <FileText size={12} className="shrink-0 text-muted-foreground/55" />
            <span className="min-w-0 flex-1"><span className="block truncate text-[9px] font-medium">{item.name}</span><span className="mt-1 block text-[7px] text-muted-foreground/65">{zh ? item.zh : item.en}</span></span>
            <Copy size={10} className="shrink-0 text-muted-foreground/45" />
          </button>
        ))}
        <button type="button" className="flex w-full items-center gap-1 px-3 py-2 text-[8px] text-muted-foreground/70"><ChevronDown size={9} />{zh ? '显示其余 5 篇最近笔记' : 'Show 5 more recent notes'}</button>
      </div>
    </div>
  );
}

function DropPanel({ zh }: { zh: boolean }) {
  const [added, setAdded] = useState(false);
  return (
    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-2.5 pb-2">
      <div className="flex items-center gap-2">
        <button type="button" className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-black/[0.065] bg-white px-2.5 py-2 text-[8px] dark:border-white/[0.08] dark:bg-white/[0.025]"><Folder size={10} className="text-amber-500" /><span className="truncate">{zh ? '根目录（Vault 根路径）' : 'Vault root'}</span><ChevronDown size={9} className="ml-auto text-muted-foreground/60" /></button>
        <button type="button" className="flex items-center gap-1 rounded-lg border border-black/[0.065] bg-white px-2.5 py-2 text-[8px] dark:border-white/[0.08] dark:bg-white/[0.025]"><FilePlus2 size={10} />{zh ? '新建' : 'New'}</button>
      </div>
      <button type="button" onClick={() => setAdded(true)} className="flex h-28 w-full flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white/50 text-center dark:border-zinc-700 dark:bg-white/[0.015]">
        <Upload size={18} className="mb-2 text-muted-foreground/70" />
        <span className="text-[9px] font-medium">{zh ? '拖入本地笔记、图片或文件夹' : 'Drop local notes, images or folders'}</span>
        <span className="mt-1 text-[7.5px] text-muted-foreground/65">{zh ? '将导入到「根目录」，点击也可以选择文件' : 'Import to Vault root, or click to choose files'}</span>
      </button>
      <div className="overflow-hidden rounded-xl border border-black/[0.065] bg-white dark:border-white/[0.08] dark:bg-white/[0.025]">
        {[0, 1].map((index) => <div key={index} className="flex items-center gap-2 border-b border-black/[0.045] px-2.5 py-2.5 last:border-0 dark:border-white/[0.05]"><Image size={12} className="text-sky-500" /><div className="min-w-0 flex-1"><p className="truncate text-[8.5px] font-medium">{index === 0 ? '1_EkgYmUq3GT0IR4ODEWRobg-no-w…' : '1_EkgYmUq3GT0IR4ODEWRobg 1.webp'}</p><p className="mt-1 truncate text-[6.5px] text-muted-foreground/60">1_EkgYmUq3GT0IR4ODEWRobg-no-watermark…</p></div><span className="flex items-center gap-1 rounded-md border border-border px-1.5 py-1 text-[7px] text-emerald-600"><Eye size={8} />{zh ? '查看' : 'View'}</span><MoreHorizontal size={11} className="text-muted-foreground/50" /></div>)}
        {added && <div className="flex items-center gap-2 border-t border-emerald-500/10 bg-emerald-500/[0.035] px-2.5 py-2.5 text-[8px] text-emerald-700 dark:text-emerald-300"><FileText size={12} /><span className="flex-1">{zh ? '快速记录.md' : 'quick-note.md'}</span><Check size={10} /></div>}
      </div>
    </div>
  );
}

function ToolsPanel({ zh }: { zh: boolean }) {
  const [tool, setTool] = useState('image');
  const tools = [
    { id: 'image', icon: Image, zh: '图片', en: 'Images' },
    { id: 'video', icon: Video, zh: '视频', en: 'Video' },
    { id: 'pdf', icon: FileType, zh: 'PDF', en: 'PDF' },
    { id: 'publish', icon: SendHorizontal, zh: '发布', en: 'Publish' },
    { id: 'capture', icon: Globe, zh: '抓取', en: 'Capture' },
  ];
  return (
    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-2.5 pb-2">
      <div className="grid grid-cols-5 rounded-xl border border-black/[0.065] bg-white p-1 dark:border-white/[0.08] dark:bg-white/[0.025]">
        {tools.map((item) => <button type="button" key={item.id} onClick={() => setTool(item.id)} aria-pressed={tool === item.id} className={`flex items-center justify-center gap-1 rounded-lg py-2 text-[8px] transition-colors ${tool === item.id ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground/65'}`}><item.icon size={10} />{zh ? item.zh : item.en}</button>)}
      </div>
      <button type="button" className="flex w-full items-center gap-1.5 rounded-lg border border-black/[0.065] bg-white px-2.5 py-2 text-[8px] dark:border-white/[0.08] dark:bg-white/[0.025]"><SlidersHorizontal size={10} className="text-muted-foreground/65" /><span className="truncate">{zh ? '处理参数：原格式 · 82% · ≤1920px' : 'Settings: original · 82% · ≤1920px'}</span><ChevronDown size={9} className="ml-auto text-muted-foreground/60" /></button>
      <div className="flex h-28 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white/50 text-center dark:border-zinc-700 dark:bg-white/[0.015]"><Image size={18} className="mb-2 text-muted-foreground/70" /><p className="text-[9px] font-medium">{zh ? `拖入或点击选择${tools.find((item) => item.id === tool)?.zh}加入队列` : `Drop or choose ${tools.find((item) => item.id === tool)?.en.toLowerCase()} files`}</p><p className="mt-1 text-[7px] text-muted-foreground/65">{zh ? '批量加入，调整参数后逐个转换' : 'Batch import, adjust settings and convert'}</p></div>
      <div className="rounded-xl border border-black/[0.065] bg-white p-2.5 dark:border-white/[0.08] dark:bg-white/[0.025]">
        <div className="mb-2 flex items-center gap-1.5 text-[7px]"><span className="mr-auto text-muted-foreground/70">{zh ? '临时队列 (1)' : 'Queue (1)'}</span><button type="button" className="flex items-center gap-1 rounded-md border border-border px-1.5 py-1"><RefreshCw size={8} />{zh ? '重压' : 'Retry'}</button><button type="button" className="rounded-md bg-zinc-800 px-1.5 py-1 text-white dark:bg-zinc-200 dark:text-zinc-900">{zh ? '全部存入笔记' : 'Save all'}</button><Trash2 size={10} className="text-muted-foreground/50" /></div>
        <div className="flex items-center gap-2 rounded-lg border border-black/[0.045] p-2 dark:border-white/[0.06]"><div className="flex h-9 w-9 items-center justify-center rounded-md bg-[linear-gradient(135deg,#e7e5e4,#d6d3d1)] text-stone-500"><Image size={15} /></div><div className="min-w-0 flex-1"><p className="truncate text-[8px] font-medium">1_EkgYmUq3GT0IR4ODEWRobg.w…</p><p className="mt-1 text-[6.5px] text-muted-foreground/65">45.8 KB → 44.2 KB (-3%) · 658×998</p></div><button type="button" className="rounded-md border border-border px-1.5 py-1 text-[7px]">{zh ? '存入笔记' : 'Save'}</button><MoreHorizontal size={10} /></div>
      </div>
    </div>
  );
}

export default function MobileWorkspace({ lang }: { lang: Lang }) {
  const zh = lang === 'zh';
  const [tab, setTab] = useState<MobileTab>('agents');
  return (
    <div className="mobile-workbench relative mx-auto flex h-full w-full flex-col overflow-hidden rounded-[22px] border-[3px] border-zinc-200 bg-[#f7f7f5] text-left shadow-[0_24px_60px_-24px_rgba(0,0,0,0.35)] dark:border-zinc-600 dark:bg-zinc-950">
      <div className="flex h-11 shrink-0 items-center gap-1.5 border-b border-black/[0.055] bg-white px-3 dark:border-white/[0.06] dark:bg-zinc-950/70">
        <LogoMark size={20} className="rounded-md" />
        <span className="text-[10px] font-semibold tracking-tight">aitower</span>
        <button type="button" className="ml-1 flex items-center gap-1 rounded-full bg-muted/65 px-2 py-1 text-[7.5px] text-muted-foreground">Obsidian Vault<ChevronDown size={8} /></button>
        <div className="ml-auto flex items-center gap-2 text-muted-foreground/65"><History size={11} /><Pin size={11} /><SquarePen size={11} /><Settings size={11} /></div>
      </div>
      <div className="flex h-10 shrink-0 items-center gap-1 px-3">
        {tabs.map((item) => <button type="button" key={item.id} onClick={() => setTab(item.id)} aria-pressed={tab === item.id} className={`rounded-full px-3 py-1.5 text-[9px] transition-colors ${tab === item.id ? 'bg-white font-medium text-foreground shadow-sm dark:bg-white/[0.08]' : 'text-muted-foreground/65 hover:text-foreground'}`}>{zh ? item.zh : item.en}</button>)}
      </div>
      {tab === 'agents' && <AgentsPanel zh={zh} />}
      {tab === 'notes' && <NotesPanel zh={zh} />}
      {tab === 'drop' && <DropPanel zh={zh} />}
      {tab === 'tools' && <ToolsPanel zh={zh} />}
      <div className="flex h-7 shrink-0 items-center gap-1.5 px-3 text-[7px] text-muted-foreground/65"><span className="h-1.5 w-1.5 rounded-full bg-zinc-400" /><span className="truncate">{tab === 'agents' ? (zh ? '后台保活中 · v0.1.13' : 'Background active · v0.1.13') : (zh ? '已固定 · 顶部和底部可拖动' : 'Pinned · drag from top or bottom')}</span><span className="ml-auto flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /><span>{zh ? '打开工作台' : 'Open workspace'}</span><span>{zh ? '退出' : 'Quit'}</span></span></div>
      <div className="pointer-events-none absolute bottom-1 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-zinc-800/15 dark:bg-white/20" />
    </div>
  );
}
