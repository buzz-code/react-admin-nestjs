const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('./tsconfig')
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
    modulePaths: [
        '<rootDir>'
    ],
    testRegex: ".*\\.(spec|test)\\.ts$",
    transform: {
        "^.+\\.(t|j)s$": "ts-jest"
    },
    collectCoverageFrom: [
        "**/*.(t|j)s",
        "!**/node_modules/**",
        "!**/dist/**",
        "!**/coverage/**",
        "!helpers/**",
        "!.eslintrc.js",
        "!jest.config.js",
        "!**/migrations/**",
        "!test/**",
    ],
    coverageDirectory: "coverage",
    coverageReporters: ["json", "lcov", "text", "clover"],
}
