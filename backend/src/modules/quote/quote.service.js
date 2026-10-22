import prisma from "../../config/prisma.js";
import AppError from "../../utils/appError.js";

export default class QuoteService {
    calculateChargeableWeight(
        width,
        length,
        height,
        weight,
        volumetricDivisor,
        basePrice,
        pricePerKg,
        surcharge
    ) {
        const dimensions = [width, length, height, weight];

        if (
            !dimensions.every(
                (value) => Number.isFinite(value) && value > 0
            )
        ) {
            throw new AppError(
                "Weight and dimensions must be positive numbers",
                400
            );
        }

        if (
            !Number.isFinite(basePrice) ||
            basePrice < 0 ||
            !Number.isFinite(pricePerKg) ||
            pricePerKg < 0 ||
            (surcharge != null &&
                (!Number.isFinite(surcharge) || surcharge < 0))
        ) {
            throw new AppError("Invalid pricing values", 400);
        }

        const divisor = volumetricDivisor ?? 5000;

        if (!Number.isFinite(divisor) || divisor <= 0) {
            throw new AppError("Invalid volumetric divisor", 400);
        }

        const volumetricWeight =
            (width * length * height) / divisor;

        const chargeableWeight = Math.max(
            weight,
            volumetricWeight
        );

        const price =
            basePrice +
            pricePerKg * chargeableWeight +
            (surcharge ?? 0);

        return Number(price.toFixed(2));
    }


