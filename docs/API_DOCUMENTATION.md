# Content Management API Documentation

## Overview

The Content Management API provides comprehensive functionality for managing educational content, including lessons, activities, assessments, and media assets. This API supports CRUD operations, advanced search, analytics, and collaborative content creation.

## Base URL
```
https://api.playlearnspark.com/v1
```

## Authentication

All API endpoints require authentication via JWT tokens. Include the token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

## Rate Limiting

- 100 requests per minute for authenticated users
- 10 requests per minute for unauthenticated requests

## Content Types

### Content Item Types
- `lesson` - Educational lessons with structured content
- `activity` - Interactive activities and exercises
- `assessment` - Quizzes, tests, and evaluations
- `resource` - Reference materials and documents

### Difficulty Levels
- `beginner` - Introductory level content
- `intermediate` - Moderate difficulty content
- `advanced` - Advanced level content

### Content Formats
- `text` - Text-based content
- `video` - Video content
- `audio` - Audio content
- `interactive` - Interactive content with user engagement
- `mixed` - Combination of multiple formats

## API Endpoints

### Content Management

#### GET /api/content
Retrieve a list of content items with pagination and filtering.

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 20, max: 100)
- `contentType` (string, optional): Filter by content type
- `difficulty` (string, optional): Filter by difficulty level
- `subject` (string, optional): Filter by subject
- `status` (string, optional): Filter by status (draft, published, archived)
- `author` (string, optional): Filter by author ID
- `sort` (string, optional): Sort field (title, createdAt, updatedAt, rating)
- `order` (string, optional): Sort order (asc, desc)

