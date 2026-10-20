import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { getDashboardData } from '../../services/dashboard';

export const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const data = await getDashboardData();
  res.json({ success: true, data });
});
