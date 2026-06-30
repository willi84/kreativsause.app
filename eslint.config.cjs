// comments are in english
const { resolve } = require('node:path');
const jiti = require('jiti')(__filename);

// resolve absolute path to eslint.config.ts next to this file
const tsConfigPath = resolve(__dirname, 'eslint.config.ts');

module.exports = jiti(tsConfigPath).default;