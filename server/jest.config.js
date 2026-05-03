const { compilerOptions } = require('./tsconfig');
const makeJestBase = require('./shared/config/jest.base');
module.exports = {
    ...makeJestBase(compilerOptions),
};
