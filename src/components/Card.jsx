import React from 'react';
import './Card.css';

function Card({ card, placeholder }) {
  if (placeholder) {
    return (
      <div className="tb-card tb-placeholder">
        <div className="tb-placeholder-title" />
        <div className="tb-placeholder-desc" />
      </div>
    );
  }

  return (
    <div className="tb-card">
      <h4 className="tb-card-title">{card.title}</h4>
      {card.description && (
        <p className="tb-card-desc">{card.description}</p>
      )}
    </div>
  );
}

export default Card;
