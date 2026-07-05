import { asyncHandler } from '../../utils/asyncHandler.js';
import * as reportsService from './reports.service.js';
import { partnerReportsQuerySchema } from './reports.validator.js';

export const getPartnerReports = asyncHandler(async (req, res) => {
  const { range } = partnerReportsQuerySchema.parse(req.query);
  const partnerUserId = req.user.userId;

  const data = await reportsService.getPartnerReports(partnerUserId, range);

  res.status(200).json({
    success: true,
    data,
  });
});
