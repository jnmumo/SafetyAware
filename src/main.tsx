import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LingoProvider } from './LingoProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LingoProvider>
      <App />
    </LingoProvider>
  </StrictMode>
);