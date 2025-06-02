import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface MailOptions {
  from?: string;
  to: string | string[];
  subject: string;
  text?: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (mailOptions: MailOptions): Promise<void> => {
  try {
    const optionsWithDefaults = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER, // Fallback to EMAIL_USER if EMAIL_FROM is not set
      ...mailOptions,
    };
    await transporter.sendMail(optionsWithDefaults);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

// Example usage (optional, for testing)
/*
if (process.env.NODE_ENV === 'development') {
  sendEmail({
    to: 'test@example.com',
    subject: 'Test Email from Intranet API',
    html: '<p>This is a test email.</p>',
  }).catch(console.error);
}
*/
