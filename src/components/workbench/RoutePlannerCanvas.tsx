interface Props {
  flowGenerated: boolean;
  selectedFrame: string;
}

const frameStyle = (name: string, selectedFrame: string) => ({
  className: selectedFrame === name ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-300 dark:text-zinc-700',
  strokeWidth: selectedFrame === name ? 1.6 : 1.1,
});

function Sticky({ x, y, width = 126, height = 52, color, lines }: {
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
  lines: string[];
}) {
  return (
    <g>
      <rect x={x + 0.8} y={y + 1.3} width={width} height={height} rx="8" fill="#18181b" opacity="0.045" />
      <rect x={x} y={y} width={width} height={height} rx="8" fill={color} />
      <text x={x + width / 2} y={y + height / 2 - (lines.length - 1) * 6} textAnchor="middle" className="board-hand" fontSize="11" fill="#27272a">
        {lines.map((line, index) => <tspan key={line} x={x + width / 2} dy={index === 0 ? 0 : 13}>{line}</tspan>)}
      </text>
    </g>
  );
}

function FlowNode({ x, y, width, label }: { x: number; y: number; width: number; label: string }) {
  return (
    <g>
      <rect x={x} y={y} width={width} height="32" rx="7" fill="var(--background)" stroke="currentColor" className="text-zinc-700 dark:text-zinc-300" strokeWidth="1.5" />
      <text x={x + width / 2} y={y + 20} textAnchor="middle" className="board-hand fill-foreground" fontSize="11">{label}</text>
    </g>
  );
}

