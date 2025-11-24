import { Page, Locator, expect } from '@playwright/test';
import { TestUtils } from '../helpers/test-utils';

/**
 * Page Object Model for Activity pages (Language Learning, Math, Science, etc.)
 */
export class ActivityPage {
  private utils: TestUtils;
  public page: Page;

  // Activity container and header
  public activityContainer: Locator;
  private activityTitle: Locator;
  private activityDescription: Locator;
  private difficultyBadge: Locator;
  private progressBar: Locator;
  private timeRemaining: Locator;
  private scoreDisplay: Locator;
  private livesCounter: Locator;

  // Activity controls
  private startButton: Locator;
  private nextButton: Locator;
  private previousButton: Locator;
  private pauseButton: Locator;
  private resumeButton: Locator;
  private exitButton: Locator;
  private submitButton: Locator;
  private hintButton: Locator;
  private skipButton: Locator;

  // Question and answer elements
  public questionContainer: Locator;
  private questionText: Locator;
  private questionImage: Locator;
  private answerOptions: Locator;
  private textAnswerInput: Locator;
  private dragDropItems: Locator;
  private matchingItems: Locator;
  private multipleChoiceOptions: Locator;

  // Feedback elements
  private feedbackContainer: Locator;
  private correctFeedback: Locator;
  private incorrectFeedback: Locator;
  private explanationText: Locator;
  private encouragementMessage: Locator;

  // Completion elements
  public completionModal: Locator;
  private finalScore: Locator;
  private achievementBadges: Locator;
  private continueButton: Locator;
  private retryButton: Locator;
  private nextActivityButton: Locator;

  // Special activity type elements
  private languageAudioButton: Locator;
  private pronunciationRecorder: Locator;
  private mathWorkspace: Locator;
  private scienceSimulation: Locator;
  private readingPassage: Locator;
  private comprehensionQuestions: Locator;

  constructor(page: Page) {
    this.page = page;
    this.utils = new TestUtils(page);
    
    // Initialize locators
    this.activityContainer = page.locator('[data-testid="activity-container"], .activity-container');
    this.activityTitle = page.locator('[data-testid="activity-title"], .activity-title, h1, h2');
    this.activityDescription = page.locator('[data-testid="activity-description"], .activity-description');
    this.difficultyBadge = page.locator('[data-testid="difficulty-badge"], .difficulty-badge');
    this.progressBar = page.locator('[data-testid="progress-bar"], .progress-bar');
    this.timeRemaining = page.locator('[data-testid="time-remaining"], .time-remaining');
    this.scoreDisplay = page.locator('[data-testid="score-display"], .score-display');
    this.livesCounter = page.locator('[data-testid="lives-counter"], .lives-counter');

    // Controls
    this.startButton = page.locator('[data-testid="start-button"], button:has-text("Start")');
    this.nextButton = page.locator('[data-testid="next-button"], button:has-text("Next")');
    this.previousButton = page.locator('[data-testid="previous-button"], button:has-text("Previous")');
    this.pauseButton = page.locator('[data-testid="pause-button"], button:has-text("Pause")');
    this.resumeButton = page.locator('[data-testid="resume-button"], button:has-text("Resume")');
    this.exitButton = page.locator('[data-testid="exit-button"], button:has-text("Exit")');
    this.submitButton = page.locator('[data-testid="submit-button"], button:has-text("Submit")');
    this.hintButton = page.locator('[data-testid="hint-button"], button:has-text("Hint")');
    this.skipButton = page.locator('[data-testid="skip-button"], button:has-text("Skip")');

    // Questions and answers
    this.questionContainer = page.locator('[data-testid="question-container"], .question-container');
    this.questionText = page.locator('[data-testid="question-text"], .question-text');
    this.questionImage = page.locator('[data-testid="question-image"], .question-image img');
    this.answerOptions = page.locator('[data-testid="answer-option"], .answer-option');
    this.textAnswerInput = page.locator('[data-testid="text-answer"], input[type="text"], textarea');
    this.dragDropItems = page.locator('[data-testid="drag-item"], .draggable-item');
    this.matchingItems = page.locator('[data-testid="matching-item"], .matching-item');
    this.multipleChoiceOptions = page.locator('input[type="radio"], input[type="checkbox"]');

    // Feedback
    this.feedbackContainer = page.locator('[data-testid="feedback-container"], .feedback-container');
    this.correctFeedback = page.locator('[data-testid="correct-feedback"], .correct-feedback');
    this.incorrectFeedback = page.locator('[data-testid="incorrect-feedback"], .incorrect-feedback');
    this.explanationText = page.locator('[data-testid="explanation"], .explanation');
    this.encouragementMessage = page.locator('[data-testid="encouragement"], .encouragement');

    // Completion
    this.completionModal = page.locator('[data-testid="completion-modal"], .completion-modal');
    this.finalScore = page.locator('[data-testid="final-score"], .final-score');
    this.achievementBadges = page.locator('[data-testid="achievement-badge"], .achievement-badge');
    this.continueButton = page.locator('[data-testid="continue-button"], button:has-text("Continue")');
    this.retryButton = page.locator('[data-testid="retry-button"], button:has-text("Retry")');
    this.nextActivityButton = page.locator('[data-testid="next-activity"], button:has-text("Next Activity")');

    // Special elements
    this.languageAudioButton = page.locator('[data-testid="audio-button"], .audio-button, button:has([data-icon="volume"])');
    this.pronunciationRecorder = page.locator('[data-testid="recorder"], .pronunciation-recorder');
    this.mathWorkspace = page.locator('[data-testid="math-workspace"], .math-workspace');
    this.scienceSimulation = page.locator('[data-testid="science-simulation"], .science-simulation');
    this.readingPassage = page.locator('[data-testid="reading-passage"], .reading-passage');
    this.comprehensionQuestions = page.locator('[data-testid="comprehension-questions"], .comprehension-questions');
  }

