// This file provides polyfills for WebSocket-related modules
// that might be required by Stripe or other dependencies

if (typeof window !== 'undefined') {
  // Browser environment - use native WebSocket
  if (!globalThis.WebSocket) {
    globalThis.WebSocket = window.WebSocket;
  }
} else {
  // Server environment - provide empty implementations
  // We need to use any here because we're polyfilling a global that may not exist
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).WebSocket = class MockWebSocket {
    static readonly CONNECTING = 0;
    static readonly OPEN = 1;
    static readonly CLOSING = 2;
    static readonly CLOSED = 3;

    constructor() {
      throw new Error('WebSocket is not available in server environment');
    }
  };
}

export { };