function isPrimitive(v) {
  return (
    v === null ||
    typeof v === 'undefined' ||
    typeof v === 'string' ||
    typeof v === 'number' ||
    typeof v === 'boolean' ||
    typeof v === 'bigint' ||
    typeof v === 'symbol'
  );
}

function deepEqual(a, b, seen = new Map()) {
  if (Object.is(a, b)) return true;
  if (a === null || b === null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  if (seen.has(a) && seen.get(a) === b) return true;
  seen.set(a, b);

  if (a.constructor !== b.constructor) return false;

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.source === b.source && a.flags === b.flags;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i], seen)) return false;
    }
    return true;
  }
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();
  if (!deepEqual(aKeys, bKeys, seen)) return false;
  for (const k of aKeys) {
    if (!deepEqual(a[k], b[k], seen)) return false;
  }
  return true;
}

function formatValue(v) {
  if (typeof v === 'string') return JSON.stringify(v);
  if (v === null) return 'null';
  if (typeof v === 'undefined') return 'undefined';
  if (typeof v === 'object') {
    try {
      return JSON.stringify(v, null, 2);
    } catch {
      return String(v);
    }
  }
  return String(v);
}

function AssertionError(message, actual, expected, operator) {
  const err = new Error(message);
  err.name = 'AssertionError';
  err.actual = actual;
  err.expected = expected;
  err.operator = operator;
  Error.captureStackTrace?.(err, AssertionError);
  return err;
}

