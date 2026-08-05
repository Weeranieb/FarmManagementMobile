// jest-expo handles the React Native / Expo transform pipeline; everything here
// is project-specific wiring on top of it.
module.exports = {
  preset: 'jest-expo',
  // Mirrors the `@/*` -> `./src/*` alias in tsconfig.json.
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.test.tsx'],
  // Coverage is reported for the modules under test rather than the whole app —
  // a global number would be dominated by view code these tests do not cover
  // and would say nothing useful about the parts that handle money.
  collectCoverageFrom: [
    'src/features/**/adapters.ts',
    'src/screens/flows/money.ts',
    'src/utils/fmt.ts',
  ],
};
