import React, { useEffect, useState } from 'react';
import { Check, Download, Terminal } from 'lucide-react';
import {
  detectPlatform,
  detectMacArch,
  detectMacArchAsync,
  fetchLatestRelease,
  getDefaultDownloadItems,
  parseDownloadItemsFromRelease,
  triggerDirectDownload,
  downloadI18n,
  FALLBACK_RELEASE_VERSION,
  type DownloadItem,
  type Platform,
  type MacArch,
} from '../data/download';
import type { Lang } from '../data/i18n';

// Official Apple bitten apple silhouette SVG
function AppleLogo({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.02c.67-.82 1.13-1.95.99-3.08-1 .04-2.17.67-2.86 1.48-.61.71-1.14 1.87-.99 2.98 1.12.09 2.21-.57 2.86-1.38z" />
    </svg>
  );
}

// Official Windows quad logo SVG
function WindowsLogo({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M0 3.449L9.75 2.1v9.451H0V3.449zM0 12.45h9.75v9.451L0 20.55V12.45zM10.95 1.95L24 0v11.551H10.95V1.95zM10.95 12.45H24V24l-13.05-1.95V12.45z" />
    </svg>
  );
}

interface Props {
  lang: Lang;
}

export default function PlatformDownloadCards({ lang }: Props) {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('other');
  const [currentArch, setCurrentArch] = useState<MacArch>('arm64');
  const [downloadItems, setDownloadItems] = useState<DownloadItem[]>(() => getDefaultDownloadItems(lang));
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const texts = downloadI18n[lang];
  const isZh = lang === 'zh';

  useEffect(() => {
    const detected = detectPlatform();
    setCurrentPlatform(detected);

    if (detected === 'mac') {
      const initialArch = detectMacArch();
      setCurrentArch(initialArch);
      detectMacArchAsync().then((arch) => {
        if (arch !== initialArch) setCurrentArch(arch);
      });
    }

    setDownloadItems(getDefaultDownloadItems(lang));

    let active = true;
    fetchLatestRelease().then((release) => {
      if (active && release) {
        setDownloadItems(parseDownloadItemsFromRelease(release, lang));
      }
    });

    return () => {
      active = false;
    };
  }, [lang]);

  const handleDownload = (item: DownloadItem) => {
    triggerDirectDownload(item.directUrl, item.filename);
    setDownloadingId(item.id);
    setTimeout(() => {
      setDownloadingId((prev) => (prev === item.id ? null : prev));
    }, 2400);
  };

  // Group items by platform
  const macItems = downloadItems.filter((i) => i.platform === 'mac');
  const winItems = downloadItems.filter((i) => i.platform === 'windows');
  const linuxItems = downloadItems.filter((i) => i.platform === 'linux');

  const platformsConfig = [
    {
      id: 'mac',
      title: 'macOS',
      icon: AppleLogo,
      isCurrent: currentPlatform === 'mac',
      desc: isZh ? '支持 macOS 11+ 及更高版本' : 'Supports macOS 11 and later',
      items: macItems,
    },
    {
      id: 'windows',
      title: 'Windows',
      icon: WindowsLogo,
      isCurrent: currentPlatform === 'windows',
      desc: isZh ? '支持 64 位 Windows 10 / 11' : 'Supports 64-bit Windows 10 / 11',
      items: winItems,
    },
    {
      id: 'linux',
      title: 'Linux',
      icon: ({ size = 20 }: { size?: number }) => <Terminal size={size} className="shrink-0" />,
      isCurrent: currentPlatform === 'linux',
      desc: isZh ? '提供 AppImage 与 .deb 两种安装方式' : 'Provides AppImage and .deb packages',
      items: linuxItems,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {platformsConfig.map((p) => {
        const IconComponent = p.icon;

        return (
          <div
            key={p.id}
            className={`relative flex flex-col justify-between rounded-2xl border bg-card p-5 text-left transition-all ${
              p.isCurrent
                ? 'border-foreground/30 shadow-sm ring-1 ring-foreground/20'
                : 'border-border shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground">
                  <IconComponent size={20} />
                </div>

                {p.isCurrent ? (
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {texts.currentRecommended}
                  </span>
                ) : p.id === 'mac' ? (
                  <span className="rounded-full bg-muted border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {isZh ? '主流推荐' : 'Popular'}
                  </span>
                ) : null}
              </div>

              {/* Title & Desc */}
              <h3 className="text-base font-bold tracking-tight text-foreground">{p.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>

            {/* Action Buttons for this Platform */}
            <div className="mt-5 space-y-2 pt-3.5 border-t border-border/70">
              {p.items.map((item) => {
                const isRecommendedItem =
                  p.isCurrent &&
                  (p.id !== 'mac' || item.arch === currentArch);
                const isDownloading = downloadingId === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleDownload(item)}
                    className={`group flex w-full cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 text-left transition active:scale-[0.99] ${
                      isRecommendedItem
                        ? 'border-primary bg-primary text-primary-foreground shadow-2xs hover:opacity-90'
                        : 'border-border bg-muted/40 hover:bg-muted text-foreground'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-semibold block leading-tight">
                          {item.name}
                        </span>
                        {isRecommendedItem && !isDownloading && (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                      </div>
                      <span
                        className={`truncate text-[10px] block mt-0.5 ${
                          isRecommendedItem ? 'text-primary-foreground/75' : 'text-muted-foreground'
                        }`}
                      >
                        {item.desc}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pl-1">
                      <span
                        className={`font-mono text-[9px] px-1.5 py-0.5 rounded border ${
                          isRecommendedItem
                            ? 'bg-white/10 border-white/20 text-primary-foreground'
                            : 'bg-card border-border text-muted-foreground'
                        }`}
                      >
                        {item.tag}
                      </span>
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-md transition ${
                          isRecommendedItem
                            ? 'bg-white/20 text-primary-foreground'
                            : 'bg-card border border-border text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground'
                        }`}
                      >
                        {isDownloading ? (
                          <Check size={12} className="text-emerald-400" />
                        ) : (
                          <Download size={12} />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

