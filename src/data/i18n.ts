export type Lang = 'zh' | 'en';

export const GITHUB = 'https://github.com/chenxi2015/aitower';
export const RELEASES_REPO = 'https://github.com/chenxi2015/aitower-releases';
export const RELEASES = `${RELEASES_REPO}/releases/latest`;

/** Prefix an in-site path with the locale (zh is served at root). */
export const href = (lang: Lang, path = '') => (lang === 'zh' ? `/${path}` : `/en/${path}`);

export const t = {
  zh: {
    meta: {
      title: 'aitower — 基于 Obsidian 的 AI 创作与配图工作台',
      desc: '去 AI 味的思想脚手架：读取你的 Obsidian 笔记，AI 协助发散与扩写，创作台手绘风配图一键插入文章。',
    },
    nav: {
      features: '功能',
      workflow: '工作流',
      changelog: '更新日志',
      github: 'GitHub',
      download: '下载',
    },
    hero: {
      badge: '基于 Obsidian 本地生态 · 本地优先 · 不破坏原文件',
      titleA: '去 AI 味的',
      titleHighlight: '思想脚手架',
      titleB: '手绘风配图与架构',
      sub: 'aitower 读取你 Obsidian 里沉睡的笔记碎片，AI 帮你发散、推敲、扩写成有温度的深度长文；创作台手绘图表，一键插入文章光标处。',
      caption: '创作台 · 三栏工作台实景（示意动效）',
    },
    features: {
      kicker: '两大业务板块',
      title: '写作与配图，不出一个窗口',
    },
    workflow: {
      kicker: '配图闭环',
      title: '从想法到插图，只需三步',
      steps: [
        { t: '唤起配图', d: '写作中点击「为本段配图」，或在右侧 Agent 唤起，创作台就地激活草稿。' },
        { t: '画板设计', d: '手绘风组件与模板拖拽即用，AI 可直接生成流程图、时序图、架构图场景。' },
        { t: '一键插入', d: '导出高清 PNG/SVG 存入资产目录，Markdown 引用自动落在光标处。' },
      ],
    },
    philosophy: {
      kicker: '为什么「半手搓」',
      titleA: 'AI 不做流水线甩手掌柜，',
      titleHighlight: '而是对话式的思想脚手架。',
      desc: '在 AI 垃圾与塑料感假图泛滥的时代，带有作者真实思考轨迹与审美品味的「半手搓」内容，才是最高阶的资产。文章由你把控打磨，配图是逻辑的直接外化。',
    },
    cta: {
      title: '开始你的第一篇深度长文',
      desc: '免费下载，支持 macOS / Windows / Linux。连接你的 Obsidian Vault，即刻开写。',
    },
    footer: {
      tagline: '去 AI 味，半手搓',
      releases: '发布仓库',
      changelog: '更新日志',
    },
    downloadPage: {
      title: '下载 aitower',
      sub: '本地优先，免费使用。客户端内置自更新，一次安装持续保持最新。',
      bridgeNoteA: '所有安装包均由 GitHub Actions 构建并托管于',
      bridgeNoteB: '公开仓库，附',
      bridgeNoteC: '校验文件。',
      recommended: '推荐',
    },
    changelogPage: {
      title: '更新日志',
      sub: '每个版本，都让「半手搓」更顺手一点。',
      current: '当前版本',
      historyA: '完整历史版本见',
    },
  },
  en: {
    meta: {
      title: 'aitower — AI writing & illustration workbench for Obsidian',
      desc: 'A thinking scaffold without the AI slop: aitower reads your Obsidian notes, helps you brainstorm and expand, and drops hand-drawn diagrams into your article with one click.',
    },
    nav: {
      features: 'Features',
      workflow: 'Workflow',
      changelog: 'Changelog',
      github: 'GitHub',
      download: 'Download',
    },
    hero: {
      badge: 'Built on your local Obsidian vault · Local-first · Your files stay yours',
      titleA: 'A thinking scaffold',
      titleHighlight: 'without the AI slop',
      titleB: 'Hand-drawn diagrams & architecture',
      sub: 'aitower wakes up the notes sleeping in your Obsidian vault. AI helps you brainstorm, argue and expand them into deep long-form writing; the studio board draws hand-crafted diagrams that drop straight into your draft.',
      caption: 'Studio · the real three-pane workbench (animated mock)',
    },
    features: {
      kicker: 'Two core modules',
      title: 'Writing and illustrating, in one window',
    },
    workflow: {
      kicker: 'The illustration loop',
      title: 'From idea to figure in three steps',
      steps: [
        { t: 'Summon', d: 'While writing, hit "illustrate this section" or ask the side-panel Agent — the studio board activates with a draft in place.' },
        { t: 'Design', d: 'Hand-drawn components and templates, drag and drop. AI can draft flowcharts, sequence diagrams and architecture scenes directly.' },
        { t: 'Insert', d: 'Export a crisp PNG/SVG into your vault assets folder; the Markdown reference lands exactly at your cursor.' },
      ],
    },
    philosophy: {
      kicker: 'Why "human-crafted hybrid"',
      titleA: 'AI is not an assembly-line ghostwriter,',
      titleHighlight: 'but a conversational thinking scaffold.',
      desc: 'In an era flooded with AI slop and plastic-looking fake imagery, content carrying the author\'s real thinking and taste is the highest-order asset. You keep the pen; the diagram is your logic made visible.',
    },
    cta: {
      title: 'Start your first deep long-form piece',
      desc: 'Free download for macOS / Windows / Linux. Point it at your Obsidian vault and write.',
    },
    footer: {
      tagline: 'No AI slop. Human-crafted hybrid.',
      releases: 'Releases repo',
      changelog: 'Changelog',
    },
    downloadPage: {
      title: 'Download aitower',
      sub: 'Local-first and free. The client ships with a built-in self-updater — install once, stay current.',
      bridgeNoteA: 'All installers are built by GitHub Actions and hosted on the public',
      bridgeNoteB: 'repo, with a',
      bridgeNoteC: 'checksum file.',
      recommended: 'Recommended',
    },
    changelogPage: {
      title: 'Changelog',
      sub: 'Every release makes the human-crafted hybrid a little smoother.',
      current: 'Current',
      historyA: 'Full release history on',
    },
  },
} as const;
