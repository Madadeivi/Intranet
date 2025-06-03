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
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER, // Esta debe ser la cuenta principal de Gmail
    pass: process.env.EMAIL_PASS,
  },
  debug: true,
  logger: true,
  // Configuraciones adicionales para Gmail
  tls: {
    rejectUnauthorized: false
  }
});

// Log de configuración para debugging
console.log('Email transporter configuration:', {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE,
  user: process.env.EMAIL_USER,
  passwordLength: process.env.EMAIL_PASS?.length || 0
});

export const sendEmail = async (mailOptions: MailOptions): Promise<void> => {
  try {
    // Verificar conexión antes de enviar
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    
    const optionsWithDefaults = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      ...mailOptions,
    };

    console.log('Sending email with options:', {
      from: optionsWithDefaults.from,
      to: optionsWithDefaults.to,
      subject: optionsWithDefaults.subject
    });

    await transporter.sendMail(optionsWithDefaults);
    console.log('Email sent successfully');
  } catch (error: any) {
    console.error('Detailed error sending email:', {
      message: error.message,
      code: error.code,
      response: error.response,
      responseCode: error.responseCode,
      command: error.command
    });
    
    // Mejorar el mensaje de error basado en el código
    if (error.code === 'EAUTH') {
      throw new Error('Gmail authentication failed. Please check your app password and 2FA settings.');
    } else if (error.responseCode === 535) {
      throw new Error('Invalid Gmail credentials. Please verify your username and app password.');
    } else {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
};