  /**
   * Navigate to specific activity
   */
  async navigateToActivity(activityId: string) {
    await this.page.goto(`/activities/${activityId}`);
    await this.utils.waitForPageReady();
    await expect(this.activityContainer).toBeVisible();
  }

  /**
   * Start the activity
   */
  async startActivity() {
    await this.startButton.click();
    await this.utils.waitForPageReady();
    await expect(this.questionContainer).toBeVisible();
  }

  /**
   * Get activity title
   */
  async getActivityTitle(): Promise<string> {
    return await this.utils.getTextContent('[data-testid="activity-title"], .activity-title, h1, h2');
  }

  /**
   * Get current score
   */
  async getCurrentScore(): Promise<string> {
    return await this.utils.getTextContent('[data-testid="score-display"], .score-display');
  }

  /**
   * Get progress percentage
   */
  async getProgress(): Promise<string> {
    const progressElement = this.progressBar.locator('.progress-fill, [data-testid="progress-fill"]');
    return await progressElement.getAttribute('style') || '0%';
  }

  /**
   * Answer multiple choice question
   */
  async answerMultipleChoice(optionIndex: number) {
    const options = this.answerOptions;
    const option = options.nth(optionIndex);
    await option.click();
  }

  /**
   * Answer multiple choice by text
   */
  async answerMultipleChoiceByText(text: string) {
    const option = this.page.locator(`[data-testid="answer-option"]:has-text("${text}"), .answer-option:has-text("${text}")`);
    await option.click();
  }

  /**
   * Type text answer
   */
  async typeTextAnswer(answer: string) {
    await this.utils.safeFill('[data-testid="text-answer"], input[type="text"], textarea', answer);
  }

  /**
   * Submit current answer
   */
  async submitAnswer() {
    await this.submitButton.click();
    await this.page.waitForTimeout(1000); // Wait for feedback animation
  }

  /**
   * Go to next question
   */
  async goToNext() {
    await this.nextButton.click();
    await this.utils.waitForPageReady();
  }

  /**
   * Go to previous question
   */
  async goToPrevious() {
    await this.previousButton.click();
    await this.utils.waitForPageReady();
  }

  /**
   * Use hint
   */
  async useHint() {
    await this.hintButton.click();
    await this.page.waitForTimeout(500); // Wait for hint to appear
  }

  /**
   * Skip current question
   */
  async skipQuestion() {
    await this.skipButton.click();
    await this.utils.waitForPageReady();
  }

