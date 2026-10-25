import express from "express";
import { protect, restrictedTo } from "../Auth/auth.controller.js";
import {
  createPricingRule,
  getApplicableRules,
  updatePricingRule,
} from "./pricing.controller.js";
import validate from "../../middlewares/validate.middleware.js";
import { createPricingRuleSchema, getApplicableRulesSchema, updatePricingRuleSchema } from "./pricing.validation.js";

const router = express.Router();

router.use(protect);

router.post("/", restrictedTo("ADMIN"), validate(createPricingRuleSchema), createPricingRule);

router.get(
  "/:providerId/:shipmentId/applicable-rules",
  validate(getApplicableRulesSchema),
  getApplicableRules
);

router.patch("/:id", restrictedTo("ADMIN"), validate(updatePricingRuleSchema), updatePricingRule);

export default router;
