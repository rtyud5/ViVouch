import { asyncHandler } from '../../utils/asyncHandler.js';
import * as service from './cms.service.js';
import { bannerSchema, bannerUpdateSchema, categorySchema, categoryUpdateSchema, idSchema, pageSchema, pageUpdateSchema, slugParamSchema } from './cms.validator.js';

const ok = (res, data, message = 'OK') => res.json({ success: true, message, data });

export const getCategories = asyncHandler(async (req, res) => ok(res, await service.listCategories()));
export const createCategory = asyncHandler(async (req, res) => res.status(201).json({ success: true, data: await service.createCategory(categorySchema.parse(req.body), req.user.userId) }));
export const updateCategory = asyncHandler(async (req, res) => ok(res, await service.updateCategory(idSchema.parse(req.params).id, categoryUpdateSchema.parse(req.body), req.user.userId)));
export const deleteCategory = asyncHandler(async (req, res) => { await service.deleteCategory(idSchema.parse(req.params).id, req.user.userId); res.status(204).end(); });

export const getPages = asyncHandler(async (req, res) => ok(res, await service.listPages()));
export const getPublishedPage = asyncHandler(async (req, res) => ok(res, await service.getPublishedPage(slugParamSchema.parse(req.params).slug)));
export const createPage = asyncHandler(async (req, res) => res.status(201).json({ success: true, data: await service.createPage(pageSchema.parse(req.body), req.user.userId) }));
export const updatePage = asyncHandler(async (req, res) => ok(res, await service.updatePage(idSchema.parse(req.params).id, pageUpdateSchema.parse(req.body), req.user.userId)));
export const deletePage = asyncHandler(async (req, res) => { await service.deletePage(idSchema.parse(req.params).id, req.user.userId); res.status(204).end(); });

export const getBanners = asyncHandler(async (req, res) => ok(res, await service.listBanners()));
export const getActiveBanners = asyncHandler(async (req, res) => ok(res, await service.listActiveBanners(req.query.position)));
export const createBanner = asyncHandler(async (req, res) => res.status(201).json({ success: true, data: await service.createBanner(bannerSchema.parse(req.body), req.user.userId) }));
export const updateBanner = asyncHandler(async (req, res) => ok(res, await service.updateBanner(idSchema.parse(req.params).id, bannerUpdateSchema.parse(req.body), req.user.userId)));
export const deleteBanner = asyncHandler(async (req, res) => { await service.deleteBanner(idSchema.parse(req.params).id, req.user.userId); res.status(204).end(); });
