import { z } from "zod";

const shipmentIdParam = z.object({
  shipmentId: z.coerce.number().int().positive(),
});


export const addTrackingEventSchema = z.object({
  params: shipmentIdParam,

  body: z.object({
    status: z.string().trim().min(1, "Status is required"),

    location: z.string().trim().nullable().optional(),

    description: z.string().trim().nullable().optional(),

    occurredAt: z
      .string()
      .datetime({ offset: true, message: "Invalid occurredAt date" }),
  }),

  query: z.object({}),
});


export const getTrackingHistorySchema = z.object({
  params: shipmentIdParam,

  body: z.object({}),

  query: z.object({}),
});


export const updateTrackingStatusSchema = z.object({
  params: z.object({
    shipmentId: z.coerce.number().int().positive(),
    id: z.coerce.number().int().positive(),
  }),

  body: z.object({
    status: z.string().trim().min(1, "Status is required"),
  }),

  query: z.object({}),
});
