if (typeof window !== 'undefined') {
    if (!globalThis.WebSocket) {
        globalThis.WebSocket = window.WebSocket;
    }
}
else {
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
export {};
