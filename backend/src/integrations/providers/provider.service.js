import prisma from "../../config/prisma.js";
import AppError from "../../utils/appError.js";
import ProviderFactory from "./provider.factory.js";

class ProviderService {
  async getProvider(providerId) {
    const parsedProviderId = Number(providerId);

    if (!Number.isInteger(parsedProviderId) || parsedProviderId <= 0) {
      throw new AppError("Invalid provider ID", 400);
    }

    const providerData = await prisma.shippingProvider.findUnique({
      where: {
        id: parsedProviderId,
      },
    });

    if (!providerData || !providerData.isActive) {
      throw new AppError("Shipping provider not available", 404);
    }

    return ProviderFactory.getProvider(providerData.code);
  }

  async getRates(providerId, shipmentData) {
    const provider = await this.getProvider(providerId);

    return provider.getRates(shipmentData);
  }

  async createShipment(providerId, shipmentData) {
    const provider = await this.getProvider(providerId);

    return provider.createShipment(shipmentData);
  }

  async trackShipment(providerId, trackingNumber) {
    const provider = await this.getProvider(providerId);

    return provider.trackShipment(trackingNumber);
  }

  async cancelShipment(providerId, trackingNumber) {
    const provider = await this.getProvider(providerId);

    return provider.cancelShipment(trackingNumber);
  }
}

export default new ProviderService();