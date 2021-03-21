export default {
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'libs/bull-mq-transport/src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts',
    '!**/index.ts',
    '!**/*.constants.ts',
    '!**/*.factory.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
