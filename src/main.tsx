import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Development-only: normalize runtime errors and unhandled rejections so the Vite overlay
// receives a proper Error object (prevents edge cases where the overlay crashes trying to
// read missing stack/frame properties). We avoid changing behavior in production.
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.addEventListener('error', (event: ErrorEvent) => {
    try {
      if (!event.error) {
        // Convert non-Error throws (e.g. throw { message: 'x' }) to Error to give overlay a stack
        const message = String(event.message || 'Unknown error');
        const normalized = new Error(message);
        // attach original data for debugging
        (normalized as any).original = event.error ?? null;
        // replace event.error by throwing normalized error asynchronously so Vite's overlay sees it
        setTimeout(() => { throw normalized; });
        event.preventDefault();
      } else if (!(event.error instanceof Error)) {
        // some environments may deliver non-Error values; normalize similarly
        const message = (event.error && (event.error.message || String(event.error))) || String(event.message || 'Unknown error');
        const normalized = new Error(message);
        (normalized as any).original = event.error;
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
        (normalized as any).original = reason;
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
