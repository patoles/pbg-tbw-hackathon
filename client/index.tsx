import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';

import './style/globals.css';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement as HTMLElement);
root.render(<App />);
