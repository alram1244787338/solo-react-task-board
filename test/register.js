const path = require('path');
const fs = require('fs');
const Module = require('module');
const babel = require('@babel/core');

const ROOT = path.resolve(__dirname, '..');
const NODE_MODULES = path.join(ROOT, 'node_modules');
const SRC_DIR = path.join(ROOT, 'src');
const TEST_DIR = path.join(ROOT, 'test');

const presets = [
  [
    '@babel/preset-env',
    {
      targets: { node: 'current' },
      modules: 'commonjs',
    },
  ],
  ['@babel/preset-react', { runtime: 'automatic' }],
];

const originalResolveFilename = Module._resolveFilename;
const cache = new Map();
const compileCache = new Map();

function shouldCompile(filename) {
  if (filename.startsWith(NODE_MODULES)) return false;
  if (/\.(js|jsx)$/.test(filename)) return true;
  return false;
}

const originalLoader = Module._extensions['.js'];

Module._extensions['.js'] = function (module, filename) {
  if (!shouldCompile(filename)) {
    return originalLoader(module, filename);
  }
  const src = fs.readFileSync(filename, 'utf8');
  let compiled;
  const mtime = fs.statSync(filename).mtimeMs;
  const cached = compileCache.get(filename);
  if (cached && cached.mtime === mtime) {
    compiled = cached.code;
  } else {
    const result = babel.transformSync(src, {
      filename,
      presets,
      configFile: false,
      babelrc: false,
      sourceMaps: 'inline',
    });
    compiled = result && result.code ? result.code : src;
    compileCache.set(filename, { mtime, code: compiled });
  }
  module._compile(compiled, filename);
};

Module._extensions['.jsx'] = Module._extensions['.js'];
