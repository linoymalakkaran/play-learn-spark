# Class & Group Management API Documentation

## Overview

This document provides comprehensive API documentation for the Class & Group Management System in the Play-Learn-Spark educational platform.

## Base URL

```
http://localhost:3002/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this structure:

```json
{
  "success": boolean,
  "message": string,
  "data": object | array,
  "errors": array (optional),
  "pagination": object (optional)
}
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message",
      "code": "ERROR_CODE"
    }
  ]
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

# Class Management API

## Create Class

Creates a new class for teachers.

**Endpoint:** `POST /classes`

**Authorization:** Teacher required

**Request Body:**
```json
{
  "name": "Mathematics 101",
  "description": "Advanced mathematics for 5th graders",
  "subject": "math",
  "gradeLevel": "5th",
  "settings": {
    "maxStudents": 25,
    "requireApproval": true,
    "allowLateSubmissions": false,
    "autoGenJoinCode": true,
    "color": "#3B82F6"
  },
  "schedule": {
    "meetingDays": ["monday", "wednesday", "friday"],
    "startTime": "09:00",
    "endTime": "10:00",
    "semester": "Fall 2025",
    "startDate": "2025-09-01",
    "endDate": "2025-12-15"
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Class created successfully",
  "data": {
    "class": {
      "_id": "676a1234567890abcdef1234",
      "name": "Mathematics 101",
      "description": "Advanced mathematics for 5th graders",
      "teacher": {
        "_id": "676a1234567890abcdef5678",
        "profile": {
          "name": "John Teacher",
          "email": "john.teacher@school.edu"
        }
      },
      "subject": "math",
      "gradeLevel": "5th",
      "joinCode": "MTH101",
      "settings": {
        "maxStudents": 25,
        "requireApproval": true,
        "allowLateSubmissions": false,
        "color": "#3B82F6"
      },
      "schedule": {
        "meetingDays": ["monday", "wednesday", "friday"],
        "startTime": "09:00",
        "endTime": "10:00",
        "semester": "Fall 2025",
        "startDate": "2025-09-01",
        "endDate": "2025-12-15"
      },
      "students": [],
      "analytics": {
        "totalStudents": 0,
        "activeStudents": 0,
        "totalAssignments": 0,
        "averageCompletion": 0,
        "lastActivity": "2025-01-27T10:30:00.000Z"
      },
      "metadata": {
        "createdAt": "2025-01-27T10:30:00.000Z",
        "updatedAt": "2025-01-27T10:30:00.000Z",
        "academicYear": "2024-2025",
        "semester": "Fall"
      }
    }
  }
}
```

**Validation Rules:**
- `name`: Required, 1-100 characters
- `gradeLevel`: Required, must be one of: pre-k, kindergarten, 1st-6th, mixed
- `subject`: Optional, must be one of: math, science, english, history, art, music, physical-education, other
- `settings.maxStudents`: 1-100
- `schedule.meetingDays`: Array of valid weekdays

---

## Get My Classes

Retrieves classes for the authenticated user (teacher or student view).

**Endpoint:** `GET /classes`

**Authorization:** Required

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)
- `archived` (optional): Include archived classes (default: false)
- `search` (optional): Search term for class name or subject

**Response:** `200 OK`

