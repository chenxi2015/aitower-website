import type { Lang } from './i18n';

export type Platform = 'mac' | 'windows' | 'linux' | 'other';
export type MacArch = 'arm64' | 'x64';
export type DownloadCategory = 'desktop';

export interface DownloadItem {
  id: string;
  category: DownloadCategory;
  platform: Platform;
  name: string;
  tag: string;
  desc: string;
  filename: string;
  directUrl: string;
  arch?: MacArch;
}

export interface GitHubAsset {
  name: string;
  browser_download_url: string;
}

export interface GitHubRelease {
  tag_name: string;
  assets: GitHubAsset[];
}

// Fallback version only used when GitHub API is unreachable or rate-limited
export const FALLBACK_RELEASE_VERSION = 'v0.1.11';
export const GITHUB_REPO = 'chenxi2015/aitower-releases';
export const GITHUB_API_LATEST = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
export const RELEASES_PAGE = `https://github.com/${GITHUB_REPO}/releases/latest`;
const FALLBACK_BASE_URL = `https://github.com/${GITHUB_REPO}/releases/download/${FALLBACK_RELEASE_VERSION}`;

/**
 * Detect client operating system from browser environment
 */
export function detectPlatform(): Platform {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'mac';
  }

  // Modern Client Hints API
  const userAgentData = (navigator as unknown as { userAgentData?: { platform?: string } }).userAgentData;
  const platformHint = userAgentData?.platform?.toLowerCase();
  if (platformHint) {
    if (platformHint.includes('mac')) return 'mac';
    if (platformHint.includes('win')) return 'windows';
    if (platformHint.includes('linux')) return 'linux';
  }

  // Traditional user agent detection fallback
  const ua = (navigator.userAgent || navigator.platform || '').toLowerCase();
  if (ua.includes('mac') || ua.includes('darwin')) return 'mac';
  if (ua.includes('win')) return 'windows';
  if (ua.includes('linux') || ua.includes('x11')) return 'linux';

  return 'other';
}

/**
 * Detect macOS processor architecture (Apple Silicon vs Intel)
 * Uses WebGL unmasked GPU renderer info for fast synchronous detection
 */
export function detectMacArch(): MacArch {
  if (typeof window === 'undefined') return 'arm64';

  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = (gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '').toLowerCase();
        // Intel Macs typically have Intel Iris, Intel UHD, or AMD Radeon graphics
        if (renderer.includes('intel') || renderer.includes('amd') || renderer.includes('radeon')) {
          return 'x64';
        }
        // Apple Silicon chips report Apple M1/M2/M3/M4 or Apple GPU
        if (renderer.includes('apple')) {
          return 'arm64';
        }
      }
    }
  } catch {
    // Ignore and fallback to arm64
  }

  return 'arm64';
}

/**
 * Asynchronously query Client Hints architecture in Chromium browsers
 */
export async function detectMacArchAsync(): Promise<MacArch> {
  const syncArch = detectMacArch();
  if (typeof navigator === 'undefined') return syncArch;

  try {
    const userAgentData = (navigator as unknown as {
      userAgentData?: {
        getHighEntropyValues?: (hints: string[]) => Promise<{ architecture?: string }>;
      };
    }).userAgentData;

    if (userAgentData?.getHighEntropyValues) {
      const hints = await userAgentData.getHighEntropyValues(['architecture']);
      if (hints.architecture === 'x86') return 'x64';
      if (hints.architecture === 'arm') return 'arm64';
    }
  } catch {
    // Keep sync result on failure
  }

  return syncArch;
}

/**
 * Detect whether current client device is mobile / phone
 */
export function checkIsMobile(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = (navigator.userAgent || navigator.platform || '').toLowerCase();
  return (
    /android|iphone|ipad|ipod|mobile/i.test(ua) ||
    ('ontouchstart' in window && navigator.maxTouchPoints > 1 && window.innerWidth < 768)
  );
}

