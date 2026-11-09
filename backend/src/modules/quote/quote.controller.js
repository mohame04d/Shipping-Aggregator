import QuoteService from "./quote.service.js";
import catchAsync from "../../utils/catchAsync.js";
import quoteQueue from "../../queues/quote.queue.js";

const quoteService = new QuoteService();

export const estimateShipment = catchAsync(async (req, res, next) => {
    const shipmentId = Number(req.params.shipmentId);
    const userId = Number(req.user.id);

    const job = await quoteQueue.add("calculate-quotes", {
        shipmentId,
        userId,
    });

    return res.status(202).json({
        status: "success",
        message: "Quote calculation started",
        data: {
            jobId: job.id,
            shipmentId,
        },
    });
});

export const calculateQuote = catchAsync((req, res, next) => {
    return quoteService.calculateQuote(req, res, next);
});

export const getShipmentQuotes = catchAsync((req, res, next) => {
    return quoteService.getShipmentQuotes(req, res, next);
});