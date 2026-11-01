import jwt from "jsonwebtoken";
import prisma from "./prisma.js";

export default function initialSocket(io) {
  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth?.token;

      if (!token) {
        const cookies = socket.request.headers.cookie;

        if (cookies) {
          const jwtCookie = cookies
            .split(";")
            .find((cookie) => cookie.trim().startsWith("jwt="));

          token = jwtCookie?.split("=")[1];
        }
      }

      if (!token) {
        return next(new Error("Authentication error: No token"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true },
      });

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = { id: user.id };

      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.id}`);

    socket.join(`user:${socket.user.id}`);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });
}
