import ProviderService from "./provider.service.js";
import catchAsync from "../../utils/catchAsync.js";

const providerService= new ProviderService();

export const createProvider= catchAsync((req, res, next)=>{
    return providerService.createProvider(req,res,next)
})

export const listActiveProviders= catchAsync((req, res, next)=>{
    return providerService.listActiveProviders(req,res,next)
})

export const getProviderById= catchAsync((req,res,next)=>{
    return providerService.getProviderById(req,res,next)
})

export const updateProvider= catchAsync((req, res, next)=>{
    return providerService.updateProvider(req, res, next)
})

