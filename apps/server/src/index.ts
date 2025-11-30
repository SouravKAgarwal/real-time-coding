import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
// import connectDB from "./config/db";
import { setupSocket } from "./socket/socket";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  res.send("Server is working");
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

setupSocket(io);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

async function start() {
  try {
    // await connectDB();
    server.listen(PORT, () => {
      console.log(`Server listening on ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
