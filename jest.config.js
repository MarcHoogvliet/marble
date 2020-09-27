const SCOPE = process.env.SCOPE;
const tsconfig = require('./tsconfig.json');
const moduleNameMapper = require('tsconfig-paths-jest')(tsconfig);

const config = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testEnvironment: 'node',
  testRegex: 'spec.ts$',
  coverageDirectory: './coverage/',
  coveragePathIgnorePatterns: [
    'dist',
    '\\+internal/testing',
    '@integration',
    '\\.spec-(util|setup)\\.ts$',
    '\\.spec\\.ts$',
    'integration\\.ts$',
  ],
  collectCoverageFrom: ['packages/**/*.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleDirectories: ['node_modules', 'packages', './'],
  globals: {
    'ts-jest': {
      tsConfig: './tsconfig.test.json',
      diagnostics: {
        ignoreCodes: [2300],
      },
    },
  },
  moduleNameMapper: {
    '@marble/(.*)': './packages/$1',
  },
};

if (SCOPE === 'integration') {
  config.testRegex = 'integration.spec.ts$';
  console.info('RUNNING INTEGRATION TESTS');
}

if (SCOPE === 'unit') {
  config.testRegex = '^((?!integration).)*.spec.ts$';
  console.info('RUNNING UNIT TESTS');
}

module.exports = config;
