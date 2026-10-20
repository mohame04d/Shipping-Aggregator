import ShipmentService from "./shipment.service";
import catchAsync from "../../utils/catchAsync";

const createShipment= catchAsync((req,res,next)=>{
    return ShipmentService.createShipment(req,res,next)
})

const getShipment= catchAsync((req,res,next)=>{
    return ShipmentService.getShipment(req,res,next)
})

const listShipments= catchAsync((req,res,next)=>{
    return ShipmentService.listShipments(req,res,next)
})

const calculateChargeableWeight= catchAsync((req,res,next)=>{
    return ShipmentService.calculateChargeableWeight(req,res,next)
})

const changeShipmentStatus= catchAsync((req,res,next)=>{
    return ShipmentService.changeShipmentStatus(req,res,net)
})

export {createShipment, getShipment, listShipments, calculateChargeableWeight, changeShipmentStatus};