/**
 * Trigger file download directly by simulating an invisible anchor tag click
 * without opening new browser tabs or navigating away
 */
export function triggerDirectDownload(url: string, filename?: string): void {
  if (typeof document === 'undefined') return;

  const anchor = document.createElement('a');
  anchor.style.display = 'none';
  anchor.href = url;
  if (filename) {
    anchor.setAttribute('download', filename);
    anchor.download = filename;
  }
  document.body.appendChild(anchor);
  anchor.click();
  setTimeout(() => {
    if (anchor.parentNode) {
      anchor.parentNode.removeChild(anchor);
    }
  }, 100);
}

/**
 * Match a specific asset from GitHub release assets using regex
 */
function findAsset(assets: GitHubAsset[], pattern: RegExp): GitHubAsset | undefined {
  return assets.find((a) => pattern.test(a.name));
}

/**
 * Dynamically parse download items from GitHub Release assets
 */
export function parseDownloadItemsFromRelease(release: GitHubRelease, lang: Lang): DownloadItem[] {
  const isZh = lang === 'zh';
  const assets = release.assets || [];
  const releaseBaseUrl = `https://github.com/${GITHUB_REPO}/releases/download/${release.tag_name}`;

  // Match assets by filename patterns
  const macArmDmgAsset = findAsset(assets, /(arm64|aarch64).*\.dmg$/i);
  const macIntelDmgAsset = findAsset(assets, /(amd64|x64|intel|x86_64).*\.dmg$/i);
  const winExeAsset =
    findAsset(assets, /installer\.exe$/i) ||
    findAsset(assets, /setup.*\.exe$/i) ||
    findAsset(assets, /\.exe$/i) ||
    findAsset(assets, /\.msi$/i);
  const linuxTarGzAsset = findAsset(assets, /linux.*\.tar\.gz$/i) || findAsset(assets, /\.tar\.gz$/i);
  const linuxAppImageAsset = findAsset(assets, /\.appimage$/i);
  const linuxDebAsset = findAsset(assets, /\.deb$/i);

  const items: DownloadItem[] = [
    // macOS Apple Silicon
    {
      id: 'mac-arm64-dmg',
      category: 'desktop',
      platform: 'mac',
      arch: 'arm64',
      name: 'macOS (Apple Silicon)',
      tag: '.dmg',
      desc: isZh ? '适用于 M1 / M2 / M3 / M4 芯片' : 'For Apple Silicon M-series chips',
      filename: macArmDmgAsset?.name || 'aitower_darwin_arm64.dmg',
      directUrl:
        macArmDmgAsset?.browser_download_url ||
        `${releaseBaseUrl}/aitower_darwin_arm64.dmg`,
    },
    // macOS Intel
    {
      id: 'mac-x64-dmg',
      category: 'desktop',
      platform: 'mac',
      arch: 'x64',
      name: 'macOS (Intel)',
      tag: '.dmg',
      desc: isZh ? '适用于 Intel 芯片的 Mac 电脑' : 'For Intel-based Mac computers',
      filename: macIntelDmgAsset?.name || 'aitower_darwin_amd64.dmg',
      directUrl:
        macIntelDmgAsset?.browser_download_url ||
        `${releaseBaseUrl}/aitower_darwin_amd64.dmg`,
    },
    // Windows x64
    {
      id: 'win-setup-exe',
      category: 'desktop',
      platform: 'windows',
      name: isZh ? 'Windows (64位安装版)' : 'Windows (64-bit Installer)',
      tag: '.exe',
      desc: isZh ? '适用于 Windows 10 / 11 操作系统' : 'For Windows 10 / 11',
      filename: winExeAsset?.name || 'aitower_windows_amd64_installer.exe',
      directUrl:
        winExeAsset?.browser_download_url ||
        `${releaseBaseUrl}/aitower_windows_amd64_installer.exe`,
    },
  ];

  // Only list Linux assets that actually exist in the release (or default to tar.gz)
  if (linuxAppImageAsset) {
    items.push({
      id: 'linux-appimage',
      category: 'desktop',
      platform: 'linux',
      name: isZh ? 'Linux (AppImage 通用版)' : 'Linux (AppImage)',
      tag: '.AppImage',
      desc: isZh ? '适用于 Ubuntu / Debian / Fedora 等绝大多数发行版' : 'Universal binary for most Linux distributions',
      filename: linuxAppImageAsset.name,
      directUrl: linuxAppImageAsset.browser_download_url,
    });
  }

  if (linuxDebAsset) {
    items.push({
      id: 'linux-deb',
      category: 'desktop',
      platform: 'linux',
      name: isZh ? 'Linux (Debian / Ubuntu 安装包)' : 'Linux (.deb package)',
      tag: '.deb',
      desc: isZh ? '适用于 Debian、Ubuntu 及派生发行版' : 'For Debian, Ubuntu and derivatives',
      filename: linuxDebAsset.name,
      directUrl: linuxDebAsset.browser_download_url,
    });
  }

  if (linuxTarGzAsset || (!linuxAppImageAsset && !linuxDebAsset)) {
    items.push({
      id: 'linux-tar-gz',
      category: 'desktop',
      platform: 'linux',
      name: isZh ? 'Linux (x64 压缩包)' : 'Linux (x64 Archive)',
      tag: '.tar.gz',
      desc: isZh ? '适用于 Ubuntu / Debian / Fedora 等 64 位发行版' : 'For 64-bit Ubuntu, Debian, Fedora and other distros',
      filename: linuxTarGzAsset?.name || 'aitower_linux_amd64.tar.gz',
      directUrl:
        linuxTarGzAsset?.browser_download_url ||
        `${releaseBaseUrl}/aitower_linux_amd64.tar.gz`,
    });
  }

  return items;
}

