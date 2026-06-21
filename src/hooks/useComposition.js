import { useState, useRef, useCallback } from 'react';

export function useComposition(initialValue = '') {
  const [value, setValue] = useState(initialValue);
  const isComposingRef = useRef(false);
  const pendingValueRef = useRef(initialValue);

  const handleChange = useCallback((e) => {
    pendingValueRef.current = e.target.value;
    if (!isComposingRef.current) {
      setValue(e.target.value);
    }
  }, []);

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback((e) => {
    isComposingRef.current = false;
    const finalValue = e.target.value;
    pendingValueRef.current = finalValue;
    setValue(finalValue);
  }, []);

  const setValueDirect = useCallback((v) => {
    pendingValueRef.current = v;
    setValue(v);
  }, []);

  const bindInput = {
    value,
    onChange: handleChange,
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd,
  };

  return [value, bindInput, setValueDirect];
}
