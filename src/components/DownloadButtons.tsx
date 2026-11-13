import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Download,
  Terminal,
} from 'lucide-react';
import {
  detectPlatform,
  detectMacArch,
  detectMacArchAsync,
  downloadI18n,
  fetchLatestRelease,
  getDefaultDownloadItems,
  parseDownloadItemsFromRelease,
  triggerDirectDownload,
  RELEASES_PAGE,
  type DownloadItem,
  type Platform,
  type MacArch,
} from '../data/download';
import type { Lang } from '../data/i18n';

// Official Apple bitten apple silhouette SVG
function AppleLogo({ size = 15, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.02c.67-.82 1.13-1.95.99-3.08-1 .04-2.17.67-2.86 1.48-.61.71-1.14 1.87-.99 2.98 1.12.09 2.21-.57 2.86-1.38z" />
    </svg>
  );
}

// Official Windows quad logo SVG
function WindowsLogo({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M0 3.449L9.75 2.1v9.451H0V3.449zM0 12.45h9.75v9.451L0 20.55V12.45zM10.95 1.95L24 0v11.551H10.95V1.95zM10.95 12.45H24V24l-13.05-1.95V12.45z" />
    </svg>
  );
}

// Platform icon selector component
function PlatformIcon({ platform, size = 15 }: { platform: Platform; size?: number }) {
  if (platform === 'mac') return <AppleLogo size={size} className="shrink-0" />;
  if (platform === 'windows') return <WindowsLogo size={size} className="shrink-0" />;
  return <Terminal size={size} className="shrink-0" />;
}

interface DownloadButtonsProps {
  lang: Lang;
  variant?: 'hero' | 'compact';
  className?: string;
}

