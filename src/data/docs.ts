import { getCollection, type CollectionEntry } from 'astro:content';
import { DOC_SECTIONS, type DocSection } from '../content.config';
import { href, type Lang } from './i18n';

export type DocEntry = CollectionEntry<'docs'>;

export interface DocNavItem {
  slug: string;
  title: string;
  description: string;
  section: DocSection;
  order: number;
  badge?: string;
  href: string;
  entry: DocEntry;
}

export interface DocNavGroup {
  id: DocSection;
  label: string;
  items: DocNavItem[];
}

const SECTION_LABELS: Record<Lang, Record<DocSection, string>> = {
  zh: {
    'getting-started': '快速开始',
    notes: '笔记工作台',
    studio: '创作画板与工具',
    agent: 'AI Agent 与技能',
    guides: '最佳实践与支持',
  },
  en: {
    'getting-started': 'Getting Started',
    notes: 'Notes Workspace',
    studio: 'Studio & Tools',
    agent: 'AI Agent & Skills',
    guides: 'Guides & Support',
  },
};

/** Parse entry id (e.g. "zh/getting-started/introduction") into locale and slug. */
export function parseDocId(id: string): { lang: Lang; slug: string } | null {
  const match = id.match(/^(zh|en)\/(.+)$/);
  if (!match) return null;
  return {
    lang: match[1] as Lang,
    slug: match[2],
  };
}

/** Build the public URL for a doc slug in a given locale. */
export function docHref(lang: Lang, slug: string): string {
  return href(lang, `docs/${slug}`);
}

/** Load published docs for a locale, sorted by section order then entry order. */
export async function getDocsByLang(lang: Lang): Promise<DocNavItem[]> {
  const entries = await getCollection('docs', ({ data }) => !data.draft);
  const items: DocNavItem[] = [];

  for (const entry of entries) {
    const parsed = parseDocId(entry.id);
    if (!parsed || parsed.lang !== lang) continue;

    items.push({
      slug: parsed.slug,
      title: entry.data.title,
      description: entry.data.description,
      section: entry.data.section,
      order: entry.data.order,
      badge: entry.data.badge,
      href: docHref(lang, parsed.slug),
      entry,
    });
  }

  return items.sort((a, b) => {
    const sectionDiff = DOC_SECTIONS.indexOf(a.section) - DOC_SECTIONS.indexOf(b.section);
    if (sectionDiff !== 0) return sectionDiff;
    if (a.order !== b.order) return a.order - b.order;
    return a.slug.localeCompare(b.slug);
  });
}

/** Group sorted doc items into sidebar sections. */
export function groupDocsBySection(lang: Lang, items: DocNavItem[]): DocNavGroup[] {
  const labels = SECTION_LABELS[lang];
  const bySection = new Map<DocSection, DocNavItem[]>();

  for (const item of items) {
    const list = bySection.get(item.section) ?? [];
    list.push(item);
    bySection.set(item.section, list);
  }

  return DOC_SECTIONS.flatMap((sectionId) => {
    const sectionItems = bySection.get(sectionId);
    if (!sectionItems || sectionItems.length === 0) return [];
    return [{ id: sectionId, label: labels[sectionId], items: sectionItems }];
  });
}

/** Resolve previous and next items in reading order for the active slug. */
export function getPrevNextDocs(items: DocNavItem[], currentSlug: string): {
  prev: DocNavItem | null;
  next: DocNavItem | null;
} {
  const idx = items.findIndex((item) => item.slug === currentSlug);
  if (idx === -1) return { prev: null, next: null };

  return {
    prev: idx > 0 ? items[idx - 1] : null,
    next: idx < items.length - 1 ? items[idx + 1] : null,
  };
}

/** Resolve the target URL when toggling language on a docs page. */
export async function getSwitchLocaleDocHref(targetLang: Lang, currentSlug: string): Promise<string> {
  const targetItems = await getDocsByLang(targetLang);
  const exactMatch = targetItems.find((item) => item.slug === currentSlug);
  if (exactMatch) return exactMatch.href;
  return targetItems[0]?.href ?? href(targetLang, 'docs');
}

export interface DocsSearchRecord {
  title: string;
  description: string;
  sectionLabel: string;
  href: string;
  headings: string[];
  body: string;
}

/** Strip Markdown syntax into compact plain text for client-side search indexing. */
function stripMarkdown(raw: string): string {
  return raw
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Extract markdown h2/h3 headings for higher-priority keyword matching. */
function extractHeadings(raw: string): string[] {
  const matches = raw.matchAll(/^#{2,3}\s+(.+)$/gm);
  return Array.from(matches, (m) => m[1].trim());
}

/** Build static JSON search index entries for the specified locale. */
export async function buildDocsSearchIndex(lang: Lang): Promise<DocsSearchRecord[]> {
  const items = await getDocsByLang(lang);
  const labels = SECTION_LABELS[lang];

  return items.map((item) => {
    const rawBody = item.entry.body ?? '';
    return {
      title: item.title,
      description: item.description,
      sectionLabel: labels[item.section],
      href: item.href,
      headings: extractHeadings(rawBody),
      body: stripMarkdown(rawBody),
    };
  });
}
