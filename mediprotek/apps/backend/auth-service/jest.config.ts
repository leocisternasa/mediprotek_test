export default {
  displayName: 'auth-service',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/apps/backend/auth-service',
  moduleNameMapper: {
    '^@auth/(.*)$': '<rootDir>/src/app/$1',
    '^@shared/(.*)$': '<rootDir>/../../../libs/shared-interfaces/src/lib/$1',
    '^@dtos/(.*)$': '<rootDir>/../../../libs/shared-interfaces/src/lib/dtos/$1',
    '^@entities/(.*)$': '<rootDir>/src/app/entities/$1',
    '^@interfaces/(.*)$': '<rootDir>/../../../libs/shared-interfaces/src/lib/interfaces/$1',
    '^@decorators/(.*)$': '<rootDir>/src/app/auth/decorators/$1',
    '^@guards/(.*)$': '<rootDir>/src/app/auth/guards/$1',
    '^@strategies/(.*)$': '<rootDir>/src/app/auth/strategies/$1',
  },
};
