const base = require('./shared/config/jest.base');
module.exports = {
    ...base,
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
};