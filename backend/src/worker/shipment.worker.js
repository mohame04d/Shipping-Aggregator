import { Worker } from "bullmq";
import redis from "../config/redis.js";
import prisma from "../config/prisma.js";
import notificationQueue from "../queues/notification.queue.js";

const shipmentWorker = new Worker(
  "shipments",

  async (job) => {
    const { shipmentId } = job.data;

    // Validate shipmentId
    if (!Number.isInteger(shipmentId) || shipmentId <= 0) {
      throw new Error("Invalid shipmentId");
    }

    // Get shipment from database
    const shipment = await prisma.shipment.findUnique({
      where: {
        id: shipmentId,
      },
    });

    if (!shipment) {
      throw new Error("Shipment not found");
    }

    // Check shipment status
    if (shipment.status !== "PENDING") {
      throw new Error("Shipment is not in PENDING status");
    }

    // Shipment processing will be added here
    // For example: send shipment to shipping provider.

    // Add notification job
    await notificationQueue.add("send-notification", {
      userId: shipment.userId,
      type: "SHIPMENT_PROCESSING",
      title: "Shipment Processing",
      message: `Your shipment ${shipment.id} is being processed.`,
    });

    return {
      success: true,
      shipmentId: shipment.id,
    };
  },

  {
    connection: redis,
    concurrency: 5,
  }
);

// Job completed
shipmentWorker.on("completed", (job, result) => {
  console.log(`Shipment job ${job.id} completed`, result);
});

// Job failed
shipmentWorker.on("failed", (job, error) => {
  console.error(
    `Shipment job ${job?.id} failed:`,
    error.message
  );
});

// Worker error
shipmentWorker.on("error", (error) => {
  console.error("Shipment worker error:", error);
});

export default shipmentWorker;
