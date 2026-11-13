import { useState } from 'react';
import type { Lang } from '../../data/i18n';
import {
  ArrowDownToLine, ArrowUpFromLine, ChevronRight, Crop, FileImage,
  ImagePlus, Maximize2, Play, Search, Sparkles, Upload, WandSparkles, Zap,
} from 'lucide-react';

export type ToolWorkspaceId = 'images' | 'skills';

interface Props {
  lang: Lang;
  view: ToolWorkspaceId;
}

const imageTools = [
  { icon: ArrowDownToLine, zh: '批量图片压缩', en: 'Batch compression', descZh: '自由调节压缩率与输出格式，极速完成。', descEn: 'Tune quality and formats for smaller images.', tagZh: '常用', tagEn: 'Popular' },
  { icon: Maximize2, zh: '批量修改尺寸', en: 'Batch resize', descZh: '按比例缩放，预设公众号与小红书尺寸。', descEn: 'Resize by ratio or use social presets.', tagZh: '高频', tagEn: 'Frequent' },
  { icon: Crop, zh: '批量图片裁剪', en: 'Batch crop', descZh: '统一裁切为 1:1、4:3、16:9 或 3:4。', descEn: 'Crop consistently to common aspect ratios.' },
  { icon: WandSparkles, zh: '智能自动抠图', en: 'Smart cutout', descZh: '精准识别主体，自动剥离复杂背景。', descEn: 'Isolate subjects from complex backgrounds.', tagZh: 'AI', tagEn: 'AI' },
  { icon: Sparkles, zh: '图片变高清', en: 'Image upscaling', descZh: '针对模糊图片进行 2x / 4x 深度超分。', descEn: 'Restore soft images with 2x / 4x upscaling.', tagZh: 'AI', tagEn: 'AI' },
];

const skills = [
  { name: 'anatomy', zh: '用精细的等距 SVG 图解复杂技术概念。', en: 'Explain technical ideas with detailed isometric SVG.' },
  { name: 'archify', zh: '创建架构、工作流与数据流可视化。', en: 'Create architecture, workflow and data-flow visuals.' },
  { name: 'article-to-video', zh: '把中文文章自动制作成竖屏口播短视频。', en: 'Turn Chinese articles into vertical talking videos.' },
  { name: 'baikou-style-video', zh: '生成带标题、配图与高亮字幕的口播视频。', en: 'Build narrated videos with images and live captions.' },
  { name: 'agents-sdk', zh: '构建、调试与审查 Agents SDK 应用。', en: 'Build, debug and review Agents SDK applications.' },
  { name: 'diagram-design', zh: '设计品牌图表、流程图与架构图。', en: 'Design branded charts, flows and architecture diagrams.' },
];

