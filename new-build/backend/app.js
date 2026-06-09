import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the root API",
    timeestamp: new Date().toISOString(),
  });
});

export default app;
