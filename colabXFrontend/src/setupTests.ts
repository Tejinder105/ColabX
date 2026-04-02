import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Mock fetch globally for tests
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Reset mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
});
