import express from 'express';
import { protect } from '../Auth/auth.controller';
import { calculateQuote, estimateShipment, getShipmentQuotes } from './quote.controller';
import validate from '../../middlewares/validate.middleware';
import { calculateQuoteSchema, shipmentIdSchema } from './quote.validation';

const router= express.Router();

router.use(protect);
router.post('/:shipmentId/estimateQuotes', validate(shipmentIdSchema), estimateShipment);
router.post('/:shipmentId/:providerId/calculateQuote', validate(calculateQuoteSchema), calculateQuote);
router.get('/:shipmentId', validate(shipmentIdSchema), getShipmentQuotes);

export default router;