import React, { useState, useRef, useEffect } from 'react';
import Card from './Card';
import Modal from './Modal';
import Confirm from './Confirm';
import { useBoardActions } from '../hooks/useBoard';
import './Column.css';

function Column({ column, index, cards }) {
  const { updateColumn, removeColumn, addCard } = useBoardActions();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const inputRef = useRef(null);

  const [showAddCard, setShowAddCard] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [cardDesc, setCardDesc] = useState('');
  const [cardTitleError, setCardTitleError] = useState('');
  const cardTitleRef = useRef(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (showAddCard && cardTitleRef.current) {
      setTimeout(() => cardTitleRef.current.focus(), 100);
    }
  }, [showAddCard]);

  const handleDoubleClick = () => {
    setEditTitle(column.title);
    setIsEditing(true);
  };

  const handleEditSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== column.title) {
      updateColumn(column.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleEditBlur = () => {
    handleEditSubmit();
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      setEditTitle(column.title);
      setIsEditing(false);
    }
  };

  const handleOpenAddCard = () => {
    setCardTitle('');
    setCardDesc('');
    setCardTitleError('');
    setShowAddCard(true);
  };

  const handleCloseAddCard = () => {
    setShowAddCard(false);
    setCardTitle('');
    setCardDesc('');
    setCardTitleError('');
  };

  const handleSubmitAddCard = (e) => {
    e.preventDefault();
    const trimmed = cardTitle.trim();
    if (!trimmed) {
      setCardTitleError('请输入卡片标题');
      return;
    }
    addCard(column.id, trimmed, cardDesc.trim());
    handleCloseAddCard();
  };

  const handleDeleteColumn = () => {
    if (cards.length > 0) return;
    removeColumn(column.id);
    setShowDeleteConfirm(false);
  };

  const isEmpty = cards.length === 0;

  return (
    <div className="tb-column">
      <div className="tb-column-header">
        {isEditing ? (
          <form onSubmit={handleEditSubmit} style={{ flex: 1, marginRight: 8 }}>
            <input
              ref={inputRef}
              type="text"
              className="tb-inline-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleEditBlur}
              onKeyDown={handleEditKeyDown}
            />
          </form>
        ) : (
          <h3
            className="tb-column-title"
            onDoubleClick={handleDoubleClick}
            title="双击编辑列名"
            style={{ cursor: 'pointer' }}
          >
            {column.title}
          </h3>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="tb-column-card-count">{cards.length}</span>
          <div className="tb-column-actions">
            <button
              className="tb-icon-btn"
              onClick={handleDoubleClick}
              title="编辑列名"
              aria-label="编辑列名"
            >
              ✏️
            </button>
            <button
              className="tb-icon-btn tb-danger"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={!isEmpty}
              title={isEmpty ? '删除列' : '请先删除列内所有卡片'}
              aria-label="删除列"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <div className="tb-cards-list">
        {cards.map((card) => (
          <Card key={card.id} card={card} columnId={column.id} />
        ))}
      </div>

      <div className="tb-add-card" onClick={handleOpenAddCard}>
        <span className="tb-add-card-icon">+</span>
        <span>添加卡片</span>
      </div>

      <Modal isOpen={showAddCard} onClose={handleCloseAddCard} title="添加新卡片">
        <form onSubmit={handleSubmitAddCard}>
          <div className="tb-form-group">
            <label className="tb-form-label">
              标题<span className="tb-required">*</span>
            </label>
            <input
              ref={cardTitleRef}
              type="text"
              className="tb-form-input"
              value={cardTitle}
              onChange={(e) => {
                setCardTitle(e.target.value);
                if (cardTitleError) setCardTitleError('');
              }}
              placeholder="输入卡片标题"
            />
            {cardTitleError && <div className="tb-form-error">{cardTitleError}</div>}
          </div>
          <div className="tb-form-group">
            <label className="tb-form-label">描述</label>
            <textarea
              className="tb-form-textarea"
              value={cardDesc}
              onChange={(e) => setCardDesc(e.target.value)}
              placeholder="添加详细描述（选填）"
            />
          </div>
          <div className="tb-form-actions">
            <button
              type="button"
              className="tb-btn tb-btn-default"
              onClick={handleCloseAddCard}
            >
              取消
            </button>
            <button type="submit" className="tb-btn tb-btn-primary">
              添加
            </button>
          </div>
        </form>
      </Modal>

      <Confirm
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteColumn}
        title="删除列"
        message={`确定要删除「${column.title}」吗？此操作不可撤销。`}
        confirmText="删除"
        danger
      />
    </div>
  );
}

export default Column;
