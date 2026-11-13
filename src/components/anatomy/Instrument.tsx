import * as React from 'react';
import {
  boxCorners, circleRing, cylinder, fitProjection, insetPlan,
  iso, knurl, lineOnTop, onTop, planOutline, radialTicks, ring, segment,
  sideArc, sideMatrix, sideRing, slabOf, topMatrix, topTicks, translateAlong,
  type Plan, type Point3, type Projection, type SolidPaths,
} from './iso-kit';

export type InstrumentKind = 'notes' | 'agent' | 'studio' | 'pipeline' | 'search' | 'local' | 'session';
type Locale = 'zh' | 'en';

const W = 520;
const H = 280;
const radians = Math.PI / 180;
const plan = (x: number, y: number, w: number, d: number, r = 3): Plan => ({ x, y, w, d, r });
const projections = {} as Record<InstrumentKind, Projection>;

function camera(extents: Plan[], tallest = 70): Projection {
  return fitProjection([
    ...extents.flatMap((item) => boxCorners(item, -12, 0)),
    ...extents.flatMap((item) => boxCorners(item, 0, tallest)),
  ], W, H, { pad: 24, azimuth: 42, elevation: 34 });
}

function Solid({ paths, lit = false, tone = 'hi', flat = false }: { paths: SolidPaths; lit?: boolean; tone?: 'hi' | 'mid' | 'lo' | 'faint'; flat?: boolean }) {
  return <g className="iso-solid" data-lit={lit || undefined}>
    <path className="iso-fill" d={paths.fill} />
    {!flat && paths.shades.map((d, index) => d ? <path key={index} className="iso-shade" data-shade={index} d={d} /> : null)}
    {!flat && <path className="iso-top" d={paths.top} />}
    {paths.crease && <path className="iso-line" data-tone="faint" d={paths.crease} />}
    <path className="iso-line iso-edge" data-tone={tone} d={paths.outline} />
  </g>;
}

function Stroke({ d, tone = 'lo', flow = false, free = false }: { d: string; tone?: string; flow?: boolean; free?: boolean }) {
  return d ? <path className="iso-line" data-tone={tone} data-flow={flow || undefined} data-free={free || undefined} d={d} /> : null;
}

function Screws({ points, P, size = .55 }: { points: Point3[]; P: Projection; size?: number }) {
  return <g className="iso-dots" data-tone="mid">{points.map((point, index) => {
    const [x, y] = iso(point, P);
    return <circle key={index} cx={x} cy={y} r={size} />;
  })}</g>;
}

function Bench({ P, base, code }: { P: Projection; base: Plan; code: string }) {
  const feet = [[base.x + 14, base.y + 13], [base.x + base.w - 14, base.y + 13], [base.x + 14, base.y + base.d - 13], [base.x + base.w - 14, base.y + base.d - 13]];
  const corners = [[base.x + 8, base.y + 8], [base.x + base.w - 8, base.y + 8], [base.x + 8, base.y + base.d - 8], [base.x + base.w - 8, base.y + base.d - 8]];
  const badge = plan(base.x + 12, base.y + base.d - 19, 50, 10, 1.5);
  const rules = [0, 1, 2].map((row) => lineOnTop([badge.x + 6, badge.y + 2.8 + row * 2.1], [badge.x + (row === 1 ? 27 : 39), badge.y + 2.8 + row * 2.1], 1.1, P)).join('');
  const ruler = topTicks(base.x + 76, base.x + base.w - 10, 5, 5, base.y + base.d - 8, .2, [1.8, 3.5], P);
  return <g>
    <path className="iso-halo" d={slabOf(base, -12, 10, P).fill} />
    {feet.map(([x, y], index) => <g key={index}>
      <Solid paths={cylinder(x!, y!, 6, -11, 2, P, 20)} tone="mid" />
      <Solid paths={cylinder(x!, y!, 4.8, -9, 6, P, 20)} tone="mid" />
    </g>)}
    <Solid paths={slabOf(base, -3, 5, P, 8, 1.2)} tone="mid" />
    <Stroke d={planOutline(insetPlan(base, 4), 2, P)} tone="faint" />
    <Screws P={P} points={corners.map(([x, y]) => [x!, y!, 2])} />
    <Solid paths={slabOf(badge, 2, .7, P, 3)} tone="lo" />
    <Stroke d={rules} tone="lo" free />
    <text className="iso-face-text" data-tone="mid" transform={topMatrix([badge.x + 4, badge.y + 8], 2.8, P)} fontSize="2.4">{code}</text>
    <Stroke d={ruler.minor} tone="faint" /><Stroke d={ruler.major} tone="lo" />
  </g>;
}

