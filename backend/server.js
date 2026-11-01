import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

dotenv.config({
  path: "./src/config/.env",
});

const [{ default: app }, { default: prisma }, { default: initialSocket }] =
  await Promise.all([
    import("./app.js"),
    import("./src/config/prisma.js"),
    import("./src/config/socket.js"),
  ]);

const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(",")
      : ["http://localhost:5173"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  },

  pingTimeout: 60000,
  pingInterval: 25000,
});

app.set("io", io);

initialSocket(io);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("uncaughtException", (error) => {
  console.error("UNCAUGHT EXCEPTION:", error);

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(1);
  });
});

process.on("unhandledRejection", (error) => {
  console.error("UNHANDLED REJECTION:", error);

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down...");

  io.close(async () => {
    await prisma.$disconnect();
    console.log("Database disconnected");
    process.exit(0);
  });
});
