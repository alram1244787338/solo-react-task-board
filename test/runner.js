const testRegistry = (global.__tb_test_registry__ = {
  suites: [],
  currentSuite: null,
  currentHooks: null,
  results: [],
  started: false,
});

function resetRegistry() {
  testRegistry.suites = [];
  testRegistry.currentSuite = null;
  testRegistry.currentHooks = null;
  testRegistry.results = [];
  testRegistry.started = false;
}

function describe(name, fn) {
  const suite = {
    name,
    tests: [],
    beforeEach: [],
    afterEach: [],
    beforeAll: [],
    afterAll: [],
  };
  const prevSuite = testRegistry.currentSuite;
  const prevHooks = testRegistry.currentHooks;
  testRegistry.currentSuite = suite;
  testRegistry.currentHooks = suite;
  try {
    fn();
  } finally {
    testRegistry.currentSuite = prevSuite;
    testRegistry.currentHooks = prevHooks;
  }
  if (!testRegistry.currentSuite) {
    testRegistry.suites.push(suite);
  } else {
    if (!testRegistry.currentSuite.children) {
      testRegistry.currentSuite.children = [];
    }
    testRegistry.currentSuite.children.push(suite);
  }
}

function it(name, fn) {
  if (!testRegistry.currentSuite) {
    throw new Error('it() must be called inside describe()');
  }
  testRegistry.currentSuite.tests.push({ name, fn });
}

function beforeEach(fn) {
  if (!testRegistry.currentHooks) {
    throw new Error('beforeEach() must be called inside describe()');
  }
  testRegistry.currentHooks.beforeEach.push(fn);
}

function afterEach(fn) {
  if (!testRegistry.currentHooks) {
    throw new Error('afterEach() must be called inside describe()');
  }
  testRegistry.currentHooks.afterEach.push(fn);
}

function beforeAll(fn) {
  if (!testRegistry.currentHooks) {
    throw new Error('beforeAll() must be called inside describe()');
  }
  testRegistry.currentHooks.beforeAll.push(fn);
}

function afterAll(fn) {
  if (!testRegistry.currentHooks) {
    throw new Error('afterAll() must be called inside describe()');
  }
  testRegistry.currentHooks.afterAll.push(fn);
}

async function runHooks(hooks) {
  for (const fn of hooks) {
    if (fn.constructor.name === 'AsyncFunction' || fn.prototype?.then) {
      await fn();
    } else {
      fn();
    }
  }
}

async function runTest(test, ancestorHooks = []) {
  const allBeforeEach = ancestorHooks.flatMap((s) => s.beforeEach);
  const allAfterEach = [...ancestorHooks].reverse().flatMap((s) => s.afterEach);

  for (const fn of allBeforeEach) {
    await runHooks([fn]);
  }

  let error = null;
  const start = Date.now();
  try {
    const result = test.fn();
    if (result && typeof result.then === 'function') {
      await result;
    }
  } catch (e) {
    error = e;
  }
  const duration = Date.now() - start;

  for (const fn of allAfterEach) {
    await runHooks([fn]);
  }

  return { error, duration };
}

async function runSuite(suite, ancestors = []) {
  const path = [...ancestors, suite];
  const nestedResults = [];

  await runHooks(suite.beforeAll);

  for (const test of suite.tests) {
    const { error, duration } = await runTest(test, path);
    const fullName = path.map((s) => s.name).join(' > ') + ' > ' + test.name;
    const record = {
      name: test.name,
      fullName,
      passed: !error,
      error: error || null,
      duration,
      suite: path.map((s) => s.name).join(' > '),
    };
    testRegistry.results.push(record);
    nestedResults.push(record);
    printTest(record);
  }

  if (suite.children) {
    for (const child of suite.children) {
      await runSuite(child, path);
    }
  }

  await runHooks(suite.afterAll);

  return nestedResults;
}

function printTest(record) {
  const status = record.passed ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m';
  const gray = '\x1b[90m';
  const reset = '\x1b[0m';
  const indent = record.suite ? '  '.repeat(record.suite.split(' > ').length + 1) : '  ';
  const duration =
    record.duration > 100
      ? ` ${gray}(${record.duration}ms)${reset}`
      : '';
  process.stdout.write(`${indent}${status} ${record.name}${duration}\n`);
}

function printSuiteHeader(suite, depth = 0) {
  const indent = '  '.repeat(depth);
  process.stdout.write(`\n\x1b[1m${indent}${suite.name}\x1b[0m\n`);
  if (suite.children) {
    for (const child of suite.children) {
      printSuiteHeader(child, depth + 1);
    }
  }
}

function printSummary() {
  const total = testRegistry.results.length;
  const passed = testRegistry.results.filter((r) => r.passed).length;
  const failed = total - passed;
  const totalDuration = testRegistry.results.reduce((a, r) => a + r.duration, 0);

  process.stdout.write('\n');
  process.stdout.write('─'.repeat(60) + '\n');

  if (failed > 0) {
    process.stdout.write(`\n\x1b[1m\x1b[31m失败用例：\x1b[0m\n\n`);
    for (const r of testRegistry.results.filter((x) => !x.passed)) {
      const err = r.error;
      process.stdout.write(`  \x1b[31m✗ ${r.fullName}\x1b[0m\n`);
      if (err && err.message) {
        const msg = err.message.split('\n').join('\n      ');
        process.stdout.write(`    \x1b[31m${msg}\x1b[0m\n`);
      }
      if (err && err.stack) {
        const stack = err.stack
          .split('\n')
          .slice(1, 5)
          .map((l) => '    ' + l)
          .join('\n');
        process.stdout.write(`  \x1b[90m${stack}\x1b[0m\n`);
      }
      process.stdout.write('\n');
    }
  }

  const status =
    failed === 0
      ? `\x1b[1m\x1b[32m全部通过 ✓\x1b[0m`
      : `\x1b[1m\x1b[31m${failed} 个失败\x1b[0m`;

  process.stdout.write(
    `\n${status}  ${passed}/${total} 通过  (${totalDuration}ms)\n\n`
  );
}

async function runAll() {
  testRegistry.results = [];
  testRegistry.started = false;
  process.stdout.write('\x1b[1m📋 任务看板单元测试\x1b[0m\n');

  for (const suite of testRegistry.suites) {
    printSuiteHeader(suite);
    await runSuite(suite);
  }

  printSummary();

  const failed = testRegistry.results.filter((r) => !r.passed).length;
  process.exit(failed === 0 ? 0 : 1);
}

module.exports = {
  describe,
  it,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
  runAll,
  _debug_suite_count: () => testRegistry.suites.length,
  _debug_test_count: () => testRegistry.suites.reduce((n, s) => n + s.tests.length + (s.children ? s.children.reduce((m, c) => m + c.tests.length, 0) : 0), 0),
};
