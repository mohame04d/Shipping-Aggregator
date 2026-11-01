import { z } from "zod";

export const createNotificationSchema = z.object({
  body: z.object({
    userId: z.coerce.number().int().positive(),

    type: z.string().trim().min(1, "Notification type is required"),

    title: z.string().trim().min(1, "Notification title is required"),

    message: z.string().trim().min(1, "Notification message is required"),
  }),

  params: z.object({}),
  query: z.object({}),
});


export const markAsReadSchema = z.object({
  body: z.object({}),

  params: z.object({
    id: z.coerce.number().int().positive(),
  }),

  query: z.object({}),
});
