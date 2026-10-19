import prisma from "../../config/prisma.js";
import AppError from "../../utils/appError.js";

export default class AddressService {
  // Create Address
  async createAddress(req, res, next) {
    const { label, country, street, city, phone } = req.body;
    const userId = req.user.id;

    const existingAddress = await prisma.address.findFirst({
      where: {
        label,
        country,
        street,
        city,
        phone,
        userId,
      },
    });

    if (existingAddress) {
      return next(
        new AppError("Address already exists", 409)
      );
    }

    const newAddress = await prisma.address.create({
      data: {
        label,
        country,
        street,
        city,
        phone,
        userId,
      },
    });

    return res.status(201).json({
      status: "success",
      data: { address: newAddress },
    });
  }

  // Update Address
  async updateAddress(req, res, next) {
    const id = req.params.id;

    const address = await prisma.address.findFirst({
      where: {
        id
          },
    });

    if (!address) {
      return next(new AppError("Address not found", 404));
    }

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: req.body,
    });

    return res.status(200).json({
      status: "success",
      data: { address: updatedAddress },
    });
  }

  // Get All Addresses
  async getAllAddresses(req, res, next) {
    const userId = req.user.id;

    const addresses = await prisma.address.findMany({
      where: { userId },
    });

    return res.status(200).json({
      status: "success",
      results: addresses.length,
      data: { addresses },
    });
  }

  // Delete Address
  async deleteAddress(req, res, next) {
    const id = req.params.id;

    const address = await prisma.address.findFirst({
      where: {
        id
      },
    });

    if (!address) {
      return next(new AppError("Address not found", 404));
    }

    await prisma.address.delete({
      where: { id },
    });

    return res.status(204).end();
  }
}
