/**
 * Search & Discovery Features Component
 * 
 * Advanced search interface with filtering, AI-powered recommendations,
 * and personalized content discovery for educational content.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './SearchAndDiscovery.css';

// Types
interface SearchFilters {
  contentType: string[];
  difficulty: string[];
  subject: string[];
  duration: { min: number; max: number };
  tags: string[];
  format: string[];
  language: string;
  author: string[];
  dateRange: { start: Date | null; end: Date | null };
  rating: number;
  status: string[];
}

interface ContentItem {
  id: string;
  title: string;
  description: string;
  contentType: 'lesson' | 'activity' | 'assessment' | 'resource';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  subject: string[];
  duration: number; // in minutes
  tags: string[];
  format: 'text' | 'video' | 'audio' | 'interactive' | 'mixed';
  language: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  rating: number;
  reviewCount: number;
  status: 'draft' | 'published' | 'archived';
  thumbnail?: string;
  interactionCount: number;
  completionRate: number;
  relevanceScore?: number;
  personalizedScore?: number;
}

interface Recommendation {
  id: string;
  type: 'trending' | 'personalized' | 'similar' | 'collaborative';
  title: string;
  description: string;
  content: ContentItem[];
  confidence: number;
}

interface UserProfile {
  id: string;
  preferences: {
    subjects: string[];
    difficulty: string[];
    formats: string[];
    languages: string[];
  };
  activity: {
    viewHistory: string[];
    completedContent: string[];
    ratings: { contentId: string; rating: number }[];
    searchHistory: string[];
  };
  learningGoals: string[];
  skillLevel: Record<string, number>;
}

const SearchAndDiscovery: React.FC = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    contentType: [],
    difficulty: [],
    subject: [],
    duration: { min: 0, max: 180 },
    tags: [],
    format: [],
    language: 'all',
    author: [],
    dateRange: { start: null, end: null },
    rating: 0,
    status: ['published']
  });
  
  const [searchResults, setSearchResults] = useState<ContentItem[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<'simple' | 'advanced'>('simple');
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'rating' | 'popularity'>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [userProfile] = useState<UserProfile>(mockUserProfile);

  // Mock data
  const mockContentItems: ContentItem[] = [
    {
      id: '1',
      title: 'Introduction to Algebra',
      description: 'Basic algebraic concepts and problem-solving techniques for beginners.',
      contentType: 'lesson',
      difficulty: 'beginner',
      subject: ['Mathematics', 'Algebra'],
      duration: 45,
      tags: ['algebra', 'math', 'equations', 'variables'],
      format: 'video',
      language: 'English',
      author: { id: 'author1', name: 'Dr. Sarah Johnson' },
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      rating: 4.7,
      reviewCount: 156,
      status: 'published',
      thumbnail: 'https://via.placeholder.com/300x200/4f46e5/ffffff?text=Algebra',
      interactionCount: 2340,
      completionRate: 87
    },
    {
      id: '2',
      title: 'Interactive Physics Simulation',
      description: 'Explore physics concepts through hands-on simulations and experiments.',
      contentType: 'activity',
      difficulty: 'intermediate',
      subject: ['Physics', 'Science'],
      duration: 60,
      tags: ['physics', 'simulation', 'forces', 'motion'],
      format: 'interactive',
      language: 'English',
      author: { id: 'author2', name: 'Prof. Michael Chen' },
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-05'),
      rating: 4.9,
      reviewCount: 89,
      status: 'published',
      thumbnail: 'https://via.placeholder.com/300x200/059669/ffffff?text=Physics',
      interactionCount: 1560,
      completionRate: 92
    },
    {
      id: '3',
      title: 'Creative Writing Workshop',
      description: 'Develop your creative writing skills with guided exercises and peer feedback.',
      contentType: 'lesson',
      difficulty: 'intermediate',
      subject: ['Language Arts', 'Writing'],
      duration: 90,
      tags: ['writing', 'creativity', 'storytelling', 'workshop'],
      format: 'mixed',
      language: 'English',
      author: { id: 'author3', name: 'Emma Rodriguez' },
      createdAt: new Date('2024-01-28'),
      updatedAt: new Date('2024-02-02'),
      rating: 4.5,
      reviewCount: 234,
      status: 'published',
      thumbnail: 'https://via.placeholder.com/300x200/dc2626/ffffff?text=Writing',
      interactionCount: 1890,
      completionRate: 78
    },
    {
      id: '4',
      title: 'Data Structures Assessment',
      description: 'Comprehensive assessment covering arrays, linked lists, trees, and graphs.',
      contentType: 'assessment',
      difficulty: 'advanced',
      subject: ['Computer Science', 'Programming'],
      duration: 120,
      tags: ['data-structures', 'algorithms', 'programming', 'assessment'],
      format: 'interactive',
      language: 'English',
      author: { id: 'author4', name: 'Dr. Alex Kumar' },
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-02-12'),
      rating: 4.3,
      reviewCount: 67,
      status: 'published',
      thumbnail: 'https://via.placeholder.com/300x200/7c3aed/ffffff?text=CS',
      interactionCount: 890,
      completionRate: 65
    },
    {
      id: '5',
      title: 'Spanish Conversation Practice',
      description: 'Practice conversational Spanish with native speakers and AI tutors.',
      contentType: 'activity',
      difficulty: 'beginner',
      subject: ['Languages', 'Spanish'],
      duration: 30,
      tags: ['spanish', 'conversation', 'pronunciation', 'practice'],
      format: 'audio',
      language: 'Spanish',
      author: { id: 'author5', name: 'Carlos Mendoza' },
      createdAt: new Date('2024-02-08'),
      updatedAt: new Date('2024-02-09'),
      rating: 4.8,
      reviewCount: 145,
      status: 'published',
      thumbnail: 'https://via.placeholder.com/300x200/f59e0b/ffffff?text=Español',
      interactionCount: 2100,
      completionRate: 94
    }
  ];

  const mockUserProfile: UserProfile = {
    id: 'user1',
    preferences: {
      subjects: ['Mathematics', 'Science', 'Computer Science'],
      difficulty: ['beginner', 'intermediate'],
      formats: ['video', 'interactive'],
      languages: ['English']
    },
    activity: {
      viewHistory: ['1', '2', '3'],
      completedContent: ['1'],
      ratings: [
        { contentId: '1', rating: 5 },
        { contentId: '2', rating: 4 }
      ],
      searchHistory: ['algebra', 'physics', 'programming']
    },
    learningGoals: ['Master algebra', 'Learn programming', 'Improve problem-solving'],
    skillLevel: {
      'Mathematics': 3,
      'Physics': 2,
      'Programming': 4,
      'Writing': 2
    }
  };

  const mockRecommendations: Recommendation[] = [
    {
      id: 'rec1',
      type: 'personalized',
      title: 'Recommended for You',
      description: 'Based on your learning history and preferences',
      content: [mockContentItems[0], mockContentItems[1]],
      confidence: 0.89
    },
    {
      id: 'rec2',
      type: 'trending',
      title: 'Trending This Week',
      description: 'Popular content among learners',
      content: [mockContentItems[1], mockContentItems[4]],
      confidence: 0.75
    },
    {
      id: 'rec3',
      type: 'similar',
      title: 'Similar to What You\'ve Viewed',
      description: 'Content similar to your recent activity',
      content: [mockContentItems[2], mockContentItems[3]],
      confidence: 0.82
    }
  ];

  // Available options for filters
  const filterOptions = {
    contentType: ['lesson', 'activity', 'assessment', 'resource'],
    difficulty: ['beginner', 'intermediate', 'advanced'],
    subject: ['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Programming', 'Language Arts', 'Writing', 'Languages', 'Spanish', 'French', 'History', 'Geography'],
    format: ['text', 'video', 'audio', 'interactive', 'mixed'],
    language: ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'],
    status: ['draft', 'published', 'archived']
  };

  // Search and filtering logic
  const performSearch = useCallback(async (query: string, currentFilters: SearchFilters) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let results = [...mockContentItems];
    
    // Text search
    if (query.trim()) {
      const searchTerms = query.toLowerCase().split(' ');
      results = results.filter(item => 
        searchTerms.some(term =>
          item.title.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term) ||
          item.tags.some(tag => tag.toLowerCase().includes(term)) ||
          item.subject.some(subject => subject.toLowerCase().includes(term))
        )
      );
    }
    
    // Apply filters
    if (currentFilters.contentType.length > 0) {
      results = results.filter(item => currentFilters.contentType.includes(item.contentType));
    }
    
    if (currentFilters.difficulty.length > 0) {
      results = results.filter(item => currentFilters.difficulty.includes(item.difficulty));
    }
    
    if (currentFilters.subject.length > 0) {
      results = results.filter(item => 
        item.subject.some(subject => currentFilters.subject.includes(subject))
      );
    }
    
    if (currentFilters.format.length > 0) {
      results = results.filter(item => currentFilters.format.includes(item.format));
    }
    
    if (currentFilters.language !== 'all') {
      results = results.filter(item => item.language === currentFilters.language);
    }
    
    if (currentFilters.rating > 0) {
      results = results.filter(item => item.rating >= currentFilters.rating);
    }
    
    if (currentFilters.duration.min > 0 || currentFilters.duration.max < 180) {
      results = results.filter(item => 
        item.duration >= currentFilters.duration.min && 
        item.duration <= currentFilters.duration.max
      );
    }
    
    if (currentFilters.status.length > 0) {
      results = results.filter(item => currentFilters.status.includes(item.status));
    }
    
    // Calculate personalized scores
    results = results.map(item => ({
      ...item,
      personalizedScore: calculatePersonalizedScore(item, userProfile),
      relevanceScore: calculateRelevanceScore(item, query)
    }));
    
    // Sort results
    switch (sortBy) {
      case 'relevance':
        results.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
        break;
      case 'date':
        results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'popularity':
        results.sort((a, b) => b.interactionCount - a.interactionCount);
        break;
    }
    
    setSearchResults(results);
    setIsLoading(false);
  }, [sortBy, userProfile]);

  // Calculate personalized score based on user profile
  const calculatePersonalizedScore = (item: ContentItem, profile: UserProfile): number => {
    let score = 0;
    
    // Subject preference match
    const subjectMatch = item.subject.some(subject => 
      profile.preferences.subjects.includes(subject)
    );
    if (subjectMatch) score += 0.3;
    
    // Difficulty preference match
    if (profile.preferences.difficulty.includes(item.difficulty)) score += 0.2;
    
    // Format preference match
    if (profile.preferences.formats.includes(item.format)) score += 0.2;
    
    // Language preference match
    if (profile.preferences.languages.includes(item.language)) score += 0.1;
    
    // Interaction history bonus
    if (profile.activity.viewHistory.includes(item.id)) score += 0.1;
    if (profile.activity.completedContent.includes(item.id)) score += 0.1;
    
    return Math.min(score, 1);
  };

  // Calculate relevance score based on search query
  const calculateRelevanceScore = (item: ContentItem, query: string): number => {
    if (!query.trim()) return 0.5;
    
    const searchTerms = query.toLowerCase().split(' ');
    let score = 0;
    
    searchTerms.forEach(term => {
      // Title match (highest weight)
      if (item.title.toLowerCase().includes(term)) score += 0.4;
      
      // Subject match
      if (item.subject.some(subject => subject.toLowerCase().includes(term))) score += 0.3;
      
      // Tag match
      if (item.tags.some(tag => tag.toLowerCase().includes(term))) score += 0.2;
      
      // Description match
      if (item.description.toLowerCase().includes(term)) score += 0.1;
    });
    
    return Math.min(score, 1);
  };

  // Generate AI-powered recommendations
  const generateRecommendations = useCallback(async () => {
    // Simulate AI recommendation generation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const personalizedContent = mockContentItems
      .map(item => ({
        ...item,
        personalizedScore: calculatePersonalizedScore(item, userProfile)
      }))
      .sort((a, b) => (b.personalizedScore || 0) - (a.personalizedScore || 0))
      .slice(0, 3);
    
    const trendingContent = mockContentItems
      .sort((a, b) => b.interactionCount - a.interactionCount)
      .slice(0, 3);
    
    const updatedRecommendations = [
      {
        ...mockRecommendations[0],
        content: personalizedContent
      },
      {
        ...mockRecommendations[1],
        content: trendingContent
      },
      ...mockRecommendations.slice(2)
    ];
    
    setRecommendations(updatedRecommendations);
  }, [userProfile]);

  // Effect hooks
  useEffect(() => {
    performSearch(searchQuery, filters);
  }, [searchQuery, filters, performSearch]);

  useEffect(() => {
    generateRecommendations();
  }, [generateRecommendations]);

  // Event handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (filterType: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags(prev => [...prev, tag]);
      handleFilterChange('tags', [...selectedTags, tag]);
    }
  };

  const handleTagRemove = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
    handleFilterChange('tags', selectedTags.filter(t => t !== tag));
  };

  const clearFilters = () => {
    setFilters({
      contentType: [],
      difficulty: [],
      subject: [],
      duration: { min: 0, max: 180 },
      tags: [],
      format: [],
      language: 'all',
      author: [],
      dateRange: { start: null, end: null },
      rating: 0,
      status: ['published']
    });
    setSelectedTags([]);
  };

  // Render helpers
  const renderSearchBar = () => (
    <div className="search-bar">
      <div className="search-input-container">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search for lessons, activities, assessments..."
          className="search-input"
        />
        <button className="search-button">
          <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
      
      <div className="search-controls">
        <button
          className={`mode-toggle ${searchMode === 'advanced' ? 'active' : ''}`}
          onClick={() => setSearchMode(searchMode === 'simple' ? 'advanced' : 'simple')}
        >
          {searchMode === 'simple' ? 'Advanced Search' : 'Simple Search'}
        </button>
        
        <button
          className={`filter-toggle ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <svg className="filter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
          </svg>
          Filters
        </button>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className={`filters-panel ${showFilters ? 'visible' : ''}`}>
      <div className="filters-header">
        <h3>Filter Results</h3>
        <button onClick={clearFilters} className="clear-filters">
          Clear All
        </button>
      </div>
      
      <div className="filters-grid">
        {/* Content Type Filter */}
        <div className="filter-group">
          <label className="filter-label">Content Type</label>
          <div className="checkbox-group">
            {filterOptions.contentType.map(type => (
              <label key={type} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={filters.contentType.includes(type)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleFilterChange('contentType', [...filters.contentType, type]);
                    } else {
                      handleFilterChange('contentType', filters.contentType.filter(t => t !== type));
                    }
                  }}
                />
                <span className="capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="filter-group">
          <label className="filter-label">Difficulty</label>
          <div className="checkbox-group">
            {filterOptions.difficulty.map(level => (
              <label key={level} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={filters.difficulty.includes(level)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleFilterChange('difficulty', [...filters.difficulty, level]);
                    } else {
                      handleFilterChange('difficulty', filters.difficulty.filter(d => d !== level));
                    }
                  }}
                />
                <span className="capitalize">{level}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Subject Filter */}
        <div className="filter-group">
          <label className="filter-label">Subject</label>
          <div className="checkbox-group scrollable">
            {filterOptions.subject.map(subject => (
              <label key={subject} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={filters.subject.includes(subject)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleFilterChange('subject', [...filters.subject, subject]);
                    } else {
                      handleFilterChange('subject', filters.subject.filter(s => s !== subject));
                    }
                  }}
                />
                <span>{subject}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Duration Filter */}
        <div className="filter-group">
          <label className="filter-label">Duration (minutes)</label>
          <div className="range-inputs">
            <input
              type="number"
              value={filters.duration.min}
              onChange={(e) => handleFilterChange('duration', { ...filters.duration, min: parseInt(e.target.value) || 0 })}
              placeholder="Min"
              min="0"
              max="180"
            />
            <span>to</span>
            <input
              type="number"
              value={filters.duration.max}
              onChange={(e) => handleFilterChange('duration', { ...filters.duration, max: parseInt(e.target.value) || 180 })}
              placeholder="Max"
              min="0"
              max="180"
            />
          </div>
        </div>

        {/* Format Filter */}
        <div className="filter-group">
          <label className="filter-label">Format</label>
          <div className="checkbox-group">
            {filterOptions.format.map(format => (
              <label key={format} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={filters.format.includes(format)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleFilterChange('format', [...filters.format, format]);
                    } else {
                      handleFilterChange('format', filters.format.filter(f => f !== format));
                    }
                  }}
                />
                <span className="capitalize">{format}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rating Filter */}
        <div className="filter-group">
          <label className="filter-label">Minimum Rating</label>
          <div className="rating-filter">
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                className={`rating-button ${filters.rating >= rating ? 'active' : ''}`}
                onClick={() => handleFilterChange('rating', rating === filters.rating ? 0 : rating)}
              >
                {'★'.repeat(rating)}
                <span>{rating}+</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSortControls = () => (
    <div className="sort-controls">
      <div className="sort-group">
        <label>Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="sort-select"
        >
          <option value="relevance">Relevance</option>
          <option value="date">Date</option>
          <option value="rating">Rating</option>
          <option value="popularity">Popularity</option>
        </select>
      </div>
      
      <div className="view-controls">
        <button
          className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
          onClick={() => setViewMode('grid')}
        >
          <svg className="view-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>
        <button
          className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          <svg className="view-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  );

  const renderContentCard = (item: ContentItem) => (
    <div key={item.id} className={`content-card ${viewMode}`}>
      {item.thumbnail && (
        <div className="card-thumbnail">
          <img src={item.thumbnail} alt={item.title} />
          <div className="card-overlay">
            <span className="duration">{item.duration}m</span>
            <span className={`difficulty ${item.difficulty}`}>{item.difficulty}</span>
          </div>
        </div>
      )}
      
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{item.title}</h3>
          <div className="card-rating">
            <span className="rating-stars">{'★'.repeat(Math.floor(item.rating))}</span>
            <span className="rating-value">{item.rating}</span>
            <span className="rating-count">({item.reviewCount})</span>
          </div>
        </div>
        
        <p className="card-description">{item.description}</p>
        
        <div className="card-meta">
          <div className="meta-row">
            <span className="content-type">{item.contentType}</span>
            <span className="format">{item.format}</span>
            <span className="author">{item.author.name}</span>
          </div>
          
          <div className="meta-row">
            <div className="subjects">
              {item.subject.slice(0, 2).map(subject => (
                <span key={subject} className="subject-tag">{subject}</span>
              ))}
              {item.subject.length > 2 && (
                <span className="more-subjects">+{item.subject.length - 2}</span>
              )}
            </div>
          </div>
          
          <div className="meta-row">
            <div className="tags">
              {item.tags.slice(0, 3).map(tag => (
                <button
                  key={tag}
                  className="tag-button"
                  onClick={() => handleTagSelect(tag)}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="card-stats">
          <div className="stat">
            <span className="stat-value">{item.interactionCount.toLocaleString()}</span>
            <span className="stat-label">Views</span>
          </div>
          <div className="stat">
            <span className="stat-value">{item.completionRate}%</span>
            <span className="stat-label">Completion</span>
          </div>
          {item.personalizedScore && (
            <div className="stat">
              <span className="stat-value">{Math.round(item.personalizedScore * 100)}%</span>
              <span className="stat-label">Match</span>
            </div>
          )}
        </div>
        
        <div className="card-actions">
          <button className="action-button primary">View Content</button>
          <button className="action-button secondary">Preview</button>
          <button className="action-button icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  const renderRecommendations = () => (
    <div className="recommendations-section">
      <h2 className="section-title">Recommended for You</h2>
      <div className="recommendations-grid">
        {recommendations.map(recommendation => (
          <div key={recommendation.id} className="recommendation-group">
            <div className="recommendation-header">
              <h3 className="recommendation-title">{recommendation.title}</h3>
              <span className="recommendation-type">{recommendation.type}</span>
              <span className="confidence-score">
                {Math.round(recommendation.confidence * 100)}% confidence
              </span>
            </div>
            <p className="recommendation-description">{recommendation.description}</p>
            <div className="recommendation-content">
              {recommendation.content.slice(0, 3).map(item => (
                <div key={item.id} className="mini-content-card">
                  {item.thumbnail && (
                    <img src={item.thumbnail} alt={item.title} className="mini-thumbnail" />
                  )}
                  <div className="mini-content">
                    <h4 className="mini-title">{item.title}</h4>
                    <div className="mini-meta">
                      <span className="mini-rating">★ {item.rating}</span>
                      <span className="mini-duration">{item.duration}m</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="search-and-discovery">
      <div className="search-header">
        <h1>Discover Learning Content</h1>
        <p>Find the perfect educational resources tailored to your learning journey</p>
      </div>

      {renderSearchBar()}
      {renderFilters()}

      {selectedTags.length > 0 && (
        <div className="selected-tags">
          <span className="tags-label">Selected tags:</span>
          {selectedTags.map(tag => (
            <span key={tag} className="selected-tag">
              #{tag}
              <button onClick={() => handleTagRemove(tag)} className="remove-tag">
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {!searchQuery && recommendations.length > 0 && renderRecommendations()}

      <div className="results-section">
        <div className="results-header">
          <h2 className="section-title">
            {searchQuery ? `Search Results (${searchResults.length})` : `All Content (${searchResults.length})`}
          </h2>
          {renderSortControls()}
        </div>

        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Searching for content...</p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-3-3v3m-3 6v-3m6 0v3M5.636 5.636l1.414 1.414M16.95 16.95l1.414 1.414M5.636 18.364l1.414-1.414M16.95 7.05l1.414-1.414" />
            </svg>
            <h3>No content found</h3>
            <p>Try adjusting your search terms or filters to find what you're looking for.</p>
            <button onClick={clearFilters} className="clear-filters-button">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={`content-grid ${viewMode}`}>
            {searchResults.map(renderContentCard)}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchAndDiscovery;