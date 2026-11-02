import BaseProvider from "./baseProvider.js";

class MockProvider extends BaseProvider {
  async getRates(shipmentData) {
    return [
      {
        service: "STANDARD",
        amount: 100,
        currency: "EGP",
        estimatedDays: 3,
      },
      {
        service: "EXPRESS",
        amount: 150,
        currency: "EGP",
        estimatedDays: 1,
      },
    ];
  }

  async createShipment(shipmentData) {
    return {
      success: true,
      providerShipmentId: `MOCK-SHIP-${Date.now()}`,
      trackingNumber: `MOCK-TRACK-${Date.now()}`,
      status: "CREATED",
    };
  }

  async trackShipment(trackingNumber) {
    return {
      trackingNumber,
      status: "IN_TRANSIT",
      location: "Cairo",
      description: "Shipment is on the way",
    };
  }

  async cancelShipment(trackingNumber) {
    return {
      success: true,
      trackingNumber,
      status: "CANCELLED",
    };
  }
}

export default MockProvider;