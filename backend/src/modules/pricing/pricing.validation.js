
import { z } from "zod";

export const createPricingRuleSchema = z.object({
  body: z
    .object({
      providerId: z.coerce.number().int().positive(),

      shippingType: z.enum(["STANDARD", "EXPRESS"]),

      minWeight: z.coerce.number().min(0).nullable().optional(),

      maxWeight: z.coerce.number().min(0).nullable().optional(),

      basePrice: z.coerce.number().finite().min(0),

      pricePerKg: z.coerce.number().finite().min(0),

      volumetricDivisor: z.coerce.number().finite().positive().nullable().optional(),

      surcharge: z.coerce.number().finite().min(0).nullable().optional(),
    })
    .refine(
      (data) =>
        data.minWeight == null ||
        data.maxWeight == null ||
        data.maxWeight >= data.minWeight,
      {
        message: "maxWeight must be greater than or equal to minWeight",
        path: ["maxWeight"],
      }
    ),
  params: z.object({}),
  query: z.object({}),
});

export const getApplicableRulesSchema = z.object({
  body: z.object({}),
  params: z.object({
    providerId: z.coerce.number().int().positive(),
    shipmentId: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
});

export const updatePricingRuleSchema = z.object({
  body: z
    .object({
      providerId: z.coerce.number().int().positive().optional(),

      shippingType: z.enum(["STANDARD", "EXPRESS"]).optional(),

      minWeight: z.coerce.number().min(0).nullable().optional(),

      maxWeight: z.coerce.number().min(0).nullable().optional(),

      basePrice: z.coerce.number().finite().min(0).optional(),

      pricePerKg: z.coerce.number().finite().min(0).optional(),

      volumetricDivisor: z.coerce.number().finite().positive().nullable().optional(),

      surcharge: z.coerce.number().finite().min(0).nullable().optional(),

      isActive: z.boolean().optional(),
    })
    .strict()
    .refine(
      (data) => Object.keys(data).length > 0,
      { message: "Provide at least one field to update" }
    )
    .refine(
      (data) =>
        data.minWeight == null ||
        data.maxWeight == null ||
        data.maxWeight >= data.minWeight,
      {
        message: "maxWeight must be greater than or equal to minWeight",
        path: ["maxWeight"],
      }
    ),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
});
