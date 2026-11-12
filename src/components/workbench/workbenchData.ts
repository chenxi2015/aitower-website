import type { Lang } from '../../data/i18n';

export type ModuleId = 'notes' | 'studio';

export interface NoteItem {
  id: string;
  title: string;
  tag?: string;
}

export interface NoteFolder {
  id: string;
  name: string;
  notes: NoteItem[];
}

export interface BoardItem {
  id: string;
  name: string;
  count: number;
}

export interface OperationStep {
  type: 'tool' | 'search' | 'read';
  label: string;
  target?: string;
  duration: string;
}

export interface PresetAction {
  id: string;
  /** shown on the quick-action chip */
  label: string;
  /** user message inserted into the chat */
  prompt: string;
  module: ModuleId;
  operations: OperationStep[];
  reply: string;
  /** side effect applied to the canvas after the reply finishes */
  effect?: 'add_flow_nodes' | 'highlight_note' | 'insert_image';
}

export const noteTree: Record<Lang, NoteFolder[]> = {
  zh: [
    {
      id: 'reports',
      name: '分析报告',
      notes: [
        { id: 'n1', title: '重试风暴与幂等设计.md' },
        { id: 'n2', title: 'RAG 评估清单.md' },
      ],
    },
    {
      id: 'learn',
      name: '学习',
      notes: [
        { id: 'n3', title: '论文笔记 · RETRO.md' },
        { id: 'n4', title: '去 AI 味的写作.md', tag: '进行中' },
      ],
    },
    {
      id: 'media',
      name: '自媒体',
      notes: [
        { id: 'n5', title: '我的 2026 工具箱.md' },
        { id: 'n6', title: '黄金ETF 分析画布.canvas' },
      ],
    },
    {
      id: 'drawings',
      name: 'drawings',
      notes: [{ id: 'n7', title: '架构演进图.excalidraw' }],
    },
  ],
  en: [
    {
      id: 'reports',
      name: 'Reports',
      notes: [
        { id: 'n1', title: 'retry-storms.md' },
        { id: 'n2', title: 'rag-checklist.md' },
      ],
    },
    {
      id: 'learn',
      name: 'Learning',
      notes: [
        { id: 'n3', title: 'paper · RETRO.md' },
        { id: 'n4', title: 'writing-without-slop.md', tag: 'drafting' },
      ],
    },
    {
      id: 'media',
      name: 'Creator',
      notes: [
        { id: 'n5', title: 'my-2026-toolbox.md' },
        { id: 'n6', title: 'gold-etf-analysis.canvas' },
      ],
    },
    {
      id: 'drawings',
      name: 'drawings',
      notes: [{ id: 'n7', title: 'architecture.excalidraw' }],
    },
  ],
};

export const boards: Record<Lang, BoardItem[]> = {
  zh: [
    { id: 'b1', name: '微服务架构演进', count: 12 },
    { id: 'b2', name: 'RAG 流程图', count: 8 },
    { id: 'b3', name: '金句卡片 · 三月', count: 21 },
    { id: 'b4', name: '产品对比矩阵', count: 6 },
  ],
  en: [
    { id: 'b1', name: 'Microservices evolution', count: 12 },
    { id: 'b2', name: 'RAG pipeline', count: 8 },
    { id: 'b3', name: 'Quote cards · March', count: 21 },
    { id: 'b4', name: 'Product matrix', count: 6 },
  ],
};

export const articleLines: Record<Lang, Array<{ kind: 'h' | 'p' | 'link' | 'caret'; text: string }>> = {
  zh: [
    { kind: 'h', text: '## 反直觉的架构决策' },
    { kind: 'p', text: '稳定性的代价，往往藏在 [[幂等设计]] 里。' },
    { kind: 'p', text: '我们复盘了三次线上事故，发现一个共同模式…' },
    { kind: 'caret', text: '' },
  ],
  en: [
    { kind: 'h', text: '## Counter-intuitive architecture decisions' },
    { kind: 'p', text: 'The cost of stability hides in [[idempotency]].' },
    { kind: 'p', text: 'Reviewing three production incidents, one pattern emerged…' },
    { kind: 'caret', text: '' },
  ],
};

