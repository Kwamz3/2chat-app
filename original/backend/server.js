import http from "node:http";
import app from "./app.js";
import { setupSocket } from "./socket/index.js";
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
setupSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
  console.log(`Health check is running on http://loalhost:${PORT}/health`);
  console.log(`Root: http://loalhost:${PORT}/`);
});