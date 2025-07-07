
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { performanceMonitor } from './utils/performance';

// Iniciar medição de performance
performanceMonitor.startMeasure('app-initialization');

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Finalizar medição de performance
performanceMonitor.endMeasure('app-initialization');