function Paper({ P, at, width, depth, rows = 6, title = '' }: { P: Projection; at: [number, number, number]; width: number; depth: number; rows?: number; title?: string }) {
  const [x, y, z] = at;
  const sheet = plan(x, y, width, depth, 2);
  const rules = Array.from({ length: rows }, (_, row) => lineOnTop(
    [x + 8, y + 17 + row * ((depth - 25) / Math.max(rows - 1, 1))],
    [x + width - 8 - (row % 3) * 9, y + 17 + row * ((depth - 25) / Math.max(rows - 1, 1))], z + .6, P,
  )).join('');
  return <g>
    <Solid paths={slabOf(sheet, z, .6, P, 4)} lit tone="hi" />
    <Stroke d={planOutline(insetPlan(sheet, 3), z + .65, P)} tone="faint" />
    <Stroke d={rules} tone="mid" free />
    {title && <text className="iso-face-text" data-tone="hi" transform={topMatrix([x + 8, y + 10], z + .7, P)} fontSize="4">{title}</text>}
  </g>;
}

function Knob({ P, x, y, z, r = 6 }: { P: Projection; x: number; y: number; z: number; r?: number }) {
  return <g>
    <Solid paths={cylinder(x, y, r + 1, z, 2, P, 24)} tone="mid" />
    <Solid paths={cylinder(x, y, r, z + 2, 5, P, 28)} tone="mid" />
    <Stroke d={knurl(x, y, r, z + 3, z + 6, 24, P)} tone="faint" />
    <Stroke d={lineOnTop([x, y], [x, y - r + 1.5], z + 7, P)} tone="lit" free />
  </g>;
}

function Rail({ P, from, to, y, z }: { P: Projection; from: number; to: number; y: number; z: number }) {
  const ticks = topTicks(from + 5, to - 5, 5, 5, y + 4, z + 5, [1.5, 3], P);
  return <g>
    <Solid paths={slabOf(plan(from, y - 4, to - from, 8, 2), z, 5, P, 4, .5)} tone="mid" />
    <Stroke d={ticks.minor} tone="faint" /><Stroke d={ticks.major} tone="lo" />
    {[from + 4, to - 4].map((x) => <Solid key={x} paths={slabOf(plan(x - 2, y - 5, 4, 10, 1), z + 5, 3, P, 3)} tone="mid" />)}
  </g>;
}

function Notes() {
  const base = plan(-140, -78, 292, 162, 8);
  const P = camera([base], 82);
  projections.notes = P;
  const housing = plan(-120, -59, 242, 35, 4);
  const carriage = plan(-103, -23, 204, 18, 3);
  const keys = Array.from({ length: 30 }, (_, index) => {
    const col = index % 10;
    const row = Math.floor(index / 10);
    return slabOf(plan(-104 + col * 20.5, 19 + row * 16, 14, 10, 2), 4, 4 + (index % 4 === 0 ? 1 : 0), P, 3, .4);
  });
  const rollers = [-95, 100].map((x) => cylinder(x, -42, 7, 46, 10, P, 28));
  return <>
    <Bench P={P} base={base} code="MD / 03" />
    <Solid paths={slabOf(housing, 2, 51, P, 5, 1)} tone="mid" />
    <Solid paths={slabOf(plan(-112, -62, 226, 8, 2), 52, 7, P, 3)} tone="mid" />
    {rollers.map((paths, index) => <Solid key={index} paths={paths} tone="mid" />)}
    <g data-motion="notes-paper"><Paper P={P} at={[-92, -55, 54]} width={176} depth={76} rows={5} title="[[ linked ideas ]]" /></g>
    <Rail P={P} from={-117} to={119} y={-12} z={27} />
    <g data-motion="notes-carriage">
      <Solid paths={slabOf(carriage, 31, 8, P, 4, .7)} tone="mid" />
      <Solid paths={slabOf(plan(-3, -24, 8, 22, 1), 39, 5, P, 3)} lit />
      <Screws P={P} points={[[-94, -14, 39], [92, -14, 39]]} />
    </g>
    <g data-motion="notes-keys">{keys.map((paths, index) => <g key={index} data-key={index}><Solid paths={paths} tone="mid" /></g>)}</g>
    <Solid paths={slabOf(plan(-77, 66, 142, 7, 2), 3, 4, P, 3)} tone="mid" />
    <Knob P={P} x={113} y={48} z={3} r={8} />
    <Stroke d={segment([-120, -20, 15], [-132, -20, 15], P)} tone="mid" />
    <Solid paths={cylinder(-132, -20, 5, 11, 8, P, 24)} tone="mid" />
  </>;
}

