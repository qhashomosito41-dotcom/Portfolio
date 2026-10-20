import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { createContactMessage } from '../services/contact';

export const submitContact = asyncHandler(async (req: Request, res: Response) => {
  const result = await createContactMessage(req.body);

  res.status(201).json({
    success: true,
    data: {
      received: true,
      message:
        'Thank you for your message. It has been saved and I will get back to you as soon as possible.',
      emailNotified: result.emailNotified,
    },
  });
});
