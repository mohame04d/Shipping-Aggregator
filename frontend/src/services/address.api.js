
import api from "./api";

export const createAddress = async (addressData) => {
  const res = await api.post("/address", addressData);
  return res.data;
};

export const updateAddress = async (id, addressData) => {
  const res = await api.patch(`/address/${id}`, addressData);
  return res.data;
};

export const getAllAddresses = async () => {
  const res = await api.get("/address");
  return res.data;
};

export const deleteAddress = async (id) => {
  const res = await api.delete(`/address/${id}`);
  return res.data;
};
