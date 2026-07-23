import { Router } from 'express';
import * as controller from './partnerMembers.controller.js';
import { requirePartnerMember, requirePartnerOwner } from '../../middlewares/partnerAccess.middleware.js';

const router = Router();

router.get('/', requirePartnerOwner(), controller.list);
router.post('/', requirePartnerOwner(), controller.create);
router.patch('/:id', requirePartnerOwner(), controller.update);
router.get('/me/redeem-history', requirePartnerMember(), controller.history);

export default router;
