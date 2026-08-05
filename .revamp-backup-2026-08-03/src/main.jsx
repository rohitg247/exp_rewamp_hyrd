// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { crestronInitManager } from './utils/crestronInitManager';

// ✅ Import Crestron libraries
import * as WebXPanelModule from '@crestron/ch5-webxpanel';
import * as CrComLibModule from '@crestron/ch5-crcomlib';

// --- Correctly extract libraries ---
const { WebXPanel, isActive, WebXPanelEvents } = WebXPanelModule.getWebXPanel(true);
export { WebXPanel, isActive };

// --- Extract CrComLib ---
const CrComLib = CrComLibModule.CrComLib || CrComLibModule.default?.CrComLib || CrComLibModule;

// 🔥 CRITICAL FIX: Attach bridge functions for Crestron ONE mobile app
window.CrComLib = CrComLib;
window.bridgeReceiveBooleanFromNative = CrComLib.bridgeReceiveBooleanFromNative;
window.bridgeReceiveIntegerFromNative = CrComLib.bridgeReceiveIntegerFromNative;
window.bridgeReceiveStringFromNative = CrComLib.bridgeReceiveStringFromNative;
window.bridgeReceiveObjectFromNative = CrComLib.bridgeReceiveObjectFromNative;

export { CrComLib };

console.log('🚀 Starting Crestron React App');
console.log(`- WebXPanel isActive: ${isActive}`);
console.log(`- CrComLib available:`, !!CrComLib);
console.log(`- Bridge functions attached:`, !!window.bridgeReceiveBooleanFromNative);
console.log(`- Running on: ${window.location.hostname}`);
console.log(`- User Agent:`, navigator.userAgent);
console.log(`- runsInContainerApp:`, WebXPanelModule.runsInContainerApp());

// --- Async WebXPanel Initialization with Timeout ---
const initializeWebXPanelAsync = () => {
  return new Promise((resolve, reject) => {
    const isDevelopment = (
      window.location.hostname === '127.0.0.1' ||
      window.location.protocol === 'file:' ||
      (window.location.hostname === 'localhost' && window.location.port === '3000')
    );

    const isInContainerApp = WebXPanelModule.runsInContainerApp();

    console.log(`📊 Environment Detection:`);
    console.log(`  - isDevelopment: ${isDevelopment}`);
    console.log(`  - isInContainerApp: ${isInContainerApp}`);
    console.log(`  - isActive: ${isActive}`);

    // Development or Container App: Skip WebXPanel init
    if (isDevelopment || isInContainerApp) {
      if (isInContainerApp) {
        console.log('✅ Container app detected - using native bridge');
      } else {
        console.warn('⚠️ Development mode - skipping WebXPanel init');
      }
      resolve();
      return;
    }

    // Production WebXPanel initialization
    console.log('✅ WebXPanel environment detected. Initializing...');

    const configuration = {
      host: window.location.hostname,
      ipId: '0x04',
      roomId: '',
      domain: '*', // 🔥 CRITICAL FIX: Add domain for cross-origin
    };

    try {
      let isConnected = false;
      const timeoutDuration = 10000; // 10 second timeout

      // Set timeout for initialization
      const timeoutId = setTimeout(() => {
        if (!isConnected) {
          console.warn('⚠️ WebXPanel initialization timeout - proceeding anyway');
          resolve(); // Resolve anyway, allow app to start
        }
      }, timeoutDuration);

      // Listen for connection
      WebXPanel.addEventListener(WebXPanelEvents.CONNECT_CIP, ({ detail }) => {
        console.log('🟢 CONNECTED to Crestron Processor:', detail);
        isConnected = true;
        clearTimeout(timeoutId);
        resolve();
      });

      // Listen for errors
      WebXPanel.addEventListener(WebXPanelEvents.ERROR, ({ detail }) => {
        console.error('❌ WebXPanel ERROR:', detail);
        // Don't reject - allow app to start even with connection issues
        if (!isConnected) {
          clearTimeout(timeoutId);
          resolve(); // Resolve to allow app to start
        }
      });

      WebXPanel.addEventListener(WebXPanelEvents.DISCONNECT_CIP, ({ detail }) => {
        console.warn('🔴 DISCONNECTED from Crestron Processor:', detail);
      });

      // Initialize WebXPanel
      WebXPanel.initialize(configuration);
      console.log('✅ WebXPanel.initialize() called with config:', configuration);

    } catch (error) {
      console.error('❌ Critical error initializing WebXPanel:', error);
      reject(error);
    }
  });
};

// --- Core Initialization Logic ---
const initializeCrestron = async () => {
  try {
    console.log('🔧 Starting Crestron initialization...');
    crestronInitManager.setInitializing();

    // Wait for WebXPanel to initialize
    await initializeWebXPanelAsync();

    console.log('✅ Crestron initialization complete');
    crestronInitManager.setInitialized();

    // Render app after initialization
    renderApp();

  } catch (error) {
    console.error('❌ Crestron initialization failed:', error);
    crestronInitManager.setError(error);

    // Still render app to show error screen
    renderApp();
  }
};

// --- React Rendering Logic ---
const renderApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('❌ Root element not found!');
    return;
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  console.log('✅ React app rendered.');
};

// --- Start the initialization process ---
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCrestron);
} else {
  initializeCrestron();
}
