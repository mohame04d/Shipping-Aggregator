
import prisma from "../../config/prisma.js";
import AppError from "../../utils/appError.js";

export default class PricingService {
  async createPricingRule(req, res, next) {
    const {
      providerId,
      shippingType,
      minWeight,
      maxWeight,
      basePrice,
      pricePerKg,
      volumetricDivisor,
      surcharge,
    } = req.body;

    if (
      providerId === undefined ||
      shippingType === undefined ||
      basePrice === undefined ||
      pricePerKg === undefined
    ) {
      return next(new AppError("Required fields are missing", 400));
    }

    if (!Number.isInteger(providerId) || providerId <= 0) {
      return next(new AppError("Invalid providerId", 400));
    }

    if (
      typeof basePrice !== "number" ||
      basePrice < 0 ||
      typeof pricePerKg !== "number" ||
      pricePerKg < 0
    ) {
      return next(new AppError("Invalid pricing values", 400));
    }


    const provider = await prisma.shippingProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider || !provider.isActive) {
      return next(
        new AppError("Provider not found or inactive", 404)
      );
    }

    // Check for an existing identical active rule
    const existingRule = await prisma.pricingRule.findFirst({
      where: {
        providerId,
        shippingType,
        minWeight: minWeight ?? null,
        maxWeight: maxWeight ?? null,
        isActive: true,
      },
    });

    if (existingRule) {
      return next(
        new AppError(
          "An active pricing rule already exists for this provider, shipping type and weight range",
          409
        )
      );
    }

    const pricingRule = await prisma.pricingRule.create({
      data: {
        providerId,
        shippingType,
        minWeight: minWeight ?? null,
        maxWeight: maxWeight ?? null,
        basePrice,
        pricePerKg,
        volumetricDivisor: volumetricDivisor ?? null,
        surcharge: surcharge ?? 0,
        isActive: true,
      },
    });

    return res.status(201).json({
      status: "success",
      data: { pricingRule },
    });
  }

  async getApplicableRules(req, res, next) {
    const providerId = Number(req.params.providerId);
    const shipmentId = Number(req.params.shipmentId);

    if (
      !Number.isInteger(providerId) ||
      providerId <= 0 ||
      !Number.isInteger(shipmentId) ||
      shipmentId <= 0
    ) {
      return next(
        new AppError("Invalid providerId or shipmentId", 400)
      );
    }

    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
    });

    if (!shipment) {
      return next(new AppError("Shipment not found", 404));
    }

    const provider = await prisma.shippingProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider || !provider.isActive) {
      return next(
        new AppError("Provider not found or inactive", 404)
      );
    }

    const applicableRules = await prisma.pricingRule.findMany({
      where: {
        providerId,
        isActive: true,
        shippingType: shipment.shippingType,
        AND: [
          {
            OR: [
              { minWeight: null },
              { minWeight: { lte: shipment.weight } },
            ],
          },
          {
            OR: [
              { maxWeight: null },
              { maxWeight: { gte: shipment.weight } },
            ],
          },
        ],
      },
      orderBy: { id: "asc" },
    });

    return res.status(200).json({
      status: "success",
      length: applicableRules.length,
      data: applicableRules,
    });
  }


  async updatePricingRule(req, res, next) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return next(new AppError("Invalid pricing rule ID", 400));
    }

    const {
      providerId,
      shippingType,
      minWeight,
      maxWeight,
      basePrice,
      pricePerKg,
      volumetricDivisor,
      surcharge,
      isActive,
    } = req.body;

    const existingRule = await prisma.pricingRule.findUnique({
      where: { id },
    });

    if (!existingRule) {
      return next(new AppError("Pricing rule not found", 404));
    }

    const data = {};

    if (providerId !== undefined) {
      if (!Number.isInteger(providerId) || providerId <= 0) {
        return next(new AppError("Invalid providerId", 400));
      }

      const provider = await prisma.shippingProvider.findUnique({
        where: { id: providerId },
      });

      if (!provider || !provider.isActive) {
        return next(
          new AppError("Provider not found or inactive", 404)
        );
      }

      data.providerId = providerId;
    }

    if (shippingType !== undefined) {
      data.shippingType = shippingType;
    }

    if (minWeight !== undefined) {
      if (
        minWeight !== null &&
        (typeof minWeight !== "number" ||
          minWeight < 0)
      ) {
        return next(new AppError("Invalid minimum weight", 400));
      }

      data.minWeight = minWeight;
    }

    if (maxWeight !== undefined) {
      if (
        maxWeight !== null &&
        (typeof maxWeight !== "number" ||
          !Number.isFinite(maxWeight) ||
          maxWeight < 0)
      ) {
        return next(new AppError("Invalid maximum weight", 400));
      }

      data.maxWeight = maxWeight;
    }

    if (basePrice !== undefined) {
      if (
        typeof basePrice !== "number" ||
        !Number.isFinite(basePrice) ||
        basePrice < 0
      ) {
        return next(new AppError("Invalid base price", 400));
      }

      data.basePrice = basePrice;
    }

    if (pricePerKg !== undefined) {
      if (
        typeof pricePerKg !== "number" ||
        !Number.isFinite(pricePerKg) ||
        pricePerKg < 0
      ) {
        return next(new AppError("Invalid pricePerKg", 400));
      }

      data.pricePerKg = pricePerKg;
    }

    if (volumetricDivisor !== undefined) {
      if (
        volumetricDivisor !== null &&
        (typeof volumetricDivisor !== "number" ||
          volumetricDivisor <= 0)
      ) {
        return next(new AppError("Invalid volumetric divisor", 400));
      }

      data.volumetricDivisor = volumetricDivisor;
    }

    if (surcharge !== undefined) {
      if (
        surcharge !== null &&
        (typeof surcharge !== "number" ||
          surcharge < 0)
      ) {
        return next(new AppError("Invalid surcharge", 400));
      }

      data.surcharge = surcharge;
    }

    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return next(new AppError("Invalid isActive value", 400));
      }

      data.isActive = isActive;
    }

    // Validate the final weight range, including unchanged values
    const finalMinWeight =
      data.minWeight !== undefined
        ? data.minWeight
        : existingRule.minWeight;

    const finalMaxWeight =
      data.maxWeight !== undefined
        ? data.maxWeight
        : existingRule.maxWeight;

    if (
      finalMinWeight != null &&
      finalMaxWeight != null &&
      finalMaxWeight < finalMinWeight
    ) {
      return next(
        new AppError("Maximum weight must be >= minimum weight", 400)
      );
    }

    if (Object.keys(data).length === 0) {
      return next(
        new AppError("No valid fields provided for update", 400)
      );
    }

    const updatedRule = await prisma.pricingRule.update({
      where: { id },
      data,
    });

    return res.status(200).json({
      status: "success",
      message: "Pricing rule updated successfully",
      data: { pricingRule: updatedRule },
    });
  }
}
