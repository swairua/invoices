/**
 * PDF Branding & Dynamic Currency Test Suite
 *
 * Verifies:
 * 1. resolvePdfBackground() – background image URL resolution, opacity
 *    clamping/parsing, and company-vs-config precedence
 * 2. resolveCurrency() / getActiveCurrency() – dynamic currency validation,
 *    normalization, and fallback chain
 * 3. generatePDF() / generateCreditNotePDF() – the emitted print HTML actually
 *    contains the full-page background layer and formats monetary values with
 *    the resolved currency instead of a hardcoded KES
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  setActiveCompanyConfig,
  getActiveCurrency,
  resolveCurrency,
  resolvePdfBackground,
} from '@/utils/activeCompanyConfig';
import { generatePDF, type DocumentData } from '@/utils/pdfGenerator';
import { generateCreditNotePDF, type CreditNotePDFData } from '@/utils/creditNotePdfGenerator';

// ---------------------------------------------------------------------------
// Browser environment stubs (tests run in the node environment)
// ---------------------------------------------------------------------------

const ORIGIN = 'http://localhost:5173';

interface PrintWindowStub {
  document: { write: (html: string) => void; close: () => void };
  onload: (() => void) | null;
  print: () => void;
  closed: boolean;
}

let capturedHtml: string[] = [];

function installWindowStub(): void {
  const createPrintWindow = (): PrintWindowStub => ({
    document: {
      write: (html: string) => {
        capturedHtml.push(html);
      },
      close: () => {},
    },
    onload: null,
    print: () => {},
    closed: false,
  });

  (globalThis as any).window = {
    location: { origin: ORIGIN },
    open: () => createPrintWindow(),
  };
}

function lastHtml(): string {
  expect(capturedHtml.length).toBeGreaterThan(0);
  return capturedHtml[capturedHtml.length - 1];
}

/** Format an amount exactly the way the PDF generators do (en-KE + currency). */
const formatWith = (currency: string, amount: number): string =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

beforeEach(() => {
  capturedHtml = [];
  installWindowStub();
  setActiveCompanyConfig(null);
});

afterEach(() => {
  delete (globalThis as any).window;
  setActiveCompanyConfig(null);
});


// ---------------------------------------------------------------------------
// 1. Background image resolution
// ---------------------------------------------------------------------------

describe('resolvePdfBackground (background image)', () => {
  it('returns an empty background when nothing is configured', () => {
    expect(resolvePdfBackground()).toEqual({ url: '', opacity: 1 });
  });

  it('resolves a relative URL against the app origin', () => {
    const result = resolvePdfBackground({ pdf_background_image: '/uploads/bg.png' });
    expect(result.url).toBe(`${ORIGIN}/uploads/bg.png`);
  });

  it('keeps an absolute URL unchanged', () => {
    const url = 'https://cdn.example.com/watermark.png';
    expect(resolvePdfBackground({ pdf_background_image: url }).url).toBe(url);
  });

  it('applies opacity from a percentage string', () => {
    const result = resolvePdfBackground({
      pdf_background_image: '/uploads/bg.png',
      pdf_background_opacity: '40',
    });
    expect(result.opacity).toBe(0.4);
  });

  it('applies opacity from a number', () => {
    const result = resolvePdfBackground({
      pdf_background_image: '/uploads/bg.png',
      pdf_background_opacity: 25,
    });
    expect(result.opacity).toBe(0.25);
  });

  it('clamps opacity into the 0-100 range', () => {
    const over = resolvePdfBackground({
      pdf_background_image: '/uploads/bg.png',
      pdf_background_opacity: '150',
    });
    expect(over.opacity).toBe(1);

    const under = resolvePdfBackground({
      pdf_background_image: '/uploads/bg.png',
      pdf_background_opacity: '-20',
    });
    expect(under.opacity).toBe(0);
  });

  it('defaults opacity to 100% for empty or non-numeric values', () => {
    expect(
      resolvePdfBackground({ pdf_background_image: '/uploads/bg.png', pdf_background_opacity: '' })
        .opacity
    ).toBe(1);
    expect(
      resolvePdfBackground({
        pdf_background_image: '/uploads/bg.png',
        pdf_background_opacity: 'abc',
      }).opacity
    ).toBe(1);
    expect(resolvePdfBackground({ pdf_background_image: '/uploads/bg.png' }).opacity).toBe(1);
  });

  it('prefers the company value over the cached admin config', () => {
    setActiveCompanyConfig({
      pdf_background_image: '/uploads/config-bg.png',
      pdf_background_opacity: '80',
    });

    const result = resolvePdfBackground({
      pdf_background_image: 'https://cdn.example.com/company-bg.png',
      pdf_background_opacity: '30',
    });

    expect(result.url).toBe('https://cdn.example.com/company-bg.png');
    expect(result.opacity).toBe(0.3);
  });

  it('falls back to the cached admin config when the company omits the fields', () => {
    setActiveCompanyConfig({
      pdf_background_image: '/uploads/config-bg.png',
      pdf_background_opacity: '60',
    });

    const result = resolvePdfBackground({ name: 'Some Company' });

    expect(result.url).toBe(`${ORIGIN}/uploads/config-bg.png`);
    expect(result.opacity).toBe(0.6);
  });

  it('treats an explicit empty company URL as a clear (ignores config)', () => {
    setActiveCompanyConfig({ pdf_background_image: '/uploads/config-bg.png' });

    expect(resolvePdfBackground({ pdf_background_image: '' })).toEqual({
      url: '',
      opacity: 1,
    });
  });
});