**Response:**
```json
{
  "items": [
    {
      "id": "content_123",
      "title": "Introduction to Algebra",
      "description": "Basic algebraic concepts and problem-solving techniques",
      "contentType": "lesson",
      "difficulty": "beginner",
      "subject": ["Mathematics", "Algebra"],
      "duration": 45,
      "tags": ["algebra", "math", "equations"],
      "format": "video",
      "language": "English",
      "author": {
        "id": "user_456",
        "name": "Dr. Sarah Johnson",
        "avatar": "https://example.com/avatar.jpg"
      },
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T14:45:00Z",
      "rating": 4.7,
      "reviewCount": 156,
      "status": "published",
      "thumbnail": "https://example.com/thumbnail.jpg",
      "isPublished": true,
      "viewCount": 2340,
      "completionRate": 87
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### GET /api/content/:id
Retrieve a specific content item by ID.

**Path Parameters:**
- `id` (string, required): Content item ID

**Response:**
```json
{
  "id": "content_123",
  "title": "Introduction to Algebra",
  "description": "Basic algebraic concepts and problem-solving techniques",
  "contentType": "lesson",
  "difficulty": "beginner",
  "subject": ["Mathematics", "Algebra"],
  "duration": 45,
  "tags": ["algebra", "math", "equations"],
  "format": "video",
  "language": "English",
  "targetAudience": {
    "ageRange": {
      "min": 12,
      "max": 16
    },
    "gradeLevel": ["6th", "7th", "8th"],
    "prerequisites": ["basic arithmetic"]
  },
  "learningObjectives": [
    "Understand basic algebraic expressions",
    "Solve simple linear equations",
    "Apply algebra to real-world problems"
  ],
  "body": {
    "type": "rich_text",
    "content": "# Introduction to Algebra\n\nAlgebra is a branch of mathematics..."
  },
  "metadata": {
    "estimatedReadingTime": 10,
    "estimatedCompletionTime": 45,
    "complexity": "low",
    "keywords": ["algebra", "variables", "equations"]
  },
  "author": {
    "id": "user_456",
    "name": "Dr. Sarah Johnson",
    "avatar": "https://example.com/avatar.jpg"
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T14:45:00Z",
  "version": 2,
  "rating": 4.7,
  "reviewCount": 156,
  "status": "published",
  "isPublished": true,
  "analytics": {
    "viewCount": 2340,
    "completionCount": 2034,
    "completionRate": 87,
    "averageTimeSpent": 42
  }
}
```

#### POST /api/content
Create a new content item.

**Request Body:**
```json
{
  "title": "Introduction to Algebra",
  "description": "Basic algebraic concepts and problem-solving techniques",
  "contentType": "lesson",
  "difficulty": "beginner",
  "subject": ["Mathematics", "Algebra"],
  "duration": 45,
  "tags": ["algebra", "math", "equations"],
  "format": "video",
  "language": "English",
  "targetAudience": {
    "ageRange": {
      "min": 12,
      "max": 16
    },
    "gradeLevel": ["6th", "7th", "8th"],
    "prerequisites": ["basic arithmetic"]
  },
  "learningObjectives": [
    "Understand basic algebraic expressions",
    "Solve simple linear equations"
  ],
  "body": {
    "type": "rich_text",
    "content": "# Introduction to Algebra\n\nAlgebra is a branch of mathematics..."
  },
  "isPublished": true
}
```

**Response:**
```json
{
  "id": "content_789",
  "title": "Introduction to Algebra",
  "status": "published",
  "createdAt": "2024-02-15T10:30:00Z",
  "version": 1,
  "message": "Content created successfully"
}
```

#### PUT /api/content/:id
Update an existing content item.

**Path Parameters:**
- `id` (string, required): Content item ID

**Request Body:** (partial update supported)
```json
{
  "title": "Advanced Introduction to Algebra",
  "description": "Updated description with more advanced concepts",
  "tags": ["algebra", "math", "equations", "advanced"]
}
```

**Response:**
```json
{
  "id": "content_123",
  "title": "Advanced Introduction to Algebra",
  "version": 3,
  "updatedAt": "2024-02-15T14:30:00Z",
  "message": "Content updated successfully"
}
```

#### DELETE /api/content/:id
Delete a content item.

**Path Parameters:**
- `id` (string, required): Content item ID

**Response:**
```http
Status: 204 No Content
```

### Content Search

#### GET /api/content/search
Advanced search for content items.

**Query Parameters:**
- `q` (string, optional): Search query
- `contentType` (array, optional): Filter by content types
- `difficulty` (array, optional): Filter by difficulty levels
- `subject` (array, optional): Filter by subjects
- `tags` (array, optional): Filter by tags
- `format` (array, optional): Filter by formats
- `language` (string, optional): Filter by language
- `rating` (number, optional): Minimum rating (0-5)
- `duration` (object, optional): Duration range `{min: 0, max: 120}`
- `dateRange` (object, optional): Date range `{start: "2024-01-01", end: "2024-12-31"}`
- `author` (array, optional): Filter by author IDs
- `sort` (string, optional): Sort by relevance, date, rating, popularity
- `page` (integer, optional): Page number
- `limit` (integer, optional): Items per page

**Response:**
```json
{
  "items": [
    {
      "id": "content_123",
      "title": "Introduction to Algebra",
      "description": "Basic algebraic concepts",
      "contentType": "lesson",
      "difficulty": "beginner",
      "subject": ["Mathematics"],
      "rating": 4.7,
      "relevanceScore": 0.95,
      "personalizedScore": 0.87
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "totalPages": 2
  },
  "filters": {
    "appliedFilters": {
      "contentType": ["lesson"],
      "difficulty": ["beginner"]
    },
    "availableFilters": {
      "subjects": ["Mathematics", "Science", "Language Arts"],
      "tags": ["algebra", "geometry", "calculus"]
    }
  },
  "searchMeta": {
    "query": "algebra basics",
    "searchTime": 0.045,
    "totalResults": 25
  }
}
```

### Lessons

#### POST /api/content/lessons
Create a new lesson with structured content.

**Request Body:**
```json
{
  "title": "Algebra Fundamentals",
  "description": "Complete lesson on algebra basics",
  "difficulty": "beginner",
  "subject": ["Mathematics"],
  "duration": 60,
  "structure": {
    "sections": [
      {
        "id": "intro",
        "title": "Introduction",
        "content": "Welcome to algebra...",
        "order": 1,
        "estimatedTime": 10
      },
      {
        "id": "variables",
        "title": "Understanding Variables",
        "content": "Variables are symbols...",
        "order": 2,
        "estimatedTime": 20,
        "activities": ["activity_123"]
      }
    ]
  },
  "prerequisites": ["basic_arithmetic"],
  "learningObjectives": [
    "Define variables and expressions",
    "Solve basic equations"
  ]
}
```

#### GET /api/content/lessons/:id/progress
Get lesson progress for the current user.

**Response:**
```json
{
  "lessonId": "lesson_123",
  "progress": {
    "overallProgress": 65,
    "completedSections": ["intro", "variables"],
    "currentSection": "equations",
    "timeSpent": 35,
    "lastAccessed": "2024-02-15T14:30:00Z"
  },
  "sections": [
    {
      "id": "intro",
      "title": "Introduction",
      "completed": true,
      "timeSpent": 8,
      "completedAt": "2024-02-15T14:00:00Z"
    },
    {
      "id": "variables",
      "title": "Understanding Variables",
      "completed": true,
      "timeSpent": 27,
      "completedAt": "2024-02-15T14:25:00Z"
    }
  ]
}
```

### Activities

#### POST /api/content/activities
Create a new activity.

**Request Body:**
```json
{
  "title": "Algebra Practice Quiz",
  "description": "Practice quiz for algebra concepts",
  "activityType": "quiz",
  "difficulty": "beginner",
  "subject": ["Mathematics"],
  "duration": 20,
  "instructions": "Complete the following questions about algebra",
  "configuration": {
    "questions": [
      {
        "id": "q1",
        "type": "multiple_choice",
        "question": "What is the value of x in the equation x + 5 = 12?",
        "options": ["5", "7", "12", "17"],
        "correctAnswer": "7",
        "explanation": "To solve x + 5 = 12, subtract 5 from both sides: x = 12 - 5 = 7",
        "points": 1
      },
      {
        "id": "q2",
        "type": "text_input",
        "question": "Solve for y: 2y - 3 = 11",
        "correctAnswer": "7",
        "points": 2
      }
    ],
    "timeLimit": 1200,
    "attemptsAllowed": 3,
    "passingScore": 70,
    "shuffleQuestions": true,
    "showCorrectAnswers": true
  }
}
```

#### POST /api/content/activities/:id/submit
Submit an activity attempt.

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": "q1",
      "answer": "7"
    },
    {
      "questionId": "q2",
      "answer": "7"
    }
  ],
  "timeSpent": 450
}
```

**Response:**
```json
{
  "attemptId": "attempt_789",
  "score": 100,
  "maxScore": 3,
  "passed": true,
  "timeSpent": 450,
  "submittedAt": "2024-02-15T15:00:00Z",
  "results": [
    {
      "questionId": "q1",
      "correct": true,
      "points": 1,
      "feedback": "Correct! You successfully solved the equation."
    },
    {
      "questionId": "q2",
      "correct": true,
      "points": 2,
      "feedback": "Excellent work on this problem."
    }
  ],
  "feedback": "Great job! You've mastered these algebra concepts.",
  "nextRecommendations": ["content_456", "content_789"]
}
```

#### GET /api/content/activities/:id/attempts
Get attempt history for an activity.

**Response:**
```json
{
  "activityId": "activity_123",
  "attempts": [
    {
      "id": "attempt_789",
      "score": 100,
      "maxScore": 3,
      "passed": true,
      "timeSpent": 450,
      "submittedAt": "2024-02-15T15:00:00Z",
      "attemptNumber": 1
    }
  ],
  "bestScore": 100,
  "averageScore": 100,
  "totalAttempts": 1,
  "remainingAttempts": 2
}
```

### Content Collections

#### POST /api/content/collections
Create a content collection (course, module, etc.).

**Request Body:**
```json
{
  "title": "Algebra Fundamentals Course",
  "description": "Complete course covering algebra basics",
  "contentItems": [
    {
      "contentId": "content_123",
      "order": 1,
      "required": true
    },
    {
      "contentId": "activity_456",
      "order": 2,
      "required": true
    },
    {
      "contentId": "assessment_789",
      "order": 3,
      "required": false
    }
  ],
  "tags": ["course", "algebra", "mathematics"],
  "difficulty": "beginner",
  "estimatedDuration": 180,
  "isPublished": true
}
```

#### GET /api/content/collections/:id/progress
Get collection progress for the current user.

**Response:**
```json
{
  "collectionId": "collection_123",
  "progress": {
    "overallProgress": 67,
    "completedItems": 2,
    "totalItems": 3,
    "timeSpent": 120,
    "lastAccessed": "2024-02-15T16:00:00Z"
  },
  "itemProgress": [
    {
      "contentId": "content_123",
      "title": "Introduction to Algebra",
      "completed": true,
      "progress": 100,
      "timeSpent": 45,
      "completedAt": "2024-02-15T14:30:00Z"
    },
    {
      "contentId": "activity_456",
      "title": "Algebra Practice",
      "completed": true,
      "progress": 100,
      "timeSpent": 20,
      "score": 85,
      "completedAt": "2024-02-15T15:00:00Z"
    },
    {
      "contentId": "assessment_789",
      "title": "Algebra Test",
      "completed": false,
      "progress": 0,
      "timeSpent": 0
    }
  ]
}
```

### Media Management

#### POST /api/media/upload
Upload a media file.

**Request:** Multipart form data
- `file` (file, required): Media file to upload
- `title` (string, optional): Media title
- `description` (string, optional): Media description
- `tags` (array, optional): Media tags

**Supported file types:**
- Images: JPG, PNG, GIF, WebP (max 10MB)
- Videos: MP4, WebM, MOV (max 100MB)
- Audio: MP3, WAV, OGG (max 50MB)
- Documents: PDF, DOC, DOCX, TXT (max 25MB)

**Response:**
```json
{
  "id": "media_123",
  "title": "Algebra Diagram",
  "description": "Visual representation of algebraic concepts",
  "filename": "algebra_diagram_uuid.jpg",
  "originalName": "algebra_diagram.jpg",
  "mimeType": "image/jpeg",
  "size": 2048576,
  "path": "/uploads/2024/02/algebra_diagram_uuid.jpg",
  "url": "https://cdn.example.com/uploads/2024/02/algebra_diagram_uuid.jpg",
  "thumbnails": {
    "small": "https://cdn.example.com/thumbnails/small/algebra_diagram_uuid.jpg",
    "medium": "https://cdn.example.com/thumbnails/medium/algebra_diagram_uuid.jpg",
    "large": "https://cdn.example.com/thumbnails/large/algebra_diagram_uuid.jpg"
  },
  "metadata": {
    "dimensions": {
      "width": 1920,
      "height": 1080
    },
    "duration": null,
    "format": "JPEG"
  },
  "uploadedAt": "2024-02-15T16:30:00Z",
  "status": "processed"
}
```

#### GET /api/media
Get media library with filtering and pagination.

**Query Parameters:**
- `page` (integer, optional): Page number
- `limit` (integer, optional): Items per page
- `type` (string, optional): Filter by media type (image, video, audio, document)
- `tags` (array, optional): Filter by tags
- `search` (string, optional): Search in title and description

**Response:**
```json
{
  "items": [
    {
      "id": "media_123",
      "title": "Algebra Diagram",
      "description": "Visual representation of algebraic concepts",
      "filename": "algebra_diagram_uuid.jpg",
      "mimeType": "image/jpeg",
      "size": 2048576,
      "url": "https://cdn.example.com/uploads/2024/02/algebra_diagram_uuid.jpg",
      "thumbnailUrl": "https://cdn.example.com/thumbnails/medium/algebra_diagram_uuid.jpg",
      "uploadedAt": "2024-02-15T16:30:00Z",
      "usageCount": 3
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  },
  "storage": {
    "totalUsed": "256.7 MB",
    "totalLimit": "10 GB",
    "usagePercentage": 2.5
  }
}
```

#### DELETE /api/media/:id
Delete a media file.

**Path Parameters:**
- `id` (string, required): Media ID

**Response:**
```http
Status: 204 No Content
```

### Analytics

#### GET /api/content/analytics/overview
Get content analytics overview.

**Query Parameters:**
- `dateRange` (string, optional): Date range (7d, 30d, 90d, 1y, custom)
- `startDate` (string, optional): Start date for custom range
- `endDate` (string, optional): End date for custom range

**Response:**
```json
{
  "summary": {
    "totalContent": 1250,
    "totalViews": 45680,
    "totalCompletions": 38920,
    "averageRating": 4.3,
    "activeUsers": 2340
  },
  "contentByType": {
    "lesson": 650,
    "activity": 380,
    "assessment": 150,
    "resource": 70
  },
  "contentByDifficulty": {
    "beginner": 580,
    "intermediate": 420,
    "advanced": 250
  },
  "contentBySubject": {
    "Mathematics": 380,
    "Science": 320,
    "Language Arts": 280,
    "Social Studies": 180,
    "Other": 90
  },
  "trends": {
    "viewsOverTime": [
      { "date": "2024-02-01", "views": 1250 },
      { "date": "2024-02-02", "views": 1380 },
      { "date": "2024-02-03", "views": 1420 }
    ],
    "completionsOverTime": [
      { "date": "2024-02-01", "completions": 1050 },
      { "date": "2024-02-02", "completions": 1180 },
      { "date": "2024-02-03", "completions": 1250 }
    ]
  },
  "topContent": [
    {
      "id": "content_123",
      "title": "Introduction to Algebra",
      "views": 2340,
      "completions": 2034,
      "rating": 4.7
    }
  ]
}
```

#### GET /api/content/:id/analytics
Get analytics for a specific content item.

**Response:**
```json
{
  "contentId": "content_123",
  "title": "Introduction to Algebra",
  "views": 2340,
  "uniqueViews": 1890,
  "completions": 2034,
  "completionRate": 87,
  "averageTimeSpent": 42,
  "averageRating": 4.7,
  "totalRatings": 156,
  "engagement": {
    "commentsCount": 45,
    "likesCount": 234,
    "sharesCount": 67
  },
  "demographics": {
    "ageGroups": {
      "12-14": 45,
      "15-17": 35,
      "18+": 20
    },
    "gradeLevels": {
      "6th": 25,
      "7th": 30,
      "8th": 25,
      "9th": 15,
      "Other": 5
    }
  },
  "performance": {
    "viewsOverTime": [
      { "date": "2024-02-01", "views": 85 },
      { "date": "2024-02-02", "views": 92 },
      { "date": "2024-02-03", "views": 78 }
    ],
    "completionsBySection": [
      { "section": "intro", "completions": 2034 },
      { "section": "examples", "completions": 1890 },
      { "section": "practice", "completions": 1756 }
    ]
  }
}
```

## Error Responses

All error responses follow a consistent format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Specific error details"
  },
  "requestId": "req_123456789"
}
```

### Common Error Codes

- `400` - Bad Request
  - `VALIDATION_ERROR` - Request validation failed
  - `INVALID_FILE_TYPE` - Unsupported file type
  - `FILE_TOO_LARGE` - File exceeds size limit

- `401` - Unauthorized
  - `INVALID_TOKEN` - JWT token is invalid
  - `TOKEN_EXPIRED` - JWT token has expired

- `403` - Forbidden
  - `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
  - `CONTENT_ACCESS_DENIED` - Access to content denied

