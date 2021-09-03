const config = require('./config');
const { build } = require('esbuild');

build({
  ...config,
  sourcemap: 'external',
});