function Agent() {
  const base = plan(-118, -91, 236, 182, 8);
  const P = camera([base], 88);
  projections.agent = P;
  const trays = [-58, -17, 24].map((y, index) => ({ y, paths: slabOf(plan(-101, y, 65, 29, 3), 5 + index * 2, 5, P, 4, .5) }));
  const drum = cylinder(28, -5, 32, 5, 43, P, 56);
  const dial = radialTicks(28, -5, 26, 32, 4, 49, [2, 4], P);
  return <>
    <Bench P={P} base={base} code="CTX / 03" />
    {trays.map(({ y, paths }, index) => <g key={y}>
      <Solid paths={paths} tone="mid" />
      <g data-motion={`agent-input-${index}`}><Paper P={P} at={[-95, y + 4, 11 + index * 2]} width={49} depth={20} rows={1} /></g>
      <Screws P={P} points={[[-96, y + 4, 11 + index * 2], [-42, y + 4, 11 + index * 2]]} size={.45} />
    </g>)}
    <Solid paths={slabOf(plan(-28, -39, 18, 75, 3), 3, 8, P, 4)} tone="mid" />
    <Solid paths={drum} tone="mid" />
    <Stroke d={ring(28, -5, 28, 49, P, 48)} tone="hi" />
    <Stroke d={dial.minor} tone="lo" /><Stroke d={dial.major} tone="mid" />
    <g data-motion="agent-needle"><Solid paths={slabOf(plan(25, -31, 6, 28, 1), 49, 2, P, 2)} lit /></g>
    <Knob P={P} x={73} y={47} z={3} r={9} />
    <Rail P={P} from={-3} to={91} y={-65} z={15} />
    <g data-motion="agent-output"><Paper P={P} at={[50, -60, 23]} width={43} depth={54} rows={4} title="draft" /></g>
    {[0, 1, 2].map((index) => <g key={index} data-motion={`agent-pulse-${index}`}>
      <Solid paths={cylinder(-24, -47 + index * 39, 2.6, 13, 3, P, 16)} lit />
    </g>)}
    <Stroke d={sideArc(28, -5, 32, 22, P)} tone="faint" />
    <Screws P={P} points={[[7, -26, 49], [48, 15, 49]]} />
  </>;
}

