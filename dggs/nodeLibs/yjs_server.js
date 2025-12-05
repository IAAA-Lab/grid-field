const { spawn } = require("child_process");

const host = "127.0.0.1";
const port = 1234;

const serverProcess = spawn(
  "npx",
  ["y-websocket", "--host", host, "--port", port],
  { stdio: "inherit" }
);

console.log(`Yjs WebSocket Server starts at ws://${host}:${port}`);

const shutdown = () => {
  console.log("Shutting down server");
  serverProcess.kill("SIGINT"); //  Ctrl+C to stop
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