### Teacher Response:
```json
{
  "success": true,
  "data": {
    "classes": [
      {
        "_id": "676a1234567890abcdef1234",
        "name": "Mathematics 101",
        "subject": "math",
        "gradeLevel": "5th",
        "joinCode": "MTH101",
        "students": [
          {
            "user": {
              "_id": "676a1234567890abcdef9999",
              "profile": {
                "name": "Jane Student",
                "email": "jane.student@school.edu"
              }
            },
            "status": "approved",
            "enrolledAt": "2025-01-20T08:00:00.000Z"
          }
        ],
        "analytics": {
          "totalStudents": 18,
          "activeStudents": 16,
          "averageCompletion": 87.5
        },
        "metadata": {
          "createdAt": "2025-01-15T10:00:00.000Z",
          "updatedAt": "2025-01-27T10:30:00.000Z"
        }
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### Student Response:
```json
{
  "success": true,
  "data": {
    "classes": [
      {
        "_id": "676a1234567890abcdef1234",
        "name": "Mathematics 101",
        "subject": "math",
        "gradeLevel": "5th",
        "teacher": {
          "_id": "676a1234567890abcdef5678",
          "profile": {
            "name": "John Teacher",
            "email": "john.teacher@school.edu"
          }
        },
        "schedule": {
          "meetingDays": ["monday", "wednesday", "friday"],
          "startTime": "09:00",
          "endTime": "10:00"
        },
        "enrollmentStatus": "approved",
        "enrolledAt": "2025-01-20T08:00:00.000Z"
      }
    ]
  }
}
```

---

## Get Class Details

Retrieves detailed information about a specific class.

**Endpoint:** `GET /classes/:classId`

**Authorization:** Required (must be teacher or enrolled student)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "class": {
      "_id": "676a1234567890abcdef1234",
      "name": "Mathematics 101",
      "description": "Advanced mathematics for 5th graders",
      "teacher": {
        "_id": "676a1234567890abcdef5678",
        "profile": {
          "name": "John Teacher",
          "email": "john.teacher@school.edu"
        }
      },
      "subject": "math",
      "gradeLevel": "5th",
      "joinCode": "MTH101",
      "settings": {
        "maxStudents": 25,
        "requireApproval": true,
        "allowLateSubmissions": false,
        "color": "#3B82F6"
      },
      "students": [
        {
          "user": {
            "_id": "676a1234567890abcdef9999",
            "profile": {
              "name": "Jane Student",
              "email": "jane.student@school.edu"
            }
          },
          "status": "approved",
          "enrolledAt": "2025-01-20T08:00:00.000Z",
          "permissions": {
            "viewClassmates": true,
            "participateInDiscussions": true,
            "submitAssignments": true
          }
        }
      ],
      "analytics": {
        "totalStudents": 18,
        "activeStudents": 16,
        "totalAssignments": 5,
        "averageCompletion": 87.5,
        "lastActivity": "2025-01-27T09:15:00.000Z"
      },
      "metadata": {
        "createdAt": "2025-01-15T10:00:00.000Z",
        "updatedAt": "2025-01-27T10:30:00.000Z",
        "academicYear": "2024-2025",
        "semester": "Fall"
      }
    }
  }
}
```

---

## Join Class

Allows students to join a class using a join code.

**Endpoint:** `POST /classes/join`

**Authorization:** Student required

**Request Body:**
```json
{
  "joinCode": "MTH101"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Successfully joined the class",
  "data": {
    "class": {
      "_id": "676a1234567890abcdef1234",
      "name": "Mathematics 101",
      "teacher": {
        "profile": {
          "name": "John Teacher"
        }
      },
      "gradeLevel": "5th",
      "subject": "math",
      "enrollmentStatus": "pending",
      "requiresApproval": true
    }
  }
}
```

**Error Responses:**
- `404`: Class not found with join code
- `400`: Already enrolled in class
- `400`: Class is full
- `403`: Not authorized to join (e.g., wrong grade level)

---

## Preview Class

Allows students to preview class details before joining.

**Endpoint:** `POST /classes/preview`

**Authorization:** Student required

**Request Body:**
```json
{
  "joinCode": "MTH101"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "class": {
      "_id": "676a1234567890abcdef1234",
      "name": "Mathematics 101",
      "description": "Advanced mathematics for 5th graders",
      "teacher": {
        "profile": {
          "name": "John Teacher"
        }
      },
      "subject": "math",
      "gradeLevel": "5th",
      "studentCount": 18,
      "maxStudents": 25,
      "schedule": {
        "meetingDays": ["monday", "wednesday", "friday"],
        "startTime": "09:00",
        "endTime": "10:00"
      },
      "requiresApproval": true,
      "metadata": {
        "createdAt": "2025-01-15T10:00:00.000Z"
      }
    }
  }
}
```

---

## Update Class

Updates class information (teacher only).

**Endpoint:** `PUT /classes/:classId`

**Authorization:** Teacher (class owner) required

