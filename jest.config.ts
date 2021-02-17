export default {
  preset: 'ts-jest',
  setupFilesAfterEnv: ['jest-sinon'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
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