// ---------------------------------------------------------------------------
// 2. Dynamic currency resolution
// ---------------------------------------------------------------------------

describe('dynamic currency (resolveCurrency / getActiveCurrency)', () => {
  it('defaults to KES when nothing is configured', () => {
    expect(getActiveCurrency()).toBe('KES');
    expect(resolveCurrency()).toBe('KES');
  });

  it('returns the configured currency normalized to upper case', () => {
    setActiveCompanyConfig({ currency: 'usd' });
    expect(getActiveCurrency()).toBe('USD');
  });

  it('rejects malformed currency codes and falls back to the default', () => {
    setActiveCompanyConfig({ currency: 'XY' });
    expect(getActiveCurrency()).toBe('KES');
  });

  it('prefers a valid explicit currency over the configured one', () => {
    setActiveCompanyConfig({ currency: 'EUR' });
    expect(resolveCurrency('USD')).toBe('USD');
  });

  it('normalizes case and whitespace of the explicit currency', () => {
    expect(resolveCurrency('  gbp ')).toBe('GBP');
  });

  it('falls back to the configured currency when the explicit one is invalid', () => {
    setActiveCompanyConfig({ currency: 'EUR' });
    expect(resolveCurrency('INVALID')).toBe('EUR');
  });

  it('falls back to the supplied fallback when both explicit and config are invalid', () => {
    // Intl rejects codes that are not 3 ASCII letters (e.g. 'TOOLONG', 'NOPE')
    setActiveCompanyConfig({ currency: 'NOPE' });
    expect(resolveCurrency('TOOLONG', 'USD')).toBe('USD');
  });
});

// ---------------------------------------------------------------------------
// 3. End-to-end: generated invoice/quotation PDF HTML
// ---------------------------------------------------------------------------

const invoiceDoc = (company: DocumentData['company']): DocumentData => ({
  type: 'invoice',
  number: 'INV-TEST-001',
  date: '2026-10-09',
  customer: { name: 'Acme Ltd', email: 'billing@acme.test' },
  items: [{ description: 'Consulting', quantity: 2, unit_price: 1500, line_total: 3000 }],
  subtotal: 3000,
  tax_amount: 0,
  total_amount: 3000,
  company,
});

describe('generatePDF (background image + dynamic currency)', () => {
  it('emits the background layer from the cached admin config', () => {
    setActiveCompanyConfig({
      pdf_background_image: '/uploads/bg.png',
      pdf_background_opacity: '40',
    });

    generatePDF(invoiceDoc({ name: 'Test Co', primary_color: '#FF8C42' }), false);

    const html = lastHtml();
    expect(html).toContain('<div class="pdf-bg-layer"></div>');
    expect(html).toContain(`background-image: url("${ORIGIN}/uploads/bg.png")`);
    expect(html).toContain('opacity: 0.4');
    expect(html).toContain('background-size: cover');
  });

  it('emits the background layer from the company record and skips it when unset', () => {
    generatePDF(
      invoiceDoc({
        name: 'Test Co',
        pdf_background_image: 'https://cdn.example.com/wm.png',
        pdf_background_opacity: 60,
      }),
      false
    );
    const withBg = lastHtml();
    expect(withBg).toContain('<div class="pdf-bg-layer"></div>');
    expect(withBg).toContain('background-image: url("https://cdn.example.com/wm.png")');
    expect(withBg).toContain('opacity: 0.6');

    generatePDF(invoiceDoc({ name: 'Test Co' }), false);
    const withoutBg = lastHtml();
    expect(withoutBg).not.toContain('pdf-bg-layer');
  });

  it('formats amounts with the company currency instead of hardcoded KES', () => {
    generatePDF(invoiceDoc({ name: 'Test Co', currency: 'USD' }), false);

    const html = lastHtml();
    expect(html).toContain(formatWith('USD', 3000));
    expect(html).not.toContain(formatWith('KES', 3000));
  });

  it('uses the admin-configured currency when the company has none', () => {
    setActiveCompanyConfig({ currency: 'EUR' });

    generatePDF(invoiceDoc({ name: 'Test Co' }), false);

    const html = lastHtml();
    expect(html).toContain(formatWith('EUR', 3000));
    expect(html).not.toContain(formatWith('KES', 3000));
  });

  it('falls back to KES when the company currency is invalid', () => {
    generatePDF(invoiceDoc({ name: 'Test Co', currency: 'XY' }), false);

    expect(lastHtml()).toContain(formatWith('KES', 3000));
  });
});

