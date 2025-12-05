import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
// Expose globally
window.Y = Y;
window.WebsocketProvider = WebsocketProvider;

console.log("Yjs and WebsocketProvider loaded in main.js of vite npm:", Y, WebsocketProvider);
