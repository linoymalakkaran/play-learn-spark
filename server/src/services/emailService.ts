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

  isEmailConfigured(): boolean {
    return this.isConfigured;
  }
}

// Export singleton instance
export const emailService = new EmailService();