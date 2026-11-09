
import { Worker } from "bullmq";
import redis from "../config/redis.js";
import prisma from "../config/prisma.js";
import QuoteService from "../services/quote.service.js";

const quoteService = new QuoteService();

const quoteWorker = new Worker(
  "quotes",

  async (job) => {
    const { shipmentId, userId } = job.data;

    if (!Number.isInteger(shipmentId) || shipmentId <= 0) {
      throw new Error("Invalid shipmentId");
    }

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error("Invalid userId");
    }

    // Verify shipment ownership
    const shipment = await prisma.shipment.findFirst({
      where: {
        id: shipmentId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!shipment) {
      throw new Error("Shipment not found");
    }

    // Calculate and save shipment quotes
    const quotes = await quoteService.estimateShipmentQuotes(
      shipmentId
    );

    return {
      success: true,
      shipmentId,
      quotesCount: quotes.length,
    };
  },

  {
    connection: redis,
    concurrency: 5,
  }
);

quoteWorker.on("completed", (job, result) => {
  console.log(`Quote job ${job.id} completed`, result);
});

quoteWorker.on("failed", (job, error) => {
  console.error(
    `Quote job ${job?.id} failed:`,
    error.message
  );
});

quoteWorker.on("error", (error) => {
  console.error("Quote worker error:", error);
});

export default quoteWorker;
