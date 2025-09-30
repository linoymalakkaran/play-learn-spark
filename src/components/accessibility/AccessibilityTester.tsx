/**
 * Accessibility Tester Component for Play & Learn Spark
 * Provides real-time accessibility testing and feedback
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { 
  Eye, 
  EyeOff, 
  MousePointer, 
  Keyboard, 
  Volume2, 
  Palette,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface AccessibilityIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'color' | 'keyboard' | 'screen-reader' | 'focus' | 'structure';
  message: string;
  element?: HTMLElement;
  suggestion?: string;
}

interface AccessibilityStats {
  totalElements: number;
  elementsWithAlt: number;
  elementsWithLabels: number;
  keyboardAccessible: number;
  colorContrastIssues: number;
}

export const AccessibilityTester: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [stats, setStats] = useState<AccessibilityStats>({
    totalElements: 0,
    elementsWithAlt: 0,
    elementsWithLabels: 0,
    keyboardAccessible: 0,
    colorContrastIssues: 0
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const observerRef = useRef<MutationObserver | null>(null);

  const categories = [
    { id: 'all', label: 'All Issues', icon: AlertCircle },
    { id: 'color', label: 'Color & Contrast', icon: Palette },
    { id: 'keyboard', label: 'Keyboard Navigation', icon: Keyboard },
    { id: 'screen-reader', label: 'Screen Reader', icon: Volume2 },
    { id: 'focus', label: 'Focus Management', icon: MousePointer },
    { id: 'structure', label: 'Structure', icon: Eye }
  ];

  const runAccessibilityTests = (): void => {
    const newIssues: AccessibilityIssue[] = [];
    const newStats: AccessibilityStats = {
      totalElements: 0,
      elementsWithAlt: 0,
      elementsWithLabels: 0,
      keyboardAccessible: 0,
      colorContrastIssues: 0
    };

    // Test 1: Images without alt text
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      newStats.totalElements++;
      if (!img.alt && !img.getAttribute('aria-label')) {
        newIssues.push({
          id: `img-alt-${index}`,
          type: 'error',
          category: 'screen-reader',
          message: 'Image missing alt text',
          element: img,
          suggestion: 'Add descriptive alt text or use alt="" for decorative images'
        });
      } else {
        newStats.elementsWithAlt++;
      }
    });

    // Test 2: Form elements without labels
    const formElements = document.querySelectorAll('input, select, textarea');
    formElements.forEach((element, index) => {
      newStats.totalElements++;
      const hasLabel = element.labels?.length > 0 || 
                     element.getAttribute('aria-label') || 
                     element.getAttribute('aria-labelledby');
      
      if (!hasLabel) {
        newIssues.push({
          id: `form-label-${index}`,
          type: 'error',
          category: 'screen-reader',
          message: 'Form element missing label',
          element: element as HTMLElement,
          suggestion: 'Add a <label> element or use aria-label'
        });
      } else {
        newStats.elementsWithLabels++;
      }
    });

    // Test 3: Interactive elements without keyboard access
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"], [tabindex]');
    interactiveElements.forEach((element, index) => {
      const tabIndex = element.getAttribute('tabindex');
      if (tabIndex === '-1' && element.tagName !== 'DIV') {
        newIssues.push({
          id: `keyboard-${index}`,
          type: 'warning',
          category: 'keyboard',
          message: 'Interactive element not keyboard accessible',
          element: element as HTMLElement,
          suggestion: 'Remove tabindex="-1" or ensure proper keyboard navigation'
        });
      } else {
        newStats.keyboardAccessible++;
      }
    });

    // Test 4: Heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > previousLevel + 1 && previousLevel !== 0) {
        newIssues.push({
          id: `heading-${index}`,
          type: 'warning',
          category: 'structure',
          message: `Heading level skipped (h${previousLevel} to h${level})`,
          element: heading as HTMLElement,
          suggestion: 'Use heading levels sequentially for better screen reader navigation'
        });
      }
      previousLevel = level;
    });

    // Test 5: Focus indicators
    const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    focusableElements.forEach((element, index) => {
      const styles = window.getComputedStyle(element, ':focus');
      if (styles.outline === 'none' && !styles.boxShadow && !styles.border) {
        newIssues.push({
          id: `focus-${index}`,
          type: 'warning',
          category: 'focus',
          message: 'Element missing focus indicator',
          element: element as HTMLElement,
          suggestion: 'Add visible focus styles with outline, box-shadow, or border'
        });
      }
    });

    setIssues(newIssues);
    setStats(newStats);
  };

  const highlightElement = (element: HTMLElement): void => {
    // Remove existing highlights
    document.querySelectorAll('.accessibility-highlight').forEach(el => {
      el.classList.remove('accessibility-highlight');
    });

    // Add highlight to target element
    element.classList.add('accessibility-highlight');
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Remove highlight after 3 seconds
    setTimeout(() => {
      element.classList.remove('accessibility-highlight');
    }, 3000);
  };

  const filteredIssues = selectedCategory === 'all' 
    ? issues 
    : issues.filter(issue => issue.category === selectedCategory);

  const getIssueIcon = (type: AccessibilityIssue['type']) => {
    switch (type) {
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const accessibilityScore = Math.max(0, 100 - (issues.length * 5));

  useEffect(() => {
    if (isActive) {
      runAccessibilityTests();

      // Set up mutation observer to re-run tests when DOM changes
      observerRef.current = new MutationObserver(() => {
        runAccessibilityTests();
      });

      observerRef.current.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['alt', 'aria-label', 'aria-labelledby', 'tabindex']
      });
    } else {
      // Clean up observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      
      // Remove any highlights
      document.querySelectorAll('.accessibility-highlight').forEach(el => {
        el.classList.remove('accessibility-highlight');
      });
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isActive]);

  // Add CSS for highlighting
  useEffect(() => {
    if (!document.getElementById('accessibility-tester-styles')) {
      const style = document.createElement('style');
      style.id = 'accessibility-tester-styles';
      style.textContent = `
        .accessibility-highlight {
          outline: 3px solid #ff6b6b !important;
          outline-offset: 2px !important;
          box-shadow: 0 0 0 6px rgba(255, 107, 107, 0.3) !important;
          scroll-margin: 20px !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Accessibility Tester
            </CardTitle>
            <CardDescription>
              Real-time accessibility testing and feedback
            </CardDescription>
          </div>
          <Button
            onClick={() => setIsActive(!isActive)}
            variant={isActive ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            {isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {isActive ? 'Stop Testing' : 'Start Testing'}
          </Button>
        </div>
      </CardHeader>

      {isActive && (
        <CardContent className="space-y-6">
          {/* Accessibility Score */}
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>Accessibility Score:</span>
                <span className={cn("text-lg font-bold", getScoreColor(accessibilityScore))}>
                  {accessibilityScore}%
                </span>
              </div>
            </AlertDescription>
          </Alert>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalElements}</div>
              <div className="text-sm text-blue-800">Total Elements</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.elementsWithAlt}</div>
              <div className="text-sm text-green-800">With Alt Text</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.elementsWithLabels}</div>
              <div className="text-sm text-purple-800">With Labels</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.keyboardAccessible}</div>
              <div className="text-sm text-orange-800">Keyboard Access</div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const issueCount = category.id === 'all' 
                ? issues.length 
                : issues.filter(issue => issue.category === category.id).length;
              
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                  {issueCount > 0 && (
                    <Badge variant="destructive" className="ml-1">
                      {issueCount}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Issues List */}
          <div className="space-y-3">
            {filteredIssues.length === 0 ? (
              <Alert>
                <CheckCircle className="w-4 h-4" />
                <AlertDescription>
                  {selectedCategory === 'all' 
                    ? 'No accessibility issues found!' 
                    : `No ${selectedCategory} issues found!`}
                </AlertDescription>
              </Alert>
            ) : (
              filteredIssues.map((issue) => (
                <Alert key={issue.id} className={cn(
                  'cursor-pointer transition-colors hover:bg-gray-50',
                  issue.type === 'error' && 'border-red-200',
                  issue.type === 'warning' && 'border-yellow-200',
                  issue.type === 'info' && 'border-blue-200'
                )}
                onClick={() => issue.element && highlightElement(issue.element)}
                >
                  {getIssueIcon(issue.type)}
                  <AlertDescription>
                    <div className="space-y-1">
                      <div className="font-medium">{issue.message}</div>
                      {issue.suggestion && (
                        <div className="text-sm text-gray-600">{issue.suggestion}</div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              ))
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default AccessibilityTester;