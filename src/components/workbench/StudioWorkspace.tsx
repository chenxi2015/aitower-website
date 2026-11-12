import type { Lang } from '../../data/i18n';
import { boards } from './workbenchData';

interface Props {
  lang: Lang;
  flowGenerated: boolean;
}

// Mini replica of studio mode: board list drawer + animated Excalidraw-style canvas
export default function StudioWorkspace({ lang, flowGenerated }: Props) {
  const zh = lang === 'zh';
  const list = boards[lang];

  return (
    <div className="grid h-full grid-cols-[150px_1fr]">
      {/* Left: boards / materials drawer */}
      <div className="flex flex-col border-r border-border bg-muted/30">
        <div className="border-b border-border p-2">
          <div className="seg-tab-group" style={{ padding: 2 }}>
            <span className="seg-tab" style={{ padding: '2px 4px', fontSize: 9 }}>{zh ? '画板' : 'Boards'}</span>
            <span className="seg-tab active" style={{ padding: '2px 4px', fontSize: 9 }}>{zh ? '素材' : 'Assets'}</span>
            <span className="seg-tab" style={{ padding: '2px 4px', fontSize: 9 }}>{zh ? '模板' : 'Tpl'}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5 p-2">
          <div className="aspect-square rounded-md border border-border bg-note-yellow/60" />
          <div className="aspect-square rounded-md border border-border bg-note-blue/60" />
          <div className="aspect-square rounded-md border border-border bg-note-pink/60" />
          <div className="aspect-square rounded-md border border-border bg-note-green/60" />
        </div>
        <div className="mt-auto space-y-1 border-t border-border p-2">
          {list.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-md px-1.5 py-1 text-[9px] text-muted-foreground">
              <span className="truncate">{b.name}</span>
              <span className="shrink-0 rounded-full bg-muted px-1 text-[8px]">{b.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Center: canvas */}
      <div className="dot-grid relative overflow-hidden bg-card">
        <svg viewBox="0 0 320 200" className="h-full w-full" fill="none">
          {/* base nodes always present */}
          <g style={{ animation: 'float 7s ease-in-out infinite' }}>
            <rect x="20" y="30" width="70" height="30" rx="8" fill="var(--background)" stroke="currentColor" className="text-zinc-500" strokeWidth="1.5" />
            <text x="55" y="49" textAnchor="middle" fontSize="10" fill="currentColor" className="fill-foreground" fontWeight="500">
              {zh ? '笔记碎片' : 'Notes'}
            </text>
          </g>
          <g style={{ animation: 'float 8s ease-in-out 0.5s infinite' }}>
            <rect x="22" y="90" width="80" height="34" rx="4" fill="#fef08a" stroke="#e5c90a" strokeWidth="1" transform="rotate(-2 62 107)" />
            <text x="62" y="110" textAnchor="middle" fontSize="8.5" fill="#713f12" transform="rotate(-2 62 107)">
              {zh ? '反直觉洞察?' : 'Counter-intuitive?'}
            </text>
          </g>

          {/* AI-drafted flow nodes appear after the preset runs */}
          {flowGenerated && (
            <g style={{ animation: 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>
              <path d="M90 45 H130" stroke="currentColor" className="text-zinc-400" strokeWidth="1.5" strokeDasharray="5 5" style={{ animation: 'dash 2.4s linear infinite' }} />
              <rect x="132" y="30" width="70" height="30" rx="8" fill="var(--background)" stroke="currentColor" className="text-zinc-500" strokeWidth="1.5" />
              <text x="167" y="49" textAnchor="middle" fontSize="10" fill="currentColor" className="fill-foreground" fontWeight="500">
                {zh ? 'AI 发散' : 'AI brainstorm'}
              </text>
              <path d="M202 45 H228 Q244 45 244 61 V84" stroke="currentColor" className="text-zinc-400" strokeWidth="1.5" strokeDasharray="5 5" style={{ animation: 'dash 2.4s linear infinite' }} />
              <rect x="214" y="86" width="82" height="30" rx="8" fill="#bbf7d0" stroke="#4ade80" strokeWidth="1.5" />
              <text x="255" y="105" textAnchor="middle" fontSize="10" fill="#14532d" fontWeight="500">
                {zh ? '手绘配图' : 'Hand-drawn'}
              </text>
            </g>
          )}

          {/* empty-canvas hint when idle */}
          {!flowGenerated && (
            <text x="200" y="100" textAnchor="middle" fontSize="9" className="fill-muted-foreground" style={{ animation: 'blink 2.4s step-end infinite' }}>
              {zh ? '等待 AI 起草…' : 'Waiting for AI draft…'}
            </text>
          )}
        </svg>
      </div>
    </div>
  );
}
