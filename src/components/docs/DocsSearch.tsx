import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, FileText, Search, X } from 'lucide-react';
import type { DocsSearchRecord } from '../../data/docs';
import { t, type Lang } from '../../data/i18n';

interface Props {
  lang: Lang;
  enableShortcut?: boolean;
}

interface SearchHit {
  record: DocsSearchRecord;
  score: number;
  snippet: string;
}

const indexCache: Partial<Record<Lang, DocsSearchRecord[]>> = {};

async function loadIndex(lang: Lang): Promise<DocsSearchRecord[]> {
  const cached = indexCache[lang];
  if (cached) return cached;

  const res = await fetch(`/docs-index.${lang}.json`);
  if (!res.ok) throw new Error(`Failed to fetch docs search index (${res.status})`);
  const data = (await res.json()) as DocsSearchRecord[];
  indexCache[lang] = data;
  return data;
}

function buildSnippet(body: string, query: string, fallback: string): string {
  const lower = body.toLowerCase();
  const idx = lower.indexOf(query);
  if (idx === -1) return fallback;

  const start = Math.max(0, idx - 32);
  const end = Math.min(body.length, idx + query.length + 72);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < body.length ? '…' : '';
  return `${prefix}${body.slice(start, end)}${suffix}`;
}

function scoreRecord(record: DocsSearchRecord, q: string): SearchHit | null {
  const titleLower = record.title.toLowerCase();
  const descLower = record.description.toLowerCase();
  const bodyLower = record.body.toLowerCase();
  const matchedHeading = record.headings.find((h) => h.toLowerCase().includes(q));

  let score = 0;
  if (titleLower.includes(q)) score += 100;
  if (matchedHeading) score += 60;
  if (descLower.includes(q)) score += 40;
  if (bodyLower.includes(q)) score += 20;

  if (score === 0) return null;

  const snippet = matchedHeading
    ? `${matchedHeading} · ${record.description}`
    : buildSnippet(record.body, q, record.description);

  return { record, score, snippet };
}

export default function DocsSearch({ lang, enableShortcut = false }: Props) {
  const copy = t[lang].docsPage;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [records, setRecords] = useState<DocsSearchRecord[]>(() => indexCache[lang] ?? []);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!enableShortcut) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableShortcut]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    if (records.length === 0) {
      loadIndex(lang)
        .then((data) => {
          if (!cancelled) setRecords(data);
        })
        .catch((error) => console.warn('Unable to load docs search index', error));
    }

    const timer = window.setTimeout(() => inputRef.current?.focus(), 10);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, lang, records.length]);

  const hits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return records
      .map((record) => scoreRecord(record, q))
      .filter((hit): hit is SearchHit => hit !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [query, records]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const closeModal = () => {
    setOpen(false);
    setQuery('');
  };

  const navigateTo = (href: string) => {
    closeModal();
    window.location.href = href;
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      closeModal();
      return;
    }
    if (event.key === 'ArrowDown' && hits.length > 0) {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % hits.length);
      return;
    }
    if (event.key === 'ArrowUp' && hits.length > 0) {
      event.preventDefault();
      setActiveIndex((prev) => (prev - 1 + hits.length) % hits.length);
      return;
    }
    if (event.key === 'Enter' && hits[activeIndex]) {
      event.preventDefault();
      navigateTo(hits[activeIndex].record.href);
    }
  };

  const modal = open && typeof document !== 'undefined'
    ? createPortal(
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/35 px-4 pt-20 backdrop-blur-[2px]"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label={copy.searchPlaceholder}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
              <Search size={15} className="shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder={copy.searchModalPlaceholder}
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X size={14} />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {!query.trim() ? (
                <p className="px-3 py-8 text-center text-xs text-muted-foreground">{copy.searchEmpty}</p>
              ) : hits.length === 0 ? (
                <p className="px-3 py-8 text-center text-xs text-muted-foreground">{copy.searchNoResult}</p>
              ) : (
                <ul className="space-y-1">
                  {hits.map((hit, idx) => (
                    <li key={hit.record.href}>
                      <a
                        href={hit.record.href}
                        onClick={closeModal}
                        className={`flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                          idx === activeIndex ? 'bg-muted text-foreground' : 'hover:bg-muted/60'
                        }`}
                      >
                        <FileText size={15} className="mt-0.5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium">{hit.record.title}</span>
                            <span className="shrink-0 rounded-full border border-border px-1.5 py-px text-[10px] text-muted-foreground">
                              {hit.record.sectionLabel}
                            </span>
                          </div>
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{hit.snippet}</p>
                        </div>
                        <ArrowRight size={13} className="mt-1 shrink-0 text-muted-foreground/60" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-zinc-300 hover:text-foreground dark:hover:border-zinc-700"
      >
        <span className="inline-flex items-center gap-2 truncate">
          <Search size={13} className="shrink-0" />
          <span className="truncate">{copy.searchPlaceholder}</span>
        </span>
        <kbd className="hidden shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </button>
      {modal}
    </>
  );
}
