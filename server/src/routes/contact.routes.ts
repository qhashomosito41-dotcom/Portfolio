import { Router } from 'express';
import { submitContact } from '../controllers/contact';
import { contactLimiter } from '../middleware/security';
import { validateBody } from '../middleware/validate';
import { contactSchema } from '../validators/entities';

export const contactRouter = Router();

contactRouter.post('/', contactLimiter, validateBody(contactSchema), submitContact);
