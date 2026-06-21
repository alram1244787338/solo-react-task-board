import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { boardReducer, initialState } from '../hooks/useBoard';

const BoardContext = createContext(null);
const BoardDispatchContext = createContext(null);

export function BoardProvider({ children }) {
  const [state, dispatch] = useReducer(boardReducer, initialState, (init) => {
    try {
      const saved = localStorage.getItem('task-board-state');
      if (!saved) return init;
      const parsed = JSON.parse(saved);
      return {
        columns: Array.isArray(parsed.columns) ? parsed.columns : [],
        cards: parsed.cards && typeof parsed.cards === 'object' ? parsed.cards : {},
      };
    } catch {
      return init;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('task-board-state', JSON.stringify(state));
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
