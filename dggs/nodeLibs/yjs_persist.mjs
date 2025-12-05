//  might gonna use this server later with kart, not in use yet
import { WebsocketServer } from "@y/websocket-server";
import { FilePersistence } from "@y/websocket-server/persistence.js";

const host = "127.0.0.1";
const port = 1234;

const persistenceDir = "./yjs-data";
const persistence = new FilePersistence(persistenceDir);

const server = new WebsocketServer({
    host,
    port,
    persistence
});