**Request Body:**
```json
{
  "name": "Advanced Mathematics 101",
  "description": "Updated description",
  "settings": {
    "maxStudents": 30,
    "requireApproval": false,
    "color": "#10B981"
  },
  "schedule": {
    "meetingDays": ["monday", "wednesday", "friday"],
    "startTime": "10:00",
    "endTime": "11:00"
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Class updated successfully",
  "data": {
    "class": {
      "_id": "676a1234567890abcdef1234",
      "name": "Advanced Mathematics 101",
      "description": "Updated description",
      // ... updated class data
    }
  }
}
```

---

# Student Management API

## Approve Student

Approves a pending student enrollment (teacher only).

**Endpoint:** `PUT /classes/:classId/students/:studentId/approve`

**Authorization:** Teacher (class owner) required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Student approved successfully",
  "data": {
    "student": {
      "user": {
        "_id": "676a1234567890abcdef9999",
        "profile": {
          "name": "Jane Student",
          "email": "jane.student@school.edu"
        }
      },
      "status": "approved",
      "approvedAt": "2025-01-27T10:30:00.000Z",
      "approvedBy": "676a1234567890abcdef5678"
    }
  }
}
```

---

## Remove Student

Removes a student from the class (teacher only).

**Endpoint:** `DELETE /classes/:classId/students/:studentId`

**Authorization:** Teacher (class owner) required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Student removed from class successfully"
}
```

---

## Regenerate Join Code

Generates a new join code for the class (teacher only).

**Endpoint:** `POST /classes/:classId/regenerate-code`

**Authorization:** Teacher (class owner) required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Join code regenerated successfully",
  "data": {
    "joinCode": "NEW123",
    "previousCode": "MTH101"
  }
}
```

---

# Group Management API

## Create Group

Creates a new group within a class.

**Endpoint:** `POST /classes/:classId/groups`

**Authorization:** Teacher (class owner) required

**Request Body:**
```json
{
  "name": "Study Group Alpha",
  "description": "Advanced problem-solving group",
  "type": "study-group",
  "settings": {
    "maxMembers": 6,
    "allowSelfJoin": false,
    "requireApproval": true,
    "isPrivate": false
  },
  "color": "#EF4444"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Group created successfully",
  "data": {
    "group": {
      "_id": "676a1234567890abcdef2468",
      "name": "Study Group Alpha",
      "description": "Advanced problem-solving group",
      "class": {
        "_id": "676a1234567890abcdef1234",
        "name": "Mathematics 101"
      },
      "teacher": "676a1234567890abcdef5678",
      "type": "study-group",
      "members": [],
      "settings": {
        "maxMembers": 6,
        "allowSelfJoin": false,
        "requireApproval": true,
        "isPrivate": false
      },
      "color": "#EF4444",
      "memberCount": 0,
      "metadata": {
        "createdAt": "2025-01-27T10:30:00.000Z",
        "updatedAt": "2025-01-27T10:30:00.000Z"
      }
    }
  }
}
```

**Validation Rules:**
- `name`: Required, 1-50 characters
- `type`: One of: study-group, project-team, reading-circle, skill-level, custom
- `settings.maxMembers`: 2-20
- `color`: Valid hex color code

---

## Get Class Groups

Retrieves all groups for a specific class.

**Endpoint:** `GET /classes/:classId/groups`

**Authorization:** Required (teacher or enrolled student)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "groups": [
      {
        "_id": "676a1234567890abcdef2468",
        "name": "Study Group Alpha",
        "description": "Advanced problem-solving group",
        "type": "study-group",
        "members": [
          {
            "user": {
              "_id": "676a1234567890abcdef9999",
              "profile": {
                "name": "Jane Student",
                "email": "jane.student@school.edu"
              }
            },
            "role": "leader",
            "joinedAt": "2025-01-25T14:20:00.000Z",
            "status": "active"
          },
          {
            "user": {
              "_id": "676a1234567890abcdef8888",
              "profile": {
                "name": "Bob Student",
                "email": "bob.student@school.edu"
              }
            },
            "role": "member",
            "joinedAt": "2025-01-26T09:15:00.000Z",
            "status": "active"
          }
        ],
        "settings": {
          "maxMembers": 6,
          "allowSelfJoin": false,
          "requireApproval": true,
          "isPrivate": false
        },
        "color": "#EF4444",
        "memberCount": 2,
        "metadata": {
          "createdAt": "2025-01-25T10:00:00.000Z",
          "updatedAt": "2025-01-26T09:15:00.000Z"
        }
      }
    ],
    "totalGroups": 3,
    "totalMembers": 12,
    "unassignedStudents": 6
  }
}
```

