# Static Content Server for Play & Learn Spark Mobile App

## Overview

This is an optional, lightweight backend service that serves static content (images, videos, audio files) for the Play & Learn Spark mobile application. It's designed to be deployed on AWS S3 + CloudFront or any CDN service.

## Purpose

- Serve large media files (images, videos, audio)
- Reduce mobile app size
- Enable content updates without app updates
- Support on-demand content download

## Architecture

```
Mobile App
    ↓
CDN (CloudFront/Cloudflare)
    ↓
S3 Bucket (Static Files)
```

## Option 1: Direct S3 + CloudFront (Recommended)

### Setup Steps

#### 1. Create S3 Bucket

```bash
# Using AWS CLI
aws s3 mb s3://play-learn-spark-content
```

#### 2. Configure Bucket Policy

**File**: `s3-bucket-policy.json`

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::play-learn-spark-content/*"
    }
  ]
}
```

Apply policy:
```bash
aws s3api put-bucket-policy --bucket play-learn-spark-content --policy file://s3-bucket-policy.json
```

#### 3. Enable CORS

**File**: `s3-cors-config.json`

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
}
```

Apply CORS:
```bash
aws s3api put-bucket-cors --bucket play-learn-spark-content --cors-configuration file://s3-cors-config.json
```

#### 4. Setup CloudFront Distribution

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name play-learn-spark-content.s3.amazonaws.com \
  --default-root-object index.json
```

#### 5. Upload Content

```bash
# Upload images
aws s3 sync ./assets/images s3://play-learn-spark-content/images/ --acl public-read

# Upload audio
aws s3 sync ./assets/audio s3://play-learn-spark-content/audio/ --acl public-read

# Upload videos
aws s3 sync ./assets/videos s3://play-learn-spark-content/videos/ --acl public-read
```

### Content Structure

```
s3://play-learn-spark-content/
├── images/
│   ├── activities/
│   │   ├── animal-safari.jpg
│   │   ├── color-rainbow.jpg
│   │   └── ...
│   ├── badges/
│   │   ├── first-steps.png
│   │   └── ...
│   └── characters/
│       └── ...
├── audio/
│   ├── sounds/
│   │   ├── success.mp3
│   │   ├── tap.mp3
│   │   └── ...
│   ├── music/
│   │   └── background.mp3
│   └── voice/
│       ├── en/
│       ├── ml/
│       └── ar/
├── videos/
│   └── tutorials/
│       └── ...
└── manifest.json
```

### Manifest File

**File**: `manifest.json`

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-12-31T00:00:00Z",
  "baseUrl": "https://d1234567.cloudfront.net",
  "content": {
    "images": {
      "activities": [
        {
          "id": "animal-safari",
          "url": "/images/activities/animal-safari.jpg",
          "size": 245678,
          "checksum": "abc123..."
        }
      ],
      "badges": [
        {
          "id": "first-steps",
          "url": "/images/badges/first-steps.png",
          "size": 12345,
          "checksum": "def456..."
        }
      ]
    },
    "audio": {
      "sounds": [
        {
          "id": "success",
          "url": "/audio/sounds/success.mp3",
          "size": 34567,
          "checksum": "ghi789..."
        }
      ]
    },
    "videos": [
      {
        "id": "intro",
        "url": "/videos/tutorials/intro.mp4",
        "size": 5678901,
        "checksum": "jkl012..."
      }
    ]
  }
}
```

---

## Option 2: Simple Node.js Server (Alternative)

If you prefer a simple backend server:

### Setup

#### 1. Create Project

```bash
mkdir play-learn-spark-static-server
cd play-learn-spark-static-server
npm init -y
```

#### 2. Install Dependencies

```bash
npm install express cors helmet compression morgan dotenv
```

#### 3. Server Code

**File**: `server.js`

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(compression());
app.use(morgan('combined'));

// Serve static files
app.use('/images', express.static(path.join(__dirname, 'content/images'), {
  maxAge: '30d',
  immutable: true
}));

app.use('/audio', express.static(path.join(__dirname, 'content/audio'), {
  maxAge: '30d',
  immutable: true
}));

app.use('/videos', express.static(path.join(__dirname, 'content/videos'), {
  maxAge: '7d'
}));

// Manifest endpoint
app.get('/manifest.json', (req, res) => {
  res.json(require('./manifest.json'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Static content server running on port ${PORT}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, 'content')}`);
});
```

#### 4. Package.json

**File**: `package.json`

```json
{
  "name": "play-learn-spark-static-server",
  "version": "1.0.0",
  "description": "Static content server for Play & Learn Spark mobile app",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "keywords": ["static", "cdn", "content"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

#### 5. Environment Variables

**File**: `.env`

```env
PORT=3000
NODE_ENV=production
```

#### 6. Dockerfile

**File**: `Dockerfile`

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

#### 7. Docker Compose

**File**: `docker-compose.yml`

```yaml
version: '3.8'

services:
  static-server:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./content:/app/content:ro
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
```

---

## Mobile App Integration

### Flutter HTTP Client

**File**: `lib/services/content_service.dart`

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class ContentService {
  static const String baseUrl = 'https://your-cdn-url.com';
  
  Future<Map<String, dynamic>> fetchManifest() async {
    final response = await http.get(Uri.parse('$baseUrl/manifest.json'));
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load manifest');
    }
  }

  Future<void> downloadContent(String url, String localPath) async {
    final response = await http.get(Uri.parse('$baseUrl$url'));
    
    if (response.statusCode == 200) {
      final file = File(localPath);
      await file.writeAsBytes(response.bodyBytes);
    } else {
      throw Exception('Failed to download content');
    }
  }

  String getContentUrl(String path) {
    return '$baseUrl$path';
  }
}
```

### Usage in App

```dart
// Load image from CDN
CachedNetworkImage(
  imageUrl: contentService.getContentUrl('/images/activities/animal-safari.jpg'),
  placeholder: (context, url) => CircularProgressIndicator(),
  errorWidget: (context, url, error) => Icon(Icons.error),
)
```

---

## Deployment Options

### AWS S3 + CloudFront
- **Cost**: ~$5-10/month for small apps
- **Scalability**: Excellent
- **Setup**: Medium complexity

### DigitalOcean Spaces + CDN
- **Cost**: $5/month + bandwidth
- **Scalability**: Good
- **Setup**: Easy

### Cloudflare R2 + CDN
- **Cost**: Free tier available
- **Scalability**: Excellent
- **Setup**: Easy

### Vercel/Netlify
- **Cost**: Free tier available
- **Scalability**: Good
- **Setup**: Very easy

---

## Content Management

### Upload Script

**File**: `upload-content.sh`

```bash
#!/bin/bash

BUCKET="play-learn-spark-content"
REGION="us-east-1"

echo "📦 Uploading content to S3..."

# Upload images
aws s3 sync ./content/images s3://$BUCKET/images/ \
  --acl public-read \
  --cache-control max-age=2592000 \
  --region $REGION

# Upload audio
aws s3 sync ./content/audio s3://$BUCKET/audio/ \
  --acl public-read \
  --cache-control max-age=2592000 \
  --region $REGION

# Upload videos
aws s3 sync ./content/videos s3://$BUCKET/videos/ \
  --acl public-read \
  --cache-control max-age=604800 \
  --region $REGION

# Upload manifest
aws s3 cp ./manifest.json s3://$BUCKET/manifest.json \
  --acl public-read \
  --cache-control max-age=300 \
  --region $REGION

echo "✅ Upload complete!"
```

### Content Optimization

```bash
# Install ImageMagick
brew install imagemagick  # macOS
apt-get install imagemagick  # Ubuntu

# Optimize images
for img in content/images/**/*.jpg; do
  convert "$img" -quality 85 -strip "$img"
