import type { Lang } from '../../data/i18n';
import { noteTree } from './workbenchData';
import { ChevronRight, Search, FilePlus, FolderPlus, RefreshCw, ArrowUpDown, Compass } from 'lucide-react';

interface Props {
  lang: Lang;
  insertedImage: boolean;
  highlightedNoteId: string | null;
}

// Notes mode, redrawn from the real app screenshot:
// search filter → vault tree → centered empty-state quick actions (or open note).
export default function NotesWorkspace({ lang, insertedImage, highlightedNoteId }: Props) {
  const zh = lang === 'zh';
  const folders = noteTree[lang];
  const hasOpenNote = insertedImage; // after "insert" the editor shows the open article

  return (
    <div className="flex h-full">
      {/* vault tree */}
      <div className="flex w-40 shrink-0 flex-col border-r border-border">
        <div className="flex items-center gap-1.5 px-3 pt-2.5 pb-2">
          <Search size={10} className="shrink-0 text-muted-foreground/70" />
          <span className="text-[10px] text-muted-foreground/70">{zh ? '按文件名过滤…' : 'Filter by name…'}</span>
        </div>
        <div className="flex items-center justify-between border-b border-border px-3 pb-1.5">
          <span className="text-[10px] font-medium text-muted-foreground">{zh ? '笔记' : 'Notes'}</span>
          <div className="flex items-center gap-1.5 text-muted-foreground/70">
            <FilePlus size={10} />
            <FolderPlus size={10} />
            <RefreshCw size={9} />
            <ArrowUpDown size={9} />
            <Compass size={10} />
          </div>
        </div>
        <div className="flex-1 overflow-hidden px-1.5 py-1.5">
          {folders.map((f) => (
            <div key={f.id}>
              <div className="flex items-center gap-1 rounded px-1 py-[3px] text-[10px] text-foreground/80">
                <ChevronRight size={9} className="shrink-0 rotate-90 text-muted-foreground/60" />
                <span className="truncate">{f.name}</span>
              </div>
              {f.notes.map((n) => (
                <div
                  key={n.id}
                  className={`ml-4 flex items-center gap-1.5 rounded px-1.5 py-[3px] text-[10px] transition-all ${
                    n.id === 'n4' && hasOpenNote
                      ? 'bg-muted font-medium text-foreground'
                      : 'text-muted-foreground'
                  } ${highlightedNoteId === n.id ? 'bg-indigo-50 ring-1 ring-indigo-300 dark:bg-indigo-950/50 dark:ring-indigo-700' : ''}`}
                >
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
        <div className="flex items-center gap-1 border-t border-border px-3 py-1.5 text-[9px] text-muted-foreground">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-gradient-to-br from-violet-400 to-violet-600" />
          Obsidian Vault
        </div>
      </div>

      {/* center */}
      <div className="flex flex-1 flex-col">
        {hasOpenNote ? (
          <>
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <span className="text-[10px] font-medium">{zh ? '去 AI 味的写作.md' : 'writing-without-slop.md'}</span>
              <div className="seg-tab-group ml-auto" style={{ padding: 1 }}>
                <span className="seg-tab active" style={{ padding: '1px 6px', fontSize: 8 }}>{zh ? '实时预览' : 'Live'}</span>
                <span className="seg-tab" style={{ padding: '1px 6px', fontSize: 8 }}>{zh ? '源码' : 'Source'}</span>
                <span className="seg-tab" style={{ padding: '1px 6px', fontSize: 8 }}>{zh ? '阅读' : 'Read'}</span>
              </div>
            </div>
            <div className="flex-1 space-y-2 overflow-hidden p-5 font-mono text-[11px] leading-6">
              <p className="text-zinc-400">{zh ? '## 反直觉的架构决策' : '## Counter-intuitive decisions'}</p>
              <p className="text-foreground">
                {zh ? '稳定性的代价，往往藏在 ' : 'The cost of stability hides in '}
                <span className="text-indigo-500">[[{zh ? '幂等设计' : 'idempotency'}]]</span>
                {zh ? ' 里。' : '.'}
              </p>
              <div
                className="rounded-md border border-indigo-300 bg-indigo-50/60 px-2 py-1.5 text-[10px] text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300"
                style={{ animation: 'fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both' }}
              >
                ![[{zh ? '重试流程图.png' : 'retry-flow.png'}]]
                <span className="ml-2 rounded bg-indigo-100 px-1 text-[8px] dark:bg-indigo-900">{zh ? '已插入' : 'inserted'}</span>
              </div>
              <p className="text-foreground">
                {zh ? '当重试风暴来临时…' : 'When the retry storm hits…'}
                <span className="ml-0.5 inline-block h-3 w-px animate-blink bg-zinc-500 align-middle" />
              </p>
            </div>
          </>
        ) : (
          /* empty state, mirroring the real app */
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              <FilePlus size={18} className="text-muted-foreground" />
            </div>
            <p className="text-[12px] font-semibold">{zh ? '选择或新建一篇笔记开始创作' : 'Pick or create a note to start'}</p>
            <p className="-mt-1.5 text-[9px] text-muted-foreground">
              {zh ? '从左侧目录树选择已有文档，或使用上方快捷操作新建。' : 'Choose an existing document from the tree, or create one above.'}
            </p>
            <div className="mt-1 flex w-44 flex-col gap-1.5">
              {[
                zh ? '新建笔记' : 'New note',
                zh ? '新建画板' : 'New board',
                zh ? '新建白板' : 'New canvas',
                zh ? '打开文件' : 'Open file',
              ].map((label, i) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-full border border-border bg-card px-3 py-1.5 text-[10px] font-medium shadow-2xs"
                >
                  {label}
                  {i === 0 && <span className="text-[8px] text-muted-foreground/60">⌘N</span>}
                  {i === 3 && <span className="text-[8px] text-muted-foreground/60">⌘O</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
