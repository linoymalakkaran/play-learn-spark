import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Star, Send, MessageSquare, Users, TrendingUp, Filter } from 'lucide-react';
import { feedbackService, type FeedbackData, type Feedback, type FeedbackStats } from '@/services/apiService';

const FeedbackPage: React.FC = () => {
  // Form state
  const [formData, setFormData] = useState<FeedbackData>({
    name: '',
    email: '',
    rating: 0,
    feedbackType: 'general',
    subject: '',
    message: '',
    isPublic: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Public feedback state
  const [publicFeedback, setPublicFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterRating, setFilterRating] = useState(0);

  const feedbackTypes = [
    { value: 'general', label: '💬 General Feedback' },
    { value: 'review', label: '⭐ Review' },
    { value: 'suggestion', label: '💡 Suggestion' },
    { value: 'complaint', label: '⚠️ Issue/Complaint' }
  ];

  // Load initial data
  useEffect(() => {
    loadPublicFeedback();
    loadStats();
  }, [currentPage, filterType, filterRating]);

  const loadPublicFeedback = async () => {
    setLoading(true);
    try {
      const response = await feedbackService.getPublicFeedback({
        page: currentPage,
        limit: 6,
        type: filterType,
        rating: filterRating
      });
      
      if (response.success && response.data) {
        setPublicFeedback(response.data.feedback);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to load feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await feedbackService.getFeedbackStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (formData.rating === 0) newErrors.rating = 'Please select a rating';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    else if (formData.message.length < 10) newErrors.message = 'Message must be at least 10 characters';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await feedbackService.submitFeedback(formData);
      if (response.success) {
        setSubmitSuccess(true);
        setFormData({
          name: '',
          email: '',
          rating: 0,
          feedbackType: 'general',
          subject: '',
          message: '',
          isPublic: true
        });
        // Reload feedback to show new submission if approved
        setTimeout(() => {
          loadPublicFeedback();
          loadStats();
        }, 1000);
      } else {
        setErrors({ submit: response.error || 'Failed to submit feedback' });
      }
    } catch (error: any) {
      setErrors({ submit: error.message || 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FeedbackData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderStars = (rating: number, interactive: boolean = false, size: 'sm' | 'lg' = 'sm') => {
    const starSize = size === 'lg' ? 'w-8 h-8' : 'w-5 h-5';
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive ? () => handleInputChange('rating', star) : undefined}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🌟 Customer Feedback & Reviews
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We value your opinion! Share your experience with Play & Learn Spark and help us improve our educational platform.
          </p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Reviews</p>
                    <p className="text-3xl font-bold">{stats.approvedFeedback}</p>
                  </div>
                  <Users className="w-12 h-12 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm">Average Rating</p>
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-bold">{stats.averageRating}</p>
                      <Star className="w-6 h-6 text-yellow-200 fill-yellow-200" />
                    </div>
                  </div>
                  <TrendingUp className="w-12 h-12 text-yellow-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Happy Customers</p>
                    <p className="text-3xl font-bold">
                      {stats.ratingDistribution
                        .filter(r => r.rating >= 4)
                        .reduce((sum, r) => sum + r.count, 0)}
                    </p>
                  </div>
                  <MessageSquare className="w-12 h-12 text-green-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Feedback Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-gray-900">
                📝 Share Your Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              {submitSuccess ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-green-600 mb-2">Thank You!</h3>
                  <p className="text-gray-600 mb-4">
                    Your feedback has been submitted successfully. We appreciate your input!
                  </p>
                  <Button 
                    onClick={() => setSubmitSuccess(false)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Submit Another Feedback
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">👤 Your Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your name"
                        className={errors.name ? 'border-red-500' : ''}
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="email">📧 Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your.email@example.com"
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <Label>⭐ Rate Your Experience</Label>
                    <div className="mt-2">
                      {renderStars(formData.rating, true, 'lg')}
                    </div>
                    {errors.rating && <p className="text-red-500 text-sm mt-1">{errors.rating}</p>}
                  </div>

                  <div>
                    <Label htmlFor="feedbackType">📋 Feedback Type</Label>
                    <select
                      id="feedbackType"
                      value={formData.feedbackType}
                      onChange={(e) => handleInputChange('feedbackType', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {feedbackTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="subject">📝 Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Brief summary of your feedback"
                      className={errors.subject ? 'border-red-500' : ''}
                    />
                    {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
                  </div>

                  <div>
                    <Label htmlFor="message">💬 Your Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Please share your detailed feedback, suggestions, or experience with our platform..."
                      rows={4}
                      className={errors.message ? 'border-red-500' : ''}
                    />
                    {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={formData.isPublic}
                      onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="isPublic" className="text-sm">
                      I agree to display this feedback publicly (subject to approval)
                    </Label>
                  </div>

                  {errors.submit && (
                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                      {errors.submit}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Public Reviews */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-gray-900">
                💭 Customer Reviews
              </CardTitle>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-2 mt-4">
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Types</option>
                  {feedbackTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                
                <select
                  value={filterRating}
                  onChange={(e) => {
                    setFilterRating(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  <option value={0}>All Ratings</option>
                  <option value={5}>5 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={2}>2 Stars</option>
                  <option value={1}>1 Star</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading reviews...</p>
                </div>
              ) : publicFeedback.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📝</div>
                  <p className="text-gray-600">No reviews found. Be the first to share your experience!</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {publicFeedback.map((feedback) => (
                      <div key={feedback.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{feedback.name}</h4>
                            <p className="text-sm text-gray-500">{formatDate(feedback.createdAt)}</p>
                          </div>
                          {renderStars(feedback.rating)}
                        </div>
                        <h5 className="font-medium text-gray-800 mb-1">{feedback.subject}</h5>
                        <p className="text-gray-700 text-sm leading-relaxed">{feedback.message}</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {feedback.feedbackType.charAt(0).toUpperCase() + feedback.feedbackType.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                      >
                        Previous
                      </Button>
                      <span className="flex items-center px-3 text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;