import AddressService from "./address.services";

const createAddress= (req,res,next)=>{
    return AddressService.createAddress(req,res,next)
}

const updateAddress= (req,res,next)=>{
    return AddressService.updateAddress(req,res,next)
}

const getAllAddresses= (req,res,next)=>{
    return AddressService.getAllAddresses(req,res,next)
}

const deleteAddress= (req,res,next)=>{
    return AddressService.deleteAddress(req,res,next)
}

export {createAddress, updateAddress, getAllAddresses, deleteAddress}
