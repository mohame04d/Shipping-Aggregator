
import { z } from "zod";

const providerIdParams = z.object({
  id: z.coerce.number().int().positive(),
});

const providerFields = {
  name: z.string().trim().min(1, "Provider name is required"),
  code: z.string().trim().min(1, "Provider code is required"),
  estimateDaysMin: z.number().int().min(0),
  estimateDaysMax: z.number().int().min(0),
};

export const createProviderSchema = z.object({
  body: z.object(providerFields).refine(
    (data) => data.estimateDaysMax >= data.estimateDaysMin,
    {
      message: "Maximum delivery days must be >= minimum delivery days",
      path: ["estimateDaysMax"],
    }
  ),
  params: z.object({}),
  query: z.object({}),
});

export const getProviderSchema = z.object({
  body: z.object({}),
  params: providerIdParams,
  query: z.object({}),
});

export const updateProviderSchema = z.object({
  body: z
    .object({
      name: providerFields.name.optional(),
      code: providerFields.code.optional(),
      estimateDaysMin: providerFields.estimateDaysMin.optional(),
      estimateDaysMax: providerFields.estimateDaysMax.optional(),
      isActive: z.boolean().optional(),
    })
    .strict()
    .refine(
      (data) => Object.keys(data).length > 0,
      { message: "Provide at least one field to update" }
    ),
  params: providerIdParams,
  query: z.object({}),
});