    async estimateShipment(req, res, next) {
            const shipmentId = Number(req.params.shipmentId);
            const userId = Number(req.user?.id);

            if (!Number.isInteger(shipmentId) || shipmentId <= 0) {
                return next(
                    new AppError("Invalid shipmentId", 400)
                );
            }

            if (!Number.isInteger(userId) || userId <= 0) {
                return next(
                    new AppError("Authentication required", 401)
                );
            }

            const shipment = await prisma.shipment.findFirst({
                where: {
                    id: shipmentId,
                    userId
                }
            });

            if (!shipment) {
                return next(
                    new AppError("Shipment not found", 404)
                );
            }

            const now = new Date();

            const existingQuotes = await prisma.shippingQuote.findMany({
                where: {
                    shipmentId,
                    expiresAt: { gt: now },
                    provider: { isActive: true }
                },
                include: {
                    provider: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                orderBy: {
                    price: "asc"
                }
            });

            const existingProviderIds = new Set(
                existingQuotes.map((quote) => quote.providerId)
            );

            const rules = await prisma.pricingRule.findMany({
                where: {
                    shippingType: shipment.shippingType,
                    isActive: true,
                    provider: {
                        isActive: true
                    },
                    AND: [
                        {
                            OR: [
                                { minWeight: null },
                                {
                                    minWeight: {
                                        lte: shipment.weight
                                    }
                                }
                            ]
                        },
                        {
                            OR: [
                                { maxWeight: null },
                                {
                                    maxWeight: {
                                        gte: shipment.weight
                                    }
                                }
                            ]
                        }
                    ]
                },
                include: {
                    provider: true
                },
                orderBy: {
                    id: "asc"
                }
            });

            const seenProviderIds = new Set(existingProviderIds);
            const expiresAt = new Date(
                Date.now() + 24 * 60 * 60 * 1000
            );

            const newQuotes = [];

            for (const rule of rules) {
                if (seenProviderIds.has(rule.providerId)) {
                    continue;
                }

                const price = this.calculateChargeableWeight(
                    shipment.width,
                    shipment.length,
                    shipment.height,
                    shipment.weight,
                    rule.volumetricDivisor,
                    rule.basePrice,
                    rule.pricePerKg,
                    rule.surcharge
                );

                newQuotes.push({
                    shipmentId: shipment.id,
                    providerId: rule.providerId,
                    price,
                    currency: shipment.currency,
                    serviceType: shipment.shippingType,
                    estimateDaysMin: rule.provider.estimateDaysMin,
                    estimateDaysMax: rule.provider.estimateDaysMax,
                    expiresAt
                });

                seenProviderIds.add(rule.providerId);
            }

            if (newQuotes.length > 0) {
                await prisma.shippingQuote.createMany({
                    data: newQuotes
                });
            }

            const quotes = await prisma.shippingQuote.findMany({
                where: {
                    shipmentId,
                    expiresAt: { gt: new Date() },
                    provider: { isActive: true }
                },
                include: {
                    provider: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                orderBy: {
                    price: "asc"
                }
            });

            return res.status(200).json({
                status: "success",
                length: quotes.length,
                data: quotes
            });
    }

    async calculateQuote(req, res, next) {
            const providerId = Number(req.body.providerId);
            const shipmentId = Number(req.body.shipmentId);
            const userId = Number(req.user?.id);

            if (
                !Number.isInteger(providerId) ||
                providerId <= 0 ||
                !Number.isInteger(shipmentId) ||
                shipmentId <= 0
            ) {
                return next(
                    new AppError(
                        "Invalid providerId or shipmentId",
                        400
                    )
                );
            }

            if (!Number.isInteger(userId) || userId <= 0) {
                return next(
                    new AppError("Authentication required", 401)
                );
            }

            const shipment = await prisma.shipment.findFirst({
                where: {
                    id: shipmentId,
                    userId
                }
            });

            if (!shipment) {
                return next(
                    new AppError("Shipment not found", 404)
                );
            }

            const provider = await prisma.shippingProvider.findFirst({
                where: {
                    id: providerId,
                    isActive: true
                }
            });

            if (!provider) {
                return next(
                    new AppError(
                        "Provider not found or inactive",
                        404
                    )
                );
            }

            const existingQuote = await prisma.shippingQuote.findFirst({
                where: {
                    shipmentId,
                    providerId,
                    expiresAt: { gt: new Date() },
                    provider: { isActive: true }
                },
                include: {
                    provider: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                }
            });

            if (existingQuote) {
                return res.status(200).json({
                    status: "success",
                    data: { quote: existingQuote }
                });
            }

            const rule = await prisma.pricingRule.findFirst({
                where: {
                    providerId,
                    shippingType: shipment.shippingType,
                    isActive: true,
                    provider: {
                        isActive: true
                    },
                    AND: [
                        {
                            OR: [
                                { minWeight: null },
                                {
                                    minWeight: {
                                        lte: shipment.weight
                                    }
                                }
                            ]
                        },
                        {
                            OR: [
                                { maxWeight: null },
                                {
                                    maxWeight: {
                                        gte: shipment.weight
                                    }
                                }
                            ]
                        }
                    ]
                },
                orderBy: {
                    id: "asc"
                }
            });

            if (!rule) {
                return next(
                    new AppError(
                        "No pricing rule matches this shipment",
                        404
                    )
                );
            }

            const price = this.calculateChargeableWeight(
                shipment.width,
                shipment.length,
                shipment.height,
                shipment.weight,
                rule.volumetricDivisor,
                rule.basePrice,
                rule.pricePerKg,
                rule.surcharge
            );

            const quote = await prisma.shippingQuote.create({
                data: {
                    providerId,
                    shipmentId,
                    price,
                    estimateDaysMin: provider.estimateDaysMin,
                    estimateDaysMax: provider.estimateDaysMax,
                    serviceType: shipment.shippingType,
                    currency: shipment.currency,
                    expiresAt: new Date(
                        Date.now() + 24 * 60 * 60 * 1000
                    )
                },
                include: {
                    provider: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });

            return res.status(201).json({
                status: "success",
                data: { quote }
            });
    }


    async getShipmentQuotes(req, res, next) {
            const shipmentId = Number(req.params.shipmentId);
            const userId = Number(req.user?.id);

            if (!Number.isInteger(shipmentId) || shipmentId <= 0) {
                return next(
                    new AppError("Invalid shipmentId", 400)
                );
            }

            if (!Number.isInteger(userId) || userId <= 0) {
                return next(
                    new AppError("Authentication required", 401)
                );
            }

            const shipment = await prisma.shipment.findFirst({
                where: {
                    id: shipmentId,
                    userId
                },
                select: {
                    id: true
                }
            });

            if (!shipment) {
                return next(
                    new AppError("Shipment not found", 404)
                );
            }

            const quotes = await prisma.shippingQuote.findMany({
                where: {
                    shipmentId,
                    expiresAt: { gt: new Date() },
                    provider: {
                        isActive: true
                    }
                },
                orderBy: {
                    price: "asc"
                },
                include: {
                    provider: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });

            return res.status(200).json({
                status: "success",
                length: quotes.length,
                data: quotes
            });
    }
}
