import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  type: 'verification' | 'resetPassword';
}

const createVerificationTemplate = (link: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
    }
    .header {
      background-color: #FF6B6B;
      padding: 20px;
      text-align: center;
    }
    .header h1 {
      color: white;
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 30px 20px;
      background-color: #ffffff;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #FF6B6B;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>HeartLink</h1>
    </div>
    <div class="content">
      <h2>Welcome to HeartLink!</h2>
      <p>Thank you for joining our community. We're excited to help you make meaningful connections.</p>
      <p>Please verify your email address to get started:</p>
      <center>
        <a href="${link}" class="button">Verify Email Address</a>
      </center>
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${link}</p>
    </div>
    <div class="footer">
      <p>© 2025 HeartLink. All rights reserved.</p>
      <p>If you didn't create this account, please ignore this email.</p>
    </div>
  </div>
</body>
</html>
`;

const createPasswordResetTemplate = (link: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
    }
    .header {
      background-color: #FF6B6B;
      padding: 20px;
      text-align: center;
    }
    .header h1 {
      color: white;
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 30px 20px;
      background-color: #ffffff;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #FF6B6B;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>HeartLink</h1>
    </div>
    <div class="content">
      <h2>Password Reset Request</h2>
      <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
      <p>To reset your password, click the button below:</p>
      <center>
        <a href="${link}" class="button">Reset Password</a>
      </center>
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${link}</p>
      <p>This link will expire in 1 hour for security reasons.</p>
    </div>
    <div class="footer">
      <p>© 2025 HeartLink. All rights reserved.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
    </div>
  </div>
</body>
</html>
`;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendEmail = async ({ to, subject, text, type }: EmailOptions) => {
  try {
    const link = text.split(': ')[1];
    const template = type === 'verification' 
      ? createVerificationTemplate(link)
      : createPasswordResetTemplate(link);

    const info = await transporter.sendMail({
      from: `"HeartLink" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: template
    });

    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};