import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    testPathIgnorePatterns: ['<rootDir>/e2e/'],
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/app/layout.tsx',
        '!src/app/providers.tsx',
        '!src/app/robots.ts',
        '!src/app/sitemap.ts',
        '!src/components/GoogleAdSense.tsx',
        '!src/components/GoogleAnalytics.tsx',
        '!src/components/GoogleTagManager.tsx',
    ],
};

export default createJestConfig(config);
