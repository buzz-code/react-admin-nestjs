const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('./tsconfig')
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
    modulePaths: [
        '<rootDir>'
    ],
    testRegex: ".*\\.spec\\.ts$",
    transform: {
        "^.+\\.(t|j)s$": "ts-jest"
    },
    // moduleDirectories: ['node_modules', './'],
    // moduleFileExtensions: [
    //     "js",
    //     "json",
    //     "ts"
    // ],
    // rootDir: "src",
    // collectCoverageFrom: [
    //     "**/*.(t|j)s"
    // ],
    // coverageDirectory: "../coverage",
}
