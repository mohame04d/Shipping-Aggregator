import prisma from "../../config/prisma.js";
import AppError from "../../utils/appError.js";

export default class TrackingService {
  async addTrackingEvent(req, res, next) {
    const shipmentId = Number(req.params.shipmentId);

    if (!Number.isInteger(shipmentId) || shipmentId <= 0) {
      return next(new AppError("Invalid shipment ID", 400));
    }

    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
    });

    if (!shipment) {
      return next(new AppError("Shipment not found", 404));
    }

    const { status, location, description, occurredAt } = req.body;

    if (
      typeof status !== "string" ||
      !status.trim() ||
      !occurredAt
    ) {
      return next(
        new AppError("Status and occurredAt are required", 400)
      );
    }

    const eventDate = new Date(occurredAt);

    if (Number.isNaN(eventDate.getTime())) {
      return next(new AppError("Invalid occurredAt date", 400));
    }

    const existingTracking = await prisma.trackingEvent.findFirst({
      where: {
        shipmentId,
        status,
        occurredAt: eventDate,
      },
    });

    if (existingTracking) {
      return next(
        new AppError("Tracking event already exists", 409)
      );
    }

    const tracking = await prisma.trackingEvent.create({
      data: {
        shipmentId,
        status,
        location: location ?? null,
        description: description ?? null,
        occurredAt: eventDate,
      },
    });

    res.status(201).json({
      status: "success",
      data: tracking,
    });
  }

  async getTrackingHistory(req, res, next) {
    const shipmentId = Number(req.params.shipmentId);

    if (!Number.isInteger(shipmentId) || shipmentId <= 0) {
      return next(new AppError("Invalid shipment ID", 400));
    }

    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
    });

    if (!shipment) {
      return next(new AppError("Shipment not found", 404));
    }

    const trackingHistory = await prisma.trackingEvent.findMany({
      where: { shipmentId },
      orderBy: { occurredAt: "asc" },
    });

    res.status(200).json({
      status: "success",
      length: trackingHistory.length,
      data: trackingHistory,
    });
  }

  async updateShipmentStatusFromEvent(req, res, next) {
    const shipmentId = Number(req.params.shipmentId);
    const trackingId = Number(req.params.id);

    if (
      !Number.isInteger(shipmentId) ||
      shipmentId <= 0 ||
      !Number.isInteger(trackingId) ||
      trackingId <= 0
    ) {
      return next(
        new AppError("Invalid shipment ID or tracking ID", 400)
      );
    }

    const { status } = req.body;

    if (typeof status !== "string" || !status.trim()) {
      return next(new AppError("Status is required", 400));
    }

    const tracking = await prisma.trackingEvent.findUnique({
      where: {
        id: trackingId,
      },
    });

    if (!tracking) {
      return next(
        new AppError(
          "Tracking event not found for this shipment",
          404
        )
      );
    }

    const updatedTracking = await prisma.trackingEvent.update({
      where: { id: trackingId },
      data: { status },
    });

    res.status(200).json({
      status: "success",
      message: "Tracking event updated successfully",
      data: updatedTracking,
    });
  }
}
