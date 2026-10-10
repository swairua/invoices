export interface ActiveCompanyConfig {
  currency?: string | null;
  pdf_background_image?: string | null;
  pdf_background_opacity?: number | string | null;
}

const STORAGE_KEY = 'app_active_company_config';

let activeConfig: ActiveCompanyConfig | null = null;

export function setActiveCompanyConfig(config: ActiveCompanyConfig | null): void {
  activeConfig = config;
  try {
    if (config) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage unavailable (private mode etc.) — in-memory value still works
  }
}

export function getActiveCompanyConfig(): ActiveCompanyConfig | null {
  if (activeConfig) return activeConfig;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      activeConfig = JSON.parse(raw) as ActiveCompanyConfig;
    }
  } catch {
    activeConfig = null;
  }
  return activeConfig;
}

function isValidCurrencyCode(code: string): boolean {
  try {
    // Throws a RangeError for unsupported currency codes
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: code });
    return true;
  } catch {
    return false;
  }
}

export function getActiveCurrency(fallback: string = 'KES'): string {
  const currency = getActiveCompanyConfig()?.currency;
  if (typeof currency === 'string' && currency.trim()) {
    const code = currency.trim().toUpperCase();
    if (isValidCurrencyCode(code)) return code;
  }
  return fallback;
}

/**
 * Currency for a document: the explicit company value if valid,
 * otherwise the admin-configured currency, then the fallback.
 */
export function resolveCurrency(currency?: string | null, fallback: string = 'KES'): string {
  if (typeof currency === 'string' && currency.trim()) {
    const code = currency.trim().toUpperCase();
    if (isValidCurrencyCode(code)) return code;
  }
  return getActiveCurrency(fallback);
}

export interface PdfBackground {
  url: string;
  opacity: number;
}

/**
 * Resolve the admin-configured full-page PDF background image.
 * Falls back to the cached company config when the caller does not
 * provide company details (most PDF call sites do not).
 */
export function resolvePdfBackground(company?: {
  pdf_background_image?: string | null;
  pdf_background_opacity?: number | string | null;
}): PdfBackground {
  const cfg = getActiveCompanyConfig();
  const rawUrl = company?.pdf_background_image ?? cfg?.pdf_background_image ?? '';
  const url = String(rawUrl || '').trim();
  if (!url) return { url: '', opacity: 1 };

  let absoluteUrl = url;
  try {
    absoluteUrl = new URL(url, window.location.origin).href;
  } catch {
    // Keep original value if it cannot be resolved (e.g. malformed)
  }

  const opacityRaw = company?.pdf_background_opacity ?? cfg?.pdf_background_opacity;
  const opacityStr = opacityRaw === null || opacityRaw === undefined ? '' : String(opacityRaw).trim();
  const parsed = Number(opacityStr);
  const percent = opacityStr === '' || !Number.isFinite(parsed)
    ? 100
    : Math.min(100, Math.max(0, parsed));

  return { url: absoluteUrl, opacity: percent / 100 };
}
