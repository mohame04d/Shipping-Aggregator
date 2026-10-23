import prisma from "../../config/prisma.js";
import AppError from "../../utils/appError.js";

export default class ProviderService {
  async createProvider(req, res, next) {
    const {
      name,
      code,
      estimateDaysMin,
      estimateDaysMax,
    } = req.body;

    if (
      !name?.trim() ||
      !code?.trim() ||
      estimateDaysMin === undefined ||
      estimateDaysMax === undefined
    ) {
      return next(new AppError("All fields are required", 400));
    }

    if (
      !Number.isInteger(estimateDaysMin) ||
      !Number.isInteger(estimateDaysMax) ||
      estimateDaysMin < 0 ||
      estimateDaysMax < estimateDaysMin
    ) {
      return next(new AppError("Invalid estimated delivery days", 400));
    }

    const existingProvider = await prisma.shippingProvider.findUnique({
      where: { code: code.trim() },
    });

    if (existingProvider) {
      return next(new AppError("Provider already exists", 409));
    }

    const provider = await prisma.shippingProvider.create({
      data: {
        name: name.trim(),
        code: code.trim(),
        estimateDaysMin,
        estimateDaysMax,
        isActive: true,
      },
    });

    return res.status(201).json({
      status: "success",
      data: { provider },
    });
  }

  async listActiveProviders(req, res, next) {
    const activeProviders = await prisma.shippingProvider.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return res.status(200).json({
      status: "success",
      length: activeProviders.length,
      data: activeProviders,
    });
  }

  async getProviderById(req, res, next) {
    const id = Number(req.params.id);


    if (!Number.isInteger(id) || id <= 0) {
      return next(new AppError("ID is invalid", 400));
    }

    const provider = await prisma.shippingProvider.findUnique({
      where: { id },
    });

    if (!provider) {
      return next(new AppError("Provider not found", 404));
    }

    return res.status(200).json({
      status: "success",
      data: { provider },
    });
  }

  async updateProvider(req, res, next) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return next(new AppError("ID is invalid", 400));
    }

    const {
      name,
      code,
      estimateDaysMin,
      estimateDaysMax,
      isActive,
    } = req.body;

    const data = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return next(new AppError("Invalid provider name", 400));
      }
      data.name = name.trim();
    }

    if (code !== undefined) {
      if (typeof code !== "string" || !code.trim()) {
        return next(new AppError("Invalid provider code", 400));
      }
      data.code = code.trim();
    }

    if (estimateDaysMin !== undefined) {
      if (!Number.isInteger(estimateDaysMin) || estimateDaysMin < 0) {
        return next(new AppError("Invalid minimum delivery days", 400));
      }
      data.estimateDaysMin = estimateDaysMin;
    }

    if (estimateDaysMax !== undefined) {
      if (!Number.isInteger(estimateDaysMax) || estimateDaysMax < 0) {
        return next(new AppError("Invalid maximum delivery days", 400));
      }
      data.estimateDaysMax = estimateDaysMax;
    }

    if ( data.estimateDaysMax < data.estimateDaysMin ) {
      return next(new AppError("Maximum delivery days must be greater than or equal to minimum delivery days", 400));
    }

    if (
      typeof isActive === "boolean"
    ) {
      data.isActive = isActive;
    } else if (isActive !== undefined) {
      return next(new AppError("Invalid isActive value", 400));
    }

    if (Object.keys(data).length === 0) {
      return next(new AppError("No valid fields provided for update", 400));
    }

    const existingProvider = await prisma.shippingProvider.findUnique({
      where: { id },
    });

    if (!existingProvider) {
      return next(new AppError("Provider not found", 404));
    }

    if (data.code !== undefined) {
      const existingCode = await prisma.shippingProvider.findUnique({
        where: { code: data.code },
      });

      if (existingCode && existingCode.id !== id) {
        return next(new AppError("Provider code already exists", 409));
      }
    }

    const provider = await prisma.shippingProvider.update({
      where: { id },
      data,
    });

    return res.status(200).json({
      status: "success",
      message: "Provider updated successfully",
      data: { provider },
    });
  }
}
