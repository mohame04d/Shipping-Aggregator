import { z } from "zod";

export const createShipmentSchema = z.object({
  body: z.object({
    senderAddressId: z.coerce.number().int().positive(),
    receiverAddressId: z.coerce.number().int().positive(),
    weight: z.number().min(1, "weight is required"),
    length: z.number().min(1, "length is required"),
    width: z.number().min(1, "width is required"),
    height: z.number().min(1, "height is required"),
    status: z.string().trim().min(7, 'status is required'),
    shippingType: z.enum(["STANDARD", "EXPRESS"]).optional(),
    currency: z.string().trim().length(3).default("EGP"),
  }),

  params: z.object({}),
  query: z.object({}),
});

export const updateShipmentStatus = z.object({
   body: z.object({
    status: z.enum([
      "PENDING",
      "CONFIRMED",
      "SHIPPED",
      "IN_TRANSIT",
      "DELIVERED",
      "CANCELLED",
    ]),
  }),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),

  query: z.object({}),
});

export const calculateWeightSchema = z.object({
  body: z.object({
    weight: z.coerce.number().positive(),
    length: z.coerce.number().positive(),
    width: z.coerce.number().positive(),
    height: z.coerce.number().positive(),
  }),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
});

export const shipmentIdSchema = z.object({
  body: z.object({}),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
});

