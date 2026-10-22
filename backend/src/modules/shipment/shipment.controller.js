import ShipmentService from "./shipment.service";
import catchAsync from "../../utils/catchAsync";

const shipmentService= new ShipmentService();

const createShipment= catchAsync((req,res,next)=>{
    return shipmentService.createShipment(req,res,next)
})

const getShipment= catchAsync((req,res,next)=>{
    return shipmentService.getShipment(req,res,next)
})

const listShipments= catchAsync((req,res,next)=>{
    return shipmentService.listShipments(req,res,next)
})

const calculateChargeableWeight= catchAsync((req,res,next)=>{
    return shipmentService.calculateChargeableWeight(req,res,next)
})

const changeShipmentStatus= catchAsync((req,res,next)=>{
    return shipmentService.changeShipmentStatus(req,res,net)
})

export {createShipment, getShipment, listShipments, calculateChargeableWeight, changeShipmentStatus};