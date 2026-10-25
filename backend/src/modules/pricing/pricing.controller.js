import catchAsync from "../../utils/catchAsync";
import PricingService from "./pricing.service";

const pricingService= new PricingService();

export const createPricingRule= catchAsync((req, res, next)=>{
    return pricingService.createPricingRule(req,res,next)
})

export const getApplicableRules= catchAsync((req, res, next)=>{
    return pricingService.getApplicableRules(req, res, next)
})

export const updatePricingRule= catchAsync((req, res, next)=>{
    return pricingService.updatePricingRule(req, res, next)
})