  /**
   * Pause activity
   */
  async pauseActivity() {
    await this.pauseButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Resume activity
   */
  async resumeActivity() {
    await this.resumeButton.click();
    await this.utils.waitForPageReady();
  }

  /**
   * Exit activity
   */
  async exitActivity() {
    await this.exitButton.click();
    
    // Handle confirmation dialog if present
    this.page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await this.utils.waitForNavigation('/dashboard');
  }

  /**
   * Get feedback message
   */
  async getFeedbackMessage(): Promise<string> {
    const correctVisible = await this.correctFeedback.isVisible().catch(() => false);
    const incorrectVisible = await this.incorrectFeedback.isVisible().catch(() => false);
    
    if (correctVisible) {
      return await this.utils.getTextContent('[data-testid="correct-feedback"], .correct-feedback');
    } else if (incorrectVisible) {
      return await this.utils.getTextContent('[data-testid="incorrect-feedback"], .incorrect-feedback');
    }
    
    return '';
  }

  /**
   * Check if answer is correct
   */
  async isAnswerCorrect(): Promise<boolean> {
    return await this.correctFeedback.isVisible();
  }

  /**
   * Wait for completion and get final score
   */
  async waitForCompletion(): Promise<string> {
    await this.completionModal.waitFor({ state: 'visible', timeout: 30000 });
    return await this.utils.getTextContent('[data-testid="final-score"], .final-score');
  }

  /**
   * Continue after completion
   */
  async continueAfterCompletion() {
    await this.continueButton.click();
    await this.utils.waitForNavigation('/dashboard');
  }

  /**
   * Retry activity
   */
  async retryActivity() {
    await this.retryButton.click();
    await this.utils.waitForPageReady();
  }

  /**
   * Start next activity
   */
  async startNextActivity() {
    await this.nextActivityButton.click();
    await this.utils.waitForPageReady();
  }

  /**
   * Get achievement badges earned
   */
  async getAchievementBadges(): Promise<string[]> {
    const badges = await this.achievementBadges.all();
    const badgeTexts = [];
    
    for (const badge of badges) {
      const text = await badge.textContent();
      if (text) badgeTexts.push(text.trim());
    }
    
    return badgeTexts;
  }

  // Language Learning Specific Methods

  /**
   * Play audio for language learning
   */
  async playAudio() {
    await this.languageAudioButton.click();
    await this.page.waitForTimeout(1000); // Wait for audio to start
  }

  /**
   * Record pronunciation
   */
  async recordPronunciation() {
    await this.pronunciationRecorder.click();
    await this.page.waitForTimeout(3000); // Record for 3 seconds
    await this.pronunciationRecorder.click(); // Stop recording
  }

  // Math Specific Methods

  /**
   * Use math workspace for calculations
   */
  async useMathWorkspace(expression: string) {
    await this.mathWorkspace.click();
    await this.page.keyboard.type(expression);
  }

  // Science Specific Methods

  /**
   * Interact with science simulation
   */
  async interactWithSimulation(element: string) {
    const simElement = this.scienceSimulation.locator(`[data-element="${element}"]`);
    await simElement.click();
  }

  // Reading Specific Methods

  /**
   * Read passage and scroll
   */
  async readPassage() {
    await this.utils.scrollIntoView('[data-testid="reading-passage"], .reading-passage');
    
    // Simulate reading time
    const passageLength = (await this.utils.getTextContent('[data-testid="reading-passage"], .reading-passage')).length;
    const readingTime = Math.max(5000, passageLength * 50); // Minimum 5 seconds
    await this.page.waitForTimeout(readingTime);
  }

  /**
   * Answer comprehension questions
   */
  async answerComprehensionQuestions(answers: string[]) {
    const questions = await this.comprehensionQuestions.locator('.question-item').all();
    
    for (let i = 0; i < Math.min(questions.length, answers.length); i++) {
      const question = questions[i];
      const answerInput = question.locator('input, textarea, select');
      
      if (await answerInput.count() > 0) {
        if (await answerInput.getAttribute('type') === 'radio') {
          const option = question.locator(`input[value="${answers[i]}"]`);
          await option.click();
        } else {
          await answerInput.fill(answers[i]);
        }
      }
    }
  }

  /**
   * Drag and drop for matching activities
   */
  async dragAndDrop(source: string, target: string) {
    const sourceElement = this.page.locator(`[data-testid="drag-item"]:has-text("${source}")`);
    const targetElement = this.page.locator(`[data-testid="drop-zone"]:has-text("${target}")`);
    
    await sourceElement.dragTo(targetElement);
  }

  /**
   * Complete activity end-to-end
   */
  async completeActivityEndToEnd(answers?: Array<string | number>) {
    await this.startActivity();
    
    let questionCount = 0;
    const maxQuestions = 20; // Safety limit
    
    while (questionCount < maxQuestions) {
      try {
        // Check if we're at completion
        if (await this.completionModal.isVisible()) {
          break;
        }
        
        // Check if question is visible
        if (await this.questionContainer.isVisible()) {
          // Answer current question
          if (answers && answers[questionCount] !== undefined) {
            const answer = answers[questionCount];
            
            if (typeof answer === 'string') {
              if (await this.textAnswerInput.isVisible()) {
                await this.typeTextAnswer(answer);
              } else {
                await this.answerMultipleChoiceByText(answer);
              }
            } else {
              await this.answerMultipleChoice(answer);
            }
          } else {
            // Default to first option if no specific answer provided
            await this.answerMultipleChoice(0);
          }
          
          await this.submitAnswer();
          await this.page.waitForTimeout(2000); // Wait for feedback
          
          // Try to go to next question
          if (await this.nextButton.isVisible()) {
            await this.goToNext();
          }
        }
        
        questionCount++;
      } catch (error) {
        console.warn(`Question ${questionCount} failed:`, error);
        break;
      }
    }
    
    return await this.waitForCompletion();
  }
}