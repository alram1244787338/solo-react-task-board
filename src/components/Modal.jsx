import React, { useEffect } from 'react';
import './Modal.css';

function Modal({ isOpen, onClose, title, children, width = 400 }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="tb-modal-overlay" onClick={onClose}>
      <div
        className="tb-modal"
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tb-modal-header">
          <h3 className="tb-modal-title">{title}</h3>
          <button className="tb-modal-close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>
        <div className="tb-modal-body">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
