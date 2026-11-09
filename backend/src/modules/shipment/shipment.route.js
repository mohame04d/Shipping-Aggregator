import express from 'express'
import { protect } from '../Auth/auth.controller.js';
import { calculateChargeableWeight, changeShipmentStatus, createShipment, getShipment, listShipments } from './shipment.controller.js';
import validate from '../../middlewares/validate.middleware.js';
import { createShipmentSchema, shipmentIdSchema, updateShipmentStatus , calculateWeightSchema} from '../shipment/shipment.validation.js';

const router= express.Router();

router.use(protect)

router.post('/', validate(createShipmentSchema), createShipment);
router.get('/:id', validate(shipmentIdSchema), getShipment);
router.get('/', listShipments);
router.get('/pricingRule/:id/calculate-weight', validate(calculateWeightSchema), calculateChargeableWeight);
router.patch('/:id', validate(updateShipmentStatus), changeShipmentStatus);

export default router;