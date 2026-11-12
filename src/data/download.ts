import type { Lang } from './i18n';

export type Platform = 'mac' | 'windows' | 'linux' | 'other';
export type MacArch = 'arm64' | 'x64';

export interface GitHubAsset {
  name: string;
  browser_download_url: string;
}

export interface GitHubRelease {
  tag_name: string;
  assets: GitHubAsset[];
}

// Fallback version only used when the GitHub API is unreachable or rate-limited
export const FALLBACK_RELEASE_VERSION = 'v0.1.9';
export const GITHUB_REPO = 'chenxi2015/aitower-releases';
export const GITHUB_API_LATEST = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
export const RELEASES_PAGE = `https://github.com/${GITHUB_REPO}/releases/latest`;

/** Detect client operating system (Client Hints first, UA fallback). */
export function detectPlatform(): Platform {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'mac';

  const userAgentData = (navigator as unknown as { userAgentData?: { platform?: string } }).userAgentData;
  const platformHint = userAgentData?.platform?.toLowerCase();
  if (platformHint) {
    if (platformHint.includes('mac')) return 'mac';
    if (platformHint.includes('win')) return 'windows';
    if (platformHint.includes('linux')) return 'linux';
  }

  const ua = (navigator.userAgent || navigator.platform || '').toLowerCase();
  if (ua.includes('mac') || ua.includes('darwin')) return 'mac';
  if (ua.includes('win')) return 'windows';
  if (ua.includes('linux') || ua.includes('x11')) return 'linux';
  return 'other';
}

/**
 * Detect macOS CPU architecture (Apple Silicon vs Intel).
 * Uses WebGL unmasked renderer info for a fast synchronous guess.
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
        if (renderer.includes('intel') || renderer.includes('amd') || renderer.includes('radeon')) return 'x64';
        if (renderer.includes('apple')) return 'arm64';
      }
    }
  } catch {
    // fall through to arm64
  }
  return 'arm64';
}

/** Chromium's Client Hints high-entropy architecture query, when available. */
export async function detectMacArchAsync(): Promise<MacArch> {
  const syncArch = detectMacArch();
  if (typeof navigator === 'undefined') return syncArch;
  try {
    const userAgentData = (navigator as unknown as {
      userAgentData?: { getHighEntropyValues?: (hints: string[]) => Promise<{ architecture?: string }> };
    }).userAgentData;
    if (userAgentData?.getHighEntropyValues) {
      const hints = await userAgentData.getHighEntropyValues(['architecture']);
      if (hints.architecture === 'x86') return 'x64';
      if (hints.architecture === 'arm') return 'arm64';
    }
  } catch {
    // keep sync result
  }
  return syncArch;
}

function findAsset(assets: GitHubAsset[], pattern: RegExp): GitHubAsset | undefined {
  return assets.find((a) => pattern.test(a.name));
}

export interface ResolvedDownload {
  url: string;
  filename: string;
  platform: Platform;
  arch?: MacArch;
}

/** Pick the best-matching asset for the visitor's device from a release. */
export function resolveAssetFor(
  release: GitHubRelease,
  platform: Platform,
  arch: MacArch = 'arm64',
): ResolvedDownload | undefined {
  const assets = release.assets || [];
  if (platform === 'mac') {
    const asset =
      arch === 'arm64'
        ? findAsset(assets, /arm64.*\.dmg$/i) ?? findAsset(assets, /aarch64.*\.dmg$/i)
        : findAsset(assets, /(x64|intel).*\.dmg$/i);
    const anyDmg = asset ?? findAsset(assets, /\.dmg$/i);
    return anyDmg && { url: anyDmg.browser_download_url, filename: anyDmg.name, platform, arch };
  }
  if (platform === 'windows') {
    const asset = findAsset(assets, /setup.*\.exe$/i) ?? findAsset(assets, /\.exe$/i) ?? findAsset(assets, /\.msi$/i);
    return asset && { url: asset.browser_download_url, filename: asset.name, platform };
  }
  if (platform === 'linux') {
    const asset = findAsset(assets, /\.appimage$/i) ?? findAsset(assets, /\.(deb|rpm)$/i);
    return asset && { url: asset.browser_download_url, filename: asset.name, platform };
  }
  return undefined;
}

/** Fetch the latest release with a 10-minute localStorage cache (GitHub rate-limit friendly). */
export async function fetchLatestRelease(): Promise<GitHubRelease | null> {
  const cacheKey = 'aitower_release_cache_v1';
  try {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
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
    forMac: '下载 macOS 版',
    forWindows: '下载 Windows 版',
    forLinux: '下载 Linux 版',
    allPlatforms: '全部平台',
    macSilicon: 'macOS · Apple Silicon',
    macIntel: 'macOS · Intel',
    windows: 'Windows x64',
    linux: 'Linux x64',
  },
  en: {
    default: 'Download aitower',
    forMac: 'Download for macOS',
    forWindows: 'Download for Windows',
    forLinux: 'Download for Linux',
    allPlatforms: 'All platforms',
    macSilicon: 'macOS · Apple Silicon',
    macIntel: 'macOS · Intel',
    windows: 'Windows x64',
    linux: 'Linux x64',
  },
} as const;
