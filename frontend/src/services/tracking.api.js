import api from "./api";

export const addTrackingEvent = async (shipmentId, eventData) => {
  const res = await api.post(
    `/tracking/${shipmentId}`,
    eventData
  );

  return res.data;
};

export const getTrackingHistory = async (shipmentId) => {
  const res = await api.get(`/tracking/${shipmentId}`);

  return res.data;
};
