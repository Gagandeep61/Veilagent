import React from 'react';
import ReactDOM from 'react-dom/client';
import { Popup } from './Popup';

const rootElement = document.getElementById('popup-root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>
  );
}
