const { boardReducer, initialState, ActionTypes } = require('../src/hooks/useBoard');

function addColumn(state, title) {
  return boardReducer(state, {
    type: ActionTypes.ADD_COLUMN,
    payload: { title },
  });
}
function addCard(state, columnId, title, description = '') {
  return boardReducer(state, {
    type: ActionTypes.ADD_CARD,
    payload: { columnId, title, description },
  });
}

describe('boardReducer', () => {
  it('初始状态包含空 columns 数组和空 cards 对象', () => {
    expect(initialState).toEqual({ columns: [], cards: {} });
  });

  it('未知 action 返回原 state（引用不变）', () => {
    const state = { columns: [], cards: {} };
    const next = boardReducer(state, { type: '__UNKNOWN__' });
    expect(next).toBe(state);
  });

  describe('ADD_COLUMN', () => {
    it('新增一列为最后一项，id 非空且 cardIds 为空', () => {
      const s1 = addColumn(initialState, '待办');
      expect(s1.columns).toHaveLength(1);
      expect(s1.columns[0].title).toBe('待办');
      expect(s1.columns[0].cardIds).toEqual([]);
      expect(typeof s1.columns[0].id).toBe('string');
      expect(s1.columns[0].id.length).toBeGreaterThan(0);
      expect(s1.cards).toEqual({});
    });

    it('连续添加多列顺序正确', () => {
      let s = initialState;
      s = addColumn(s, 'Todo');
      s = addColumn(s, 'Doing');
      s = addColumn(s, 'Done');
      expect(s.columns.map((c) => c.title)).toEqual(['Todo', 'Doing', 'Done']);
    });

    it('添加列不会变更已有列的 id', () => {
      const s1 = addColumn(initialState, 'A');
      const id = s1.columns[0].id;
      const s2 = addColumn(s1, 'B');
      expect(s2.columns[0].id).toBe(id);
    });
  });

  describe('UPDATE_COLUMN', () => {
    it('更新指定列的标题', () => {
      const s1 = addColumn(initialState, '旧名');
      const colId = s1.columns[0].id;
      const s2 = boardReducer(s1, {
        type: ActionTypes.UPDATE_COLUMN,
        payload: { columnId: colId, title: '新名' },
      });
      expect(s2.columns[0].title).toBe('新名');
      expect(s2.columns[0].id).toBe(colId);
    });

    it('id 不匹配则状态不变', () => {
      const s1 = addColumn(initialState, '待办');
      const s2 = boardReducer(s1, {
        type: ActionTypes.UPDATE_COLUMN,
        payload: { columnId: 'non-exist', title: 'xxx' },
      });
      expect(s2).toEqual(s1);
    });
  });

  describe('ADD_CARD', () => {
    let sCol;
    let colId;
    beforeEach(() => {
      sCol = addColumn(initialState, '待办');
      colId = sCol.columns[0].id;
    });

    it('卡片被加入 cards 对象并挂到列 cardIds 末尾', () => {
      const s2 = addCard(sCol, colId, '写测试');
      expect(Object.keys(s2.cards)).toHaveLength(1);
      expect(s2.columns[0].cardIds).toHaveLength(1);
      const cardId = s2.columns[0].cardIds[0];
      expect(s2.cards[cardId].title).toBe('写测试');
      expect(s2.cards[cardId].description).toBe('');
      expect(typeof s2.cards[cardId].createdAt).toBe('number');
    });

    it('description 正确保存', () => {
      const s2 = addCard(sCol, colId, '买牛奶', '买低脂的');
      const cardId = s2.columns[0].cardIds[0];
      expect(s2.cards[cardId].description).toBe('买低脂的');
    });

    it('连续添加顺序正确', () => {
      let s = sCol;
      s = addCard(s, colId, 'a');
      s = addCard(s, colId, 'b');
      s = addCard(s, colId, 'c');
      const titles = s.columns[0].cardIds.map((id) => s.cards[id].title);
      expect(titles).toEqual(['a', 'b', 'c']);
    });
  });

  describe('UPDATE_CARD', () => {
    let sWithCard;
    let cardId;
    beforeEach(() => {
      let s = addColumn(initialState, '待办');
      s = addCard(s, s.columns[0].id, '旧标题', '旧描述');
      cardId = s.columns[0].cardIds[0];
      sWithCard = s;
    });

    it('支持只更新标题', () => {
      const s2 = boardReducer(sWithCard, {
        type: ActionTypes.UPDATE_CARD,
        payload: { cardId, updates: { title: '新标题' } },
      });
      expect(s2.cards[cardId].title).toBe('新标题');
      expect(s2.cards[cardId].description).toBe('旧描述');
    });

    it('支持同时更新标题和描述', () => {
      const s2 = boardReducer(sWithCard, {
        type: ActionTypes.UPDATE_CARD,
        payload: { cardId, updates: { title: 'x', description: 'y' } },
      });
      expect(s2.cards[cardId].title).toBe('x');
      expect(s2.cards[cardId].description).toBe('y');
    });

    it('id 不存在时 cards 引用不变', () => {
      const s2 = boardReducer(sWithCard, {
        type: ActionTypes.UPDATE_CARD,
        payload: { cardId: 'nope', updates: { title: 'x' } },
      });
      expect(s2).toEqual(sWithCard);
    });
  });

  describe('REMOVE_CARD', () => {
    it('移除最后一个卡片后列 cardIds 变空，cards 对象清除', () => {
      let s = addColumn(initialState, '待办');
      const colId = s.columns[0].id;
      s = addCard(s, colId, '唯一卡片');
      const cardId = s.columns[0].cardIds[0];
      expect(s.columns[0].cardIds).toHaveLength(1);

      const s2 = boardReducer(s, {
        type: ActionTypes.REMOVE_CARD,
        payload: { columnId: colId, cardId },
      });
      expect(s2.columns[0].cardIds).toEqual([]);
      expect(s2.cards).toEqual({});
    });

    it('多卡片时只移除指定的那个', () => {
      let s = addColumn(initialState, '待办');
      const colId = s.columns[0].id;
      s = addCard(s, colId, 'a');
      s = addCard(s, colId, 'b');
      s = addCard(s, colId, 'c');
      const bId = s.columns[0].cardIds[1];
      const s2 = boardReducer(s, {
        type: ActionTypes.REMOVE_CARD,
        payload: { columnId: colId, cardId: bId },
      });
      const titles = s2.columns[0].cardIds.map((id) => s2.cards[id].title);
      expect(titles).toEqual(['a', 'c']);
      expect(s2.cards[bId]).toBeUndefined();
    });
  });

  describe('REMOVE_COLUMN', () => {
    it('删除空列（边界：0 卡片）', () => {
      let s = addColumn(initialState, '空列');
      s = addColumn(s, '待办');
      const emptyColId = s.columns[0].id;
      const todoColId = s.columns[1].id;

      const s2 = boardReducer(s, {
        type: ActionTypes.REMOVE_COLUMN,
        payload: { columnId: emptyColId },
      });
      expect(s2.columns.map((c) => c.id)).toEqual([todoColId]);
      expect(s2.cards).toEqual({});
    });

    it('删除非空列时，该列卡片从 cards 对象中一并清除（级联删除）', () => {
      let s = addColumn(initialState, '待办');
      s = addColumn(s, '已完成');
      const todoId = s.columns[0].id;
      const doneId = s.columns[1].id;
      s = addCard(s, todoId, 'a');
      s = addCard(s, todoId, 'b');
      s = addCard(s, doneId, 'c');

      const todoCardIds = [...s.columns[0].cardIds];
      expect(todoCardIds).toHaveLength(2);
      const cId = s.columns[1].cardIds[0];

      const s2 = boardReducer(s, {
        type: ActionTypes.REMOVE_COLUMN,
        payload: { columnId: todoId },
      });
      expect(s2.columns.map((c) => c.id)).toEqual([doneId]);
      expect(s2.columns[0].cardIds).toEqual([cId]);
      expect(s2.cards[cId].title).toBe('c');
      expect(s2.cards[todoCardIds[0]]).toBeUndefined();
      expect(s2.cards[todoCardIds[1]]).toBeUndefined();
    });

    it('删除不存在的列时状态不变', () => {
      const s = addColumn(initialState, '待办');
      const s2 = boardReducer(s, {
        type: ActionTypes.REMOVE_COLUMN,
        payload: { columnId: 'ghost' },
      });
      expect(s2).toEqual(s);
    });
  });

  describe('MOVE_COLUMN', () => {
    it('调换列顺序', () => {
      let s = initialState;
      s = addColumn(s, 'A');
      s = addColumn(s, 'B');
      s = addColumn(s, 'C');
      const s2 = boardReducer(s, {
        type: ActionTypes.MOVE_COLUMN,
        payload: { fromIndex: 2, toIndex: 0 },
      });
      expect(s2.columns.map((c) => c.title)).toEqual(['C', 'A', 'B']);
    });
  });

  describe('MOVE_CARD', () => {
    it('同列内调整顺序', () => {
      let s = addColumn(initialState, '待办');
      const colId = s.columns[0].id;
      s = addCard(s, colId, '1');
      s = addCard(s, colId, '2');
      s = addCard(s, colId, '3');
      const s2 = boardReducer(s, {
        type: ActionTypes.MOVE_CARD,
        payload: {
          fromColumnId: colId,
          toColumnId: colId,
          fromIndex: 2,
          toIndex: 0,
        },
      });
      const titles = s2.columns[0].cardIds.map((id) => s2.cards[id].title);
      expect(titles).toEqual(['3', '1', '2']);
    });

    it('跨列移动卡片（重要边界）', () => {
      let s = addColumn(initialState, 'Todo');
      s = addColumn(s, 'Done');
      const todoId = s.columns[0].id;
      const doneId = s.columns[1].id;
      s = addCard(s, todoId, '写代码');
      s = addCard(s, todoId, '写测试');
      s = addCard(s, doneId, '需求文档');

      const cardIdToMove = s.columns[0].cardIds[1]; // '写测试'
      const s2 = boardReducer(s, {
        type: ActionTypes.MOVE_CARD,
        payload: {
          fromColumnId: todoId,
          toColumnId: doneId,
          fromIndex: 1,
          toIndex: 1,
        },
      });
      const todoTitles = s2.columns[0].cardIds.map((id) => s2.cards[id].title);
      const doneTitles = s2.columns[1].cardIds.map((id) => s2.cards[id].title);
      expect(todoTitles).toEqual(['写代码']);
      expect(doneTitles).toEqual(['需求文档', '写测试']);
      expect(s2.cards[cardIdToMove].title).toBe('写测试');
    });

    it('from/to 列 id 非法不抛错，state 不变', () => {
      let s = addColumn(initialState, 'Todo');
      const colId = s.columns[0].id;
      s = addCard(s, colId, 'a');
      const s2 = boardReducer(s, {
        type: ActionTypes.MOVE_CARD,
        payload: {
          fromColumnId: colId,
          toColumnId: 'BAD_ID',
          fromIndex: 0,
          toIndex: 0,
        },
      });
      expect(s2).toEqual(s);
    });
  });
});
