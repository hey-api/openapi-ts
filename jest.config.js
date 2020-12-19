'use strict';

module.exports = {
    projects: [
        {
            displayName: 'UNIT',
            testEnvironment: 'node',
            testMatch: [
                '<rootDir>/src/**/*.spec.ts',
                '<rootDir>/test/index.spec.js',
            ],
            moduleFileExtensions: ['js', 'ts', 'd.ts'],
            moduleNameMapper: {
                '\\.hbs$': '<rootDir>/src/templates/__mocks__/index.js',
            },
        },
        {
            displayName: 'E2E',
            testEnvironment: 'node',
            testMatch: [
                '<rootDir>/test/e2e/v2.fetch.spec.js',
                '<rootDir>/test/e2e/v2.xhr.spec.js',
                '<rootDir>/test/e2e/v2.node.spec.js',
                '<rootDir>/test/e2e/v2.babel.spec.js',
                '<rootDir>/test/e2e/v3.fetch.spec.js',
                '<rootDir>/test/e2e/v3.xhr.spec.js',
                '<rootDir>/test/e2e/v3.node.spec.js',
                '<rootDir>/test/e2e/v3.babel.spec.js',
            ],
        },
    ],
    collectCoverageFrom: [
        '<rootDir>/src/**/*.ts',
        '!<rootDir>/src/**/*.d.ts',
        '!<rootDir>/bin',
        '!<rootDir>/dist',
    ],
};
