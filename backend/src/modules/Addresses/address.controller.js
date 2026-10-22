import AddressService from "./address.services";
import catchAsync from "../../utils/catchAsync";

const addressService= new AddressService()

const createAddress= catchAsync((req,res,next)=>{
    return addressService.createAddress(req,res,next)
})

const updateAddress= catchAsync((req,res,next)=>{
    return addressService.updateAddress(req,res,next)
})

const getAllAddresses= catchAsync((req,res,next)=>{
    return addressService.getAllAddresses(req,res,next)
})

const deleteAddress= catchAsync((req,res,next)=>{
    return addressService.deleteAddress(req,res,next)
})

export {createAddress, updateAddress, getAllAddresses, deleteAddress}
