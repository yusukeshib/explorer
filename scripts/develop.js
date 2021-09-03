const config = require('./config');
const { build } = require('esbuild');
const chalk = require('chalk');
const browsersync = require('browser-sync');
const throttle = require('lodash/throttle');
const { Exec } = require('./spawn');
const path = require('path');

const bs = browsersync.create();

const devConfig = {
  ...config,
  minify: false,
  sourcemap: 'inline',
  incremental: true,
  color: true,
  define: {
    ...config.define,
    'process.env.NODE_ENV': '"development"',
  },
};

// cwd
const platformdir = path.resolve(__dirname, '..');
console.log('cwd:', platformdir);
process.chdir(platformdir);

(async () => {
  let builder;
  try {
    const s = Date.now();
    builder = await build(devConfig);
    const e = Date.now();
    console.log('built in:', e - s, 'ms');
  } catch (err) {
    console.warn('build failed:', err.message);
  }

  const tsc = new Exec('tsc --project tsconfig.json --noEmit');

  bs.init({
    ui: false,
    server: './dist',
    open: false,
    port: 4000,
    watch: false,
    single: true,
    ignore: [/node_modules/],
    files: [
      {
        match: ['src/**/*.ts', 'src/**/*.tsx'],
        fn: throttle(
          async () => {
            try {
              console.log(chalk.gray('> rebuilding...'));
              const s = Date.now();
              if (builder) {
                await builder.rebuild();
              } else {
                builder = await build(devConfig);
              }
              const e = Date.now();
              console.log(chalk.blue('> rebuilt in', e - s, 'ms'));

              bs.reload();

              await tsc.stopAndStart();
            } catch (err) {
              console.log(chalk.red('> building failed:'), err.message);
            }
          },
          1000,
          { leading: false },
        ),
      },
    ],
  });

  bs.emitter.on('init', function () {
    // initial typecheck
    tsc.stopAndStart();
  });
})();
