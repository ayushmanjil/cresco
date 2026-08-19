// Quick test script to verify Cresco compilation & state changes
import React from 'react';
import { renderToString } from 'react-dom/server';
import CrescoApp from '../Cresco.jsx';

try {
  const html = renderToString(React.createElement(CrescoApp));
  console.log("SUCCESS: Initial render succeeded, length:", html.length);
} catch (err) {
  console.error("RENDER ERROR:", err);
}
