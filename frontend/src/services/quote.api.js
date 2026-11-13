import api from "./api";

export const estimateQuotes = async (shipmentId) => {
  const res = await api.post(`/quote/${shipmentId}/estimateQuotes`);
  return res.data;
};

export const calculateQuote = async (shipmentId, providerId) => {
  const res = await api.post(
    `/quote/${shipmentId}/${providerId}/calculateQuote`
  );
  return res.data;
};

export const getShipmentQuotes = async (shipmentId) => {
  const res = await api.get(`/quote/${shipmentId}`);
  return res.data;
};
