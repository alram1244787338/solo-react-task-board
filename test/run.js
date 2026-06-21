const runner = require('./runner');
const { expect } = require('./expect');

global.describe = runner.describe;
global.it = runner.it;
global.beforeEach = runner.beforeEach;
global.afterEach = runner.afterEach;
global.beforeAll = runner.beforeAll;
global.afterAll = runner.afterAll;
global.expect = expect;

const path = require('path');
const fs = require('fs');

const testDir = __dirname;
const files = fs.readdirSync(testDir).filter((f) => f.endsWith('.test.js'));

process.stdout.write(`发现 ${files.length} 个测试文件:\n`);
for (const f of files) {
  process.stdout.write(`  - ${f}\n`);
  try {
    const abs = path.join(testDir, f);
    delete require.cache[abs];
    require(abs);
    process.stdout.write(`    ✓ 加载成功\n`);
  } catch (e) {
    process.stdout.write(`    ✗ 加载失败: ${e && e.message ? e.message : String(e)}\n`);
    if (e && e.stack) {
      process.stdout.write(`    ${e.stack.split('\n').slice(0, 5).join('\n    ')}\n`);
    }
    process.exit(1);
  }
}

process.stdout.write(`\n已注册 suites 数量: ${runner._debug_suite_count ? runner._debug_suite_count() : 'N/A'}\n`);

runner.runAll();
