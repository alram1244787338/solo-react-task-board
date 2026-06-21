import React, { useState, useRef, useEffect } from 'react';
import { useBoardState } from '../contexts/BoardContext';
import { useBoardActions } from '../hooks/useBoard';
import { useComposition } from '../hooks/useComposition';
import Column from './Column';
import Modal from './Modal';
import './Board.css';
import './Confirm.css';

function Board() {
  const state = useBoardState();
  const { addColumn } = useBoardActions();
  const columns = state && Array.isArray(state.columns) ? state.columns : [];
  const cards = state && state.cards && typeof state.cards === 'object' ? state.cards : {};
  const isEmpty = columns.length === 0;

  const [showAddColumn, setShowAddColumn] = useState(false);
  const [columnTitle, bindColumnTitle, setColumnTitleDirect] = useComposition('');
  const [titleError, setTitleError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (showAddColumn && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [showAddColumn]);

  const handleOpenAddColumn = () => {
    setColumnTitleDirect('');
    setTitleError('');
    setShowAddColumn(true);
  };

  const handleCloseAddColumn = () => {
    setShowAddColumn(false);
    setColumnTitleDirect('');
    setTitleError('');
  };

  const handleColumnTitleChange = (e) => {
    bindColumnTitle.onChange(e);
    if (titleError) setTitleError('');
  };

  const handleSubmitAddColumn = (e) => {
    e.preventDefault();
    const trimmed = columnTitle.trim();
    if (!trimmed) {
      setTitleError('请输入列名');
      return;
    }
    addColumn(trimmed);
    handleCloseAddColumn();
  };

  return (
    <div className="tb-board">
      <header className="tb-board-header">
        <h1 className="tb-board-title">📋 任务看板</h1>
        <p className="tb-board-subtitle">Trello 风格的任务管理</p>
      </header>

      {isEmpty ? (
        <div className="tb-empty-state">
          <div className="tb-empty-icon">📭</div>
          <div className="tb-empty-title">还没有列</div>
          <div className="tb-empty-desc">点击下方「+ 添加列」开始创建你的第一个看板吧</div>
        </div>
      ) : (
        <div className="tb-columns-container">
          {columns.map((col, index) => (
            <Column
              key={col.id}
              column={col}
              index={index}
              cards={col.cardIds
                ? col.cardIds.map((id) => cards[id]).filter(Boolean)
                : []}
            />
          ))}
        </div>
      )}

      <div
        className={`tb-add-column ${isEmpty ? 'tb-add-column-centered' : ''}`}
        onClick={handleOpenAddColumn}
      >
        <span className="tb-add-column-icon">+</span>
        <span>添加列</span>
      </div>

      <Modal isOpen={showAddColumn} onClose={handleCloseAddColumn} title="添加新列">
        <form onSubmit={handleSubmitAddColumn}>
          <div className="tb-form-group">
            <label className="tb-form-label">
              列名<span className="tb-required">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              className="tb-form-input"
              value={bindColumnTitle.value}
              onChange={handleColumnTitleChange}
              onCompositionStart={bindColumnTitle.onCompositionStart}
              onCompositionEnd={bindColumnTitle.onCompositionEnd}
              placeholder="例如：待办、进行中"
            />
            {titleError && <div className="tb-form-error">{titleError}</div>}
          </div>
          <div className="tb-form-actions">
            <button type="button" className="tb-btn tb-btn-default" onClick={handleCloseAddColumn}>
              取消
            </button>
            <button type="submit" className="tb-btn tb-btn-primary">
              创建
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Board;
