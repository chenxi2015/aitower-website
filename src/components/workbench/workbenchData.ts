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
      id: 'research',
      name: '研究调研',
      notes: [
        { id: 'n1', title: '重试风暴与幂等设计' },
        { id: 'n2', title: 'RAG 评估清单' },
        { id: 'n3', title: '论文笔记 · RETRO' },
      ],
    },
    {
      id: 'essays',
      name: '专栏草稿',
      notes: [
        { id: 'n4', title: '去 AI 味的写作', tag: '进行中' },
        { id: 'n5', title: '我的 2026 工具箱' },
      ],
    },
    {
      id: 'assets',
      name: '资产图片',
      notes: [{ id: 'n6', title: '架构演进图.excalidraw' }],
    },
  ],
  en: [
    {
      id: 'research',
      name: 'Research',
      notes: [
        { id: 'n1', title: 'Retry storms & idempotency' },
        { id: 'n2', title: 'RAG evaluation checklist' },
        { id: 'n3', title: 'Paper notes · RETRO' },
      ],
    },
    {
      id: 'essays',
      name: 'Column drafts',
      notes: [
        { id: 'n4', title: 'Writing without AI slop', tag: 'drafting' },
        { id: 'n5', title: 'My 2026 toolbox' },
      ],
    },
    {
      id: 'assets',
      name: 'Assets',
      notes: [{ id: 'n6', title: 'architecture-evolution.excalidraw' }],
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
      label: '为本段配图',
      prompt: '为「重试风暴与幂等设计」这一节生成一张手绘风流程图',
      module: 'studio',
      operations: [
        { type: 'read', label: 'read_vault_file(重试风暴与幂等设计.md)', duration: '0.8s' },
        { type: 'tool', label: 'draft_studio_board(type=flowchart)', duration: '2.4s' },
      ],
      reply: '已读取该节的论证结构，在画板上起草了一张「请求 → 重试 → 幂等网关」的手绘流程图。你可以直接在画布上微调配色和文案，满意后点「插入文章」。',
      effect: 'add_flow_nodes',
    },
    {
      id: 'brainstorm',
      label: '灵感发散',
      prompt: '基于我最近的笔记，发散三个反直觉的写作角度',
      module: 'notes',
      operations: [
        { type: 'search', label: 'search_notes(近 30 天)', duration: '1.6s' },
        { type: 'read', label: '穿透 [[双链]] 网络交叉归纳', duration: '1.9s' },
      ],
      reply: '从「重试风暴」和「去 AI 味的写作」两条线索交叉出发，建议你试试：1）把「幂等」翻译成内容创作的「可复用论证」；2）写一篇「我的反 AI 插图宣言」；3）复盘一次失败的重构作为案例开篇。',
      effect: 'highlight_note',
    },
    {
      id: 'insert',
      label: '插入文章',
      prompt: '把当前画板导出并插入到文章光标处',
      module: 'notes',
      operations: [
        { type: 'tool', label: 'export_board(format=png, scale=2x)', duration: '0.9s' },
        { type: 'tool', label: 'insert_at_cursor(![[…]])', duration: '0.2s' },
      ],
      reply: '已导出高清 PNG 到 Obsidian 资产目录，并在光标处打入引用。全程 1 秒，无需跳出。',
      effect: 'insert_image',
    },
  ],
  en: [
    {
      id: 'illustrate',
      label: 'Illustrate this section',
      prompt: 'Draft a hand-drawn flowchart for the "retry storms" section',
      module: 'studio',
      operations: [
        { type: 'read', label: 'read_vault_file(retry-storms.md)', duration: '0.8s' },
        { type: 'tool', label: 'draft_studio_board(type=flowchart)', duration: '2.4s' },
      ],
      reply: 'I read the argument structure of that section and drafted a hand-drawn "request → retry → idempotent gateway" flow on the board. Tweak colors and copy right on the canvas, then hit "insert into article".',
      effect: 'add_flow_nodes',
    },
    {
      id: 'brainstorm',
      label: 'Brainstorm angles',
      prompt: 'Brainstorm three counter-intuitive angles from my recent notes',
      module: 'notes',
      operations: [
        { type: 'search', label: 'search_notes(last 30 days)', duration: '1.6s' },
        { type: 'read', label: 'cross-correlate the [[backlink]] graph', duration: '1.9s' },
      ],
      reply: 'Crossing "retry storms" with "writing without AI slop", try: 1) translate idempotency into reusable arguments for content; 2) an anti-AI-illustration manifesto; 3) open with a failed refactoring post-mortem.',
      effect: 'highlight_note',
    },
    {
      id: 'insert',
      label: 'Insert into article',
      prompt: 'Export the current board and insert at cursor',
      module: 'notes',
      operations: [
        { type: 'tool', label: 'export_board(format=png, scale=2x)', duration: '0.9s' },
        { type: 'tool', label: 'insert_at_cursor(![[…]])', duration: '0.2s' },
      ],
      reply: 'Exported a crisp PNG into your vault assets folder and stamped the Markdown reference at the cursor. One second, no app-switching.',
      effect: 'insert_image',
    },
  ],
};
