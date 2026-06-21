import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { boardReducer, initialState } from '../hooks/useBoard';
import { STORAGE_KEY, restoreStateFromStorage } from './boardStorage';

const BoardContext = createContext(null);
const BoardDispatchContext = createContext(null);

export function BoardProvider({ children }) {
  const [state, dispatch] = useReducer(
    boardReducer,
    initialState,
    (init) =>
      restoreStateFromStorage(init, (key) =>
        typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null
      )
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
    }
  }, [state]);

  return (
    <BoardContext.Provider value={state}>
      <BoardDispatchContext.Provider value={dispatch}>
        {children}
      </BoardDispatchContext.Provider>
    </BoardContext.Provider>
  );
}

export function useBoardState() {
  const ctx = useContext(BoardContext);
  if (!ctx) {
    throw new Error('useBoardState must be used within a BoardProvider');
  }
  return ctx;
}

export function useBoardDispatch() {
  const ctx = useContext(BoardDispatchContext);
  if (!ctx) {
    throw new Error('useBoardDispatch must be used within a BoardProvider');
  }
  return ctx;
}
