import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Development-only: normalize runtime errors and unhandled rejections so the Vite overlay
// receives a proper Error object (prevents edge cases where the overlay crashes trying to
// read missing stack/frame properties). We avoid changing behavior in production.
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  // helper to safely serialize arbitrary values into a primitive for attachment
  function safeSerialize(value: any): string | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    // DOM node
    if (typeof Node !== 'undefined' && value instanceof Node) {
      try {
        return `<${value.nodeName.toLowerCase()}${(value as any).id ? ` id="${(value as any).id}"` : ''}>`;
      } catch (_) {
        return value.nodeName || String(value);
      }
    }
    try {
      return JSON.stringify(value);
    } catch (_) {
      try {
        return String(value);
      } catch (__){
        return null;
      }
    }
  }

  window.addEventListener('error', (event: ErrorEvent) => {
    try {
      if (!event.error) {
        // Convert non-Error throws (e.g. throw { message: 'x' }) to Error to give overlay a stack
        const message = String(event.message || 'Unknown error');
        const normalized = new Error(message);
        // attach original data for debugging as a safe primitive
        (normalized as any).original = safeSerialize(event.error ?? event.message ?? null);
        // replace event.error by throwing normalized error asynchronously so Vite's overlay sees it
        setTimeout(() => { throw normalized; });
        event.preventDefault();
      } else if (!(event.error instanceof Error)) {
        // some environments may deliver non-Error values; normalize similarly
        const message = (event.error && (event.error.message || String(event.error))) || String(event.message || 'Unknown error');
        const normalized = new Error(message);
        (normalized as any).original = safeSerialize(event.error);
        setTimeout(() => { throw normalized; });
        event.preventDefault();
      }
    } catch (e) {
      // swallow normalization errors to avoid recursive failures
      // eslint-disable-next-line no-console
      console.warn('Error during error normalization', e);
    }
  });

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    try {
      const reason = event.reason;
      if (!(reason instanceof Error)) {
        // create a proper Error with serialized reason
        let msg = 'Unhandled Rejection';
        try {
          msg = typeof reason === 'string' ? reason : JSON.stringify(reason);
        } catch (_) {
          msg = String(reason);
        }
        const normalized = new Error(msg || 'Unhandled Rejection');
        (normalized as any).original = safeSerialize(reason);
        // throw normalized to let Vite overlay capture it in its usual flow
        setTimeout(() => { throw normalized; });
        event.preventDefault();
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Error during unhandledrejection normalization', e);
    }
  });
}


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
