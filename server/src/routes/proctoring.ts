import express from 'express';
import ProctorController, {
  validateInitializeProctoringSession,
  validateSessionId,
  validateSubmitSecurityEvent
} from '../controllers/proctoringController';
import { authenticateToken } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';

const router = express.Router();
const proctorController = new ProctorController();

// Rate limiting for proctoring endpoints
const proctorRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many proctoring requests from this IP'
});

const frameProcessingRateLimit = rateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // 2 frames per second max
  message: 'Frame processing rate limit exceeded'
});

// Apply authentication to all routes
router.use(authenticateToken);

// Session Management Routes
/**
 * @route POST /api/proctoring/session/initialize
 * @desc Initialize a new proctoring session with all components
 * @access Private
 */
router.post(
  '/session/initialize',
  proctorRateLimit,
  validateInitializeProctoringSession,
  proctorController.initializeProctoringSession
);

/**
 * @route GET /api/proctoring/session/:sessionId/status
 * @desc Get comprehensive status of a proctoring session
 * @access Private
 */
router.get(
  '/session/:sessionId/status',
  validateSessionId,
  proctorController.getSessionStatus
);

/**
 * @route POST /api/proctoring/session/:sessionId/complete
 * @desc Complete a proctoring session and generate reports
 * @access Private
 */
router.post(
  '/session/:sessionId/complete',
  validateSessionId,
  proctorController.completeProctoringSession
);

// Security Event Routes
/**
 * @route POST /api/proctoring/session/:sessionId/event
 * @desc Submit a security event (unified endpoint for all components)
 * @access Private
 */
router.post(
  '/session/:sessionId/event',
  proctorRateLimit,
  validateSubmitSecurityEvent,
  proctorController.submitSecurityEvent
);

// Webcam Processing Routes
/**
 * @route POST /api/proctoring/session/:sessionId/frame
 * @desc Process webcam frame data
 * @access Private
 */
router.post(
  '/session/:sessionId/frame',
  frameProcessingRateLimit,
  validateSessionId,
  proctorController.processWebcamFrame
);

// AI Integrity Routes
/**
 * @route POST /api/proctoring/session/:sessionId/answer
 * @desc Submit answer for AI analysis
 * @access Private
 */
router.post(
  '/session/:sessionId/answer',
  proctorRateLimit,
  validateSessionId,
  proctorController.submitAnswerForAnalysis
);

/**
 * @route POST /api/proctoring/session/:sessionId/typing
 * @desc Submit typing behavior data
 * @access Private
 */
router.post(
  '/session/:sessionId/typing',
  proctorRateLimit,
  validateSessionId,
  proctorController.submitTypingBehavior
);

/**
 * @route POST /api/proctoring/session/:sessionId/response-time
 * @desc Submit response time data
 * @access Private
 */
router.post(
  '/session/:sessionId/response-time',
  proctorRateLimit,
  validateSessionId,
  proctorController.submitResponseTime
);

// Dashboard and Monitoring Routes
/**
 * @route GET /api/proctoring/sessions
 * @desc Get all active proctoring sessions for dashboard
 * @access Private (Admin only)
 */
router.get(
  '/sessions',
  proctorController.getActiveSessions
);

/**
 * @route GET /api/proctoring/violations
 * @desc Get security violations for dashboard
 * @access Private (Admin only)
 */
router.get(
  '/violations',
  proctorController.getViolations
);

/**
 * @route GET /api/proctoring/system-status
 * @desc Get system status metrics
 * @access Private (Admin only)
 */
router.get(
  '/system-status',
  proctorController.getSystemStatus
);

/**
 * @route GET /api/proctoring/metrics
 * @desc Get dashboard metrics and analytics
 * @access Private (Admin only)
 */
router.get(
  '/metrics',
  proctorController.getDashboardMetrics
);

// Export Routes
/**
 * @route GET /api/proctoring/export/:type
 * @desc Export proctoring data (sessions, violations, or comprehensive report)
 * @access Private (Admin only)
 */
router.get(
  '/export/:type',
  proctorController.exportData
);

// WebSocket endpoint for real-time updates (handled in server.ts)
// ws://localhost:3001/ws/proctoring-dashboard

export default router;