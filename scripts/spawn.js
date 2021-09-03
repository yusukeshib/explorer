const child_process = require('child_process');
const chalk = require('chalk');

const spawn = async (command, env = {}) => {
  const [first, ...components] = command.split(' ');
  return await new Promise((resolve, reject) => {
    try {
      const proc = child_process.spawn(first, components, {
        cwd: process.cwd(),
        stdio: 'inherit',
        env: {
          ...process.env,
          ...env,
        },
      });

      proc.on('error', (err) => {
        reject(err);
      });
      proc.on('close', (code) => {
        resolve(code);
      });
    } catch (err) {
      reject(err);
    }
  });
};

class Exec {
  constructor(command) {
    const [first, ...components] = command.split(' ');
    this._command = first;
    this._components = components;
  }
  async stopAndStart(env = {}) {
    await this.stop();
    return await this.start(env);
  }
  async start(env = {}) {
    let s = 0;
    let proc;
    const ret = await new Promise((resolve) => {
      proc = child_process.spawn(this._command, this._components, {
        cwd: process.cwd(),
        stdio: 'inherit',
        env: {
          ...process.env,
          ...env,
        },
      });
      this._proc = proc;
      s = Date.now();

      this._proc.on('error', (err) => {
        this._proc = null;
        console.log(
          '>',
          chalk.yellow(`${this._command}(${proc.pid})`),
          'error:',
          err.message,
        );
        resolve(null);
      });
      this._proc.on('close', (code) => {
        this._proc = null;
        resolve(code);
      });
      console.log(
        '>',
        chalk.yellow(`${this._command}(${proc.pid})`),
        'started',
      );
    });
    const e = Date.now();
    console.log(
      '>',
      chalk.yellow(`${this._command}(${proc.pid})`),
      ret === null ? 'killed' : `completed(${ret})`,
      e - s,
      'ms',
    );
    return ret;
  }
  async stop() {
    if (!this._proc) return;
    const proc = this._proc;
    this._proc = null;
    await new Promise((resolve) => {
      proc.on('close', (code, signal) => {
        // console.log('killed:', proc.pid, 'with', signal);
        resolve(code);
      });
      // console.log('killing:', proc.pid);
      proc.kill('SIGINT');
    });
  }
}

module.exports = { spawn, Exec };
