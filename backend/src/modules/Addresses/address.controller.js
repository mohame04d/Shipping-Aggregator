import AddressService from "./address.services";
import catchAsync from "../../utils/catchAsync";

const createAddress= catchAsync((req,res,next)=>{
    return AddressService.createAddress(req,res,next)
})

const updateAddress= catchAsync((req,res,next)=>{
    return AddressService.updateAddress(req,res,next)
})

const getAllAddresses= catchAsync((req,res,next)=>{
    return AddressService.getAllAddresses(req,res,next)
})

const deleteAddress= catchAsync((req,res,next)=>{
    return AddressService.deleteAddress(req,res,next)
})

export {createAddress, updateAddress, getAllAddresses, deleteAddress}
