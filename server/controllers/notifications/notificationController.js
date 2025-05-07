import { User } from '../../models/User.js';
import { sendTemplateEmail } from '../../utils/emailService.js';

// Notification templates
const notificationTemplates = {
  verification: {
    approved: {
      email: '<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px;"><h2 style="color: #3b82f6;">Account Verified Successfully!</h2><p>Dear User,</p><p>Your account has been verified successfully. You can now access all platform features and start bidding on projects.</p><p>{{feedback}}</p><div style="margin: 30px 0;"><a href="http://localhost:5173/dashboard" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a></div><p>Thank you for choosing SkillSwap!</p><p>Best regards,<br>The SkillSwap Team</p></div>',
      sms: 'SkillSwap: Your account has been verified! You now have full access to the platform.'
    },
    rejected: {
      email: '<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px;"><h2 style="color: #ef4444;">Verification Request Declined</h2><p>Dear User,</p><p>Unfortunately, your verification request has been declined. Please review the feedback below and submit new documents.</p><p><strong>Feedback:</strong> {{feedback}}</p><div style="margin: 30px 0;"><a href="http://localhost:5173/freelancer/verification" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Update Verification</a></div><p>If you have any questions, please contact our support team.</p><p>Best regards,<br>The SkillSwap Team</p></div>',
      sms: 'SkillSwap: Your verification was not approved. Please check your email for details.'
    }
  },
  project: {
    awarded: {
      email: '<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px;"><h2 style="color: #3b82f6;">Congratulations! Project Awarded</h2><p>Dear User,</p><p>You have been awarded the project: <strong>{{projectName}}</strong>.</p><p>Please log in to your dashboard to review the project details and get started.</p><div style="margin: 30px 0;"><a href="http://localhost:5173/projects" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Project</a></div><p>We wish you success with this project!</p><p>Best regards,<br>The SkillSwap Team</p></div>',
      sms: 'SkillSwap: You got the job! Project {{projectName}} has been awarded to you.'
    },
    completed: {
      email: '<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px;"><h2 style="color: #3b82f6;">Project Completed</h2><p>Dear User,</p><p>The project <strong>{{projectName}}</strong> has been marked as completed. Please take a moment to leave a review for your collaboration partner.</p><div style="margin: 30px 0;"><a href="http://localhost:5173/reviews" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Leave a Review</a></div><p>Thank you for using SkillSwap!</p><p>Best regards,<br>The SkillSwap Team</p></div>',
      sms: 'SkillSwap: Project {{projectName}} completed. Don\'t forget to leave a review!'
    }
  },
  payment: {
    received: {
      email: '<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px;"><h2 style="color: #3b82f6;">Payment Received</h2><p>Dear User,</p><p>You have received a payment of <strong>${{amount}}</strong> for project <strong>{{projectName}}</strong>.</p><p>The funds have been added to your balance and are available for withdrawal.</p><div style="margin: 30px 0;"><a href="http://localhost:5173/earnings" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Earnings</a></div><p>Thank you for using SkillSwap!</p><p>Best regards,<br>The SkillSwap Team</p></div>',
      sms: 'SkillSwap: Payment received! ${{amount}} for project {{projectName}}.'
    },
    due: {
      email: '<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px;"><h2 style="color: #f59e0b;">Payment Due</h2><p>Dear User,</p><p>A payment of <strong>${{amount}}</strong> is due for project <strong>{{projectName}}</strong>.</p><p>Please log in to your dashboard to complete the payment.</p><div style="margin: 30px 0;"><a href="http://localhost:5173/payments" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Make Payment</a></div><p>Thank you for using SkillSwap!</p><p>Best regards,<br>The SkillSwap Team</p></div>',
      sms: 'SkillSwap: Payment reminder: ${{amount}} due for {{projectName}}.'
    }
  },
  milestone: {
    completed: {
      email: '<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px;"><h2 style="color: #3b82f6;">Milestone Completed</h2><p>Dear User,</p><p>Milestone <strong>{{milestoneName}}</strong> for project <strong>{{projectName}}</strong> has been marked as completed.</p><p>Please log in to your dashboard to review the milestone details.</p><div style="margin: 30px 0;"><a href="http://localhost:5173/projects" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Project</a></div><p>Thank you for using SkillSwap!</p><p>Best regards,<br>The SkillSwap Team</p></div>',
      sms: 'SkillSwap: Milestone {{milestoneName}} completed for {{projectName}}.'
    },
    approaching: {
      email: '<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px;"><h2 style="color: #f59e0b;">Milestone Approaching</h2><p>Dear User,</p><p>Milestone <strong>{{milestoneName}}</strong> for project <strong>{{projectName}}</strong> is due in <strong>{{daysLeft}}</strong> days.</p><p>Please log in to your dashboard to check your progress and ensure timely delivery.</p><div style="margin: 30px 0;"><a href="http://localhost:5173/projects" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Project</a></div><p>Thank you for using SkillSwap!</p><p>Best regards,<br>The SkillSwap Team</p></div>',
      sms: 'SkillSwap: Milestone {{milestoneName}} due in {{daysLeft}} days.'
    }
  }
};

