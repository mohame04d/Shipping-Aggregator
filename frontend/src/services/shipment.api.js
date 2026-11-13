import api from "./api";

export const createShipment = async (shipmentData) => {
  const res = await api.post("/shipments", shipmentData);
  return res.data;
};

export const getShipment = async (id) => {
  const res = await api.get(`/shipments/${id}`);
  return res.data;
};

export const listShipments = async () => {
  const res = await api.get("/shipments");
  return res.data;
};

export const updateShipmentStatus = async (id, statusData) => {
  const res = await api.patch(
    `/shipments/${id}/status`,
    statusData
  );

  return res.data;
};
