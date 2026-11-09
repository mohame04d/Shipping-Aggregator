import { Worker } from "bullmq";
import redis from "../config/redis.js";
import prisma from "../config/prisma.js";

const notificationWorker = new Worker(
  "notifications",

  async (job) => {
    const { userId, type, title, message } = job.data;

    // Validate required fields
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error("Invalid userId");
    }

    if (!type || !title || !message) {
      throw new Error(
        "Notification type, title, and message are required"
      );
    }

    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
      },
    });

    return {
      success: true,
      notificationId: notification.id,
    };
  },

  {
    connection: redis,
    concurrency: 5,
  }
);

// Job completed successfully
notificationWorker.on("completed", (job, result) => {
  console.log(
    `Notification job ${job.id} completed`,
    result
  );
});

// Job failed
notificationWorker.on("failed", (job, error) => {
  console.error(
    `Notification job ${job?.id} failed:`,
    error.message
  );
});

// Worker or Redis error
notificationWorker.on("error", (error) => {
  console.error("Notification worker error:", error);
});

export default notificationWorker;
