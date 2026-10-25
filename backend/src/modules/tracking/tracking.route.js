import express from "express";

import {
  addTrackingEvent,
  getTrackingHistory,
  updateShipmentStatusFromEvent,
} from "./tracking.controller.js";

import { protect } from "../Auth/auth.controller.js";
import validate from "../../middlewares/validate.middleware.js";
import { addTrackingEventSchema, getTrackingHistorySchema, updateTrackingStatusSchema } from "./tracking.validation.js";

const router = express.Router();

router.use(protect);

router.post("/:shipmentId", 
    validate(addTrackingEventSchema), addTrackingEvent);

router.get("/:shipmentId",
     validate(getTrackingHistorySchema), getTrackingHistory);

router.patch(
  "/:shipmentId/:id",
       validate(updateTrackingStatusSchema), updateShipmentStatusFromEvent
);

export default router;
