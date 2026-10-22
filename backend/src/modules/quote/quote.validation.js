import { z } from "zod";

export const shipmentIdSchema = z.object({
  body: z.object({}),
  params: z.object({
    shipmentId: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
});

export const calculateQuoteSchema = z.object({
  body: z.object({}),
  params: z.object({
    shipmentId: z.coerce.number().int().positive(),
    providerId: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
});
