import React, { useState, useRef, useEffect } from 'react';
import Modal from './Modal';
import Confirm from './Confirm';
import { useBoardActions } from '../hooks/useBoard';
import { useComposition } from '../hooks/useComposition';
import './Card.css';

function Card({ card, columnId }) {
  const { updateCard, removeCard } = useBoardActions();
  const [showEdit, setShowEdit] = useState(false);
  const [editTitle, bindEditTitle, setEditTitleDirect] = useComposition(card.title);
  const [editDesc, setEditDesc] = useState(card.description || '');
  const [titleError, setTitleError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    if (showEdit && titleRef.current) {
      setTimeout(() => titleRef.current.focus(), 100);
    }
  }, [showEdit]);

  const handleOpenEdit = (e) => {
    e.stopPropagation();
    setEditTitleDirect(card.title);
    setEditDesc(card.description || '');
    setTitleError('');
    setShowEdit(true);
  };

  const handleCloseEdit = () => {
    setShowEdit(false);
    setEditTitleDirect(card.title);
    setEditDesc(card.description || '');
    setTitleError('');
  };

  const handleEditTitleChange = (e) => {
    bindEditTitle.onChange(e);
    if (titleError) setTitleError('');
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      setTitleError('请输入卡片标题');
      return;
    }
    const trimmedDesc = editDesc.trim();
    const titleChanged = trimmedTitle !== card.title;
    const descChanged = trimmedDesc !== (card.description || '');
    if (!titleChanged && !descChanged) {
      handleCloseEdit();
      return;
    }
    const updates = {};
    if (titleChanged) updates.title = trimmedTitle;
    if (descChanged) updates.description = trimmedDesc;
    updateCard(card.id, updates);
    handleCloseEdit();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    removeCard(columnId, card.id);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className="tb-card">
        <div className="tb-card-actions">
          <button
            className="tb-icon-btn"
            onClick={handleOpenEdit}
            title="编辑卡片"
            aria-label="编辑卡片"
          >
            ✏️
          </button>
          <button
            className="tb-icon-btn tb-danger"
            onClick={handleDelete}
            title="删除卡片"
            aria-label="删除卡片"
          >
            🗑️
          </button>
        </div>
        <h4 className="tb-card-title">{card.title}</h4>
        {card.description && (
          <p className="tb-card-desc">{card.description}</p>
        )}
      </div>

      <Modal isOpen={showEdit} onClose={handleCloseEdit} title="编辑卡片">
        <form onSubmit={handleSubmitEdit}>
          <div className="tb-form-group">
            <label className="tb-form-label">
              标题<span className="tb-required">*</span>
            </label>
            <input
              ref={titleRef}
              type="text"
              className="tb-form-input"
              value={bindEditTitle.value}
              onChange={handleEditTitleChange}
              onCompositionStart={bindEditTitle.onCompositionStart}
              onCompositionEnd={bindEditTitle.onCompositionEnd}
            />
            {titleError && <div className="tb-form-error">{titleError}</div>}
          </div>
          <div className="tb-form-group">
            <label className="tb-form-label">描述</label>
            <textarea
              className="tb-form-textarea"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="添加详细描述（选填）"
            />
          </div>
          <div className="tb-form-actions">
            <button
              type="button"
              className="tb-btn tb-btn-default"
              onClick={handleCloseEdit}
            >
              取消
            </button>
            <button type="submit" className="tb-btn tb-btn-primary">
              保存
            </button>
          </div>
        </form>
      </Modal>

      <Confirm
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="删除卡片"
        message={`确定要删除「${card.title}」吗？此操作不可撤销。`}
        confirmText="删除"
        danger
      />
    </>
  );
}

export default Card;
