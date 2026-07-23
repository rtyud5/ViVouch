import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import * as controller from './supportTickets.controller.js';

export const customerTicketRouter = Router();
customerTicketRouter.use(verifyToken, requireRole('CUSTOMER'));
customerTicketRouter.get('/', controller.mine);
customerTicketRouter.post('/', controller.create);

export const adminTicketRouter = Router();
adminTicketRouter.get('/', controller.adminList);
adminTicketRouter.post('/:id/respond', controller.respond);
