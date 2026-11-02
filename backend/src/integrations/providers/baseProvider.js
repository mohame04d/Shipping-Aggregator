class BaseProvider {
  async getRates(shipmentData) {
    throw new Error("Method not implemented");
  }

  async createShipment(shipmentData) {
    throw new Error("Method not implemented");
  }

  async trackShipment(trackingNumber) {
    throw new Error("Method not implemented");
  }
}

export default BaseProvider;