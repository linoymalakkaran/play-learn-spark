import { Request, Response } from 'express';
import { Feedback } from '../models/Feedback';
import { emailService } from '../services/emailService';
import { logger } from '../utils/logger';
import { Op, fn, col } from 'sequelize';

export const feedbackController = {
  // Create new feedback
  async createFeedback(req: Request, res: Response) {
    try {
      const { name, email, rating, feedbackType, subject, message, isPublic } = req.body;

      // Validation
      if (!name || !email || !rating || !subject || !message) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, rating, subject, and message are required.'
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5.'
        });
      }

      if (!['review', 'suggestion', 'complaint', 'general'].includes(feedbackType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid feedback type.'
        });
      }

      // Create feedback record
      const feedback = await Feedback.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        rating: parseInt(rating),
        feedbackType: feedbackType || 'general',
        subject: subject.trim(),
        message: message.trim(),
        isPublic: isPublic !== false, // Default to true unless explicitly false
        isApproved: false // Always requires approval
      });

      // Send email notifications
      try {
        // Send notification to admin
        await emailService.sendFeedbackNotification({
          name: feedback.name,
          email: feedback.email,
          subject: feedback.subject,
          message: feedback.message,
          rating: feedback.rating,
          feedbackType: feedback.feedbackType
        });

        // Send confirmation to user
        await emailService.sendFeedbackConfirmation(
          feedback.email,
          feedback.name,
          feedback.subject
        );
      } catch (emailError) {
        logger.warn('Failed to send feedback emails:', emailError);
        // Continue even if email fails
      }

      logger.info(`New feedback submitted by ${feedback.name} (${feedback.email})`);

      return res.status(201).json({
        success: true,
        message: 'Thank you for your feedback! We\'ll review it shortly.',
        data: {
          id: feedback.id,
          name: feedback.name,
          rating: feedback.rating,
          feedbackType: feedback.feedbackType,
          subject: feedback.subject,
          createdAt: feedback.createdAt
        }
      });
    } catch (error) {
      logger.error('Error creating feedback:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to submit feedback. Please try again.'
      });
    }
  },

  // Get public feedback (approved reviews)
  async getPublicFeedback(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, type, rating } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      // Build filter conditions
      const whereConditions: any = {
        isPublic: true,
        isApproved: true
      };

      if (type && type !== 'all') {
        whereConditions.feedbackType = type;
      }

      if (rating && rating !== 'all') {
        whereConditions.rating = parseInt(rating as string);
      }

      const { rows: feedback, count } = await Feedback.findAndCountAll({
        where: whereConditions,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit as string),
        offset,
        attributes: [
          'id',
          'name',
          'rating',
          'feedbackType',
          'subject',
          'message',
          'createdAt'
        ]
      });

      const totalPages = Math.ceil(count / parseInt(limit as string));

      return res.status(200).json({
        success: true,
        data: {
          feedback,
          pagination: {
            currentPage: parseInt(page as string),
            totalPages,
            totalItems: count,
            itemsPerPage: parseInt(limit as string)
          }
        }
      });
    } catch (error) {
      logger.error('Error fetching public feedback:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch feedback.'
      });
    }
  },

  // Get feedback statistics
  async getFeedbackStats(req: Request, res: Response) {
    try {
      const [
        totalFeedback,
        approvedFeedback,
        averageRating,
        ratingDistribution,
        typeDistribution
      ] = await Promise.all([
        // Total feedback count
        Feedback.count(),
        
        // Approved public feedback count
        Feedback.count({
          where: { isPublic: true, isApproved: true }
        }),
        
        // Average rating for approved feedback
        Feedback.findOne({
          attributes: [
            [fn('AVG', col('rating')), 'avgRating']
          ],
          where: { isPublic: true, isApproved: true },
          raw: true
        }),
        
        // Rating distribution
        Feedback.findAll({
          attributes: [
            'rating',
            [fn('COUNT', col('rating')), 'count']
          ],
          where: { isPublic: true, isApproved: true },
          group: ['rating'],
          order: [['rating', 'DESC']],
          raw: true
        }),
        
        // Feedback type distribution
        Feedback.findAll({
          attributes: [
            'feedbackType',
            [fn('COUNT', col('feedbackType')), 'count']
          ],
          where: { isPublic: true, isApproved: true },
          group: ['feedbackType'],
          raw: true
        })
      ]);

      return res.status(200).json({
        success: true,
        data: {
          totalFeedback,
          approvedFeedback,
          averageRating: averageRating ? parseFloat((averageRating as any).avgRating).toFixed(1) : 0,
          ratingDistribution: ratingDistribution || [],
          typeDistribution: typeDistribution || []
        }
      });
    } catch (error) {
      logger.error('Error fetching feedback statistics:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics.'
      });
    }
  },

  // Admin: Get all feedback
  async getAllFeedback(req: Request, res: Response) {
    try {
      const { page = 1, limit = 20, status, type } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const whereConditions: any = {};

      if (status === 'approved') {
        whereConditions.isApproved = true;
      } else if (status === 'pending') {
        whereConditions.isApproved = false;
      }

      if (type && type !== 'all') {
        whereConditions.feedbackType = type;
      }

      const { rows: feedback, count } = await Feedback.findAndCountAll({
        where: whereConditions,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit as string),
        offset
      });

      const totalPages = Math.ceil(count / parseInt(limit as string));

      return res.status(200).json({
        success: true,
        data: {
          feedback,
          pagination: {
            currentPage: parseInt(page as string),
            totalPages,
            totalItems: count,
            itemsPerPage: parseInt(limit as string)
          }
        }
      });
    } catch (error) {
      logger.error('Error fetching all feedback:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch feedback.'
      });
    }
  },

  // Admin: Approve/reject feedback
  async updateFeedbackStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isApproved, isPublic } = req.body;

      const feedback = await Feedback.findByPk(id);
      if (!feedback) {
        return res.status(404).json({
          success: false,
          message: 'Feedback not found.'
        });
      }

      await feedback.update({
        isApproved: isApproved !== undefined ? isApproved : feedback.isApproved,
        isPublic: isPublic !== undefined ? isPublic : feedback.isPublic
      });

      logger.info(`Feedback ${id} status updated by admin`);

      return res.status(200).json({
        success: true,
        message: 'Feedback status updated successfully.',
        data: feedback
      });
    } catch (error) {
      logger.error('Error updating feedback status:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update feedback status.'
      });
    }
  }
};

export default feedbackController;