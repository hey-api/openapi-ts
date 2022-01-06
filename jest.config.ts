import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    projects: [
        {
            displayName: 'UNIT',
            testEnvironment: 'node',
            testMatch: ['<rootDir>/src/**/*.spec.ts', '<rootDir>/test/index.spec.ts'],
            moduleFileExtensions: ['js', 'ts', 'd.ts'],
            moduleNameMapper: {
                '\\.hbs$': '<rootDir>/src/templates/__mocks__/index.ts',
            },
        },
        {
            displayName: 'E2E',
            testEnvironment: 'node',
            testMatch: [
                '<rootDir>/test/e2e/v2.fetch.spec.ts',
                '<rootDir>/test/e2e/v2.xhr.spec.ts',
                '<rootDir>/test/e2e/v2.node.spec.ts',
                '<rootDir>/test/e2e/v2.axios.spec.ts',
                '<rootDir>/test/e2e/v2.babel.spec.ts',
                '<rootDir>/test/e2e/v3.fetch.spec.ts',
                '<rootDir>/test/e2e/v3.xhr.spec.ts',
                '<rootDir>/test/e2e/v3.node.spec.ts',
                '<rootDir>/test/e2e/v3.axios.spec.ts',
                '<rootDir>/test/e2e/v3.babel.spec.ts',
            ],
        },
    ],
    collectCoverageFrom: ['<rootDir>/src/**/*.ts', '!<rootDir>/src/**/*.d.ts', '!<rootDir>/bin', '!<rootDir>/dist'],
};

export default config;
