import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BoardProvider } from './contexts/BoardContext';
import './styles/global.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BoardProvider>
      <App />
    </BoardProvider>
  </React.StrictMode>
);

if (module.hot) {
  module.hot.accept();
}
