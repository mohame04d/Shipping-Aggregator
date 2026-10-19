import express from "express";

import {
  createAddress,
  updateAddress,
  deleteAddress,
  getAllAddresses,
} from "./address.controller.js";

import {
    addressIdSchema,
  createAddressSchema,
  updateAddressSchema,
} from "./address.validation.js";

import validate from "../../middlewares/validate.middleware.js";
import { protect } from "../Auth/auth.controller.js";

const router = express.Router();

router.post(
  "/",
  protect,
  validate(createAddressSchema),
  createAddress
);

router.get("/", protect, getAllAddresses);

router.patch(
  "/:id",
  validate(updateAddressSchema),
  updateAddress
);

router.delete("/:id", validate(addressIdSchema), deleteAddress);

export default router;
