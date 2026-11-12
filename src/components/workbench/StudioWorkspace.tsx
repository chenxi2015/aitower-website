import type { Lang } from '../../data/i18n';
import { Search, Plus, Minus, Maximize, LayoutGrid, Undo2, Redo2 } from 'lucide-react';

interface Props {
  lang: Lang;
  flowGenerated: boolean;
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
export default function StudioWorkspace({ lang, flowGenerated }: Props) {
  const zh = lang === 'zh';

  return (
    <div className="flex h-full flex-col">
      {/* board toolbar strip */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-1.5">
        <span className="max-w-40 truncate text-[10px] font-medium">{zh ? '未命名画板 按时打算大叔大…' : 'Untitled board route-planner…'}</span>
        <span className="rounded-full bg-note-green/70 px-1.5 py-px text-[8px] font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300">
          {zh ? '笔记' : 'Note'}
        </span>
        <div className="seg-tab-group ml-1" style={{ padding: 1 }}>
          {['自适应', '3:4', '9:16', '16:9'].map((r, i) => (
            <span key={r} className={`seg-tab ${i === 0 ? 'active' : ''}`} style={{ padding: '1px 5px', fontSize: 8 }}>
              {zh ? r : ['Auto', '3:4', '9:16', '16:9'][i]}
            </span>
          ))}
        </div>
        <span className="ml-auto rounded-md bg-primary px-2 py-0.5 text-[9px] font-medium text-primary-foreground">
          + {zh ? '新建画板' : 'New board'}
        </span>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* material drawer */}
        <div className="flex w-36 shrink-0 flex-col border-r border-border">
          <div className="p-1.5 pb-0">
            <div className="seg-tab-group" style={{ padding: 2 }}>
              <span className="seg-tab active" style={{ padding: '2px 4px', fontSize: 9 }}>{zh ? '自有素材' : 'Mine'}</span>
              <span className="seg-tab" style={{ padding: '2px 4px', fontSize: 9 }}>{zh ? '官方素材' : 'Official'}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1.5">
            <Search size={9} className="shrink-0 text-muted-foreground/60" />
            <span className="truncate text-[9px] text-muted-foreground/60">{zh ? '搜索素材、组件、图片…' : 'Search assets…'}</span>
          </div>
          <div className="flex items-center gap-1 px-2 pb-1">
            <span className="rounded-full bg-zinc-800 px-1.5 py-px text-[8px] font-medium text-white dark:bg-zinc-200 dark:text-zinc-900">{zh ? '常用' : 'Freq'}</span>
            <span className="px-1 py-px text-[8px] text-muted-foreground">{zh ? '组件' : 'Parts'}</span>
            <span className="px-1 py-px text-[8px] text-muted-foreground">{zh ? '图片' : 'Imgs'}</span>
            <Plus size={9} className="ml-auto text-muted-foreground/70" />
          </div>
          <div className="grid flex-1 grid-cols-2 content-start gap-1.5 overflow-hidden p-2">
            {materialCards.map((c) => (
              <div key={c.name} className="flex flex-col gap-1">
                <div className={`aspect-[4/3] rounded-md border border-border ${c.color} shadow-2xs transition-transform hover:scale-105`} />
                <span className="truncate text-[8px] text-muted-foreground">{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* canvas */}
        <div className="dot-grid relative flex-1 overflow-hidden">
          <svg viewBox="0 0 560 330" className="h-full w-full" fill="none">
            {/* Goals frame */}
            <g>
              <text x="18" y="24" fontSize="10" className="fill-muted-foreground">Goals</text>
              <rect x="14" y="32" width="132" height="118" rx="8" fill="var(--background)" stroke="currentColor" className="text-zinc-300 dark:text-zinc-700" strokeWidth="1.2" />
              <g style={{ animation: 'float 7s ease-in-out infinite' }}>
                <rect x="24" y="44" width="112" height="26" rx="4" fill="#fef08a" />
                <text x="80" y="61" textAnchor="middle" fontSize="8.5" fill="#713f12" fontStyle="italic">Drivers replan stops by hand</text>
              </g>
              <g style={{ animation: 'float 8s ease-in-out 0.4s infinite' }}>
                <rect x="24" y="78" width="112" height="26" rx="4" fill="#bfdbfe" />
                <text x="80" y="95" textAnchor="middle" fontSize="8.5" fill="#1e3a8a">Goal: 30% less planning time</text>
              </g>
              <g style={{ animation: 'float 7.5s ease-in-out 0.8s infinite' }}>
                <rect x="24" y="112" width="112" height="26" rx="4" fill="#bfdbfe" />
                <text x="80" y="129" textAnchor="middle" fontSize="8.5" fill="#1e3a8a">Adoption: 70% by 30 days</text>
              </g>
            </g>

            {/* User Flow frame */}
            <g>
              <text x="168" y="24" fontSize="10" className="fill-muted-foreground">User Flow</text>
              <rect x="164" y="32" width="372" height="118" rx="8" fill="var(--background)" stroke="currentColor" className="text-zinc-300 dark:text-zinc-700" strokeWidth="1.2" />
              {/* flow */}
              <rect x="176" y="66" width="58" height="22" rx="5" fill="var(--background)" stroke="currentColor" className="text-zinc-600 dark:text-zinc-400" strokeWidth="1.4" />
              <text x="205" y="81" textAnchor="middle" fontSize="8.5" fill="currentColor" className="fill-foreground">Start day</text>
              <path d="M234 77 H256" stroke="currentColor" className="text-zinc-400" strokeWidth="1.4" markerEnd="url(#wb-arrow)" />
              <rect x="258" y="66" width="58" height="22" rx="5" fill="var(--background)" stroke="currentColor" className="text-zinc-600 dark:text-zinc-400" strokeWidth="1.4" />
              <text x="287" y="81" textAnchor="middle" fontSize="8.5" fill="currentColor" className="fill-foreground">See stops</text>
              <path d="M316 77 H336" stroke="currentColor" className="text-zinc-400" strokeWidth="1.4" markerEnd="url(#wb-arrow)" />
              <path d="M365 55 L387 77 L365 99 L343 77 Z" fill="var(--background)" stroke="currentColor" className="text-zinc-600 dark:text-zinc-400" strokeWidth="1.4" />
              <text x="365" y="74" textAnchor="middle" fontSize="7.5" fill="currentColor" className="fill-foreground">Signal</text>
              <text x="365" y="84" textAnchor="middle" fontSize="7.5" fill="currentColor" className="fill-foreground">ok?</text>
              <path d="M387 77 H406" stroke="currentColor" className="text-zinc-400" strokeWidth="1.4" markerEnd="url(#wb-arrow)" />
              <text x="392" y="71" fontSize="7" className="fill-muted-foreground">Yes</text>
              <rect x="408" y="66" width="56" height="22" rx="5" fill="var(--background)" stroke="currentColor" className="text-zinc-600 dark:text-zinc-400" strokeWidth="1.4" />
              <text x="436" y="81" textAnchor="middle" fontSize="8.5" fill="currentColor" className="fill-foreground">Optimise</text>
              <path d="M464 77 H484" stroke="currentColor" className="text-zinc-400" strokeWidth="1.4" markerEnd="url(#wb-arrow)" />
              <text x="469" y="71" fontSize="7" className="fill-muted-foreground">Go</text>
              <rect x="486" y="66" width="42" height="22" rx="5" fill="var(--background)" stroke="currentColor" className="text-zinc-600 dark:text-zinc-400" strokeWidth="1.4" />
              <text x="507" y="81" textAnchor="middle" fontSize="8.5" fill="currentColor" className="fill-foreground">Drive</text>
              {/* No branch */}
              <path d="M365 99 V112" stroke="currentColor" className="text-zinc-400" strokeWidth="1.4" markerEnd="url(#wb-arrow)" />
              <text x="359" y="108" fontSize="7" className="fill-muted-foreground">No</text>
              <rect x="334" y="114" width="62" height="20" rx="5" fill="var(--background)" stroke="currentColor" className="text-zinc-600 dark:text-zinc-400" strokeWidth="1.4" />
              <text x="365" y="127" textAnchor="middle" fontSize="8" fill="currentColor" className="fill-foreground">Saved map</text>
              <path d="M396 124 H436 V88" stroke="currentColor" className="text-zinc-400" strokeWidth="1.4" strokeDasharray="4 4" style={{ animation: 'dash 2.6s linear infinite' }} />
              {/* pink callout */}
              <g style={{ animation: 'float 8s ease-in-out 0.2s infinite' }}>
                <rect x="176" y="108" width="92" height="26" rx="5" fill="#fecdd3" />
                <text x="222" y="119" textAnchor="middle" fontSize="8" fill="#881337">Drivers undo</text>
                <text x="222" y="129" textAnchor="middle" fontSize="8" fill="#881337">silent reroutes</text>
              </g>
              <text x="176" y="146" fontSize="8" fontStyle="italic" className="fill-muted-foreground">Driver app, Route Planner beta</text>
            </g>

            {/* Decisions frame */}
            <g>
              <text x="404" y="176" fontSize="10" className="fill-muted-foreground">Decisions</text>
              <rect x="400" y="184" width="136" height="118" rx="8" fill="var(--background)" stroke="currentColor" className="text-zinc-300 dark:text-zinc-700" strokeWidth="1.2" />
              <g style={{ animation: 'float 7s ease-in-out 0.5s infinite' }}>
                <rect x="410" y="196" width="116" height="26" rx="4" fill="#bbf7d0" />
                <text x="468" y="212" textAnchor="middle" fontSize="8" fill="#14532d">Stops reorder by drag. Mira, Fri</text>
              </g>
              <g style={{ animation: 'float 8.5s ease-in-out 0.9s infinite' }}>
                <rect x="410" y="230" width="116" height="26" rx="4" fill="#bfdbfe" />
                <text x="468" y="246" textAnchor="middle" fontSize="8" fill="#1e3a8a">Beta: 200 drivers, Wed 4 Nov</text>
              </g>
              <g style={{ animation: 'float 7.8s ease-in-out 1.3s infinite' }}>
                <rect x="410" y="264" width="116" height="26" rx="4" fill="#bbf7d0" />
                <text x="468" y="280" textAnchor="middle" fontSize="8" fill="#14532d">Offline maps ship in v1. Nora</text>
              </g>
            </g>

            {/* AI-drafted flow appears after running the preset */}
            {flowGenerated && (
              <g style={{ animation: 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>
                <text x="18" y="176" fontSize="10" className="fill-muted-foreground">{zh ? 'AI 起草 · 幂等网关' : 'AI draft · Idempotent gateway'}</text>
                <rect x="14" y="184" width="250" height="118" rx="8" fill="var(--background)" stroke="#818cf8" strokeWidth="1.4" strokeDasharray="6 4" />
                <rect x="26" y="220" width="52" height="22" rx="5" fill="var(--background)" stroke="currentColor" className="text-zinc-600 dark:text-zinc-400" strokeWidth="1.4" />
                <text x="52" y="235" textAnchor="middle" fontSize="8.5" fill="currentColor" className="fill-foreground">{zh ? '请求' : 'Request'}</text>
                <path d="M78 231 H96" stroke="currentColor" className="text-zinc-400" strokeWidth="1.4" strokeDasharray="4 4" style={{ animation: 'dash 2.4s linear infinite' }} />
                <path d="M118 209 L138 231 L118 253 L98 231 Z" fill="var(--background)" stroke="currentColor" className="text-zinc-600 dark:text-zinc-400" strokeWidth="1.4" />
                <text x="118" y="228" textAnchor="middle" fontSize="7.5" fill="currentColor" className="fill-foreground">{zh ? '重试' : 'Retry'}</text>
                <text x="118" y="237" textAnchor="middle" fontSize="7.5" fill="currentColor" className="fill-foreground">?</text>
                <path d="M138 231 H156" stroke="currentColor" className="text-zinc-400" strokeWidth="1.4" strokeDasharray="4 4" style={{ animation: 'dash 2.4s linear infinite' }} />
                <rect x="158" y="220" width="62" height="22" rx="5" fill="#bbf7d0" stroke="#4ade80" strokeWidth="1.4" />
                <text x="189" y="235" textAnchor="middle" fontSize="8.5" fill="#14532d">{zh ? '幂等网关' : 'Idempotent'}</text>
                <path d="M118 253 V274" stroke="currentColor" className="text-zinc-400" strokeWidth="1.4" strokeDasharray="4 4" style={{ animation: 'dash 2.4s linear infinite' }} />
                <rect x="88" y="276" width="60" height="20" rx="5" fill="var(--background)" stroke="currentColor" className="text-zinc-600 dark:text-zinc-400" strokeWidth="1.4" />
                <text x="118" y="289" textAnchor="middle" fontSize="8" fill="currentColor" className="fill-foreground">{zh ? '去重丢弃' : 'Dedupe'}</text>
              </g>
            )}

            <defs>
              <marker id="wb-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0 0 L6 3 L0 6" fill="none" stroke="currentColor" className="text-zinc-400" strokeWidth="1.2" />
              </marker>
            </defs>
          </svg>
        </div>
      </div>

      {/* bottom canvas bar */}
      <div className="flex items-center justify-center gap-3 border-t border-border py-1.5 text-muted-foreground">
        <Minus size={10} />
        <span className="text-[9px] font-medium">60%</span>
        <Plus size={10} />
        <Maximize size={10} />
        <LayoutGrid size={10} />
        <Undo2 size={10} />
        <Redo2 size={10} />
      </div>
    </div>
  );
}
