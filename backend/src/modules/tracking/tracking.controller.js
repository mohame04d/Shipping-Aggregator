import catchAsync from "../../utils/catchAsync.js";
import TrackingService from "./tracking.service.js";

const trackingService = new TrackingService();

export const addTrackingEvent = catchAsync((req, res, next) =>
  trackingService.addTrackingEvent(req, res, next)
);

export const getTrackingHistory = catchAsync((req, res, next) =>
  trackingService.getTrackingHistory(req, res, next)
);

export const updateShipmentStatusFromEvent = catchAsync(
  (req, res, next) =>
    trackingService.updateShipmentStatusFromEvent(req, res, next)
);
