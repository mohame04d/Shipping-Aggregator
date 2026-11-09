import express from 'express';
import { restrictedTo, protect } from '../Auth/auth.controller.js';
import { createProvider, getProviderById, listActiveProviders, updateProvider } from './provider.controller.js';
import validate from '../../middlewares/validate.middleware.js';
import { createProviderSchema, getProviderSchema, updateProviderSchema } from './provider.validation.js';

const router= express.Router();

router.use(protect)
router.post('/', restrictedTo('ADMIN'), validate(createProviderSchema), createProvider);
router.get('/', listActiveProviders);
router.get('/:id', validate(getProviderSchema), getProviderById);
router.patch('/:id', restrictedTo('ADMIN'), validate(updateProviderSchema), updateProvider)

export default router;