function expect(actual) {
  const chain = {
    _notFlag: false,
  };

  function pass(msgOnFail) {
    if (chain._notFlag) {
      throw AssertionError(msgOnFail, actual, undefined, 'not');
    }
  }
  function fail(msgOnPass, expected, operator) {
    if (!chain._notFlag) {
      throw AssertionError(msgOnPass, actual, expected, operator);
    }
  }

  function M(name, fn) {
    chain[name] = function (...args) {
      fn(...args);
      return chain;
    };
  }

  M('toBeDefined', () => {
    if (typeof actual === 'undefined')
      fail('expected value to be defined', undefined, 'toBeDefined');
    else pass('expected value NOT to be defined');
  });

  M('toBeUndefined', () => {
    if (typeof actual !== 'undefined')
      fail(`expected ${formatValue(actual)} to be undefined`, undefined, 'toBeUndefined');
    else pass('expected value NOT to be undefined');
  });

  M('toBeNull', () => {
    if (actual !== null)
      fail(`expected ${formatValue(actual)} to be null`, null, 'toBeNull');
    else pass('expected value NOT to be null');
  });

  M('toBeTruthy', () => {
    if (!actual)
      fail(`expected ${formatValue(actual)} to be truthy`, undefined, 'toBeTruthy');
    else pass('expected value NOT to be truthy');
  });

  M('toBeFalsy', () => {
    if (actual)
      fail(`expected ${formatValue(actual)} to be falsy`, undefined, 'toBeFalsy');
    else pass('expected value NOT to be falsy');
  });

  M('toBeNaN', () => {
    if (!Number.isNaN(actual))
      fail(`expected ${formatValue(actual)} to be NaN`, NaN, 'toBeNaN');
    else pass('expected value NOT to be NaN');
  });

  M('toBe', (expected) => {
    const ok = Object.is(actual, expected);
    if (!ok)
      fail(
        `expected ${formatValue(actual)} to be ${formatValue(expected)} (Object.is)`,
        expected,
        'toBe'
      );
    else pass(`expected ${formatValue(actual)} NOT to be ${formatValue(expected)}`);
  });

  M('toEqual', (expected) => {
    const ok = deepEqual(actual, expected);
    if (!ok)
      fail(
        `expected value to deeply equal:\n  ${formatValue(expected)}\nbut got:\n  ${formatValue(actual)}`,
        expected,
        'toEqual'
      );
    else pass('expected values NOT to be deeply equal');
  });

  M('toStrictEqual', (expected) => {
    if (actual?.constructor !== expected?.constructor) {
      fail(
        `expected constructor ${actual?.constructor?.name} to equal ${expected?.constructor?.name}`,
        expected,
        'toStrictEqual'
      );
      return;
    }
    const ok = deepEqual(actual, expected);
    if (!ok)
      fail(
        `expected value to strictly equal:\n  ${formatValue(expected)}\nbut got:\n  ${formatValue(actual)}`,
        expected,
        'toStrictEqual'
      );
    else pass('expected values NOT to be strictly equal');
  });

  M('toContain', (needle) => {
    let ok = false;
    if (typeof actual === 'string' || Array.isArray(actual)) {
      ok = actual.includes(needle);
    } else if (actual && typeof actual[Symbol.iterator] === 'function') {
      for (const v of actual) {
        if (deepEqual(v, needle)) {
          ok = true;
          break;
        }
      }
    }
    if (!ok)
      fail(
        `expected ${formatValue(actual)} to contain ${formatValue(needle)}`,
        needle,
        'toContain'
      );
    else pass(`expected ${formatValue(actual)} NOT to contain ${formatValue(needle)}`);
  });

  M('toMatch', (regex) => {
    const re = regex instanceof RegExp ? regex : new RegExp(String(regex));
    const str = String(actual);
    if (!re.test(str))
      fail(`expected ${formatValue(actual)} to match ${re}`, re, 'toMatch');
    else pass(`expected ${formatValue(actual)} NOT to match ${re}`);
  });

  M('toBeGreaterThan', (n) => {
    if (!(actual > n))
      fail(`expected ${formatValue(actual)} to be greater than ${n}`, n, 'toBeGreaterThan');
    else pass(`expected ${formatValue(actual)} NOT to be greater than ${n}`);
  });

  M('toBeGreaterThanOrEqual', (n) => {
    if (!(actual >= n))
      fail(`expected ${formatValue(actual)} to be >= ${n}`, n, 'toBeGreaterThanOrEqual');
    else pass(`expected ${formatValue(actual)} to be < ${n}`);
  });

  M('toBeLessThan', (n) => {
    if (!(actual < n))
      fail(`expected ${formatValue(actual)} to be less than ${n}`, n, 'toBeLessThan');
    else pass(`expected ${formatValue(actual)} NOT to be less than ${n}`);
  });

  M('toBeLessThanOrEqual', (n) => {
    if (!(actual <= n))
      fail(`expected ${formatValue(actual)} to be <= ${n}`, n, 'toBeLessThanOrEqual');
    else pass(`expected ${formatValue(actual)} to be > ${n}`);
  });

  M('toHaveLength', (n) => {
    const len = actual && actual.length;
    if (len !== n)
      fail(`expected length ${len} to equal ${n}`, n, 'toHaveLength');
    else pass(`expected length NOT to equal ${n}`);
  });

  chain.toHaveProperty = function (key, value) {
    if (actual == null) {
      fail(`expected ${formatValue(actual)} to have property ${key}`, undefined, 'toHaveProperty');
      return chain;
    }
    const keys = String(key).split('.');
    let cur = actual;
    for (const k of keys) {
      if (cur == null || !(k in cur)) {
        fail(`expected ${formatValue(actual)} to have property ${key}`, undefined, 'toHaveProperty');
        return chain;
      }
      cur = cur[k];
    }
    if (arguments.length >= 2) {
      if (!deepEqual(cur, value))
        fail(
          `expected property ${key} to equal ${formatValue(value)}, got ${formatValue(cur)}`,
          value,
          'toHaveProperty'
        );
      else pass(`expected property ${key} NOT to equal ${formatValue(value)}`);
    }
    return chain;
  };

  M('toBeInstanceOf', (Ctor) => {
    if (!(actual instanceof Ctor))
      fail(`expected value to be instance of ${Ctor.name}`, Ctor, 'toBeInstanceOf');
    else pass(`expected value NOT to be instance of ${Ctor.name}`);
  });

  M('toThrow', (match) => {
    let thrown = false;
    let thrownErr = null;
    if (typeof actual !== 'function') {
      fail('toThrow expects actual to be a function', undefined, 'toThrow');
      return;
    }
    try {
      const result = actual();
      if (result && typeof result.then === 'function') {
        fail(
          'toThrow does not support async functions; use async/await in test body',
          undefined,
          'toThrow'
        );
        return;
      }
    } catch (e) {
      thrown = true;
      thrownErr = e;
    }
    if (!thrown) {
      fail('expected function to throw', undefined, 'toThrow');
      return;
    }
    if (match !== undefined) {
      const msg = typeof thrownErr?.message === 'string' ? thrownErr.message : String(thrownErr);
      let ok = false;
      if (match instanceof RegExp) ok = match.test(msg);
      else if (typeof match === 'string') ok = msg.includes(match);
      else if (match instanceof Error) ok = thrownErr instanceof match.constructor;
      if (!ok)
        fail(
          `expected thrown message ${formatValue(msg)} to match ${formatValue(match)}`,
          match,
          'toThrow'
        );
      else pass(`expected thrown message NOT to match ${formatValue(match)}`);
    }
  });

  M('toSatisfy', (predicate) => {
    if (!predicate(actual))
      fail(`expected value to satisfy predicate`, undefined, 'toSatisfy');
    else pass('expected value NOT to satisfy predicate');
  });

  Object.defineProperty(chain, 'not', {
    get() {
      chain._notFlag = !chain._notFlag;
      return chain;
    },
    configurable: true,
  });

  return chain;
}

module.exports = { expect, deepEqual, AssertionError };
