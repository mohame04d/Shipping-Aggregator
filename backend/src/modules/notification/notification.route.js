import express from "express";

import {
  createNotification,
  listNotifications,
  markAsRead,
} from "./notification.controller.js";

import {
  protect,
 restrictedTo,
} from "../Auth/auth.controller.js";
import validate from "../../middlewares/validate.middleware.js";

import {
  createNotificationSchema,
  markAsReadSchema,
} from "./notification.validation.js";

const router = express.Router();

router.use(protect);

router.get(
  "/",
  listNotifications
);

router.patch(
  "/:id/read",
  validate(markAsReadSchema),
  markAsRead
);

export default router;