export const presets: Record<Lang, PresetAction[]> = {
  zh: [
    {
      id: 'illustrate',
      label: '手绘架构图',
      prompt: '手绘风格系统架构图',
      module: 'studio',
      operations: [
        { type: 'read', label: '读取了笔记', target: '重试风暴与幂等设计', duration: '58ms' },
        { type: 'tool', label: '调用了工具', target: 'draft_studio_board', duration: '2.4s' },
        { type: 'tool', label: '调用了工具', target: 'layout_elements', duration: '1.1s' },
      ],
      reply: '排版已完成。在画板上起草了「请求 → 重试 → 幂等网关」的手绘流程：顶行对齐、回环箭头不再戳出画框下缘、三张便签做了垂直居中。你可以直接在画布上微调配色和文案。',
      effect: 'add_flow_nodes',
    },
    {
      id: 'brainstorm',
      label: '灵感发散',
      prompt: '激活笔记灵感与双链重组',
      module: 'notes',
      operations: [
        { type: 'search', label: '搜索了笔记', target: '「学习」「自媒体」', duration: '678ms' },
        { type: 'read', label: '读取了笔记', target: 'Original Books Rea…', duration: '58ms' },
      ],
      reply: '写作不是最终产出，而是智力工作的基础动作。从「重试风暴」和「去 AI 味的写作」交叉出发：1）把「幂等」翻译成内容的「可复用论证」；2）写一篇「反 AI 插图宣言」；3）用一次失败重构做案例开篇。',
      effect: 'highlight_note',
    },
    {
      id: 'insert',
      label: '插入文章',
      prompt: '把画板导出并插入到文章光标处',
      module: 'notes',
      operations: [
        { type: 'tool', label: '调用了工具', target: 'export_board(png, 2x)', duration: '0.9s' },
        { type: 'tool', label: '调用了工具', target: 'insert_at_cursor', duration: '0.2s' },
      ],
      reply: '已导出高清 PNG 到 Obsidian 资产目录，并在光标处打入引用。全程 1 秒，无需跳出。',
      effect: 'insert_image',
    },
  ],
  en: [
    {
      id: 'illustrate',
      label: 'Hand-drawn diagram',
      prompt: 'Sketch a hand-drawn system architecture',
      module: 'studio',
      operations: [
        { type: 'read', label: 'Read note', target: 'retry-storms', duration: '58ms' },
        { type: 'tool', label: 'Called', target: 'draft_studio_board', duration: '2.4s' },
        { type: 'tool', label: 'Called', target: 'layout_elements', duration: '1.1s' },
      ],
      reply: 'Layout done. Drafted a hand-drawn "request → retry → idempotent gateway" flow on the board: top edges aligned, the loop-back arrow no longer pokes past the frame, sticky notes vertically centered. Tweak colors and copy right on the canvas.',
      effect: 'add_flow_nodes',
    },
    {
      id: 'brainstorm',
      label: 'Brainstorm angles',
      prompt: 'Spark ideas from my notes & backlinks',
      module: 'notes',
      operations: [
        { type: 'search', label: 'Searched notes', target: '"Learning" "Creator"', duration: '678ms' },
        { type: 'read', label: 'Read note', target: 'Original Books Rea…', duration: '58ms' },
      ],
      reply: 'Writing is not the final output — it is the base act of intellectual work. Crossing "retry storms" with "writing without slop": 1) idempotency as reusable arguments; 2) an anti-AI-illustration manifesto; 3) open with a failed refactoring post-mortem.',
      effect: 'highlight_note',
    },
    {
      id: 'insert',
      label: 'Insert into article',
      prompt: 'Export the board and insert at cursor',
      module: 'notes',
      operations: [
        { type: 'tool', label: 'Called', target: 'export_board(png, 2x)', duration: '0.9s' },
        { type: 'tool', label: 'Called', target: 'insert_at_cursor', duration: '0.2s' },
      ],
      reply: 'Exported a crisp PNG into your vault assets folder and stamped the Markdown reference at the cursor. One second, no app-switching.',
      effect: 'insert_image',
    },
  ],
};
