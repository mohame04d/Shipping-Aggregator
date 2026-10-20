import AppError from "../../utils/appError";
import prisma from "../../config/prisma";
import { date } from "zod";

export default class ShipmentService {
    async createShipment(req,res,next){

        const userId= req.user.id
        const{senderAddressId, receiverAddressId, weight, length, width, height, shippingType, currency}= req.body;

        const shipment= await prisma.shipment.create({
            data:{
                userId,
                senderAddressId,
                receiverAddressId,
                weight,
                length,
                width,
                height,
                shippingType,
                currency,
            }
        })

        res.status(201).json({
            status:'success',
            data: shipment
        })
    }

    async getShipment(req,res,next) {

        const id= req.params.id;
        const shipment= await prisma.shipment.findUnique({
            where:{id: Number(id)},
            include:{
                user: true,
                senderAddress: true,
                receiverAddress: true
            }
        })

        if(!shipment){
            return next(new AppError('shipment not found', 404));
        }

        res.status(200).json({
            status:'success',
            data:{shipment}
        })
    }


    async listShipments(req, res, next) {
        
        const shipments= await prisma.shipment.findMany({
            where: {
                userId: Number(req.user.id)
            },
            include:{
                user: true,
                senderAddress: true,
                receiverAddress: true
            }
        })

        res.status(200).json({
            status: 'success',
            length: shipments.length,
            data: {shipments}
        })
    }


    async calculateChargeableWeight(req, res, next) {
        
        const{width, length, height, weight}= req.body;
        const pricingRule= await prisma.pricingRule.findUnique({
            where: {id: Number(req.params.id)}
        })
        if(!pricingRule) {
            return next(new AppError('pricingRule not found', 404))
        }

       if (divisor == null || divisor <= 0) {
      return next(
        new AppError("Invalid volumetric divisor in pricing rule", 400)
      );
    }
        const volumetricWeight=  (width* length* height)/ pricingRule.volumetricDivisor;
        const chargeableWeight= Math.max(weight, volumetricWeight)

        res.status(200).json({
            status: 'calculating ChargeableWeight successfully',
            chargeableWeight:chargeableWeight
        })
    }


    async changeShipmentStatus(req, res, next) {

        const {status}= req.body;
        const updatedShipment= await prisma.shipment.update({
            where: {id: Number(req.params.id)},
            data: {status}
        })
        if(!updatedShipment) {
            return next(new AppError('shipment not found', 404))
        }

        res.status(201).json({
            status: 'changing Shipment Status successfully',
            date: {updatedShipment}
        })
    }

}