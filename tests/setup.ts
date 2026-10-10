import { vi } from 'vitest';

// Legacy test suites were written against Jest's global API (jest.fn()).
// Expose `jest` as an alias of `vi` so they run under Vitest unchanged.
(globalThis as any).jest = vi;
