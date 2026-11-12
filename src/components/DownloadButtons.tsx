import { useEffect, useState } from 'react';
import { ArrowDownToLine, Apple, AppWindow, Terminal } from 'lucide-react';
import {
  detectPlatform,
  detectMacArchAsync,
  fetchLatestRelease,
  resolveAssetFor,
  RELEASES_PAGE,
  downloadI18n,
  type Platform,
  type MacArch,
} from '../data/download';
import type { Lang } from '../data/i18n';

interface Props {
  lang: Lang;
}

export default function DownloadButtons({ lang }: Props) {
  const d = downloadI18n[lang];
  const [platform, setPlatform] = useState<Platform>('other');
  const [arch, setArch] = useState<MacArch>('arm64');
  const [version, setVersion] = useState('');
  const [assetUrl, setAssetUrl] = useState(RELEASES_PAGE);

  useEffect(() => {
    let cancelled = false;
    const p = detectPlatform();
    setPlatform(p);

    (async () => {
      const a = p === 'mac' ? await detectMacArchAsync() : 'arm64';
      if (cancelled) return;
      setArch(a);

      const release = await fetchLatestRelease();
      if (cancelled) return;
      if (release?.tag_name) {
        setVersion(release.tag_name);
        const resolved = resolveAssetFor(release, p, a);
        if (resolved) setAssetUrl(resolved.url);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const meta =
    platform === 'mac'
      ? { label: arch === 'arm64' ? d.macSilicon : d.macIntel, icon: Apple }
      : platform === 'windows'
        ? { label: d.windows, icon: AppWindow }
        : platform === 'linux'
          ? { label: d.linux, icon: Terminal }
          : null;

  const Icon = meta ? meta.icon : ArrowDownToLine;
  const label = meta ? `${lang === 'zh' ? '下载' : 'Download'} ${meta.label}` : d.default;

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <a
        href={assetUrl}
        className="group inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90 hover:shadow-md"
      >
        <Icon size={16} className="transition-transform group-hover:translate-y-0.5" />
        {label}
      </a>
      <a
        href={RELEASES_PAGE}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        {d.allPlatforms}
      </a>
      {version && (
        <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {version}
        </span>
      )}
    </div>
  );
}
