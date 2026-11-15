import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { GITHUB_API_RELEASES, type GitHubRelease } from '../data/download';
import { RELEASES, t, type Lang } from '../data/i18n';

interface Props {
  lang: Lang;
}

interface CachedReleases {
  time: number;
  data: GitHubRelease[];
}

type LoadState = 'loading' | 'loaded' | 'error';

const CACHE_KEY = 'aitower_changelog_releases_v1';
const CACHE_TTL = 10 * 60 * 1000;

function isGitHubRelease(value: unknown): value is GitHubRelease {
  return (
    typeof value === 'object' &&
    value !== null &&
    'tag_name' in value &&
    typeof value.tag_name === 'string' &&
    'assets' in value &&
    Array.isArray(value.assets)
  );
}

function isCachedReleases(value: unknown): value is CachedReleases {
  return (
    typeof value === 'object' &&
    value !== null &&
    'time' in value &&
    typeof value.time === 'number' &&
    'data' in value &&
    Array.isArray(value.data) &&
    value.data.every(isGitHubRelease)
  );
}

function readCache(): GitHubRelease[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const cached: unknown = JSON.parse(raw);
    if (!isCachedReleases(cached) || Date.now() - cached.time >= CACHE_TTL) return null;
    return cached.data;
  } catch (error) {
    console.warn('Unable to read cached GitHub releases', error);
    return null;
  }
}

function writeCache(data: GitHubRelease[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), data }));
  } catch (error) {
    console.warn('Unable to cache GitHub releases', error);
  }
}

function formatDate(value: string | null | undefined, lang: Lang) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export default function ChangelogReleases({ lang }: Props) {
  const copy = t[lang].changelogPage;
  const [releases, setReleases] = useState<GitHubRelease[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');

  useEffect(() => {
    const controller = new AbortController();

    const loadReleases = async () => {
      const cached = readCache();
      if (cached) {
        setReleases(cached);
        setLoadState('loaded');
        return;
      }

      try {
        const response = await fetch(GITHUB_API_RELEASES, {
          headers: { Accept: 'application/vnd.github+json' },
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`GitHub Releases API returned ${response.status}`);
        }

        const payload: unknown = await response.json();
        if (!Array.isArray(payload)) {
          throw new Error('GitHub Releases API returned an invalid response');
        }

        const nextReleases = payload.filter(isGitHubRelease).filter((release) => !release.draft);
        setReleases(nextReleases);
        setLoadState('loaded');
        writeCache(nextReleases);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Unable to load GitHub releases', error);
        setLoadState('error');
      }
    };

    void loadReleases();
    return () => controller.abort();
  }, []);

  if (loadState === 'loading') {
    return <p className="text-sm text-muted-foreground" aria-live="polite">{copy.loading}</p>;
  }

  if (loadState === 'error') {
    return (
      <p className="text-sm text-muted-foreground" role="alert">
        {copy.loadError}{' '}
        <a
          href={RELEASES}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-foreground underline decoration-zinc-300 underline-offset-4 hover:decoration-foreground"
        >
          GitHub Releases
        </a>
      </p>
    );
  }

  if (releases.length === 0) {
    return <p className="text-sm text-muted-foreground">{copy.empty}</p>;
  }

  const currentRelease = releases.find((release) => !release.prerelease);

  return (
    <div className="space-y-10">
      {releases.map((release) => {
        const date = formatDate(release.published_at, lang);
        const isCurrent = release.tag_name === currentRelease?.tag_name;

        return (
          <article key={release.tag_name} className="relative border-l-2 border-border pl-8">
            <span className="absolute top-1 -left-[7px] h-3 w-3 rounded-full border-2 border-background bg-foreground" />
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight">
                {release.name?.trim() || release.tag_name}
              </h2>
              {isCurrent && (
                <span className="rounded-full bg-note-green/70 px-2 py-0.5 text-[10px] font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300">
                  {copy.current}
                </span>
              )}
              {date && <time className="text-xs text-muted-foreground">{date}</time>}
            </div>
            <div className="mt-4 text-sm leading-relaxed text-muted-foreground">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h3 className="mb-3 text-sm font-semibold text-foreground">{children}</h3>,
                  h2: ({ children }) => <h3 className="mb-3 text-sm font-semibold text-foreground">{children}</h3>,
                  h3: ({ children }) => <h3 className="mb-3 text-sm font-semibold text-foreground">{children}</h3>,
                  p: ({ children }) => <p className="mt-3 first:mt-0">{children}</p>,
                  ul: ({ children }) => <ul className="mt-3 list-disc space-y-2 pl-5">{children}</ul>,
                  ol: ({ children }) => <ol className="mt-3 list-decimal space-y-2 pl-5">{children}</ol>,
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-foreground underline decoration-zinc-300 underline-offset-4 hover:decoration-foreground"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {release.body?.trim() || copy.noNotes}
              </ReactMarkdown>
            </div>
          </article>
        );
      })}
    </div>
  );
}
