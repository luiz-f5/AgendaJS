const path = require('path');
const rootDir = __dirname;

module.exports = {
    testEnvironment: "node",
    setupFilesAfterEnv: ["<rootDir>/tests/setup/testDb.js"],
    globalSetup: "<rootDir>/tests/setup/globalSetup.js",
  };
  