import express from 'express';
import { protect } from '../Auth/auth.controller.js';
import { calculateQuote, estimateShipment, getShipmentQuotes } from './quote.controller.js';
import validate from '../../middlewares/validate.middleware.js';
import { calculateQuoteSchema, shipmentIdSchema } from './quote.validation.js';

const router= express.Router();

router.use(protect);
router.post('/:shipmentId/estimateQuotes', validate(shipmentIdSchema), estimateShipment);
router.post('/:shipmentId/:providerId/calculateQuote', validate(calculateQuoteSchema), calculateQuote);
router.get('/:shipmentId', validate(shipmentIdSchema), getShipmentQuotes);

export default router;