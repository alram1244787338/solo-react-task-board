import React from 'react';
import Modal from './Modal';
import './Confirm.css';

function Confirm({ isOpen, onClose, onConfirm, title, message, confirmText = '确认', cancelText = '取消', danger = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} width={360}>
      <p className="tb-confirm-message">{message}</p>
      <div className="tb-confirm-actions">
        <button className="tb-btn tb-btn-default" onClick={onClose}>
          {cancelText}
        </button>
        <button className={`tb-btn ${danger ? 'tb-btn-danger' : 'tb-btn-primary'}`} onClick={onConfirm}>
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}

export default Confirm;
