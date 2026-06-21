export function createCompositionMachine(initialValue = '') {
  let value = initialValue;
  let pending = initialValue;
  let isComposing = false;
  const listeners = new Set();

  const notify = () => {
    listeners.forEach((fn) => fn(value));
  };

  return {
    getValue() {
      return value;
    },
    getPending() {
      return pending;
    },
    isComposing() {
      return isComposing;
    },
    onChange(inputValue) {
      pending = inputValue;
      if (!isComposing) {
        value = inputValue;
        notify();
      }
      return value;
    },
    onCompositionStart() {
      isComposing = true;
    },
    onCompositionEnd(finalValue) {
      isComposing = false;
      pending = finalValue;
      value = finalValue;
      notify();
      return value;
    },
    setValue(next) {
      pending = next;
      value = next;
      notify();
      return value;
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
