import React from 'react';
import { useBoardState } from '../contexts/BoardContext';
import Column from './Column';
import './Board.css';

const DEFAULT_COLUMNS = [
  { title: '待办', placeholder: true },
  { title: '进行中', placeholder: true },
  { title: '已完成', placeholder: true },
];

function Board() {
  const state = useBoardState();
  const columns = state && Array.isArray(state.columns) ? state.columns : [];
  const cards = state && state.cards && typeof state.cards === 'object' ? state.cards : {};
  const displayColumns = columns.length > 0 ? columns : DEFAULT_COLUMNS;

  return (
    <div className="tb-board">
      <header className="tb-board-header">
        <h1 className="tb-board-title">📋 任务看板</h1>
        <p className="tb-board-subtitle">Trello 风格的任务管理</p>
      </header>
      <div className="tb-columns-container">
        {displayColumns.map((col, index) => (
          <Column
            key={col.id || `placeholder-${index}`}
            column={col}
            index={index}
            cards={
              col.cardIds
                ? col.cardIds.map((id) => cards[id]).filter(Boolean)
                : []
            }
          />
        ))}
        <div className="tb-add-column">
          <span className="tb-add-column-icon">+</span>
          <span>添加列</span>
        </div>
      </div>
    </div>
  );
}

export default Board;
