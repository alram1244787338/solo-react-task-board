import { useState, useEffect, useRef, useCallback } from 'react';
import { createCompositionMachine } from './compositionMachine';

export function useComposition(initialValue = '') {
  const machineRef = useRef(null);
  if (!machineRef.current) {
    machineRef.current = createCompositionMachine(initialValue);
  }
  const machine = machineRef.current;

  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const unsub = machine.subscribe((next) => setValue(next));
    return unsub;
  }, [machine]);

  const bindInput = {
    value,
    onChange: useCallback(
      (e) => machine.onChange(e.target.value),
      [machine]
    ),
    onCompositionStart: useCallback(
      () => machine.onCompositionStart(),
      [machine]
    ),
    onCompositionEnd: useCallback(
      (e) => machine.onCompositionEnd(e.target.value),
      [machine]
    ),
  };

  const setValueDirect = useCallback(
    (v) => machine.setValue(v),
    [machine]
  );

  return [value, bindInput, setValueDirect];
}
