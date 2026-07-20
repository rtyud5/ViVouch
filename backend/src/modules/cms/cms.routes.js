import { Router } from 'express';
import * as controller from './cms.controller.js';

const router = Router();
router.get('/banners', controller.getActiveBanners);
router.get('/pages/:slug', controller.getPublishedPage);
export default router;
