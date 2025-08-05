import { Devtools } from '@/devtools';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './styles/index.css';
import { Demo } from './demo';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <Devtools />
    <Demo />
  </StrictMode>,
);