/**
 * Default fallback download items
 */
export function getDefaultDownloadItems(lang: Lang): DownloadItem[] {
  return parseDownloadItemsFromRelease(
    {
      tag_name: FALLBACK_RELEASE_VERSION,
      assets: [
        {
          name: 'aitower_darwin_arm64.dmg',
          browser_download_url: `${FALLBACK_BASE_URL}/aitower_darwin_arm64.dmg`,
        },
        {
          name: 'aitower_darwin_amd64.dmg',
          browser_download_url: `${FALLBACK_BASE_URL}/aitower_darwin_amd64.dmg`,
        },
        {
          name: 'aitower_windows_amd64_installer.exe',
          browser_download_url: `${FALLBACK_BASE_URL}/aitower_windows_amd64_installer.exe`,
        },
        {
          name: 'aitower_linux_amd64.tar.gz',
          browser_download_url: `${FALLBACK_BASE_URL}/aitower_linux_amd64.tar.gz`,
        },
      ],
    },
    lang,
  );
}

/**
 * Backward compatibility helper to resolve single asset for visitor's platform
 */
export interface ResolvedDownload {
  url: string;
  filename: string;
  platform: Platform;
  arch?: MacArch;
}

export function resolveAssetFor(
  release: GitHubRelease,
  platform: Platform,
  arch: MacArch = 'arm64',
): ResolvedDownload | undefined {
  const items = parseDownloadItemsFromRelease(release, 'zh');
  if (platform === 'mac') {
    const target = items.find((i) => i.id === (arch === 'x64' ? 'mac-x64-dmg' : 'mac-arm64-dmg'));
    return target && { url: target.directUrl, filename: target.filename, platform, arch };
  }
  if (platform === 'windows') {
    const target = items.find((i) => i.platform === 'windows');
    return target && { url: target.directUrl, filename: target.filename, platform };
  }
  if (platform === 'linux') {
    const target = items.find((i) => i.platform === 'linux');
    return target && { url: target.directUrl, filename: target.filename, platform };
  }
  return undefined;
}

