import AppError from "../../utils/appError.js";
import prisma from "../../config/prisma.js";

export default class NotificationService {
  sendNotification(io, notification) {
    if (!io) return;

    io.to(`user:${notification.userId}`).emit(
      "notification",
      notification
    );
  }

  async createNotification(req, res) {
    const { userId, type, title, message } = req.body;

    const parsedUserId = Number(userId);

    if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
      throw new AppError("Invalid user ID", 400);
    }

    if (
      typeof type !== "string" ||
      !type.trim() ||
      typeof title !== "string" ||
      !title.trim() ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      throw new AppError("Type, title and message are required", 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: parsedUserId },
      select: { id: true },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const notification = await prisma.notification.create({
      data: {
        userId: parsedUserId,
        type: type.trim(),
        title: title.trim(),
        message: message.trim(),
      },
    });

    const io = req.app.get("io");
    this.sendNotification(io, notification);

    return res.status(201).json({
      status: "success",
      message: "Notification created successfully",
      data: { notification },
    });
  }

  async listNotifications(req, res) {
    const userId = req.user.id;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      status: "success",
      results: notifications.length,
      data: { notifications },
    });
  }

  async markAsRead(req, res) {
    const userId = req.user.id;
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError("Invalid notification ID", 400);
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    const io = req.app.get("io");

    if (io) {
      io.to(`user:${userId}`).emit("notification:read", {
        notificationId: id,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Notification marked as read",
      data: { notification: updatedNotification },
    });
  }
}

