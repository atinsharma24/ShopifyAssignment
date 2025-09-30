import type { Mock } from 'jest-mock';

const originalConsole = global.console;

global.console = {
  ...originalConsole
};

const fetchMock = jest.fn();

global.fetch = fetchMock as unknown as typeof fetch;

Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost/',
    origin: 'http://localhost',
    pathname: '/',
    search: '',
    hash: ''
  },
  writable: true
});

declare global {
  interface Window {
    Shopify: {
      formatMoney: (cents: number) => string;
      money_format: string;
    };
  }
}

beforeEach(() => {
  (fetchMock as Mock).mockClear();
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});

window.Shopify = {
  formatMoney: (cents: number) => `$${(cents / 100).toFixed(2)}`,
  money_format: '${{amount}}'
};
