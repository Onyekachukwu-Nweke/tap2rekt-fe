
import { Buffer } from 'buffer';

// Make Buffer available globally for browser compatibility
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  (window as any).global = window;
}

export {};