function ImageTools({ zh }: { zh: boolean }) {
  const [selectedTool, setSelectedTool] = useState(0);
  return (
    <div className="flex h-full bg-white dark:bg-zinc-950/30">
      <aside className="hidden w-36 shrink-0 border-r border-black/[0.05] p-2 dark:border-white/[0.06] sm:block">
        <p className="px-1.5 pb-2 pt-1 text-[10px] font-semibold">{zh ? '图片工具箱' : 'Image toolbox'}</p>
        <div className="mb-2 flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1.5 text-[8px] text-muted-foreground/70"><Search size={9} />{zh ? '搜索图片处理功能…' : 'Search tools…'}</div>
        <div className="space-y-1.5">
          {imageTools.map((tool, index) => (
            <button type="button" key={tool.en} aria-pressed={selectedTool === index} onClick={() => setSelectedTool(index)} className={`w-full rounded-lg border border-black/[0.045] p-2 text-left transition-colors dark:border-white/[0.06] ${selectedTool === index ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'bg-white hover:bg-muted/60 dark:bg-transparent'}`}>
              <span className="flex items-center gap-1.5 text-[9px] font-medium"><tool.icon size={10} /><span className="truncate">{zh ? tool.zh : tool.en}</span><ChevronRight size={8} className="ml-auto" /></span>
              <span className={`mt-1 line-clamp-2 text-[7px] leading-3 ${selectedTool === index ? 'text-white/60 dark:text-zinc-500' : 'text-muted-foreground/70'}`}>{zh ? tool.descZh : tool.descEn}</span>
            </button>
          ))}
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-9 items-center gap-2 border-b border-black/[0.05] px-3 dark:border-white/[0.06]">
          <span className="text-[10px] font-semibold">{zh ? imageTools[selectedTool].zh : imageTools[selectedTool].en}</span>
          <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[7px] text-muted-foreground dark:bg-white/[0.06]">{zh ? '本地处理' : 'Local'}</span>
          <button type="button" className="ml-auto inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[8px]"><ImagePlus size={9} />{zh ? '从笔记选择' : 'From notes'}</button>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-[1fr_142px]">
          <div className="flex items-center justify-center p-4">
            <div className="flex h-full w-full flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50/45 text-center dark:border-zinc-700 dark:bg-white/[0.015]">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.05] bg-white text-muted-foreground shadow-sm dark:border-white/[0.08] dark:bg-white/[0.04]"><Upload size={17} /></div>
              <p className="text-[10px] font-medium">{zh ? '拖拽图片至此处，或从笔记中挑选' : 'Drop images here, or choose from notes'}</p>
              <p className="mt-1.5 max-w-56 text-[8px] leading-4 text-muted-foreground/70">{zh ? '支持批量处理 PNG、JPG、WebP，完成后可一键存回 Obsidian。' : 'Batch process PNG, JPG and WebP, then save back to Obsidian.'}</p>
              <button type="button" className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-[8px] text-white dark:bg-zinc-100 dark:text-zinc-900"><FileImage size={10} />{zh ? '选择图片' : 'Choose images'}</button>
            </div>
          </div>
          <aside className="hidden border-l border-black/[0.05] p-3 md:block dark:border-white/[0.06]">
            <p className="text-[9px] font-semibold">{zh ? '处理参数配置' : 'Output settings'}</p>
            <div className="mt-4 flex items-center justify-between text-[8px]"><span>{zh ? '压缩质量' : 'Quality'}</span><span className="font-mono">80%</span></div>
            <div className="mt-2 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700"><div className="h-full w-4/5 rounded-full bg-zinc-800 dark:bg-zinc-200" /></div>
            <p className="mt-5 text-[8px] font-medium">{zh ? '输出图片格式' : 'Image format'}</p>
            <div className="mt-2 flex items-center justify-between rounded-md border border-border px-2 py-1.5 text-[8px] text-muted-foreground">{zh ? '保持原始格式' : 'Original format'}<ChevronRight size={8} /></div>
            <button type="button" className="mt-6 flex w-full items-center justify-center gap-1 rounded-md bg-zinc-900 py-2 text-[8px] text-white dark:bg-zinc-100 dark:text-zinc-900"><Play size={9} fill="currentColor" />{zh ? '开始批量处理' : 'Start processing'}</button>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SkillLibrary({ zh }: { zh: boolean }) {
  const [source, setSource] = useState('all');
  const sources = [
    { id: 'all', label: zh ? '全部来源' : 'All' },
    { id: 'agents', label: 'Agents' },
    { id: 'codex', label: 'Codex' },
    { id: 'claude', label: 'Claude' },
    { id: 'builtin', label: 'Built-in' },
  ];
  const visibleSkills = source === 'all' || source === 'agents'
    ? skills
    : skills.filter((_, index) => index % 3 === ['codex', 'claude', 'builtin'].indexOf(source));
  return (
    <div className="flex h-full flex-col bg-zinc-50/45 dark:bg-zinc-950/30">
      <div className="flex h-9 items-center gap-2 border-b border-black/[0.05] bg-white px-3 dark:border-white/[0.06] dark:bg-zinc-950/30">
        <Zap size={11} className="text-amber-500" />
        <span className="text-[10px] font-semibold">{zh ? '智能体技能库' : 'Agent Skills'}</span>
        <span className="text-[8px] text-muted-foreground">209</span>
        <div className="ml-auto flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[8px] text-muted-foreground"><Search size={9} />{zh ? '搜索技能名称、描述或标签…' : 'Search skills…'}</div>
        <button type="button" className="rounded-md bg-zinc-900 px-2 py-1 text-[8px] text-white dark:bg-zinc-100 dark:text-zinc-900">+ {zh ? '安装技能' : 'Install'}</button>
      </div>
      <div className="flex items-center gap-1.5 border-b border-black/[0.04] bg-white px-3 py-2 dark:border-white/[0.05] dark:bg-zinc-950/30">
        {sources.map((item) => <button type="button" key={item.id} aria-pressed={source === item.id} onClick={() => setSource(item.id)} className={`rounded-full px-2 py-1 text-[8px] ${source === item.id ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'border border-border text-muted-foreground'}`}>{item.label}</button>)}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-2 overflow-y-auto p-3 lg:grid-cols-3">
        {visibleSkills.map((skill) => (
          <button type="button" key={skill.name} className="rounded-lg border border-black/[0.055] bg-white p-2.5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.025)] transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/[0.07] dark:bg-white/[0.025]">
            <span className="flex items-center gap-1.5"><span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-50 text-amber-500 dark:bg-amber-400/10"><Zap size={10} /></span><span className="truncate text-[9px] font-semibold">{skill.name}</span><span className="ml-auto text-muted-foreground/40">···</span></span>
            <span className="mt-2 line-clamp-2 h-6 text-[8px] leading-3 text-muted-foreground">{zh ? skill.zh : skill.en}</span>
            <span className="mt-2 flex items-center justify-between border-t border-border/70 pt-1.5 text-[7px] text-muted-foreground/60"><span>Agents</span><span className="inline-flex items-center gap-1">{zh ? '查看指南' : 'Guide'}<ArrowUpFromLine size={8} /></span></span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ToolWorkspace({ lang, view }: Props) {
  return view === 'images' ? <ImageTools zh={lang === 'zh'} /> : <SkillLibrary zh={lang === 'zh'} />;
}
