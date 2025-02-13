// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
	moduleDirectories: ['node_modules', '<rootDir>/'],
	testEnvironment: 'jest-environment-jsdom',
	moduleNameMapper: {
		'@/(.*)': '<rootDir>/client/$1',
	},
};

module.exports = customJestConfig;