// Send notification - real implementation with Nodemailer
const sendNotification = async (user, type, template, replacements, channels) => {
  // Track all sent notifications
  const notifications = [];

  // Send email notifications
  if (channels.includes('email') && user.email) {
    let emailContent = notificationTemplates[type][template].email;
    let emailSubject = '';
    
    // Create appropriate email subject based on the notification type
    switch (type) {
      case 'verification':
        emailSubject = template === 'approved' 
          ? 'Your Account Has Been Verified!' 
          : 'Verification Request Update';
        break;
      case 'project':
        emailSubject = template === 'awarded' 
          ? 'Project Awarded: ' + replacements.projectName 
          : 'Project Update: ' + replacements.projectName;
        break;
      case 'payment':
        emailSubject = template === 'received' 
          ? 'Payment Received: $' + replacements.amount 
          : 'Payment Due: $' + replacements.amount;
        break;
      case 'milestone':
        emailSubject = template === 'approaching' 
          ? 'Milestone Approaching: ' + replacements.milestoneName 
          : 'Milestone Completed: ' + replacements.milestoneName;
        break;
      default:
        emailSubject = 'SkillSwap Notification';
    }
    
    try {
      // Send actual email using Nodemailer
      const result = await sendTemplateEmail(
        user.email,
        emailSubject,
        emailContent,
        replacements
      );
      
      notifications.push({
        type: 'email',
        recipient: user.email,
        subject: emailSubject,
        status: 'sent',
        sentAt: new Date(),
        messageId: result.messageId
      });
      
    } catch (error) {
      console.error('Error sending email notification:', error);
      notifications.push({
        type: 'email',
        recipient: user.email,
        subject: emailSubject,
        status: 'failed',
        error: error.message
      });
    }
  }

  // SMS notifications (still mocked since we don't have a real SMS provider)
  if (channels.includes('sms') && user.phone) {
    let smsContent = notificationTemplates[type][template].sms;
    
    // Replace placeholders with actual values
    Object.keys(replacements).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      smsContent = smsContent.replace(regex, replacements[key]);
    });

    // Mock SMS sending - would be replaced with actual SMS API in production
    console.log(`MOCK SMS to ${user.phone}: ${smsContent}`);
    notifications.push({
      type: 'sms',
      recipient: user.phone,
      content: smsContent,
      status: 'sent',
      sentAt: new Date()
    });
  }

  // In-app notifications - would be saved to database in a full implementation
  if (channels.includes('in-app')) {
    let inAppContent = notificationTemplates[type][template].email; // Reuse email template for in-app
    
    // Replace placeholders with actual values
    Object.keys(replacements).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      inAppContent = inAppContent.replace(regex, replacements[key]);
    });

    // In a real implementation, save this to a notifications collection
    console.log(`IN-APP notification for ${user._id}: Notification about ${type}`);
    notifications.push({
      type: 'in-app',
      recipient: user._id,
      content: inAppContent,
      status: 'delivered',
      read: false,
      deliveredAt: new Date()
    });
    
    // In a real implementation you would:
    // await Notification.create({
    //   userId: user._id,
    //   type,
    //   template,
    //   content: inAppContent,
    //   read: false,
    //   createdAt: new Date()
    // });
  }

  return notifications;
};

