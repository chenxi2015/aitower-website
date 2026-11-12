import type { Lang } from '../../data/i18n';
import { noteTree, articleLines } from './workbenchData';
import { FileText, FolderOpen, Search, FilePlus, ChevronsLeft } from 'lucide-react';

interface Props {
  lang: Lang;
  insertedImage: boolean;
  highlightedNoteId: string | null;
}

// Faithful mini replica of the app's notes mode: vault tree + CM6-style editor
export default function NotesWorkspace({ lang, insertedImage, highlightedNote }: Props) {
  const zh = lang === 'zh';
  const folders = noteTree[lang];
  const lines = articleLines[lang];

  return (
    <div className="grid h-full grid-cols-[150px_1fr]">
      {/* Left: vault tree */}
      <div className="flex flex-col border-r border-border bg-muted/30">
        <div className="flex items-center gap-1.5 border-b border-border px-2.5 py-2">
          <Search size={11} className="text-muted-foreground" />
          <span className="flex-1 text-[10px] text-muted-foreground">{zh ? '搜索笔记…' : 'Search notes…'}</span>
          <FilePlus size={11} className="text-muted-foreground" />
          <ChevronsLeft size={11} className="text-muted-foreground" />
        </div>
        <div className="flex-1 space-y-2 overflow-hidden p-2">
          {folders.map((f) => (
            <div key={f.id}>
              <div className="flex items-center gap-1 px-1 py-0.5 text-[10px] font-semibold text-muted-foreground">
                <FolderOpen size={10} />
                {f.name}
              </div>
              {f.notes.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[10px] transition-all ${
                    n.id === 'n4'
                      ? 'bg-card font-medium text-foreground shadow-2xs ring-1 ring-border'
                      : 'text-muted-foreground'
                  } ${highlightedNote === n.id ? 'ring-2 ring-indigo-400' : ''}`}
                >
                  <FileText size={10} className="shrink-0" />
                  <span className="truncate">{n.title}</span>
                  {n.tag && (
                    <span className="ml-auto shrink-0 rounded-full bg-amber-100 px-1 text-[8px] font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                      {n.tag}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Center: editor */}
      <div className="flex flex-col bg-card">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <span className="text-[10px] font-medium">{zh ? '去 AI 味的写作.md' : 'writing-without-ai-slop.md'}</span>
          <div className="ml-auto seg-tab-group" style={{ padding: 1 }}>
            <span className="seg-tab active" style={{ padding: '1px 6px', fontSize: 8 }}>{zh ? '实时预览' : 'Live'}</span>
            <span className="seg-tab" style={{ padding: '1px 6px', fontSize: 8 }}>{zh ? '源码' : 'Source'}</span>
            <span className="seg-tab" style={{ padding: '1px 6px', fontSize: 8 }}>{zh ? '阅读' : 'Read'}</span>
          </div>
        </div>
        <div className="flex-1 space-y-2 overflow-hidden p-4 font-mono text-[11px] leading-6">
          {lines.map((l, idx) => (
            <p key={idx} className={l.kind === 'h' ? 'text-zinc-400' : 'text-foreground'}>
              {l.kind === 'caret' ? (
                <span className="inline-block h-3 w-px animate-blink bg-zinc-500 align-middle" />
              ) : (
                l.text
              )}
            </p>
          ))}
          {insertedImage && (
            <div className="rounded-md border border-indigo-300 bg-indigo-50/60 px-2 py-1.5 text-[10px] text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300" style={{ animation: 'fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
              ![[{zh ? '重试流程图.png' : 'retry-flow.png'}]]
              <span className="ml-2 rounded bg-indigo-100 px-1 text-[8px] dark:bg-indigo-900">{zh ? '已插入' : 'inserted'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
