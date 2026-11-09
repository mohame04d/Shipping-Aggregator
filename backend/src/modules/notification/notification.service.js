import AppError from "../../utils/appError.js";
import prisma from "../../config/prisma.js";
import notificationQueue from "../queues/notification.queues.js";

const addNotificationJob = async ({
  userId,
  type,
  title,
  message,
}) => {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid userId");
  }

  if (!type || !title || !message) {
    throw new Error("Notification data is required");
  }

  const job = await notificationQueue.add(
    "create-notification",
    {
      userId,
      type,
      title,
      message,
    }
  );

  return {
    jobId: job.id,
    status: "QUEUED",
  };
};
export default class NotificationService {

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