// Send verification notification
export const sendVerificationNotification = async (req, res) => {
  try {
    const { userId, status, feedback } = req.body;
    
    if (!userId || !status) {
      return res.status(400).json({
        success: false,
        message: 'User ID and verification status are required'
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get user notification preferences (in a real system, fetch this from user settings)
    const notificationChannels = ['email', 'in-app'];
    
    // Send verification notification based on status
    const template = status === 'approved' ? 'approved' : 'rejected';
    const notifications = await sendNotification(
      user, 
      'verification', 
      template,
      { feedback: feedback || '' },
      notificationChannels
    );
    
    res.status(200).json({
      success: true,
      message: 'Verification notification sent',
      notifications
    });
  } catch (error) {
    console.error('Error sending verification notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification notification',
      error: error.message
    });
  }
};

// Send project notification
export const sendProjectNotification = async (req, res) => {
  try {
    const { userId, projectId, projectName, type } = req.body;
    
    if (!userId || !projectId || !projectName || !type) {
      return res.status(400).json({
        success: false,
        message: 'User ID, project ID, project name, and notification type are required'
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get user notification preferences
    const notificationChannels = ['email', 'sms', 'in-app'];
    
    // Validate notification type
    if (!notificationTemplates.project[type]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification type'
      });
    }
    
    // Send project notification
    const notifications = await sendNotification(
      user, 
      'project', 
      type,
      { projectName },
      notificationChannels
    );
    
    res.status(200).json({
      success: true,
      message: 'Project notification sent',
      notifications
    });
  } catch (error) {
    console.error('Error sending project notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send project notification',
      error: error.message
    });
  }
};

// Send payment notification
export const sendPaymentNotification = async (req, res) => {
  try {
    const { userId, amount, projectName, type } = req.body;
    
    if (!userId || !amount || !projectName || !type) {
      return res.status(400).json({
        success: false,
        message: 'User ID, amount, project name, and notification type are required'
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get user notification preferences
    const notificationChannels = ['email', 'sms', 'in-app'];
    
    // Validate notification type
    if (!notificationTemplates.payment[type]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification type'
      });
    }
    
    // Send payment notification
    const notifications = await sendNotification(
      user, 
      'payment', 
      type,
      { amount, projectName },
      notificationChannels
    );
    
    res.status(200).json({
      success: true,
      message: 'Payment notification sent',
      notifications
    });
  } catch (error) {
    console.error('Error sending payment notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send payment notification',
      error: error.message
    });
  }
};

// Send milestone notification
export const sendMilestoneNotification = async (req, res) => {
  try {
    const { userId, milestoneName, projectName, daysLeft, type } = req.body;
    
    if (!userId || !milestoneName || !projectName || !type) {
      return res.status(400).json({
        success: false,
        message: 'User ID, milestone name, project name, and notification type are required'
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get user notification preferences
    const notificationChannels = ['email', 'sms', 'in-app'];
    
    // Validate notification type
    if (!notificationTemplates.milestone[type]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification type'
      });
    }
    
    // Send milestone notification
    const notifications = await sendNotification(
      user, 
      'milestone', 
      type,
      { milestoneName, projectName, daysLeft: daysLeft || 0 },
      notificationChannels
    );
    
    res.status(200).json({
      success: true,
      message: 'Milestone notification sent',
      notifications
    });
  } catch (error) {
    console.error('Error sending milestone notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send milestone notification',
      error: error.message
    });
  }
};

// Get notification templates
export const getNotificationTemplates = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: notificationTemplates
    });
  } catch (error) {
    console.error('Error getting notification templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notification templates',
      error: error.message
    });
  }
};

// Update notification templates (admin only)
export const updateNotificationTemplate = async (req, res) => {
  try {
    const { category, type, channel, template } = req.body;
    
    if (!category || !type || !channel || !template) {
      return res.status(400).json({
        success: false,
        message: 'Category, type, channel, and template content are required'
      });
    }
    
    // Validate that the template category and type exist
    if (!notificationTemplates[category] || !notificationTemplates[category][type]) {
      return res.status(404).json({
        success: false,
        message: 'Template category or type not found'
      });
    }
    
    // Update the template
    notificationTemplates[category][type][channel] = template;
    
    res.status(200).json({
      success: true,
      message: 'Notification template updated',
      data: notificationTemplates[category][type]
    });
  } catch (error) {
    console.error('Error updating notification template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification template',
      error: error.message
    });
  }
};