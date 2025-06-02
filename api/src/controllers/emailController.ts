import { Request, Response, NextFunction } from 'express';
import { sendEmail } from '../services/emailService.js';

export const handleSendEmail = async (req: Request, res: Response, next: NextFunction) => {
  const { to, subject, html, text } = req.body;

  if (!to || !subject || (!html && !text)) {
    return res.status(400).json({ message: 'Missing required fields: to, subject, and html or text.' });
  }

  try {
    await sendEmail({ to, subject, html, text });
    res.status(200).json({ message: 'Email sent successfully.' });
  } catch (error) {
    next(error); // Pass error to the global error handler
  }
};