function Studio() {
  const base = plan(-145, -85, 300, 174, 8);
  const P = camera([base], 84);
  projections.studio = P;
  const bed = plan(-105, -48, 190, 103, 4);
  const grid = [
    ...Array.from({ length: 12 }, (_, index) => lineOnTop([-95 + index * 15, -42], [-95 + index * 15, 48], 5, P)),
    ...Array.from({ length: 7 }, (_, index) => lineOnTop([-98, -39 + index * 14], [78, -39 + index * 14], 5, P)),
  ].join('');
  return <>
    <Bench P={P} base={base} code="DRAW / XY" />
    <Solid paths={slabOf(bed, 2, 3, P, 4)} tone="mid" />
    <Stroke d={grid} tone="faint" />
    <Rail P={P} from={-116} to={96} y={-58} z={42} />
    {[-119, 99].map((x) => <Solid key={x} paths={slabOf(plan(x, -64, 12, 13, 2), 2, 40, P, 4)} tone="mid" />)}
    <g data-motion="studio-gantry">
      <Solid paths={slabOf(plan(-110, -52, 198, 10, 2), 36, 8, P, 4)} tone="mid" />
      <Solid paths={slabOf(plan(-12, -53, 24, 14, 3), 44, 7, P, 4)} tone="mid" />
      <Screws P={P} points={[[-6, -46, 51], [6, -46, 51]]} />
      <Solid paths={cylinder(0, -45, 5, 20, 24, P, 24)} tone="mid" />
      <Solid paths={cylinder(0, -45, 2.2, 12, 10, P, 20)} lit />
    </g>
    <g data-motion="studio-sheet"><Paper P={P} at={[-75, -30, 6]} width={135} depth={70} rows={0} title="system sketch" /></g>
    <g data-motion="studio-drawing">
      <Stroke d={onTop([[-54, -5], [-15, -5], [-15, 18], [30, 18], [30, -9], [57, -9]], 7, P)} tone="lit" />
      {[[-54, -5], [-15, -5], [-15, 18], [30, 18], [30, -9], [57, -9]].map(([x, y], index) => <Solid key={index} paths={slabOf(plan(x! - 5, y! - 4, 10, 8, 1), 7, .5, P, 2)} lit />)}
    </g>
    <Knob P={P} x={119} y={45} z={3} r={9} />
    {[0, 1, 2].map((index) => <Solid key={index} paths={slabOf(plan(102 + index * 11, -49, 7, 23, 1), 3, 5 + index * 3, P, 2)} tone="mid" />)}
    <Solid paths={cylinder(-127, 52, 8, 3, 6, P, 28)} tone="mid" />
    <Stroke d={knurl(-127, 52, 8, 4, 8, 28, P)} tone="faint" />
  </>;
}

function Pipeline() {
  const base = plan(-116, -91, 232, 182, 8);
  const P = camera([base], 105);
  projections.pipeline = P;
  const posts = [-83, 60].map((x) => slabOf(plan(x, -51, 17, 18, 3), 2, 76, P, 4, .6));
  return <>
    <Bench P={P} base={base} code="PNG / 1S" />
    {posts.map((paths, index) => <Solid key={index} paths={paths} tone="mid" />)}
    <Solid paths={slabOf(plan(-91, -58, 175, 25, 4), 76, 13, P, 4, 1)} tone="mid" />
    <Rail P={P} from={-87} to={78} y={-44} z={90} />
    <g data-motion="pipeline-press">
      <Solid paths={slabOf(plan(-56, -38, 91, 62, 4), 47, 12, P, 4, .8)} tone="mid" />
      <Solid paths={cylinder(-10, -8, 8, 59, 26, P, 28)} tone="mid" />
      <Screws P={P} points={[[-47, -29, 59], [26, -29, 59], [-47, 15, 59], [26, 15, 59]]} />
    </g>
    <Solid paths={slabOf(plan(-66, -45, 111, 76, 4), 3, 7, P, 4)} tone="mid" />
    <g data-motion="pipeline-board"><Paper P={P} at={[-55, -35, 11]} width={89} depth={55} rows={2} title="diagram.png" /></g>
    <Solid paths={slabOf(plan(-71, 43, 137, 25, 3), 3, 7, P, 4)} tone="mid" />
    <g data-motion="pipeline-page"><Paper P={P} at={[-59, 46, 11]} width={112} depth={19} rows={1} title="![[diagram.png]]" /></g>
    <Knob P={P} x={83} y={49} z={3} r={8} />
    <Solid paths={cylinder(74, -40, 5, 82, 10, P, 24)} lit />
    <Stroke d={segment([-83, -31, 54], [-83, -31, 68], P)} tone="hi" />
    <Stroke d={segment([77, -31, 54], [77, -31, 68], P)} tone="hi" />
  </>;
}

