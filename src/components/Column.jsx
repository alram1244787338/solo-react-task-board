import React from 'react';
import Card from './Card';
import './Column.css';

function Column({ column, index, cards }) {
  const isPlaceholder = !column.id;

  return (
    <div className="tb-column">
      <div className="tb-column-header">
        <h3 className="tb-column-title">{column.title}</h3>
        {!isPlaceholder && (
          <span className="tb-column-card-count">{cards.length}</span>
        )}
      </div>
      <div className="tb-cards-list">
        {isPlaceholder ? (
          <>
            <Card placeholder />
            <Card placeholder />
          </>
        ) : (
          cards.map((card) => <Card key={card.id} card={card} />)
        )}
      </div>
      {!isPlaceholder && (
        <div className="tb-add-card">
          <span className="tb-add-card-icon">+</span>
          <span>添加卡片</span>
        </div>
      )}
    </div>
  );
}

export default Column;