---

## Add Member to Group

Adds a student to a group.

**Endpoint:** `POST /groups/:groupId/members`

**Authorization:** Teacher (class owner) required

**Request Body:**
```json
{
  "userId": "676a1234567890abcdef9999",
  "role": "member"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Member added to group successfully",
  "data": {
    "member": {
      "user": {
        "_id": "676a1234567890abcdef9999",
        "profile": {
          "name": "Jane Student",
          "email": "jane.student@school.edu"
        }
      },
      "role": "member",
      "joinedAt": "2025-01-27T10:30:00.000Z",
      "status": "active"
    }
  }
}
```

**Error Responses:**
- `400`: Group is full
- `400`: User already in group
- `404`: Group or user not found

---

## Remove Member from Group

Removes a student from a group.

**Endpoint:** `DELETE /groups/:groupId/members/:userId`

**Authorization:** Teacher (class owner) required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Member removed from group successfully"
}
```

---

## Update Member Role

Updates a group member's role.

**Endpoint:** `PUT /groups/:groupId/members/:userId/role`

**Authorization:** Teacher (class owner) required

**Request Body:**
```json
{
  "role": "leader"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Member role updated successfully",
  "data": {
    "member": {
      "user": {
        "_id": "676a1234567890abcdef9999",
        "profile": {
          "name": "Jane Student"
        }
      },
      "role": "leader",
      "updatedAt": "2025-01-27T10:30:00.000Z"
    }
  }
}
```

**Validation Rules:**
- `role`: One of: member, leader, helper

---

## Auto-Assign Students

Automatically assigns unassigned students to groups.

**Endpoint:** `POST /classes/:classId/groups/auto-assign`

**Authorization:** Teacher (class owner) required

**Request Body (Optional):**
```json
{
  "strategy": "balanced",
  "preferences": {
    "considerSkillLevel": true,
    "mixGrades": false,
    "maxGroupSize": 6
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Students assigned successfully",
  "data": {
    "assignments": [
      {
        "groupId": "676a1234567890abcdef2468",
        "groupName": "Study Group Alpha",
        "newMembers": [
          {
            "userId": "676a1234567890abcdef9999",
            "name": "Jane Student"
          },
          {
            "userId": "676a1234567890abcdef8888",
            "name": "Bob Student"
          }
        ]
      }
    ],
    "totalAssigned": 12,
    "remainingUnassigned": 2
  }
}
```

**Assignment Strategies:**
- `balanced`: Even distribution across groups
- `random`: Random assignment
- `skill-based`: Based on performance data (if available)

---

## Update Group

Updates group information.

**Endpoint:** `PUT /groups/:groupId`

**Authorization:** Teacher (class owner) required

**Request Body:**
```json
{
  "name": "Advanced Study Group",
  "description": "Updated description",
  "settings": {
    "maxMembers": 8,
    "isPrivate": true
  },
  "color": "#10B981"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Group updated successfully",
  "data": {
    "group": {
      "_id": "676a1234567890abcdef2468",
      "name": "Advanced Study Group",
      "description": "Updated description",
      // ... updated group data
    }
  }
}
```

---

## Delete Group

Deletes a group and removes all members.

**Endpoint:** `DELETE /groups/:groupId`

**Authorization:** Teacher (class owner) required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Group deleted successfully",
  "data": {
    "deletedGroup": {
      "_id": "676a1234567890abcdef2468",
      "name": "Study Group Alpha"
    },
    "membersRemoved": 4
  }
}
```

---

# Archive Management API

## Archive Class

Archives a class (soft delete).

**Endpoint:** `POST /classes/:classId/archive`

**Authorization:** Teacher (class owner) required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Class archived successfully",
  "data": {
    "class": {
      "_id": "676a1234567890abcdef1234",
      "name": "Mathematics 101",
      "metadata": {
        "archivedAt": "2025-01-27T10:30:00.000Z"
      }
    }
  }
}
```

---

## Restore Class

Restores an archived class.

**Endpoint:** `POST /classes/:classId/restore`

**Authorization:** Teacher (class owner) required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Class restored successfully"
}
```

