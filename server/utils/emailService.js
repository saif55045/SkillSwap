import nodemailer from 'nodemailer';
import { config } from './config.js';

// Create a transporter object with SMTP configuration
const transporter = nodemailer.createTransport({
  host: config.EMAIL_HOST || 'smtp.gmail.com',
  port: config.EMAIL_PORT || 587,
  secure: config.EMAIL_SECURE === 'true' || false,
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASSWORD
  },
  debug: true // Enable debug mode
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error with email transporter configuration:', error);
    console.log('Current email configuration:', {
      host: config.EMAIL_HOST,
      port: config.EMAIL_PORT,
      secure: config.EMAIL_SECURE === 'true' || false,
      user: config.EMAIL_USER ? 'PROVIDED' : 'MISSING',
      pass: config.EMAIL_PASSWORD ? 'PROVIDED' : 'MISSING'
    });
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Send email function
export const sendEmail = async (to, subject, htmlContent, textContent = '') => {
  try {
    console.log(`Attempting to send email to ${to} with subject: ${subject}`);
    
    const mailOptions = {
      from: `"${config.EMAIL_FROM_NAME || 'SkillSwap'}" <${config.EMAIL_FROM || config.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: textContent || htmlContent.replace(/<[^>]*>?/gm, ''), // Strip HTML tags for plain text version
      html: htmlContent
    };
    
    console.log('Mail options prepared:', { to, subject, from: mailOptions.from });
    
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
};

// Function to send template-based emails with replacements
export const sendTemplateEmail = async (to, subject, template, replacements) => {
  try {
    // Replace placeholders with actual values
    let emailContent = template;
    
    Object.keys(replacements).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      emailContent = emailContent.replace(regex, replacements[key]);
    });
    
    return await sendEmail(to, subject, emailContent);
  } catch (error) {
    console.error('Error sending template email:', error);
    throw error;
  }
};