// ---------------------------------------------------------------------------
// 4. End-to-end: credit note PDF HTML
// ---------------------------------------------------------------------------

const creditNoteFixture = (): CreditNotePDFData =>
  ({
    credit_note_number: 'CN-TEST-001',
    credit_note_date: '2026-10-01',
    status: 'draft',
    customers: { name: 'Acme Ltd', customer_code: 'C-001' },
    subtotal: 1000,
    tax_amount: 160,
    total_amount: 1160,
    applied_amount: 0,
    balance: 1160,
    credit_note_items: [],
  }) as unknown as CreditNotePDFData;

describe('generateCreditNotePDF (background image + dynamic currency)', () => {
  it('emits the background layer and the resolved currency', () => {
    generateCreditNotePDF(creditNoteFixture(), {
      name: 'Test Co',
      currency: 'GBP',
      pdf_background_image: 'https://cdn.example.com/wm.png',
      pdf_background_opacity: 60,
    });

    const html = lastHtml();
    expect(html).toContain('<div class="pdf-bg-layer"></div>');
    expect(html).toContain('background-image: url("https://cdn.example.com/wm.png")');
    expect(html).toContain('opacity: 0.6');
    expect(html).toContain(formatWith('GBP', 1160));
    expect(html).not.toContain(formatWith('KES', 1160));
  });

  it('uses the cached admin config when the company omits branding fields', () => {
    setActiveCompanyConfig({
      currency: 'USD',
      pdf_background_image: '/uploads/config-bg.png',
      pdf_background_opacity: '90',
    });

    generateCreditNotePDF(creditNoteFixture(), { name: 'Test Co' });

    const html = lastHtml();
    expect(html).toContain('<div class="pdf-bg-layer"></div>');
    expect(html).toContain(`background-image: url("${ORIGIN}/uploads/config-bg.png")`);
    expect(html).toContain('opacity: 0.9');
    expect(html).toContain(formatWith('USD', 1160));
  });

  it('omits the background layer entirely when none is configured', () => {
    generateCreditNotePDF(creditNoteFixture(), { name: 'Test Co' });

    const html = lastHtml();
    expect(html).not.toContain('pdf-bg-layer');
    expect(html).toContain(formatWith('KES', 1160));
  });
});

// ---------------------------------------------------------------------------
// 5. Full page-area coverage of the background layer
// ---------------------------------------------------------------------------

describe('background layer page-area coverage', () => {
  it('pins the layer to all four edges so it fills the page area', () => {
    setActiveCompanyConfig({ pdf_background_image: '/uploads/bg.png' });

    generatePDF(invoiceDoc({ name: 'Test Co' }), false);

    const html = lastHtml();
    expect(html).toContain('position: fixed');
    expect(html).toContain('top: 0');
    expect(html).toContain('left: 0');
    expect(html).toContain('right: 0');
    expect(html).toContain('bottom: 0');
  });

  it('scales the image to cover the area without tiling (credit notes too)', () => {
    setActiveCompanyConfig({ pdf_background_image: '/uploads/bg.png' });

    generateCreditNotePDF(creditNoteFixture(), { name: 'Test Co' });

    const html = lastHtml();
    expect(html).toContain('background-size: cover');
    expect(html).toContain('background-repeat: no-repeat');
    expect(html).toContain('background-position: center');
  });

  it('stacks the layer behind content but above the page background', () => {
    setActiveCompanyConfig({ pdf_background_image: '/uploads/bg.png' });

    generatePDF(invoiceDoc({ name: 'Test Co' }), false);

    const html = lastHtml();
    // .page creates an isolated stacking context so z-index:-1 cannot
    // slip behind the page/body background
    expect(html).toContain('isolation: isolate');
    expect(html).toContain('z-index: -1');
    expect(html).toContain('pointer-events: none');
  });

  it('forces background printing even with "Background graphics" off', () => {
    setActiveCompanyConfig({ pdf_background_image: '/uploads/bg.png' });

    generatePDF(invoiceDoc({ name: 'Test Co' }), false);

    const html = lastHtml();
    expect(html).toContain('print-color-adjust: exact');
  });

  it('mounts the layer as the first child of the .page container', () => {
    setActiveCompanyConfig({ pdf_background_image: '/uploads/bg.png' });

    generatePDF(invoiceDoc({ name: 'Test Co' }), false);

    const html = lastHtml();
    expect(html).toContain('<div class="page">\n        <div class="pdf-bg-layer"></div>');
  });
});


