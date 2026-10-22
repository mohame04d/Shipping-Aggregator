import QuoteService from "./quote.service";
import catchAsync from "../../utils/catchAsync";

const quoteService= new QuoteService()

export const estimateShipment= catchAsync((req,res,next)=>{
    return quoteService.estimateShipment(req,res,next)
})

export const calculateQuote= catchAsync((req,res,next)=>{
    return quoteService.calculateQuote(req,res,next)
})

export const getShipmentQuotes= catchAsync((req,res,next)=>{
    return quoteService.getShipmentQuotes(req,res,next)
})