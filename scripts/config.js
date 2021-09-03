const path = require('path');

const ENV = process.env.NODE_ENV || 'development';
const envPath = path.resolve(__dirname, '..', `env/${ENV}.env`);
const env = require('dotenv').config({ path: envPath });

const define = {};
for (const key in env.parsed) {
  const value = JSON.stringify(env.parsed[key]);
  define[`process.env.${key}`] = value;
  console.log('(env)', key, '=', value);
}

const config = {
  entryPoints: ['./src/index.tsx'],
  outdir: `./dist`,
  bundle: true,
  sourcemap: 'external',
  minify: true,
  define: {
    'process.env.ACCESSTOKEN': '""',
    ...define,
    'process.env.NODE_ENV': '"production"',
  },
  publicPath: `/`,
};

module.exports = config;
