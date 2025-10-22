import express from 'express';
import { LanguageManagementController } from '../controllers/LanguageManagementController.js';

const router = express.Router();
const languageController = new LanguageManagementController();

// Dashboard and overview routes
router.get('/dashboard/overview', 
  languageController.getDashboardOverview.bind(languageController)
);

router.get('/dashboard/analytics', 
  languageController.getWorkflowAnalytics.bind(languageController)
);

router.get('/dashboard/alerts', 
  languageController.getWorkflowAlerts.bind(languageController)
);

// Translation management routes
router.get('/translations/progress', 
  languageController.getTranslationProgress.bind(languageController)
);

router.post('/translations/:translationId/assign', 
  languageController.assignTranslator.bind(languageController)
);

router.post('/translations/bulk-assign', 
  languageController.bulkAssignTranslations.bind(languageController)
);

router.post('/translations/:translationId/review', 
  languageController.submitQualityReview.bind(languageController)
);

router.post('/translations/export', 
  languageController.exportTranslationData.bind(languageController)
);

// Translator management routes
router.get('/translators/:translatorId/metrics', 
  languageController.getTranslatorMetrics.bind(languageController)
);

// Resource management routes
router.get('/resources', 
  languageController.getLanguageResources.bind(languageController)
);

router.get('/glossary/search', 
  languageController.searchGlossary.bind(languageController)
);

router.get('/translation-memory/matches', 
  languageController.getTranslationMemoryMatches.bind(languageController)
);

export default router;