export default function RoutePlannerCanvas({ flowGenerated, selectedFrame }: Props) {
  return (
    <svg viewBox={flowGenerated ? '0 0 956 580' : '0 0 832 580'} preserveAspectRatio="xMidYMid meet" className="h-full w-full" fill="none" aria-label="Route Planner board preview">
      <g>
        <text x="18" y="22" fontSize="11" className="fill-muted-foreground">Goals</text>
        <rect x="14" y="30" width="178" height="248" rx="9" fill="var(--background)" stroke="currentColor" {...frameStyle('Goals', selectedFrame)} />
        <Sticky x={36} y={62} width={134} height={54} color="#fff08a" lines={['Drivers replan', 'stops by hand']} />
        <Sticky x={36} y={137} width={134} height={54} color="#bfe3fb" lines={['Goal: 30% less', 'planning time']} />
        <Sticky x={36} y={211} width={134} height={54} color="#bfe3fb" lines={['Adoption: 70% by', '30 days after GA']} />
      </g>

      <g>
        <text x="218" y="22" fontSize="11" className="fill-muted-foreground">User Flow</text>
        <rect x="214" y="30" width="604" height="248" rx="9" fill="var(--background)" stroke="currentColor" {...frameStyle('User Flow', selectedFrame)} />
        <FlowNode x={236} y={86} width={78} label="Start day" />
        <path d="M314 102 H347" stroke="currentColor" className="text-zinc-700 dark:text-zinc-300" strokeWidth="1.5" markerEnd="url(#board-arrow)" />
        <FlowNode x={350} y={86} width={78} label="See stops" />
        <path d="M428 102 H461" stroke="currentColor" className="text-zinc-700 dark:text-zinc-300" strokeWidth="1.5" markerEnd="url(#board-arrow)" />
        <path d="M500 69 L533 102 L500 135 L467 102 Z" fill="var(--background)" stroke="currentColor" className="text-zinc-700 dark:text-zinc-300" strokeWidth="1.5" />
        <text x="500" y="98" textAnchor="middle" className="board-hand fill-foreground" fontSize="10"><tspan x="500">Signal</tspan><tspan x="500" dy="11">ok?</tspan></text>
        <path d="M533 102 H562" stroke="currentColor" className="text-zinc-700 dark:text-zinc-300" strokeWidth="1.5" markerEnd="url(#board-arrow)" />
        <text x="541" y="96" className="board-hand fill-foreground" fontSize="10">Yes</text>
        <FlowNode x={566} y={86} width={78} label="Optimise" />
        <path d="M644 102 H675" stroke="currentColor" className="text-zinc-700 dark:text-zinc-300" strokeWidth="1.5" markerEnd="url(#board-arrow)" />
        <text x="653" y="96" className="board-hand fill-foreground" fontSize="10">Go</text>
        <FlowNode x={679} y={86} width={76} label="Drive" />
        <path d="M500 135 V174" stroke="currentColor" className="text-zinc-700 dark:text-zinc-300" strokeWidth="1.5" markerEnd="url(#board-arrow)" />
        <text x="488" y="151" className="board-hand fill-foreground" fontSize="10">No</text>
        <FlowNode x={461} y={177} width={78} label="Saved map" />
        <path d="M539 193 H605 V120" stroke="currentColor" className="text-zinc-700 dark:text-zinc-300" strokeWidth="1.5" markerEnd="url(#board-arrow)" />
        <Sticky x={236} y={177} width={136} height={54} color="#ffd0d8" lines={['Drivers undo', 'silent reroutes']} />
        <text x="237" y="258" className="board-hand fill-foreground" fontSize="11">Driver app, Route Planner beta</text>
      </g>

      <g>
        <text x="18" y="302" fontSize="11" className="fill-muted-foreground">Driver Screen</text>
        <rect x="14" y="310" width="276" height="250" rx="9" fill="var(--background)" stroke="currentColor" {...frameStyle('Driver Screen', selectedFrame)} />
        <rect x="32" y="328" width="90" height="214" rx="14" fill="var(--background)" stroke="currentColor" className="text-zinc-700 dark:text-zinc-300" strokeWidth="1.5" />
        <rect x="64" y="337" width="26" height="3" rx="2" fill="currentColor" className="text-zinc-300" />
        <text x="42" y="359" fontSize="7" fontWeight="600" className="fill-foreground">Today&apos;s stops</text>
        {[374, 397, 420, 443].map((y, index) => (
          <g key={y}>
            <rect x="39" y={y - 10} width="76" height="20" rx="3" fill={index === 1 ? '#fff1f2' : 'transparent'} stroke={index === 1 ? '#fda4af' : 'transparent'} />
            <circle cx="47" cy={y} r="4.5" fill="#27272a" />
            <rect x="58" y={y - 4} width="31" height="3" rx="1.5" fill="#d4d4d8" />
            <rect x="58" y={y + 2} width="23" height="3" rx="1.5" fill="#e4e4e7" />
            <text x="91" y={y + 2} fontSize="5.5" fill={index === 1 ? '#e11d48' : '#a1a1aa'}>{['14:35', '15:10', '15:45', '16:20'][index]}</text>
          </g>
        ))}
        <rect x="39" y="470" width="34" height="17" rx="4" fill="var(--background)" stroke="#d4d4d8" />
        <text x="56" y="481" textAnchor="middle" fontSize="5.5" className="fill-foreground">Reorder</text>
        <rect x="77" y="470" width="38" height="17" rx="4" fill="var(--background)" stroke="#d4d4d8" />
        <text x="96" y="481" textAnchor="middle" fontSize="5.5" className="fill-foreground">Optimise</text>
        <rect x="39" y="509" width="76" height="22" rx="5" fill="#18181b" />
        <text x="77" y="523" textAnchor="middle" fontSize="6.5" fill="white">Start route</text>
        <Sticky x={136} y={328} width={138} height={54} color="#fff08a" lines={['Show new ETAs', 'while dragging']} />
        <Sticky x={136} y={398} width={138} height={54} color="#bfe3fb" lines={['Finished stops', 'fold to the end']} />
        <Sticky x={136} y={468} width={138} height={54} color="#ffd0d8" lines={['Late ETAs are', 'easy to miss']} />
        <rect x="136" y="530" width="29" height="23" rx="5" fill="#e8e3fb" />
        <text x="150.5" y="545" textAnchor="middle" className="board-hand" fontSize="11" fill="#27272a">+3</text>
      </g>

      <g>
        <text x="316" y="302" fontSize="11" className="fill-muted-foreground">Open Questions</text>
        <rect x="312" y="310" width="276" height="198" rx="9" fill="var(--background)" stroke="currentColor" {...frameStyle('Open Questions', selectedFrame)} />
        <Sticky x={332} y={330} width={116} height={67} color="#fff08a" lines={['Dispatcher', 'overrides win?', 'Leo']} />
        <Sticky x={460} y={330} width={116} height={67} color="#fff08a" lines={['Undo a reroute', 'in one tap?', 'Mira']} />
        <Sticky x={332} y={413} width={116} height={67} color="#bfe3fb" lines={['Will drivers', 'trust reroutes?', 'Theo']} />
        <Sticky x={460} y={413} width={116} height={67} color="#e8e3fb" lines={['Offline maps', 'fit old phones?', 'Nora']} />
      </g>

      <g>
        <text x="614" y="302" fontSize="11" className="fill-muted-foreground">Decisions</text>
        <rect x="610" y="310" width={flowGenerated ? 332 : 208} height="250" rx="9" fill="var(--background)" stroke="currentColor" {...frameStyle('Decisions', selectedFrame)} />
        <Sticky x={632} y={330} width={flowGenerated ? 288 : 164} height={54} color="#b7f5d7" lines={['Stops reorder', 'by drag. Mira, Fri']} />
        <Sticky x={632} y={400} width={flowGenerated ? 288 : 164} height={54} color="#bfe3fb" lines={['Beta: 200 drivers', 'from Wed 4 Nov']} />
        <Sticky x={632} y={470} width={flowGenerated ? 288 : 164} height={54} color="#b7f5d7" lines={['Offline maps ship', 'in v1. Nora, Mon']} />
        {flowGenerated && <g style={{ animation: 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>
          <path d="M674 341 H788 M674 411 H788 M674 481 H788" stroke="#6366f1" strokeWidth="1.3" strokeDasharray="4 4" />
          <path d="M800 341 l9 9 -9 9 M800 411 l9 9 -9 9 M800 481 l9 9 -9 9" stroke="#6366f1" strokeWidth="1.3" />
        </g>}
      </g>

      <defs>
        <marker id="board-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0 0 L7 3.5 L0 7" fill="none" stroke="currentColor" className="text-zinc-700 dark:text-zinc-300" strokeWidth="1.3" />
        </marker>
      </defs>
    </svg>
  );
}
