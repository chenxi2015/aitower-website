# aitower 官网 — 架构与风格方案

> 目标：为 aitower（基于 Obsidian 本地生态的 AI 创作与配图增强工作台）搭建官方网站，风格与 App 本体的「清爽、手作温度、去 AI 味」完全一致。

---

## 一、 技术栈定案

| 层 | 选型 | 理由 |
|---|---|---|
| 框架 | **Astro 5**（SSG 静态输出） | 官网以内容展示为主，Astro 默认零 JS、可局部「岛屿化」交互，SEO 友好，构建即纯静态 HTML |
| 交互岛屿 | **React 18**（仅下载按钮、主题切换等需要处） | 与 App 技术栈同源，组件语言可直接复用 |
| 样式 | **原生 Tailwind CSS v4**（`@tailwindcss/vite`） | 与 App 完全一致，直接搬运 design tokens |
| 字体 | **Geist Variable**（`@fontsource-variable/geist`） + 系统中文字体栈 | 与 App 同款字体，中英文混排一致 |
| 图标 | **lucide-react** | 与 App 一致 |
| 内容 | Astro Content Collections（Markdown/MDX） | 更新日志、博客直接用 `.md` 编写，契合「Markdown 原生」气质 |
| 部署 | 静态托管（Cloudflare Pages / Vercel / GitHub Pages 均可） | 产物纯静态，无服务端依赖 |
| 下载分发 | `chenxi2015/aitower-releases` 公开仓库 Release 直链 | 与自更新 Bridge Repo 架构对齐，无需后端 |

> 不选 Next.js：官网无服务端渲染刚需，Astro 更轻、更快、产物更小。
> 不引入 UI 组件库：延续 App「原生 HTML + Tailwind」准则。

---

## 二、 设计语言（与 App 严格同源）

### 1. Design Tokens（直接从 `frontend/src/index.css` 搬运）

```css
@theme inline {
  --font-sans: 'Geist Variable', -apple-system, BlinkMacSystemFont,
    "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC",
    system-ui, sans-serif;

  /* 中性色阶：zinc 系（App 主色） */
  --color-zinc-750: #303036;
  --color-zinc-850: #202024;

  /* shadcn 语义层（与 App 同一套 oklch） */
  --background: oklch(1 0 0);        /* 纯白底 */
  --foreground: oklch(0.145 0 0);    /* 近黑文字 */
  --muted: oklch(0.97 0 0);          /* 浅灰分区底 */
  --muted-foreground: oklch(0.556 0 0);
  --border: oklch(0.922 0 0);        /* 1px 细边框 */
  --primary: oklch(0.205 0 0);       /* 黑按钮 */
  --radius: 0.625rem;
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* 与 App dark 完全一致 */
}
```

### 2. 视觉关键词
- **白底 + zinc 灰阶 + 1px 细边框 + 微阴影**（`shadow-2xs`），干净克制；
- **圆角语言**：`rounded-xl` 卡片、`rounded-full` 胶囊标签与按钮；
- **手绘风点缀**：Hero 与功能插图直接使用 App 创作台导出的 Excalidraw 手绘架构图 PNG/SVG——「去 AI 味」的品牌资产，绝无塑料感 AI 插图；
- **点缀色**：克制的单色强调（App selection 用 indigo `#6366f1`）；便签卡片的 pastel 黄/蓝/粉/绿取自创作台素材色系，仅小面积使用；
- **真实产品截图**（带 macOS 三灯窗口框）作为核心视觉，而非 mockup；
- **暗色模式**：`.dark` class 切换，跟随系统 + 手动开关，tokens 与 App 一致。

### 3. 组件语言（复刻 App 微观细节）
- 分段 Tab 组（`seg-tab-group`）：用于「笔记 / 创作」双模块切换展示；
- 胶囊 Badge：`v0.1.9`、`macOS · Windows · Linux`；
- 卡片：`bg-card border border-border rounded-xl shadow-2xs hover:shadow-sm transition`；
- 按钮：主按钮黑底白字 `rounded-full`，次按钮 `border` 幽灵样式；
- 6px 极简滚动条、统一 `border-color: zinc-200`。

---

## 三、 站点结构与页面规划

```
/                       首页（Hero + 核心卖点 + 双模块展示 + 截图 + 下载 CTA）
/features               功能总览（笔记工作台 / 创作台 / AI Agent 三大块深挖）
/download               下载页（macOS arm64/x64、Windows x64、Linux x64，直链 GitHub Release）
/changelog              更新日志（Content Collections 驱动，/changelog/v0-1-9）
/blog                   博客/深度文章（二期可选：创作方法论、「去 AI 味」理念）
/docs                   使用文档（二期可选：快速上手、FAQ）
```