done

for img in content/images/**/*.png; do
  pngquant --quality=80-90 --ext .png --force "$img"
done
```

---

## Monitoring

### CloudWatch (AWS)

- Monitor S3 request metrics
- Track CloudFront cache hit ratio
- Set up billing alerts

### Simple Analytics Script

```javascript
// log-analytics.js
const fs = require('fs');

function logAccess(req) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent')
  };
  
  fs.appendFileSync(
    'access.log',
    JSON.stringify(logEntry) + '\n'
  );
}

module.exports = logAccess;
```

---

## Security

1. **Enable HTTPS only**
2. **Set proper CORS headers**
3. **Use signed URLs for premium content** (if needed)
4. **Rate limiting** (CloudFront/API Gateway)
5. **Content validation** (checksums in manifest)

---

## Cost Estimation

### S3 + CloudFront (AWS)

**Assumptions**:
- 1000 active users/month
- 50 MB content per user
- Total: 50 GB transfer/month

**Costs**:
- S3 storage (5 GB): ~$0.12/month
- CloudFront data transfer (50 GB): ~$4.25/month
- S3 requests: ~$0.50/month
- **Total**: ~$5-7/month

### Self-Hosted (DigitalOcean)

- Droplet: $6/month
- Spaces: $5/month
- CDN: $0.01/GB
- **Total**: ~$12-15/month

---

## Best Practices

1. ✅ Use CDN for all static content
2. ✅ Implement proper caching headers
3. ✅ Optimize images before upload
4. ✅ Use WebP format where possible
5. ✅ Implement lazy loading in app
6. ✅ Version your manifest file
7. ✅ Monitor bandwidth usage
8. ✅ Set up automated backups

---

## Conclusion

Choose the deployment method based on your needs:

- **For simplicity**: S3 + CloudFront (Option 1)
- **For control**: Self-hosted Node.js server (Option 2)
- **For budget**: Cloudflare R2 or Vercel

All options provide the same functionality to the mobile app - serving static content efficiently and reliably.