function Search() {
  const base = plan(-116, -91, 232, 182, 8);
  const P = camera([base], 94);
  projections.search = P;
  const cards = Array.from({ length: 12 }, (_, index) => {
    const col = index % 4;
    const row = Math.floor(index / 4);
    return { x: -83 + col * 43, y: -54 + row * 39, z: 7 + (index % 3) * 2 };
  });
  return <>
    <Bench P={P} base={base} code="LINK / 12" />
    <Solid paths={slabOf(plan(-94, -66, 181, 124, 5), 2, 4, P, 4)} tone="mid" />
    {cards.map(({ x, y, z }, index) => <g key={index} data-motion={`search-card-${index}`}>
      <Paper P={P} at={[x, y, z]} width={33} depth={27} rows={2} title={index % 4 === 0 ? '[[]]' : ''} />
    </g>)}
    {[-92, 86].map((x) => <Solid key={x} paths={slabOf(plan(x, -68, 9, 9, 2), 2, 67, P, 3)} tone="mid" />)}
    <Rail P={P} from={-91} to={94} y={-64} z={68} />
    <g data-motion="search-scanner">
      <Solid paths={slabOf(plan(-98, -60, 195, 15, 3), 57, 10, P, 4, .6)} tone="mid" />
      <Solid paths={slabOf(plan(-90, -43, 178, 3, 1), 49, 7, P, 2)} lit />
      <Screws P={P} points={[[-88, -52, 67], [76, -52, 67]]} />
    </g>
    <g data-motion="search-link"><Stroke d={onTop([[-66, -40], [-23, -1], [20, -40], [63, 37]], 18, P)} tone="lit" /></g>
    <Knob P={P} x={94} y={59} z={3} r={7} />
  </>;
}

function Local() {
  const base = plan(-116, -91, 232, 182, 8);
  const P = camera([base], 100);
  projections.local = P;
  const safe = plan(-77, -59, 142, 104, 7);
  const face = sideMatrix([-75, 45], 63, P, 'right');
  const wheel = sideRing([-1, 45, 48], 19, 'y', P);
  return <>
    <Bench P={P} base={base} code="VAULT / OS" />
    <Solid paths={slabOf(safe, 2, 70, P, 6, 1.2)} tone="mid" />
    <Solid paths={slabOf(plan(-84, -53, 9, 91, 2), 12, 51, P, 4)} tone="lo" />
    <g data-motion="local-door">
      <Solid paths={slabOf(plan(-70, 39, 128, 9, 4), 11, 53, P, 4, .8)} tone="mid" />
      <Stroke d={wheel} tone="hi" />
      <Stroke d={sideRing([-1, 45, 48], 14, 'y', P)} tone="mid" />
      {[0, 60, 120].map((angle) => <Stroke key={angle} d={segment([-1, 45, 48], [-1 + Math.cos(angle * radians) * 14, 45, 48 + Math.sin(angle * radians) * 14], P)} tone="mid" />)}
      <Screws P={P} points={[[-61, 48, 18], [49, 48, 18], [-61, 48, 58], [49, 48, 58]]} />
    </g>
    <g data-motion="local-drawer">
      <Solid paths={slabOf(plan(-58, -36, 101, 64, 3), 13, 9, P, 4)} tone="mid" />
      {[0, 1, 2].map((index) => <Paper key={index} P={P} at={[-48 + index * 29, -26, 23]} width={24} depth={43} rows={3} title=".md" />)}
    </g>
    <Solid paths={cylinder(81, -47, 6, 3, 7, P, 24)} lit />
    <Knob P={P} x={82} y={40} z={3} r={8} />
    <text className="iso-face-text" data-tone="mid" transform={face} fontSize="3.2">LOCAL VAULT</text>
    <Solid paths={slabOf(plan(-80, 55, 34, 17, 3), 3, 4, P, 3)} tone="mid" />
    <Solid paths={slabOf(plan(-70, 60, 14, 8, 2), 7, 3, P, 3)} tone="mid" />
  </>;
}

