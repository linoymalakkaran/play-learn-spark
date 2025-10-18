import * as nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;

  constructor() {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    try {
      // Check if email configuration is available
      const emailConfig = this.getEmailConfig();
      
      if (!emailConfig) {
        logger.warn('Email configuration not found. Email functionality will be disabled.');
        return;
      }

      this.transporter = nodemailer.createTransport(emailConfig);
      
      // Verify the connection
      if (this.transporter) {
        await this.transporter.verify();
      }
      this.isConfigured = true;
      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
      logger.info('Email functionality will be disabled. Using console logging instead.');
    }
  }

  private getEmailConfig(): EmailConfig | null {
    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_SECURE,
      SMTP_USER,
      SMTP_PASS
    } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      return null;
    }

    return {
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || '587'),
      secure: SMTP_SECURE === 'true',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    };
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      if (!this.isConfigured || !this.transporter) {
        // Fallback: log email content to console for development
        logger.info('Email would be sent (email service not configured):', {
          to: emailData.to,
          subject: emailData.subject,
          content: emailData.text || emailData.html
        });
        return true; // Return true for development mode
      }

      const result = await this.transporter.sendMail({
        from: process.env.FROM_EMAIL || process.env.SMTP_USER,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      });

      logger.info(`Email sent successfully to ${emailData.to}`, { messageId: result.messageId });
      return true;
    } catch (error) {
      logger.error('Failed to send email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string, userName: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8081'}/reset-password?token=${resetToken}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
          .footer { margin-top: 20px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Play & Learn Spark</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello ${userName},</p>
            <p>We received a request to reset your password for your Play & Learn Spark account.</p>
            <p>Click the button below to reset your password:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4f46e5;">${resetUrl}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
            <div class="footer">
              <p>Best regards,<br>The Play & Learn Spark Team</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Play & Learn Spark - Password Reset Request
      
      Hello ${userName},
      
      We received a request to reset your password for your Play & Learn Spark account.
      
      Please visit the following link to reset your password:
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request a password reset, you can safely ignore this email.
      
      Best regards,
      The Play & Learn Spark Team
    `;

    return await this.sendEmail({
      to: email,
      subject: 'Reset Your Play & Learn Spark Password',
      html: htmlContent,
      text: textContent
    });
  }

  async sendWelcomeEmail(email: string, userName: string, userRole: string): Promise<boolean> {
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:8081'}/login`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f0fdf4; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
          .features { background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .feature { margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Play & Learn Spark!</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>Welcome to Play & Learn Spark, your personalized educational adventure platform!</p>
            <p>Your account has been successfully created as a <strong>${userRole}</strong>.</p>
            
            <div class="features">
              <h3>🚀 What you can do:</h3>
              <div class="feature">📚 Access interactive learning activities</div>
              <div class="feature">📊 Track your learning progress</div>
              <div class="feature">🏆 Earn badges and achievements</div>
              <div class="feature">🎯 Set personalized learning goals</div>
              <div class="feature">🤖 Get AI-powered content recommendations</div>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" class="button">Start Learning Now!</a>
            </p>
            
            <p>We're excited to have you on this learning journey!</p>
            <p>Best regards,<br>The Play & Learn Spark Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Welcome to Play & Learn Spark!
      
      Hello ${userName}!
      
      Welcome to Play & Learn Spark, your personalized educational adventure platform!
      Your account has been successfully created as a ${userRole}.
      
      What you can do:
      - Access interactive learning activities
      - Track your learning progress  
      - Earn badges and achievements
      - Set personalized learning goals
      - Get AI-powered content recommendations
      
      Start learning now: ${loginUrl}
      
      We're excited to have you on this learning journey!
      
      Best regards,
      The Play & Learn Spark Team
    `;

    return await this.sendEmail({
      to: email,
      subject: '🎉 Welcome to Play & Learn Spark!',
      html: htmlContent,
      text: textContent
    });
  }

  async sendFeedbackNotification(feedbackData: {
    name: string;
    email: string;
    subject: string;
    message: string;
    rating: number;
    feedbackType: string;
  }): Promise<boolean> {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL || 'playlearnspark@gmail.com';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Feedback Received</title>
        <style>
          ${this.getEmailStyles()}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌟 New Feedback Received!</h1>
          </div>
          <div class="content">
            <h2>Customer Feedback Details</h2>
            
            <div class="info-box">
              <p><strong>👤 Name:</strong> ${feedbackData.name}</p>
              <p><strong>📧 Email:</strong> ${feedbackData.email}</p>
              <p><strong>⭐ Rating:</strong> ${'★'.repeat(feedbackData.rating)}${'☆'.repeat(5 - feedbackData.rating)} (${feedbackData.rating}/5)</p>
              <p><strong>📋 Type:</strong> ${feedbackData.feedbackType.charAt(0).toUpperCase() + feedbackData.feedbackType.slice(1)}</p>
              <p><strong>📝 Subject:</strong> ${feedbackData.subject}</p>
            </div>
            
            <div class="message-box">
              <h3>💬 Message:</h3>
              <p>${feedbackData.message.replace(/\n/g, '<br>')}</p>
            </div>
            
            <p><em>This feedback was submitted through the Play & Learn Spark feedback form.</em></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      New Feedback Received!
      
      Customer Details:
      Name: ${feedbackData.name}
      Email: ${feedbackData.email}
      Rating: ${feedbackData.rating}/5 stars
      Type: ${feedbackData.feedbackType}
      Subject: ${feedbackData.subject}
      
      Message:
      ${feedbackData.message}
      
      This feedback was submitted through the Play & Learn Spark feedback form.
    `;

    return await this.sendEmail({
      to: adminEmail,
      subject: `🔔 New ${feedbackData.feedbackType} from ${feedbackData.name}`,
      html: htmlContent,
      text: textContent
    });
  }

  async sendFeedbackConfirmation(email: string, name: string, subject: string): Promise<boolean> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Feedback Received - Thank You!</title>
        <style>
          ${this.getEmailStyles()}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🙏 Thank You for Your Feedback!</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            
            <p>Thank you for taking the time to share your feedback with us. We truly appreciate your input!</p>
            
            <div class="info-box">
              <p><strong>📝 Your Feedback:</strong> "${subject}"</p>
              <p><strong>📅 Submitted:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>Our team will review your feedback carefully. If you have any questions or need immediate assistance, please don't hesitate to contact us.</p>
            
            <p>We're constantly working to improve Play & Learn Spark, and your feedback helps us make the platform better for everyone!</p>
            
            <p>Best regards,<br>The Play & Learn Spark Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Thank You for Your Feedback!
      
      Hello ${name}!
      
      Thank you for taking the time to share your feedback with us. We truly appreciate your input!
      
      Your Feedback: "${subject}"
      Submitted: ${new Date().toLocaleDateString()}
      
      Our team will review your feedback carefully. If you have any questions or need immediate assistance, please don't hesitate to contact us.
      
      We're constantly working to improve Play & Learn Spark, and your feedback helps us make the platform better for everyone!
      
      Best regards,
      The Play & Learn Spark Team
    `;

    return await this.sendEmail({
      to: email,
      subject: '✅ Thank you for your feedback!',
      html: htmlContent,
      text: textContent
    });
  }

  private getEmailStyles(): string {
    return `
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
      .container { max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
      .header h1 { margin: 0; font-size: 28px; }
      .content { padding: 30px; }
      .info-box { background-color: #f8f9ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; }
      .message-box { background-color: #f0f8ff; border: 1px solid #b3d9ff; border-radius: 8px; padding: 15px; margin: 20px 0; }
      .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight: bold; }
      .feature { background-color: #e8f5e8; padding: 8px 12px; margin: 5px 0; border-radius: 15px; display: inline-block; }
    `;
  }

  isEmailConfigured(): boolean {
    return this.isConfigured;
  }
}

// Export singleton instance
export const emailService = new EmailService();