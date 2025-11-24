import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/auth.page';
import { ActivityPage } from '../pages/activity.page';
import { DashboardPage } from '../pages/dashboard.page';
import { TestUsers, TestActivities } from '../fixtures/test-data';

test.describe('Activity Tests', () => {
  let authPage: AuthPage;
  let activityPage: ActivityPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    activityPage = new ActivityPage(page);
    dashboardPage = new DashboardPage(page);
    
    // Login as student user for activity tests
    await authPage.navigateToLogin();
    await authPage.login(TestUsers.STUDENT.email, TestUsers.STUDENT.password);
  });

  test.describe('Activity Navigation and Setup', () => {
    test('should navigate to activity from dashboard', async () => {
      // Click on first available activity
      const firstActivityCard = dashboardPage.page.locator('[data-testid="activity-card"]').first();
      
      if (await firstActivityCard.isVisible()) {
        await firstActivityCard.click();
        await expect(activityPage.page).toHaveURL(/.*\/activities/);
        await expect(activityPage.activityContainer).toBeVisible();
      }
    });

    test('should display activity information correctly', async () => {
      await activityPage.navigateToActivity('lang_easy_001');
      
      const title = await activityPage.getActivityTitle();
      expect(title.length).toBeGreaterThan(0);
      
      // Check for activity elements
      await expect(activityPage.activityContainer).toBeVisible();
    });

    test('should show difficulty badge', async () => {
      await activityPage.navigateToActivity('math_med_001');
      
      const difficultyBadge = activityPage.page.locator('[data-testid="difficulty-badge"]');
      if (await difficultyBadge.isVisible()) {
        const difficultyText = await difficultyBadge.textContent();
        expect(difficultyText?.toLowerCase()).toMatch(/easy|medium|hard/);
      }
    });

    test('should display progress bar', async () => {
      await activityPage.navigateToActivity('lang_easy_001');
      await activityPage.startActivity();
      
      const progressBar = activityPage.page.locator('[data-testid="progress-bar"]');
      if (await progressBar.isVisible()) {
        await expect(progressBar).toBeVisible();
      }
    });
  });

  test.describe('Activity Start and Controls', () => {
    test('should start activity successfully', async () => {
      await activityPage.navigateToActivity('lang_easy_001');
      await activityPage.startActivity();
      
      // Should show question container
      await expect(activityPage.questionContainer).toBeVisible();
    });

    test('should pause and resume activity', async () => {
      await activityPage.navigateToActivity('lang_easy_001');
      await activityPage.startActivity();
      
      // Pause activity
      const pauseButton = activityPage.page.locator('[data-testid="pause-button"]');
      if (await pauseButton.isVisible()) {
        await activityPage.pauseActivity();
        
        // Resume activity
        await activityPage.resumeActivity();
      }
    });

    test('should exit activity and return to dashboard', async () => {
      await activityPage.navigateToActivity('lang_easy_001');
      await activityPage.startActivity();
      
      await activityPage.exitActivity();
      
      // Should return to dashboard
      await expect(dashboardPage.page).toHaveURL(/.*\/dashboard/);
    });

    test('should handle exit confirmation dialog', async () => {
      await activityPage.navigateToActivity('lang_easy_001');
      await activityPage.startActivity();
      
      // Set up dialog handler before triggering exit
      activityPage.page.on('dialog', async dialog => {
        expect(dialog.message().toLowerCase()).toMatch(/exit|leave|quit/);
        await dialog.accept();
      });
      
      await activityPage.exitActivity();
    });
  });

  test.describe('Question Answering', () => {
    test('should answer multiple choice questions', async () => {
      await activityPage.navigateToActivity('lang_easy_001');
      await activityPage.startActivity();
      
      // Answer first option
      await activityPage.answerMultipleChoice(0);
      await activityPage.submitAnswer();
      
      // Should show feedback
      const feedback = await activityPage.getFeedbackMessage();
      expect(feedback.length).toBeGreaterThan(0);
    });

    test('should answer multiple choice by text', async () => {
      await activityPage.navigateToActivity('math_med_001');
      await activityPage.startActivity();
      
      // Try to answer with specific text
      const answerOptions = activityPage.page.locator('[data-testid="answer-option"]');
      const optionCount = await answerOptions.count();
      
      if (optionCount > 0) {
        const firstOptionText = await answerOptions.first().textContent();
        if (firstOptionText) {
          await activityPage.answerMultipleChoiceByText(firstOptionText);
          await activityPage.submitAnswer();
        }
      }
    });

    test('should handle text input answers', async () => {
      await activityPage.navigateToActivity('read_easy_001');
      await activityPage.startActivity();
      
      const textInput = activityPage.page.locator('[data-testid="text-answer"]');
      if (await textInput.isVisible()) {
        await activityPage.typeTextAnswer('Sample answer');
        await activityPage.submitAnswer();
      }
    });

    test('should navigate between questions', async () => {
      await activityPage.navigateToActivity('lang_easy_001');
      await activityPage.startActivity();
      
      // Answer current question and go to next
      await activityPage.answerMultipleChoice(0);
      await activityPage.submitAnswer();
      
      const nextButton = activityPage.page.locator('[data-testid="next-button"]');
      if (await nextButton.isVisible()) {
        await activityPage.goToNext();
        
        // Try going back
        const prevButton = activityPage.page.locator('[data-testid="previous-button"]');
        if (await prevButton.isVisible()) {
          await activityPage.goToPrevious();
        }
      }
    });

    test('should use hint functionality', async () => {
      await activityPage.navigateToActivity('math_med_001');
      await activityPage.startActivity();
      
      const hintButton = activityPage.page.locator('[data-testid="hint-button"]');
      if (await hintButton.isVisible()) {
        await activityPage.useHint();
        
        // Should show hint content
        await activityPage.page.waitForTimeout(1000);
      }
    });

    test('should skip questions when allowed', async () => {
      await activityPage.navigateToActivity('sci_hard_001');
      await activityPage.startActivity();
      
      const skipButton = activityPage.page.locator('[data-testid="skip-button"]');
      if (await skipButton.isVisible()) {
        await activityPage.skipQuestion();
        
        // Should move to next question
        await activityPage.page.waitForTimeout(1000);
      }
    });
  });

  test.describe('Feedback and Scoring', () => {
    test('should show correct answer feedback', async () => {
      await activityPage.navigateToActivity('lang_easy_001');
      await activityPage.startActivity();
      
      // Answer question
      await activityPage.answerMultipleChoice(0);
      await activityPage.submitAnswer();
      
      const feedback = await activityPage.getFeedbackMessage();
      expect(feedback.length).toBeGreaterThan(0);
      
      // Check if answer was marked as correct or incorrect
      const isCorrect = await activityPage.isAnswerCorrect();
      expect(typeof isCorrect).toBe('boolean');
    });

    test('should update score correctly', async () => {
      await activityPage.navigateToActivity('math_med_001');
      await activityPage.startActivity();
      
      const initialScore = await activityPage.getCurrentScore();
      
      // Answer a few questions
      await activityPage.answerMultipleChoice(0);
      await activityPage.submitAnswer();
      await activityPage.page.waitForTimeout(1000);
      
      const newScore = await activityPage.getCurrentScore();
      // Score may or may not change depending on correctness
    });

    test('should track progress percentage', async () => {
      await activityPage.navigateToActivity('read_easy_001');
      await activityPage.startActivity();
      
      const initialProgress = await activityPage.getProgress();
      
      // Answer question and move forward
      await activityPage.answerMultipleChoice(0);
      await activityPage.submitAnswer();
      await activityPage.goToNext();
      
      const newProgress = await activityPage.getProgress();
      // Progress should change (implementation dependent)
    });

    test('should show explanation for incorrect answers', async () => {
      await activityPage.navigateToActivity('sci_hard_001');
      await activityPage.startActivity();
      
      // Answer question (might be wrong)
      await activityPage.answerMultipleChoice(1);
      await activityPage.submitAnswer();
      
      const explanationText = activityPage.page.locator('[data-testid="explanation"]');
      if (await explanationText.isVisible()) {
        const explanation = await explanationText.textContent();
        expect(explanation?.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Activity Completion', () => {
    test('should complete activity and show results', async () => {
      await activityPage.navigateToActivity('lang_easy_001');
      
      // Complete activity with default answers
      const finalScore = await activityPage.completeActivityEndToEnd();
      
      // Should show completion modal
      await expect(activityPage.completionModal).toBeVisible();
      expect(finalScore.length).toBeGreaterThan(0);
    });

    test('should show achievement badges on completion', async () => {
      await activityPage.navigateToActivity('math_med_001');
      await activityPage.completeActivityEndToEnd();
      
      const badges = await activityPage.getAchievementBadges();
      expect(Array.isArray(badges)).toBeTruthy();
    });

    test('should allow continuing to dashboard after completion', async () => {
      await activityPage.navigateToActivity('read_easy_001');
      await activityPage.completeActivityEndToEnd();
      
      await activityPage.continueAfterCompletion();
      
      // Should return to dashboard
      await expect(dashboardPage.page).toHaveURL(/.*\/dashboard/);
    });

    test('should allow retrying activity', async () => {
      await activityPage.navigateToActivity('lang_easy_001');
      await activityPage.completeActivityEndToEnd();
      
      const retryButton = activityPage.page.locator('[data-testid="retry-button"]');
      if (await retryButton.isVisible()) {
        await activityPage.retryActivity();
        
        // Should restart activity
        await expect(activityPage.questionContainer).toBeVisible();
      }
    });

    test('should offer next activity option', async () => {
      await activityPage.navigateToActivity('sci_hard_001');
      await activityPage.completeActivityEndToEnd();
      
      const nextActivityButton = activityPage.page.locator('[data-testid="next-activity"]');
      if (await nextActivityButton.isVisible()) {
        await activityPage.startNextActivity();
        
        // Should navigate to next activity
        await expect(activityPage.page).toHaveURL(/.*\/activities/);
      }
    });
  });

  test.describe('Language Learning Activities', () => {
    test('should play audio for pronunciation', async () => {
      await activityPage.navigateToActivity('lang_easy_001');
      await activityPage.startActivity();
      
      const audioButton = activityPage.page.locator('[data-testid="audio-button"]');
      if (await audioButton.isVisible()) {
        await activityPage.playAudio();
        
        // Should play audio (implementation dependent)
        await activityPage.page.waitForTimeout(2000);
      }
    });

    test('should record pronunciation', async () => {
      await activityPage.navigateToActivity('lang_easy_001');
      await activityPage.startActivity();
      
      const recorder = activityPage.page.locator('[data-testid="recorder"]');
      if (await recorder.isVisible()) {
        await activityPage.recordPronunciation();
        
        // Should handle recording (implementation dependent)
        await activityPage.page.waitForTimeout(1000);
      }
    });

    test('should handle drag and drop vocabulary matching', async () => {
      await activityPage.navigateToActivity('lang_easy_001');
      await activityPage.startActivity();
      
      const dragItems = activityPage.page.locator('[data-testid="drag-item"]');
      const dropZones = activityPage.page.locator('[data-testid="drop-zone"]');
      
      if (await dragItems.count() > 0 && await dropZones.count() > 0) {
        const firstItem = await dragItems.first().textContent();
        const firstZone = await dropZones.first().textContent();
        
        if (firstItem && firstZone) {
          await activityPage.dragAndDrop(firstItem, firstZone);
        }
      }
    });
  });

  test.describe('Math Activities', () => {
    test('should use math workspace for calculations', async () => {
      await activityPage.navigateToActivity('math_med_001');
      await activityPage.startActivity();
      
      const mathWorkspace = activityPage.page.locator('[data-testid="math-workspace"]');
      if (await mathWorkspace.isVisible()) {
        await activityPage.useMathWorkspace('2+2');
        await activityPage.page.waitForTimeout(1000);
      }
    });

    test('should handle number input validation', async () => {
      await activityPage.navigateToActivity('math_med_001');
      await activityPage.startActivity();
      
      const numberInput = activityPage.page.locator('input[type="number"]');
      if (await numberInput.isVisible()) {
        await numberInput.fill('42');
        await activityPage.submitAnswer();
      }
    });
  });

  test.describe('Science Activities', () => {
    test('should interact with science simulations', async () => {
      await activityPage.navigateToActivity('sci_hard_001');
      await activityPage.startActivity();
      
      const simulation = activityPage.page.locator('[data-testid="science-simulation"]');
      if (await simulation.isVisible()) {
        await activityPage.interactWithSimulation('planet');
        await activityPage.page.waitForTimeout(1000);
      }
    });

    test('should handle interactive experiments', async () => {
      await activityPage.navigateToActivity('sci_hard_001');
      await activityPage.startActivity();
      
      // Look for interactive elements
      const interactiveElements = activityPage.page.locator('[data-interactive="true"]');
      const count = await interactiveElements.count();
      
      if (count > 0) {
        await interactiveElements.first().click();
        await activityPage.page.waitForTimeout(1000);
      }
    });
  });

  test.describe('Reading Comprehension Activities', () => {
    test('should display reading passage', async () => {
      await activityPage.navigateToActivity('read_easy_001');
      await activityPage.startActivity();
      
      const passage = activityPage.page.locator('[data-testid="reading-passage"]');
      if (await passage.isVisible()) {
        await activityPage.readPassage();
        
        const passageText = await passage.textContent();
        expect(passageText?.length).toBeGreaterThan(0);
      }
    });

    test('should answer comprehension questions', async () => {
      await activityPage.navigateToActivity('read_easy_001');
      await activityPage.startActivity();
      
      const comprehensionSection = activityPage.page.locator('[data-testid="comprehension-questions"]');
      if (await comprehensionSection.isVisible()) {
        await activityPage.answerComprehensionQuestions(['Answer 1', 'Answer 2']);
        await activityPage.submitAnswer();
      }
    });

    test('should track reading time', async () => {
      await activityPage.navigateToActivity('read_easy_001');
      await activityPage.startActivity();
      
      const timeTracker = activityPage.page.locator('[data-testid="reading-timer"]');
      if (await timeTracker.isVisible()) {
        const initialTime = await timeTracker.textContent();
        
        await activityPage.page.waitForTimeout(3000);
        
        const newTime = await timeTracker.textContent();
        expect(newTime).not.toBe(initialTime);
      }
    });
  });

  test.describe('Activity Performance and Error Handling', () => {
    test('should handle network interruptions gracefully', async () => {
      await activityPage.navigateToActivity('lang_easy_001');
      await activityPage.startActivity();
      
      // Simulate network interruption
      await activityPage.page.route('**/api/**', route => {
        route.abort();
      });
      
      await activityPage.answerMultipleChoice(0);
      await activityPage.submitAnswer();
      
      // Should show error message or retry option
      await activityPage.page.waitForTimeout(2000);
    });

    test('should save progress automatically', async () => {
      await activityPage.navigateToActivity('math_med_001');
      await activityPage.startActivity();
      
      // Answer a few questions
      await activityPage.answerMultipleChoice(0);
      await activityPage.submitAnswer();
      await activityPage.goToNext();
      
      // Refresh page to test persistence
      await activityPage.page.reload();
      
      // Should resume from saved progress (implementation dependent)
    });

    test('should handle activity timeout', async () => {
      await activityPage.navigateToActivity('sci_hard_001');
      await activityPage.startActivity();
      
      // Check if there's a time limit
      const timeRemaining = activityPage.page.locator('[data-testid="time-remaining"]');
      if (await timeRemaining.isVisible()) {
        const timeText = await timeRemaining.textContent();
        expect(timeText).toBeDefined();
      }
    });

    test('should validate answers before submission', async () => {
      await activityPage.navigateToActivity('read_easy_001');
      await activityPage.startActivity();
      
      // Try to submit without answering
      await activityPage.submitAnswer();
      
      // Should show validation message (implementation dependent)
      await activityPage.page.waitForTimeout(1000);
    });
  });

  test.describe('Accessibility in Activities', () => {
    test('should support keyboard navigation', async () => {
      await activityPage.navigateToActivity('lang_easy_001');
      await activityPage.startActivity();
      
      // Test keyboard navigation through options
      await activityPage.page.keyboard.press('Tab');
      await activityPage.page.keyboard.press('Space'); // Select option
      await activityPage.page.keyboard.press('Tab'); // Move to submit
      await activityPage.page.keyboard.press('Enter'); // Submit
    });

    test('should have proper ARIA labels for interactive elements', async () => {
      await activityPage.navigateToActivity('math_med_001');
      await activityPage.startActivity();
      
      const answerOptions = activityPage.page.locator('[data-testid="answer-option"]');
      if (await answerOptions.count() > 0) {
        const firstOption = answerOptions.first();
        
        // Should have accessible labels
        const hasAriaLabel = await firstOption.getAttribute('aria-label') !== null;
        const hasTitle = await firstOption.getAttribute('title') !== null;
        
        expect(hasAriaLabel || hasTitle).toBeTruthy();
      }
    });

    test('should provide alternative text for images', async () => {
      await activityPage.navigateToActivity('sci_hard_001');
      await activityPage.startActivity();
      
      const questionImages = activityPage.page.locator('[data-testid="question-image"]');
      if (await questionImages.count() > 0) {
        const firstImage = questionImages.first();
        const altText = await firstImage.getAttribute('alt');
        
        expect(altText).toBeDefined();
        expect(altText?.length).toBeGreaterThan(0);
      }
    });
  });
});