function Session() {
  const base = plan(-116, -91, 232, 182, 8);
  const P = camera([base], 90);
  projections.session = P;
  const channels = [-56, -20, 16, 52];
  return <>
    <Bench P={P} base={base} code="RUN / 04" />
    <Solid paths={slabOf(plan(-85, -67, 166, 39, 5), 3, 46, P, 4)} tone="mid" />
    {channels.map((y, index) => <g key={y}>
      <Solid paths={slabOf(plan(-94, y, 169, 24, 3), 3, 6, P, 4)} tone="mid" />
      <Solid paths={cylinder(-77, y + 12, 4, 10, 4, P, 20)} tone="mid" />
      <g data-motion={`session-token-${index}`}><Solid paths={slabOf(plan(-53, y + 5, 27, 14, 2), 10, 5, P, 3)} lit /></g>
      <Stroke d={lineOnTop([-14, y + 7], [54 - index * 7, y + 7], 10, P)} tone="lo" free />
      <Stroke d={lineOnTop([-14, y + 13], [43 - index * 5, y + 13], 10, P)} tone="faint" free />
      <g data-motion={`session-lamp-${index}`}><Solid paths={cylinder(66, y + 12, 3.3, 10, 5, P, 18)} lit /></g>
    </g>)}
    {[0, 1, 2, 3].map((index) => <g key={index}>
      <Solid paths={cylinder(-66 + index * 38, -47, 10, 49, 7, P, 28)} tone="mid" />
      <g data-motion={`session-meter-${index}`}><Stroke d={lineOnTop([-66 + index * 38, -47], [-66 + index * 38, -54], 57, P)} tone="lit" free /></g>
    </g>)}
    <Knob P={P} x={87} y={70} z={3} r={7} />
    <Screws P={P} points={[[-76, -58, 49], [72, -58, 49]]} />
  </>;
}

const ART = { notes: Notes, agent: Agent, studio: Studio, pipeline: Pipeline, search: Search, local: Local, session: Session };

const META = {
  notes: '活字编辑机：纸张随打字滑架推进，双链出现在纸面上。',
  agent: '上下文交换机：三路笔记汇入旋转推理鼓，输出结构化草稿。',
  studio: '逻辑绘图仪：XY 滑架在绘图床上连接组件，画出系统架构。',
  pipeline: '插图压印机：压头导出画板，纸张送出 Markdown 图片引用。',
  search: '双链索引柜：扫描梁扫过卡片目录，命中的卡片抬起并连成引用路径。',
  local: '本地保险柜：柜门滑开，Markdown 抽屉推出，原始文件始终留在本地。',
  session: '四路会话路由台：四个令牌沿独立通道前进，计量器各自变化，互不串台。',
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };
const windowAt = (time: number, start: number, end: number, fade = .35) => Math.min(smooth((time - start) / fade), smooth((end - time) / fade));
const phaseAt = (time: number, duration: number) => (time % duration) / duration;

function draw(kind: InstrumentKind, root: HTMLElement, time: number, active: boolean) {
  const set = (name: string, by: Point3, opacity?: number) => {
    const node = root.querySelector<SVGGElement>(`[data-motion="${name}"]`);
    if (!node) return;
    const vector = translateAlong(projections[kind], by);
    node.setAttribute('transform', vector);
    if (opacity !== undefined) node.style.opacity = `${opacity}`;
  };
  const t = active ? time : 0;
  if (kind === 'notes') {
    const p = phaseAt(t, 8);
    set('notes-carriage', [Math.sin(p * Math.PI * 2) * 18, 0, 0]);
    set('notes-paper', [0, 0, smooth((p - .48) / .25) * 9]);
    root.querySelectorAll<SVGGElement>('[data-key]').forEach((key, index) => {
      const down = windowAt(p * 30, index % 10, index % 10 + 1.4, .25);
      key.setAttribute('transform', `translate(0 ${down * 2})`);
    });
  } else if (kind === 'agent') {
    const p = phaseAt(t, 9);
    for (let index = 0; index < 3; index++) {
      const travel = smooth((p - .08 - index * .1) / .24);
      set(`agent-input-${index}`, [travel * 42, 0, 0], 1 - smooth((travel - .8) / .2));
      set(`agent-pulse-${index}`, [0, 0, windowAt(p, .25 + index * .08, .55 + index * .08) * 2], windowAt(p, .25 + index * .08, .55 + index * .08));
    }
    set('agent-needle', [Math.sin(p * Math.PI * 2) * 8, 0, 0]);
    set('agent-output', [smooth((p - .58) / .22) * 28, 0, smooth((p - .58) / .22) * 2]);
  } else if (kind === 'studio') {
    const p = phaseAt(t, 10);
    set('studio-gantry', [Math.sin(p * Math.PI * 2) * 42, Math.sin(p * Math.PI * 4) * 17, 0]);
    set('studio-drawing', [0, 0, 0], smooth((p - .12) / .55));
    set('studio-sheet', [0, 0, windowAt(p, .72, .95) * 2]);
  } else if (kind === 'pipeline') {
    const p = phaseAt(t, 7);
    const press = windowAt(p, .12, .64, .2);
    set('pipeline-press', [0, 0, -press * 28]);
    set('pipeline-board', [0, smooth((p - .55) / .2) * 6, 0], 1 - smooth((p - .7) / .1));
    set('pipeline-page', [0, smooth((p - .57) / .24) * 27, smooth((p - .57) / .24) * 2], smooth((p - .52) / .08));
  } else if (kind === 'search') {
    const p = phaseAt(t, 9);
    set('search-scanner', [0, p * 94, 0]);
    set('search-link', [0, 0, 0], windowAt(p, .32, .9, .2));
    for (let index = 0; index < 12; index++) {
      const selected = [1, 6, 8, 11].includes(index);
      set(`search-card-${index}`, [0, 0, selected ? windowAt(p, .3 + index * .015, .88, .2) * 9 : 0]);
    }
  } else if (kind === 'local') {
    const p = phaseAt(t, 10);
    const open = windowAt(p, .1, .9, .22);
    set('local-door', [open * 72, 0, 0]);
    set('local-drawer', [0, open * 35, 0]);
  } else {
    const p = phaseAt(t, 8);
    for (let index = 0; index < 4; index++) {
      const travel = (p + index * .19) % 1;
      set(`session-token-${index}`, [travel * 86, 0, 0], Math.min(smooth(travel / .1), smooth((1 - travel) / .12)));
      set(`session-lamp-${index}`, [0, 0, 0], .25 + windowAt(travel, .65, .96, .12) * .75);
      set(`session-meter-${index}`, [Math.sin((p + index * .2) * Math.PI * 2) * 4, 0, 0]);
    }
  }
}