### 首页信息架构（自上而下）
1. **Navbar**：logo + 功能 / 下载 / 更新日志 / GitHub，右侧暗色切换 + 下载 CTA；
2. **Hero**：slogan（如「去 AI 味的思想脚手架，手绘风配图与架构」）+ 副文案 + 下载按钮（自动识别平台）+ 真实 App 截图（创作台三栏截图，带窗口框与微浮起阴影）；
3. **黄金三场景**：科学研究 / 自媒体长文 / 高阶学习笔记 三卡片；
4. **双模块展示**：「笔记」与「创作」用 seg-tab 切换，各配截图 + 3-4 个卖点；
5. **配图闭环链路**：1→2→3 步骤条（唤起配图 → 画板设计 → 一键插入文章），配 Excalidraw 手绘流程图；
6. **AI Agent 能力**：灵感发散 / 混合推理 / 结构化扩写 / 图表生成；
7. **去 AI 味理念区**：一段话 + 对比（AI Slop vs 半手搓）；
8. **下载区**：平台卡片（从 `aitower-releases` Release 拉最新版本号与直链）；
9. **Footer**：GitHub、邮箱、版权、版本号。

---

## 四、 目录结构

```
aitower-website/
├── astro.config.mjs          # Astro + React + Tailwind v4
├── package.json
├── public/
│   ├── screenshots/          # App 真实截图（亮色/暗色各一套）
│   ├── diagrams/             # Excalidraw 导出的手绘 SVG/PNG
│   └── favicon.svg           # 复用 appicon.svg
├── src/
│   ├── styles/
│   │   └── global.css        # 搬运 App design tokens
│   ├── content/
│   │   ├── changelog/        # v0.1.9.md …
│   │   └── blog/
│   ├── components/
│   │   ├── Navbar.astro
│   │   ├── Footer.astro
│   │   ├── Hero.astro
│   │   ├── ScreenshotFrame.astro   # macOS 三灯窗口框容器
│   │   ├── FeatureCard.astro
│   │   ├── SegTab.astro            # 复刻 App 分段 Tab
│   │   ├── DownloadButtons.tsx     # React 岛屿：识别 UA 推荐安装包
│   │   └── ThemeToggle.tsx         # React 岛屿：暗色切换
│   ├── layouts/
│   │   └── BaseLayout.astro  # <html> 骨架、字体、SEO meta、OG
│   └── pages/
│       ├── index.astro
│       ├── features.astro
│       ├── download.astro
│       └── changelog/
│           ├── index.astro
│           └── [slug].astro
└── PLAN.md                   # 本文件
```

---

## 五、 内容策略与品牌语气

- **文案一律中文为主**（代码/命令保留英文），语气克制、有思考温度，杜绝「赋能/抓手/颠覆」式套话——官网本身就要是「去 AI 味」的示范；
- slogan 候选：
  - 「去 AI 味的思想脚手架，手绘风配图与架构」
  - 「把沉睡的 Obsidian 笔记，写成有温度的深度长文」
- 截图全部用真实 App 画面；插图全部用创作台自产的手绘图（吃自己狗粮）；
- 版本与下载链接与 `chenxi2015/aitower-releases` 公开仓库对齐：构建期拉取 `https://api.github.com/repos/chenxi2015/aitower-releases/releases/latest` 生成静态数据（带降级兜底），彻底免 Token、免后端。

---

## 六、 实施里程碑

| 阶段 | 内容 | 产出 |
|---|---|---|
| M1 | Astro 脚手架 + Tailwind v4 + tokens 搬运 + BaseLayout + Navbar/Footer | 可运行的白底站点骨架 |
| M2 | 首页全区块（Hero / 三场景 / 双模块 seg-tab / 闭环步骤 / AI 能力 / 理念 / 下载） | 完整首页 |
| M3 | 下载页 + GitHub Release 直链 + 暗色模式完善 | 可发布下载 |
| M4 | 更新日志 Collections + 首个 changelog 条目（v0.1.9） | 内容管线打通 |
| M5 | SEO（OG / sitemap / rss）+ 部署上线 | 正式对外 |

素材缺口：需要 App 亮色/暗色高清截图 4-6 张、2-3 张创作台导出的手绘架构图 SVG。
