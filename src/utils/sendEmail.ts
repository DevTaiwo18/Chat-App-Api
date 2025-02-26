import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  type: 'verification' | 'resetPassword' | 'likeNotification' | 'messageNotification';
  userData?: UserData;
}

interface UserData {
  name: string;
  age?: number;
  gender?: string;
  bio?: string;
  interests?: string[];
  profilePicture?: string;
  id: string;
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

const createLikeNotificationTemplate = (userData: UserData, baseUrl: string) => {
  const { name, age, gender, bio, interests, profilePicture, id } = userData;

  const ageGenderText = [
    age ? `${age}` : '',
    gender ? `${gender.charAt(0).toUpperCase() + gender.slice(1)}` : ''
  ].filter(Boolean).join(', ');

  const interestBadges = interests && interests.length > 0
    ? `<div style="margin-top: 15px; margin-bottom: 15px;">
        <div style="display: flex; flex-wrap: wrap; gap: 5px;">
          ${interests.map(interest =>
      `<span style="display: inline-block; background-color: #FFECEC; color: #FF6B6B; 
              border-radius: 20px; padding: 5px 10px; margin-right: 5px; margin-bottom: 5px; 
              font-size: 12px;">${interest}</span>`
    ).join('')}
        </div>
      </div>`
    : '';

  const initials = name
    ? name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
    : '?';

  const profileImageHtml = profilePicture
    ? `<img src="${profilePicture}" alt="${name}'s profile" 
        style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; margin: 0 auto; display: block;">`
    : `<div style="width: 150px; height: 150px; border-radius: 50%; background-color: #FF6B6B; 
        color: white; margin: 0 auto; display: block; text-align: center;">
        <div style="line-height: 150px; font-size: 48px; font-weight: 500;">${initials}</div>
      </div>`;

  const likeUrl = `${baseUrl}/auth/dashboard/matches?action=like&userId=${id}`;

  return `
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
      text-align: center;
    }
    .profile-card {
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 24px;
      margin: 20px 0;
    }
    .profile-name {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      margin: 15px 0 4px 0;
    }
    .profile-details {
      background-color: #f8f8f8;
      border-radius: 20px;
      padding: 4px 10px;
      font-size: 14px;
      color: #666;
      display: inline-block;
      margin-bottom: 15px;
    }
    .bio {
      color: #555;
      margin-bottom: 16px;
      text-align: center;
    }
    .like-button {
      display: inline-block;
      padding: 12px 40px;
      background-color: #FF6B6B;
      color: white;
      text-decoration: none;
      border-radius: 50px;
      margin: 20px 0;
      text-align: center;
      font-weight: 500;
      font-size: 16px;
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
      <h2>${name} likes you! ❤️</h2>
      
      <div class="profile-card">
        ${profileImageHtml}
        
        <h3 class="profile-name">${name}</h3>
        ${ageGenderText ? `<div class="profile-details">${ageGenderText}</div>` : ''}
        
        ${bio ? `<p class="bio">${bio}</p>` : ''}
        
        ${interestBadges}
      </div>
      
      <p>Click below to like ${name} back and start chatting!</p>
      <a href="${likeUrl}" class="like-button">Like Back</a>
      
      <p style="margin-top: 30px; color: #666; font-size: 13px;">
        If you're not interested, simply ignore this email and continue browsing other matches in the app.
      </p>
    </div>
    <div class="footer">
      <p>© 2025 HeartLink. All rights reserved.</p>
      <p>You're receiving this email because you have an account on HeartLink.</p>
      <p>To stop receiving these notifications, update your preferences in your account settings.</p>
    </div>
  </div>
</body>
</html>
`;
};

const createMessageNotificationTemplate = (userData: UserData, baseUrl: string) => {
  const { name, profilePicture, id } = userData;

  const initials = name
    ? name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
    : '?';

  const profileImageHtml = profilePicture
    ? `<img src="${profilePicture}" alt="${name}'s profile" 
        style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-right: 15px;">`
    : `<div style="width: 80px; height: 80px; border-radius: 50%; background-color: #FF6B6B; 
        color: white; margin-right: 15px; text-align: center;">
        <div style="line-height: 80px; font-size: 32px; font-weight: 500;">${initials}</div>
      </div>`;

  const messagesUrl = `${baseUrl}/auth/dashboard/messages/${id}`;

  return `
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
      text-align: center;
    }
    .message-card {
      background-color: #F9F9F9;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      display: flex;
      align-items: center;
      text-align: left;
    }
    .message-details {
      flex-grow: 1;
    }
    .message-name {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin: 0 0 5px 0;
    }
    .message-preview {
      color: #666;
      margin: 0;
      font-size: 14px;
    }
    .reply-button {
      display: inline-block;
      padding: 12px 40px;
      background-color: #FF6B6B;
      color: white;
      text-decoration: none;
      border-radius: 50px;
      margin: 20px 0;
      text-align: center;
      font-weight: 500;
      font-size: 16px;
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
      <h2>New Message!</h2>
      
      <p>You've received a new message from ${name}.</p>
      
      <div class="message-card">
        ${profileImageHtml}
        <div class="message-details">
          <h3 class="message-name">${name}</h3>
          <p class="message-preview">You have a new message waiting...</p>
        </div>
      </div>
      
      <p>Click below to read and reply!</p>
      <a href="${messagesUrl}" class="reply-button">View Message</a>
      
    </div>
    <div class="footer">
      <p>© 2025 HeartLink. All rights reserved.</p>
      <p>You're receiving this email because you have an account on HeartLink.</p>
      <p>To stop receiving these notifications, update your preferences in your account settings.</p>
    </div>
  </div>
</body>
</html>
`;
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendEmail = async ({ to, subject, text, type, userData }: EmailOptions) => {
  try {
    let template;
    let htmlText = text;

    if (type === 'verification' || type === 'resetPassword') {
      const link = text.split(': ')[1];
      template = type === 'verification'
        ? createVerificationTemplate(link)
        : createPasswordResetTemplate(link);
    } else if (type === 'likeNotification' && userData) {
      const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      template = createLikeNotificationTemplate(userData, baseUrl);
    } else if (type === 'messageNotification' && userData) {
      const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      template = createMessageNotificationTemplate(userData, baseUrl);
    }

    const info = await transporter.sendMail({
      from: `"HeartLink" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: htmlText,
      html: template
    });

    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
