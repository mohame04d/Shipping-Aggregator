import { z } from "zod";

export const markAsReadSchema = z.object({
  body: z.object({}),

  params: z.object({
    id: z.coerce.number().int().positive(),
  }),

  query: z.object({}),
});
