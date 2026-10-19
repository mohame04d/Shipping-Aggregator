import { z } from "zod";

export const createAddressSchema = z.object({
  body: z.object({
    label: z.string().trim().min(1, "Label is required"),
    country: z.string().trim().min(1, "Country is required"),
    city: z.string().trim().min(1, "City is required"),
    street: z.string().trim().min(1, "Street is required"),
    phone: z.string().trim().min(11, "Phone is required"),
  }),

  params: z.object({}),
  query: z.object({}),
});

export const updateAddressSchema = z.object({
  body: z.object({
    label: z.string().trim().min(1).optional(),
    country: z.string().trim().min(1).optional(),
    city: z.string().trim().min(1).optional(),
    street: z.string().trim().min(1).optional(),
    phone: z.string().trim().min(1).optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided"
  ),

  params: z.object({
    id: z.coerce.number().int().positive(),
  }),

  query: z.object({}),
});

export const addressIdSchema = z.object({
  body: z.object({}),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
});

export {createAddressSchema, updateAddressSchema, addressIdSchema}