/**
 * Fetch latest release from GitHub API with 10-minute localStorage cache
 */
export async function fetchLatestRelease(): Promise<GitHubRelease | null> {
  const cacheKey = 'aitower_release_cache_v2';
  try {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Cache valid for 10 minutes to prevent GitHub rate limits while quickly picking up new releases
        if (Date.now() - parsed.time < 10 * 60 * 1000 && parsed.data?.tag_name) {
          return parsed.data as GitHubRelease;
        }
      }
    }

    const res = await fetch(GITHUB_API_LATEST);
    if (!res.ok) return null;
    const data: GitHubRelease = await res.json();
    if (data?.tag_name && typeof window !== 'undefined') {
      localStorage.setItem(cacheKey, JSON.stringify({ data, time: Date.now() }));
    }
    return data;
  } catch {
    return null;
  }
}

export const downloadI18n = {
  zh: {
    default: '下载 aitower',
    downloadDefault: '免费下载',
    downloadForMac: '下载 macOS 版',
    downloadForMacArm: '下载 Mac Apple Silicon 版',
    downloadForMacIntel: '下载 Mac Intel 版',
    downloadForWindows: '下载 Windows 版',
    downloadForLinux: '下载 Linux 版',
    forMac: '下载 macOS 版',
    forWindows: '下载 Windows 版',
    forLinux: '下载 Linux 版',
    macHint: 'Apple Silicon · DMG',
    winHint: 'Win 10/11 · EXE',
    linuxHint: '通用版本',
    allPlatforms: '全部平台',
    allOptions: '所有客户端安装包',
    desktopCategory: '桌面客户端',
    directDownloadBadge: '点击直下',
    viewAllReleases: '全部版本与更新日志',
    copiedHint: '已开始直接下载安装包',
    modalTitle: '下载 aitower 客户端',
    modalSubtitle: '基于 Obsidian 本地生态的 AI 创作与配图增强工作台',
    mobileNotice: '当前应用为桌面客户端（macOS / Windows / Linux）。建议在电脑端打开下载，或复制链接发送到电脑。',
    copyLink: '复制链接',
    linkCopied: '链接已复制',
    currentRecommended: '当前推荐',
    close: '关闭',
    macSilicon: 'macOS · Apple Silicon',
    macIntel: 'macOS · Intel',
    windows: 'Windows x64',
    linux: 'Linux x64',
  },
  en: {
    default: 'Download aitower',
    downloadDefault: 'Download',
    downloadForMac: 'Download for Mac',
    downloadForMacArm: 'Download for Mac (Apple Silicon)',
    downloadForMacIntel: 'Download for Mac (Intel)',
    downloadForWindows: 'Download for Windows',
    downloadForLinux: 'Download for Linux',
    forMac: 'Download for macOS',
    forWindows: 'Download for Windows',
    forLinux: 'Download for Linux',
    macHint: 'Apple Silicon · DMG',
    winHint: 'Win 10/11 · EXE',
    linuxHint: 'Universal',
    allPlatforms: 'All platforms',
    allOptions: 'All Platform Installers',
    desktopCategory: 'Desktop Clients',
    directDownloadBadge: 'Direct',
    viewAllReleases: 'All Releases & Changelog',
    copiedHint: 'Direct download started',
    modalTitle: 'Download aitower Client',
    modalSubtitle: 'AI writing & illustration workbench built on your Obsidian vault',
    mobileNotice: 'aitower is currently built for desktop (macOS, Windows & Linux). Please open on your computer or copy the link.',
    copyLink: 'Copy Link',
    linkCopied: 'Link copied',
    currentRecommended: 'Recommended',
    close: 'Close',
    macSilicon: 'macOS · Apple Silicon',
    macIntel: 'macOS · Intel',
    windows: 'Windows x64',
    linux: 'Linux x64',
  },
} as const;
