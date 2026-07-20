import { Router } from 'express';
import * as controller from './cms.controller.js';

const router = Router();
router.get('/categories', controller.getCategories);
router.post('/categories', controller.createCategory);
router.patch('/categories/:id', controller.updateCategory);
router.delete('/categories/:id', controller.deleteCategory);
router.get('/pages', controller.getPages);
router.post('/pages', controller.createPage);
router.patch('/pages/:id', controller.updatePage);
router.delete('/pages/:id', controller.deletePage);
router.get('/banners', controller.getBanners);
router.post('/banners', controller.createBanner);
router.patch('/banners/:id', controller.updateBanner);
router.delete('/banners/:id', controller.deleteBanner);
export default router;
