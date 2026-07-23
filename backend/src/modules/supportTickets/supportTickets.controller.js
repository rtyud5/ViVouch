import { asyncHandler } from '../../utils/asyncHandler.js';
import { createTicketSchema, respondTicketSchema } from './supportTickets.validator.js';
import * as service from './supportTickets.service.js';

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await service.createTicket(req.user.userId, createTicketSchema.parse(req.body)) });
});
export const mine = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.listMine(req.user.userId) });
});
export const adminList = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  res.json({ success: true, data: await service.listAdmin({ status: req.query.status, page, limit }) });
});
export const respond = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.respond(req.user.userId, req.params.id, respondTicketSchema.parse(req.body)) });
});