---

# Error Codes Reference

## Class Management Errors

| Code | Description |
|------|-------------|
| `CLASS_NOT_FOUND` | Class with specified ID not found |
| `CLASS_ALREADY_EXISTS` | Class with same name already exists for teacher |
| `INVALID_JOIN_CODE` | Join code is invalid or expired |
| `CLASS_FULL` | Class has reached maximum student capacity |
| `ALREADY_ENROLLED` | Student is already enrolled in the class |
| `NOT_CLASS_TEACHER` | User is not the teacher of the class |
| `ENROLLMENT_CLOSED` | Class no longer accepts new enrollments |

## Group Management Errors

| Code | Description |
|------|-------------|
| `GROUP_NOT_FOUND` | Group with specified ID not found |
| `GROUP_FULL` | Group has reached maximum member capacity |
| `ALREADY_GROUP_MEMBER` | Student is already a member of the group |
| `NOT_GROUP_MEMBER` | Student is not a member of the group |
| `INVALID_ROLE` | Specified role is not valid |
| `CANNOT_REMOVE_LEADER` | Cannot remove the last leader from group |

## Permission Errors

| Code | Description |
|------|-------------|
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `TEACHER_REQUIRED` | Action requires teacher role |
| `STUDENT_REQUIRED` | Action requires student role |
| `CLASS_ACCESS_DENIED` | User cannot access this class |
| `GROUP_ACCESS_DENIED` | User cannot access this group |

---

# Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **General endpoints**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 10 requests per 15 minutes per IP
- **Class creation**: 5 classes per hour per teacher
- **Join requests**: 10 join attempts per hour per student

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1706364000
```

---

# Webhooks (Future Enhancement)

The API supports webhooks for real-time notifications:

## Webhook Events

- `class.created` - New class created
- `class.student_joined` - Student joined class
- `class.student_approved` - Student enrollment approved
- `group.created` - New group created
- `group.member_added` - Member added to group
- `group.member_removed` - Member removed from group

## Webhook Payload Example

```json
{
  "event": "class.student_joined",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "data": {
    "class": {
      "_id": "676a1234567890abcdef1234",
      "name": "Mathematics 101"
    },
    "student": {
      "_id": "676a1234567890abcdef9999",
      "profile": {
        "name": "Jane Student"
      }
    },
    "status": "pending"
  }
}
```

---

# SDK Examples

## JavaScript/TypeScript

```typescript
import { ClassAPI } from 'play-learn-spark-sdk';

const api = new ClassAPI({
  baseUrl: 'http://localhost:3002/api',
  token: 'your-jwt-token'
});

// Create a class
const newClass = await api.classes.create({
  name: 'Mathematics 101',
  subject: 'math',
  gradeLevel: '5th'
});

// Join a class
const joinResult = await api.classes.join('MTH101');

// Create a group
const newGroup = await api.groups.create(classId, {
  name: 'Study Group Alpha',
  maxMembers: 6
});

// Auto-assign students
const assignments = await api.groups.autoAssign(classId, {
  strategy: 'balanced'
});
```

## Python

```python
from play_learn_spark import ClassAPI

api = ClassAPI(
    base_url='http://localhost:3002/api',
    token='your-jwt-token'
)

# Create a class
new_class = api.classes.create({
    'name': 'Mathematics 101',
    'subject': 'math',
    'grade_level': '5th'
})

# Get class groups
groups = api.groups.get_by_class(class_id)

# Add student to group
api.groups.add_member(group_id, user_id, role='member')
```

---

This documentation covers all current API endpoints and provides examples for integration. For the most up-to-date information, refer to the OpenAPI specification at `/api/docs` (when available).