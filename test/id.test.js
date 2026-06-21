const { generateId } = require('../src/utils/id');

describe('generateId', () => {
  it('返回非空字符串', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('总长度合理（timestamp + random 段组合）', () => {
    for (let i = 0; i < 20; i++) {
      const id = generateId();
      expect(id.length).toBeGreaterThanOrEqual(14);
      expect(id.length).toBeLessThanOrEqual(24);
    }
  });

  it('字符全是合法 36 进制（0-9 a-z）', () => {
    const base36Regex = /^[0-9a-z]+$/;
    for (let i = 0; i < 100; i++) {
      const id = generateId();
      expect(id).toMatch(base36Regex);
    }
  });

  it('连续 10000 个都不重复', () => {
    const seen = new Set();
    for (let i = 0; i < 10000; i++) {
      const id = generateId();
      expect(seen.has(id)).toBe(false);
      seen.add(id);
    }
    expect(seen.size).toBe(10000);
  });

  it('可以安全地用作对象键', () => {
    const obj = {};
    const ids = [];
    for (let i = 0; i < 100; i++) {
      const id = generateId();
      ids.push(id);
      obj[id] = i;
    }
    ids.forEach((id, i) => {
      expect(obj[id]).toBe(i);
    });
  });
});