export default function DownloadButtons({
  lang,
  variant = 'hero',
  className = '',
}: DownloadButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom');
  const [platform, setPlatform] = useState<Platform>('mac');
  const [macArch, setMacArch] = useState<MacArch>('arm64');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [downloadItems, setDownloadItems] = useState<DownloadItem[]>(() => getDefaultDownloadItems(lang));
  const containerRef = useRef<HTMLDivElement>(null);

  const texts = downloadI18n[lang];

  // Initialize client platform detection and fetch latest release
  useEffect(() => {
    const detected = detectPlatform();
    setPlatform(detected);

    if (detected === 'mac') {
      const initialArch = detectMacArch();
      setMacArch(initialArch);
      detectMacArchAsync().then((arch) => {
        if (arch !== initialArch) setMacArch(arch);
      });
    }

    setDownloadItems(getDefaultDownloadItems(lang));

    let isSubscribed = true;
    fetchLatestRelease().then((release) => {
      if (isSubscribed && release) {
        setDownloadItems(parseDownloadItemsFromRelease(release, lang));
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [lang]);

  // Dynamically compute whether to pop up or pop down based on viewport space
  const updatePlacement = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dropdownHeight = 310; // Estimated height of dropdown panel
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Flip to top if bottom space is restricted and top has more room
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      setPlacement('top');
    } else {
      setPlacement('bottom');
    }
  }, []);

  // Recalculate placement when dropdown opens or during scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    updatePlacement();
    const handleScrollOrResize = () => updatePlacement();

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize);
    };
  }, [isOpen, updatePlacement]);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Primary recommended download item based on current environment
  const primaryItem = useMemo(() => {
    if (platform === 'windows') {
      return downloadItems.find((i) => i.id === 'win-setup-exe') || downloadItems[0];
    }
    if (platform === 'linux') {
      return downloadItems.find((i) => i.platform === 'linux') || downloadItems[0];
    }
    if (platform === 'mac') {
      const targetId = macArch === 'x64' ? 'mac-x64-dmg' : 'mac-arm64-dmg';
      return downloadItems.find((i) => i.id === targetId) || downloadItems[0];
    }
    return downloadItems[0];
  }, [platform, macArch, downloadItems]);

  // Trigger download action directly without modal overlay
  const handleDownload = (item: DownloadItem) => {
    triggerDirectDownload(item.directUrl, item.filename);
    setCopiedNotification(true);
    setIsOpen(false);
    setTimeout(() => setCopiedNotification(false), 2400);
  };

  // Compute button label for recommended package
  const getPrimaryLabel = () => {
    if (platform === 'mac') {
      return macArch === 'x64' ? texts.downloadForMacIntel : texts.downloadForMacArm;
    }
    if (platform === 'windows') return texts.downloadForWindows;
    if (platform === 'linux') return texts.downloadForLinux;
    return texts.downloadDefault;
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      updatePlacement();
    }
    setIsOpen((prev) => !prev);
  };

  const isCompact = variant === 'compact';

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${isOpen ? 'z-40' : 'z-20'} ${className}`}
    >
      {/* Split Button Container */}
      <div className="inline-flex items-center rounded-full bg-primary text-primary-foreground shadow-sm transition hover:opacity-95 p-1">
        {/* Main Action Button: Click to directly download recommended package */}
        <button
          type="button"
          onClick={() => handleDownload(primaryItem)}
          title={`${texts.directDownloadBadge}: ${primaryItem.filename}`}
          className={`group flex cursor-pointer items-center gap-2 rounded-full text-primary-foreground transition hover:bg-white/10 active:scale-[0.99] ${
            isCompact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm font-medium'
          }`}
        >
          {copiedNotification ? (
            <Check size={isCompact ? 14 : 16} className="text-emerald-400" />
          ) : (
            <PlatformIcon platform={primaryItem.platform} size={isCompact ? 14 : 16} />
          )}

          <span className="font-medium tracking-tight">
            {copiedNotification ? texts.copiedHint : getPrimaryLabel()}
          </span>
        </button>

        {/* Vertical divider */}
        <div className="h-4 w-px bg-primary-foreground/20" />

        {/* Dropdown toggle for all other packages */}
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-label={texts.allOptions}
          onClick={toggleDropdown}
          className={`cursor-pointer rounded-full text-primary-foreground/80 transition hover:bg-white/10 hover:text-primary-foreground ${
            isCompact ? 'p-1.5' : 'p-2'
          }`}
        >
          <ChevronDown
            size={isCompact ? 14 : 16}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Adaptive dropdown/dropup popover */}
      {isOpen && (
        <div
          className={`absolute left-1/2 z-50 w-72 -translate-x-1/2 sm:w-80 rounded-2xl border border-border bg-card p-1.5 shadow-2xl backdrop-blur-md transition-all ${
            placement === 'top' ? 'bottom-full mb-2.5' : 'top-full mt-2.5'
          }`}
        >
          <div className="space-y-1">
            {downloadItems.map((item) => {
              const isRecommended = item.id === primaryItem.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleDownload(item)}
                  className={`group flex w-full cursor-pointer items-center justify-between rounded-xl p-2.5 text-left transition ${
                    isRecommended
                      ? 'bg-muted/70 font-medium text-foreground'
                      : 'text-foreground/90 hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-background text-foreground shadow-2xs">
                      <PlatformIcon platform={item.platform} size={14} />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-medium text-foreground flex items-center gap-1.5">
                        <span>{item.name}</span>
                        {isRecommended && (
                          <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.2 font-mono text-[9px] text-emerald-600 dark:text-emerald-400">
                            {lang === 'zh' ? '当前系统' : 'Current'}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pl-2 shrink-0">
                    <span className="rounded border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                      {item.tag}
                    </span>
                    <Download size={13} className="text-muted-foreground/50 transition group-hover:text-foreground" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* GitHub Releases footer link */}
          <div className="mt-1 border-t border-border/60 pt-1.5">
            <a
              href={RELEASES_PAGE}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
            >
              <span>{texts.viewAllReleases}</span>
              <ArrowUpRight size={13} className="opacity-70" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
