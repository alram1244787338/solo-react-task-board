const {
  restoreStateFromStorage,
  normalizeState,
  STORAGE_KEY,
} = require('../src/contexts/boardStorage');

const INIT = Object.freeze({ columns: [], cards: {} });

function makeStore(map) {
  return (key) => (Object.prototype.hasOwnProperty.call(map, key) ? map[key] : null);
}

describe('boardStorage', () => {
  describe('STORAGE_KEY', () => {
    it('等于 task-board-state', () => {
      expect(STORAGE_KEY).toBe('task-board-state');
    });
  });

  describe('normalizeState', () => {
    it('完全合法的对象原样保留字段', () => {
      const input = {
        columns: [{ id: 'a', title: 'Todo', cardIds: ['x'] }],
        cards: { x: { id: 'x', title: 'hi' } },
      };
      expect(normalizeState(input)).toEqual(input);
    });

    it('输入为 null 时返回 fallback', () => {
      expect(normalizeState(null)).toEqual(INIT);
    });

    it('输入为 undefined 时返回 fallback', () => {
      expect(normalizeState(undefined)).toEqual(INIT);
    });

    it('输入为数组（非对象）时返回 fallback', () => {
      expect(normalizeState([1, 2, 3])).toEqual(INIT);
    });

    it('columns 缺省时补空数组', () => {
      const out = normalizeState({ cards: { a: {} } });
      expect(out.columns).toEqual([]);
      expect(out.cards).toEqual({ a: {} });
    });

    it('columns 非数组（如对象、字符串）时补空数组', () => {
      expect(normalizeState({ columns: 'nope', cards: {} })).toEqual(INIT);
      expect(normalizeState({ columns: { 0: 'a' }, cards: {} }).columns).toEqual([]);
    });

    it('cards 缺省时补空对象', () => {
      const out = normalizeState({ columns: [] });
      expect(out.cards).toEqual({});
      expect(out.columns).toEqual([]);
    });

    it('cards 为数组时补空对象', () => {
      expect(normalizeState({ columns: [], cards: [1, 2] }).cards).toEqual({});
    });

    it('cards 为 null 时补空对象', () => {
      expect(normalizeState({ columns: [], cards: null }).cards).toEqual({});
    });

    it('cards 为字符串时补空对象', () => {
      expect(normalizeState({ columns: [], cards: 'x' }).cards).toEqual({});
    });
  });

  describe('restoreStateFromStorage', () => {
    it('localStorage 为空时返回 init 参数', () => {
      const init = { columns: [], cards: {} };
      const store = makeStore({});
      const out = restoreStateFromStorage(init, store);
      expect(out).toBe(init);
    });

    it('STORAGE_KEY 对应 null 值时返回 init', () => {
      const store = makeStore({ 'task-board-state': null });
      const init = { columns: [], cards: {} };
      expect(restoreStateFromStorage(init, store)).toBe(init);
    });

    it('STORAGE_KEY 对应空字符串时 JSON 抛出，fallback 到 init', () => {
      const store = makeStore({ 'task-board-state': '' });
      const init = { columns: [], cards: {} };
      expect(restoreStateFromStorage(init, store)).toBe(init);
    });

    it('损坏的 JSON（语法错误）fallback 到 init，不抛错', () => {
      const store = makeStore({ 'task-board-state': '{ columns: [,' });
      const init = { columns: [], cards: {} };
      const out = restoreStateFromStorage(init, store);
      expect(out).toBe(init);
    });

    it('合法 JSON 被 parse 并通过 normalizeState', () => {
      const raw = JSON.stringify({
        columns: [{ id: '1', title: '待办', cardIds: ['a'] }],
        cards: { a: { id: 'a', title: 'hello' } },
      });
      const store = makeStore({ 'task-board-state': raw });
      const out = restoreStateFromStorage(INIT, store);
      expect(out.columns.map((c) => c.title)).toEqual(['待办']);
      expect(out.cards.a.title).toBe('hello');
    });

    it('getStorageItem 抛异常时 fallback 到 init', () => {
      function badGet() {
        throw new Error('read-only storage');
      }
      const init = { columns: [], cards: {} };
      const out = restoreStateFromStorage(init, badGet);
      expect(out).toBe(init);
    });

    it('JSON 顶层为数组时 normalize 兜底', () => {
      const store = makeStore({ 'task-board-state': '[1,2,3]' });
      const out = restoreStateFromStorage(INIT, store);
      expect(out).toEqual(INIT);
    });

    it('JSON 中 columns 缺 cards 坏时，都能正常 normalize', () => {
      const raw = JSON.stringify({ columns: null, cards: [1, 2, 3] });
      const store = makeStore({ 'task-board-state': raw });
      const out = restoreStateFromStorage(INIT, store);
      expect(out).toEqual(INIT);
    });

    it('只有 STORAGE_KEY 这个 key 被读取（不读别的 key）', () => {
      const calls = [];
      function store(key) {
        calls.push(key);
        return null;
      }
      restoreStateFromStorage(INIT, store);
      expect(calls).toEqual([STORAGE_KEY]);
    });
  });
});
