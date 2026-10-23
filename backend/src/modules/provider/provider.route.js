import express from 'express';
import { protect, restrictedTo } from '../Auth/auth.controller';
import { createProvider, getProviderById, listActiveProviders, updateProvider } from './provider.controller';
import validate from '../../middlewares/validate.middleware';
import { createProviderSchema, getProviderSchema, updateProviderSchema } from './provider.validation';

const router= express.Router();

router.use(protect)
router.post('/', restrictedTo('ADMIN'), validate(createProviderSchema), createProvider);
router.get('/', listActiveProviders);
router.get('/:id', validate(getProviderSchema), getProviderById);
router.patch('/:id', restrictedTo('ADMIN'), validate(updateProviderSchema), updateProvider)

export default router;