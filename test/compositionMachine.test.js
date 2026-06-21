const { createCompositionMachine } = require('../src/hooks/compositionMachine');

describe('createCompositionMachine', () => {
  it('初始状态：value 为 initial，pending 同值，未 composing', () => {
    const m = createCompositionMachine('hello');
    expect(m.getValue()).toBe('hello');
    expect(m.getPending()).toBe('hello');
    expect(m.isComposing()).toBe(false);
  });

  it('默认 initialValue 为空字符串', () => {
    const m = createCompositionMachine();
    expect(m.getValue()).toBe('');
  });

  describe('普通英文输入（无 composition）', () => {
    it('每次 onChange 都同步 value 和 pending', () => {
      const m = createCompositionMachine('');
      m.onChange('a');
      expect(m.getValue()).toBe('a');
      expect(m.getPending()).toBe('a');
      m.onChange('ab');
      expect(m.getValue()).toBe('ab');
    });
  });

  describe('拼音组字中（composition 周期）', () => {
    it('onCompositionStart 后 isComposing 为 true', () => {
      const m = createCompositionMachine('');
      m.onCompositionStart();
      expect(m.isComposing()).toBe(true);
    });

    it('composing 期间 onChange 只更新 pending，不更新 value', () => {
      const m = createCompositionMachine('');
      m.onCompositionStart();
      m.onChange('ni');
      expect(m.getPending()).toBe('ni');
      expect(m.getValue()).toBe('');
      m.onChange('nihao');
      expect(m.getPending()).toBe('nihao');
      expect(m.getValue()).toBe('');
    });

    it('compositionEnd 时 value 同步到最终选词', () => {
      const m = createCompositionMachine('');
      m.onCompositionStart();
      m.onChange('nihao');
      const final = m.onCompositionEnd('你好');
      expect(final).toBe('你好');
      expect(m.getValue()).toBe('你好');
      expect(m.getPending()).toBe('你好');
      expect(m.isComposing()).toBe(false);
    });

    it('完整 2 次 composition 周期互不干扰', () => {
      const m = createCompositionMachine('');
      m.onCompositionStart();
      m.onChange('ni');
      m.onCompositionEnd('你');
      expect(m.getValue()).toBe('你');

      m.onCompositionStart();
      m.onChange('hao');
      expect(m.getValue()).toBe('你');
      expect(m.getPending()).toBe('hao');
      m.onCompositionEnd('好');
      expect(m.getValue()).toBe('好');
    });
  });

  describe('setValue 直接设置', () => {
    it('立即同步 value 和 pending', () => {
      const m = createCompositionMachine('a');
      m.setValue('reset');
      expect(m.getValue()).toBe('reset');
      expect(m.getPending()).toBe('reset');
    });

    it('即使在 composing 中，setValue 也能直接同步', () => {
      const m = createCompositionMachine('');
      m.onCompositionStart();
      m.onChange('abc');
      m.setValue('强行设值');
      expect(m.getValue()).toBe('强行设值');
      expect(m.isComposing()).toBe(true);
    });
  });

  describe('subscribe 订阅机制', () => {
    it('普通 onChange 触发订阅', () => {
      const m = createCompositionMachine('');
      const calls = [];
      m.subscribe((v) => calls.push(v));
      m.onChange('a');
      m.onChange('ab');
      expect(calls).toEqual(['a', 'ab']);
    });

    it('composing 中 onChange 不触发订阅，compositionEnd 才触发', () => {
      const m = createCompositionMachine('');
      const calls = [];
      m.subscribe((v) => calls.push(v));
      m.onCompositionStart();
      m.onChange('ni');
      m.onChange('nihao');
      expect(calls).toHaveLength(0);
      m.onCompositionEnd('你好');
      expect(calls).toEqual(['你好']);
    });

    it('setValue 触发订阅', () => {
      const m = createCompositionMachine('');
      const calls = [];
      m.subscribe((v) => calls.push(v));
      m.setValue('x');
      expect(calls).toEqual(['x']);
    });

    it('返回取消订阅函数，解绑后不再回调', () => {
      const m = createCompositionMachine('');
      const calls = [];
      const unsub = m.subscribe((v) => calls.push(v));
      m.onChange('a');
      unsub();
      m.onChange('ab');
      expect(calls).toEqual(['a']);
    });

    it('多个订阅者都收到通知', () => {
      const m = createCompositionMachine('');
      const a = [];
      const b = [];
      m.subscribe((v) => a.push(v));
      m.subscribe((v) => b.push(v));
      m.onChange('test');
      m.onCompositionEnd('结束');
      expect(a).toEqual(['test', '结束']);
      expect(b).toEqual(['test', '结束']);
    });
  });
});