- `404` - Not Found
  - `CONTENT_NOT_FOUND` - Requested content not found
  - `MEDIA_NOT_FOUND` - Requested media not found

- `429` - Too Many Requests
  - `RATE_LIMIT_EXCEEDED` - API rate limit exceeded

- `500` - Internal Server Error
  - `INTERNAL_ERROR` - Unexpected server error

## Webhooks

Register webhook endpoints to receive real-time notifications about content events.

### Supported Events
- `content.created` - New content item created
- `content.updated` - Content item updated
- `content.deleted` - Content item deleted
- `content.published` - Content item published
- `activity.completed` - User completed an activity
- `lesson.completed` - User completed a lesson
- `collection.completed` - User completed a collection

### Webhook Payload Example
```json
{
  "event": "content.created",
  "timestamp": "2024-02-15T16:30:00Z",
  "data": {
    "contentId": "content_123",
    "title": "Introduction to Algebra",
    "contentType": "lesson",
    "author": {
      "id": "user_456",
      "name": "Dr. Sarah Johnson"
    }
  }
}
```

## SDKs and Libraries

### JavaScript/Node.js
```javascript
npm install @playlearnspark/content-api
```

### Python
```python
pip install playlearnspark-content-api
```

### Usage Example (JavaScript)
```javascript
import { ContentAPI } from '@playlearnspark/content-api';

const api = new ContentAPI({
  apiKey: 'your_api_key',
  baseURL: 'https://api.playlearnspark.com/v1'
});

// Create content
const content = await api.content.create({
  title: 'My Lesson',
  contentType: 'lesson',
  description: 'A great lesson'
});

// Search content
const results = await api.content.search({
  query: 'algebra',
  filters: { difficulty: 'beginner' }
});

// Upload media
const media = await api.media.upload({
  file: fileBuffer,
  title: 'Lesson Image',
  type: 'image'
});
```

## Support

For API support, please contact:
- Email: api-support@playlearnspark.com
- Documentation: https://docs.playlearnspark.com
- Status Page: https://status.playlearnspark.com