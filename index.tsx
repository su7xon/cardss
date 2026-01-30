
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("App booting...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Root element missing!");
  throw new Error("Could not find root element to mount to");
}

window.onerror = function (message, source, lineno, colno, error) {
  console.error("Global Error Caught:", message, "at", source, ":", lineno);
};

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
