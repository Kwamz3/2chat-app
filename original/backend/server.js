import http from "node:http";
import app from "./app.js";
import { setupSocket } from "./socket";
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
setupSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:5000`);
});