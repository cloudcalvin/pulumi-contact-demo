/*
 * Comment severities you want to see on the console.
 * Uncomment severities you want suppressed by jest.
 * Use a function other than `jest.fn()` to capture elsewhere.
 */
global.console = {
    ...global.console,
    // debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    log: jest.fn(),
    // trace: jest.fn(),
    warn: jest.fn(),
};
