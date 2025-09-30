jest.mock('../../src/utils/currency', () => ({
  formatMoney: jest.fn((cents: number) => `$${(cents / 100).toFixed(2)}`)
}));

describe('Test Setup', () => {
  test('Jest is working correctly', () => {
    expect(true).toBe(true);
  });

  test('Can perform basic calculations', () => {
    const result = 100 * 0.75 * 0.8;
    expect(result).toBe(60);
  });

  test('Mock functions work', () => {
    const mockModule = jest.requireMock('../../src/utils/currency') as {
      formatMoney: (cents: number) => string;
    };

    expect(mockModule.formatMoney(1000)).toBe('$10.00');
  });
});