export default function Instrument({ kind, lang = 'zh' }: { kind: InstrumentKind; lang?: Locale }) {
  const root = React.useRef<HTMLDivElement>(null);
  const active = React.useRef(false);
  const elapsed = React.useRef(0);
  const lastTick = React.useRef(0);
  const hovered = React.useRef(false);
  const visible = React.useRef(false);
  const [interacting, setInteracting] = React.useState(false);
  const Art = ART[kind];
  const meta = META[kind];

  React.useEffect(() => {
    const node = root.current;
    if (!node) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const tick = (now: number) => {
      const dt = lastTick.current ? Math.min((now - lastTick.current) / 1000, 1 / 30) : 0;
      lastTick.current = now;
      if (!reduced.matches && (active.current || hovered.current)) elapsed.current += dt;
      draw(kind, node, elapsed.current, !reduced.matches);
      if (visible.current && !reduced.matches) frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver((entries) => {
      visible.current = Boolean(entries.at(-1)?.isIntersecting);
      if (visible.current) {
        active.current = true;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(tick);
      } else {
        active.current = false;
        cancelAnimationFrame(frame);
      }
    }, { rootMargin: '100px 0px' });
    observer.observe(node);
    const motionChange = () => draw(kind, node, elapsed.current, !reduced.matches);
    reduced.addEventListener('change', motionChange);
    return () => { observer.disconnect(); reduced.removeEventListener('change', motionChange); cancelAnimationFrame(frame); };
  }, [kind]);

  const replay = () => {
    const node = root.current;
    elapsed.current = 0;
    lastTick.current = 0;
    active.current = true;
    if (node) draw(kind, node, 0, true);
    setInteracting(true);
  };

  return <div className="instrument-shell" data-kind={kind}>
    <div
      ref={root}
      className="iso aitower-instrument"
      role="button"
      tabIndex={0}
      aria-label={`${meta}${lang === 'zh' ? '按回车重新播放。' : ' Press Enter to replay.'}`}
      onPointerEnter={() => { hovered.current = true; setInteracting(true); }}
      onPointerLeave={() => { hovered.current = false; setInteracting(false); }}
      onFocus={() => { hovered.current = true; setInteracting(true); }}
      onBlur={() => { hovered.current = false; setInteracting(false); }}
      onClick={replay}
      onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); replay(); } }}
      data-active={interacting || undefined}
    >
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={meta}><Art /></svg>
    </div>
  </div>;
}
