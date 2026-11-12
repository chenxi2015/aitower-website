import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Copy,
  Download,
  Laptop,
  Terminal,
  X,
} from 'lucide-react';
import {
  detectPlatform,
  detectMacArch,
  detectMacArchAsync,
  checkIsMobile,
  downloadI18n,
  fetchLatestRelease,
  getDefaultDownloadItems,
  parseDownloadItemsFromRelease,
  triggerDirectDownload,
  FALLBACK_RELEASE_VERSION,
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
  const [platform, setPlatform] = useState<Platform>('mac');
  const [macArch, setMacArch] = useState<MacArch>('arm64');
  const [isMobile, setIsMobile] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [releaseVersion, setReleaseVersion] = useState(FALLBACK_RELEASE_VERSION);
  const [downloadItems, setDownloadItems] = useState<DownloadItem[]>(() => getDefaultDownloadItems(lang));
  const [mounted, setMounted] = useState(false);

  const texts = downloadI18n[lang];

  // Initialize client environment detection and fetch latest release
  useEffect(() => {
    setMounted(true);
    setIsMobile(checkIsMobile());

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
        setReleaseVersion(release.tag_name);
        setDownloadItems(parseDownloadItemsFromRelease(release, lang));
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [lang]);

  // Lock body scroll and listen for Escape key when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Primary recommended item based on current environment
  const primaryItem = useMemo(() => {
    if (platform === 'windows') {
      return downloadItems.find((i) => i.id === 'win-setup-exe') || downloadItems[0];
    }
    if (platform === 'linux') {
      return downloadItems.find((i) => i.id === 'linux-appimage') || downloadItems[0];
    }
    if (platform === 'mac') {
      const targetId = macArch === 'x64' ? 'mac-x64-dmg' : 'mac-arm64-dmg';
      return downloadItems.find((i) => i.id === targetId) || downloadItems[0];
    }
    return downloadItems[0];
  }, [platform, macArch, downloadItems]);

  // Trigger download action
  const handleDownload = (item: DownloadItem) => {
    if (isMobile) {
      setIsOpen(true);
      return;
    }

    triggerDirectDownload(item.directUrl, item.filename);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2400);
    setIsOpen(false);
  };

  // Copy current URL for mobile visitors to open on desktop
  const handleCopyLink = async () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.href : 'https://aitower.site';
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2400);
    } catch {
      // Fallback
    }
  };

  // Compute button label for recommended package
  const getPrimaryLabel = () => {
    if (isMobile) return texts.allOptions;
    if (platform === 'mac') {
      return macArch === 'x64' ? texts.downloadForMacIntel : texts.downloadForMacArm;
    }
    if (platform === 'windows') return texts.downloadForWindows;
    if (platform === 'linux') return texts.downloadForLinux;
    return texts.downloadDefault;
  };

  const isCompact = variant === 'compact';

  return (
    <div className={`relative inline-flex flex-wrap items-center justify-center gap-3 ${className}`}>
      {/* Split Button Container */}
      <div className="inline-flex items-center rounded-full bg-primary text-primary-foreground shadow-sm transition hover:opacity-95 p-1">
        {/* Main Action Button */}
        <button
          type="button"
          onClick={() => (isMobile ? setIsOpen(true) : handleDownload(primaryItem))}
          title={isMobile ? texts.allOptions : `${texts.directDownloadBadge}: ${primaryItem.filename}`}
          className={`group flex cursor-pointer items-center gap-2 rounded-full text-primary-foreground transition hover:bg-white/10 active:scale-[0.99] ${isCompact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm font-medium'
            }`}
        >
          {copiedNotification ? (
            <Check size={isCompact ? 14 : 16} className="text-emerald-400" />
          ) : isMobile ? (
            <Download size={isCompact ? 14 : 16} />
          ) : (
            <PlatformIcon platform={primaryItem.platform} size={isCompact ? 14 : 16} />
          )}

          <span className="font-medium tracking-tight">
            {copiedNotification ? texts.copiedHint : getPrimaryLabel()}
          </span>
        </button>

        {/* Vertical divider line */}
        <div className="h-4 w-px bg-primary-foreground/20" />

        {/* Dropdown / Modal Trigger */}
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label={texts.allOptions}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`cursor-pointer rounded-full text-primary-foreground/80 transition hover:bg-white/10 hover:text-primary-foreground ${isCompact ? 'p-1.5' : 'p-2'
            }`}
        >
          <ChevronDown
            size={isCompact ? 14 : 16}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Portal Dialog for All Platforms (Mobile Drawer & PC Modal) */}
      {mounted &&
        createPortal(
          <>
            {/* Backdrop Blur Overlay */}
            <div
              onClick={() => setIsOpen(false)}
              className={`fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
              aria-hidden="true"
            />

            {/* 1. Mobile Bottom Sheet Drawer */}
            <div
              role="dialog"
              aria-modal="true"
              aria-label={texts.modalTitle}
              className={`fixed inset-x-0 bottom-0 z-[121] max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-border bg-card p-4 pb-8 shadow-2xl backdrop-blur-xl transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] sm:hidden ${isOpen ? 'translate-y-0' : 'translate-y-full pointer-events-none'
                }`}
            >
              {/* Top drag handle indicator */}
              <div className="mx-auto -mt-1 mb-3.5 h-1 w-10 rounded-full bg-muted-foreground/30" />

              {/* Header */}
              <div className="mb-3 flex items-center justify-between border-b border-border pb-2.5 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{texts.allOptions}</span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-medium text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    {releaseVersion}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label={texts.close}
                  className="cursor-pointer rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mobile Friendly Notice: Guide visiting on desktop */}
              <div className="mb-3.5 flex items-center justify-between gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5 text-xs text-amber-800 dark:text-amber-300">
                <div className="flex items-start gap-2 min-w-0">
                  <Laptop size={14} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <p className="leading-snug text-[11px]">{texts.mobileNotice}</p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-card border border-border px-2 py-1 text-xs font-medium text-foreground shadow-2xs hover:bg-muted active:scale-95 transition"
                >
                  {linkCopied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  <span>{linkCopied ? texts.linkCopied : texts.copyLink}</span>
                </button>
              </div>

              {/* Platform Item List in Mobile Drawer */}
              <div className="space-y-2">
                {downloadItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      handleDownload(item);
                      setIsOpen(false);
                    }}
                    className="group flex w-full cursor-pointer items-center justify-between rounded-xl border border-border bg-muted/40 p-2.5 text-left transition hover:bg-muted active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card border border-border text-foreground">
                        <PlatformIcon platform={item.platform} size={15} />
                      </div>
                      <div className="min-w-0">
                        <span className="truncate text-xs font-medium text-foreground block">
                          {item.name}
                        </span>
                        <p className="truncate text-[10px] text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 pl-2 shrink-0">
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[9px] font-medium text-muted-foreground border border-border">
                        {item.tag}
                      </span>
                      <Download size={13} className="text-muted-foreground/60" />
                    </div>
                  </button>
                ))}
              </div>

              {/* Footer Releases Link */}
              <div className="mt-3.5 border-t border-border pt-2.5 px-1">
                <a
                  href={RELEASES_PAGE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition"
                >
                  <span>{texts.viewAllReleases}</span>
                  <ArrowUpRight size={13} className="opacity-70" />
                </a>
              </div>
            </div>

            {/* 2. Desktop Centered Modal */}
            <div
              className={`fixed inset-0 z-[121] hidden sm:flex items-center justify-center p-4 sm:p-6 transition-all duration-200 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-label={texts.modalTitle}
                className={`relative z-10 w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl transition-all duration-200 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-2'
                  }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-semibold tracking-tight text-foreground">
                      {texts.modalTitle}
                    </h3>
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-medium text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {releaseVersion}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label={texts.close}
                    className="cursor-pointer -mr-1 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Subtitle */}
                <p className="mt-2 text-xs text-muted-foreground">
                  {texts.modalSubtitle}
                </p>

                {/* Grid of Platform Options */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {downloadItems.map((item) => {
                    const isRecommended = item.id === primaryItem.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleDownload(item)}
                        className={`group relative flex flex-col justify-between rounded-xl p-3.5 text-left transition active:scale-[0.99] border cursor-pointer ${isRecommended
                            ? 'border-foreground/30 bg-muted/70 ring-1 ring-foreground/20'
                            : 'border-border bg-card hover:border-zinc-300 hover:bg-muted/30 dark:hover:border-zinc-700'
                          }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card border border-border text-foreground shadow-2xs">
                              <PlatformIcon platform={item.platform} size={16} />
                            </div>
                            {isRecommended && (
                              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                {texts.currentRecommended}
                              </span>
                            )}
                          </div>

                          <div className="text-sm font-semibold text-foreground">
                            {item.name}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1 leading-normal">
                            {item.desc}
                          </p>
                        </div>

                        <div className="mt-3.5 flex items-center justify-between pt-2.5 border-t border-border/60">
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {item.tag}
                          </span>
                          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-card border border-border text-muted-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
                            <Download size={12} />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Modal Footer: GitHub Release Link */}
                <div className="mt-5 border-t border-border pt-3.5 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{texts.desktopCategory}</span>
                  <a
                    href={RELEASES_PAGE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-foreground transition underline decoration-zinc-300 underline-offset-4"
                  >
                    <span>{texts.viewAllReleases}</span>
                    <ArrowUpRight size={12} className="opacity-70" />
                  </a>
                </div>
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
