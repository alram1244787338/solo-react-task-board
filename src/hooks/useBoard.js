import { useBoardDispatch } from '../contexts/BoardContext';
import { generateId } from '../utils/id';

export const initialState = {
  columns: [],
  cards: {},
};

export const ActionTypes = {
  ADD_COLUMN: 'ADD_COLUMN',
  REMOVE_COLUMN: 'REMOVE_COLUMN',
  UPDATE_COLUMN: 'UPDATE_COLUMN',
  ADD_CARD: 'ADD_CARD',
  REMOVE_CARD: 'REMOVE_CARD',
  UPDATE_CARD: 'UPDATE_CARD',
  MOVE_CARD: 'MOVE_CARD',
  MOVE_COLUMN: 'MOVE_COLUMN',
};

export function boardReducer(state, action) {
  switch (action.type) {
    case ActionTypes.ADD_COLUMN: {
      const { title } = action.payload;
      const newColumn = {
        id: generateId(),
        title,
        cardIds: [],
      };
      return {
        ...state,
        columns: [...state.columns, newColumn],
      };
    }

    case ActionTypes.REMOVE_COLUMN: {
      const { columnId } = action.payload;
      const column = state.columns.find((c) => c.id === columnId);
      const newCards = { ...state.cards };
      if (column) {
        column.cardIds.forEach((id) => delete newCards[id]);
      }
      return {
        ...state,
        columns: state.columns.filter((c) => c.id !== columnId),
        cards: newCards,
      };
    }

    case ActionTypes.UPDATE_COLUMN: {
      const { columnId, title } = action.payload;
      return {
        ...state,
        columns: state.columns.map((c) =>
          c.id === columnId ? { ...c, title } : c
        ),
      };
    }

    case ActionTypes.ADD_CARD: {
      const { columnId, title, description } = action.payload;
      const cardId = generateId();
      const newCard = {
        id: cardId,
        title,
        description: description || '',
        createdAt: Date.now(),
      };
      return {
        ...state,
        columns: state.columns.map((c) =>
          c.id === columnId ? { ...c, cardIds: [...c.cardIds, cardId] } : c
        ),
        cards: {
          ...state.cards,
          [cardId]: newCard,
        },
      };
    }

    case ActionTypes.REMOVE_CARD: {
      const { columnId, cardId } = action.payload;
      const newCards = { ...state.cards };
      delete newCards[cardId];
      return {
        ...state,
        columns: state.columns.map((c) =>
          c.id === columnId
            ? { ...c, cardIds: c.cardIds.filter((id) => id !== cardId) }
            : c
        ),
        cards: newCards,
      };
    }

    case ActionTypes.UPDATE_CARD: {
      const { cardId, updates } = action.payload;
      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: { ...state.cards[cardId], ...updates },
        },
      };
    }

    case ActionTypes.MOVE_CARD: {
      const { fromColumnId, toColumnId, fromIndex, toIndex } = action.payload;
      const newColumns = state.columns.map((c) => ({ ...c, cardIds: [...c.cardIds] }));
      const fromCol = newColumns.find((c) => c.id === fromColumnId);
      const toCol = newColumns.find((c) => c.id === toColumnId);
      if (!fromCol || !toCol) return state;
      const [movedCardId] = fromCol.cardIds.splice(fromIndex, 1);
      toCol.cardIds.splice(toIndex, 0, movedCardId);
      return { ...state, columns: newColumns };
    }

    case ActionTypes.MOVE_COLUMN: {
      const { fromIndex, toIndex } = action.payload;
      const newColumns = [...state.columns];
      const [moved] = newColumns.splice(fromIndex, 1);
      newColumns.splice(toIndex, 0, moved);
      return { ...state, columns: newColumns };
    }

    default:
      return state;
  }
}

export function useBoardActions() {
  const dispatch = useBoardDispatch();
  return {
    addColumn: (title) =>
      dispatch({ type: ActionTypes.ADD_COLUMN, payload: { title } }),
    removeColumn: (columnId) =>
      dispatch({ type: ActionTypes.REMOVE_COLUMN, payload: { columnId } }),
    updateColumn: (columnId, title) =>
      dispatch({
        type: ActionTypes.UPDATE_COLUMN,
        payload: { columnId, title },
      }),
    addCard: (columnId, title, description) =>
      dispatch({
        type: ActionTypes.ADD_CARD,
        payload: { columnId, title, description },
      }),
    removeCard: (columnId, cardId) =>
      dispatch({
        type: ActionTypes.REMOVE_CARD,
        payload: { columnId, cardId },
      }),
    updateCard: (cardId, updates) =>
      dispatch({
        type: ActionTypes.UPDATE_CARD,
        payload: { cardId, updates },
      }),
    moveCard: (fromColumnId, toColumnId, fromIndex, toIndex) =>
      dispatch({
        type: ActionTypes.MOVE_CARD,
        payload: { fromColumnId, toColumnId, fromIndex, toIndex },
      }),
    moveColumn: (fromIndex, toIndex) =>
      dispatch({
        type: ActionTypes.MOVE_COLUMN,
        payload: { fromIndex, toIndex },
      }),
  };
}
