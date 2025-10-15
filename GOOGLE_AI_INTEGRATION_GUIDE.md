# Google AI Studio Integration Guide

## 🤖 AI Configuration Setup

### Overview
The Play Learn Spark backend now supports **Google AI Studio (Gemini)** as the primary AI service for generating educational content and stories. This integration provides:

- 📝 **Content Generation**: Educational activities for children aged 3-6
- 📚 **Story Generation**: Age-appropriate stories with customizable length
- 🎨 **Image Prompt Generation**: Descriptions for child-friendly illustrations
- 🔄 **Fallback Support**: Automatic fallback to OpenAI if Google AI is unavailable

---

## 🔑 API Key Configuration

### 1. Get Your Google AI Studio API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Navigate to **API Keys** section
4. Create a new API key or use existing one
5. Copy the API key (format: `AIzaSy...`)

### 2. Local Development Setup

#### Option A: Environment File (Recommended)
Add to your `.env` file:
```bash
# Google AI Studio Configuration
GOOGLE_AI_API_KEY=AIzaSyAaWwtmv24UiNXEVsjwNLhNrlbTE6TEI08

# Other AI providers (optional)
OPENAI_API_KEY=
HUGGINGFACE_API_KEY=
ANTHROPIC_API_KEY=
```

#### Option B: Environment Variables
```bash
export GOOGLE_AI_API_KEY=AIzaSyAaWwtmv24UiNXEVsjwNLhNrlbTE6TEI08
```

---

## 🚀 Usage Examples

### Generate Educational Activity
```bash
curl -X POST http://localhost:3002/api/ai/generate-activity \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "animals",
    "ageGroup": "4-5",
    "language": "English",
    "activityType": "animals",
    "difficulty": "medium",
    "provider": "google"
  }'
```

### Generate Story
```bash
curl -X POST http://localhost:3002/api/ai/generate-story \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "friendship",
    "ageGroup": "3-4",
    "language": "English",
    "length": "short",
    "includeImages": true,
    "provider": "google"
  }'
```

---

## ☁️ Azure Deployment Configuration

### Terraform Variables
Update your `terraform.tfvars` file:

```hcl
# AI Service Configuration
google_ai_api_key = "AIzaSyAaWwtmv24UiNXEVsjwNLhNrlbTE6TEI08"

# Optional: Additional AI providers
openai_api_key      = ""
huggingface_api_key = ""
anthropic_api_key   = ""
```

### Environment Variables in Azure
The following environment variables are automatically configured in Azure App Service:

```bash
GOOGLE_AI_API_KEY=<your-api-key>
PORT=3002
NODE_ENV=production
DATABASE_TYPE=memory
CONTENT_SAFETY_ENABLED=true
```

---

## 🔧 Technical Implementation

### Service Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   AI Routes     │───▶│  Google AI       │───▶│   Gemini API    │
│   /api/ai/*     │    │  Service         │    │   (Primary)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                               │
                               ▼ (Fallback)
                       ┌──────────────────┐    ┌─────────────────┐
                       │   OpenAI         │───▶│   OpenAI API    │
                       │   Service        │    │   (Backup)      │
                       └──────────────────┘    └─────────────────┘
```

### Default Provider Priority
1. **Google AI Studio (Gemini)** - Primary service
2. **OpenAI GPT** - Automatic fallback
3. **Mock Content** - Final fallback for development

### Supported Models
- **Google AI**: Gemini Pro
- **Safety Settings**: Enabled for child-safe content
- **Temperature**: 0.7 (activities), 0.8 (stories)
- **Max Tokens**: 2048

---

## 🧪 Testing

### Run Test Script
```bash
# Make script executable
chmod +x test-google-ai.sh

# Run tests
./test-google-ai.sh
```

### Manual Testing
1. Start the server: `npm start`
2. Check health: `curl http://localhost:3002/health`
3. Test AI endpoint with the examples above

---

## 🔒 Security Considerations

### API Key Protection
- ✅ **Environment Variables**: Never commit API keys to version control
- ✅ **Azure Key Vault**: Consider using for production secrets
- ✅ **Terraform Sensitive**: API key variables marked as sensitive
- ✅ **Content Safety**: Google AI safety filters enabled

### Rate Limiting
- Google AI Studio has usage quotas
- Implement caching for frequently requested content
- Monitor API usage in Google AI Studio console

---

## 📊 Monitoring

### Application Insights (Azure)
- AI request success/failure rates
- Response times for content generation
- Error tracking and debugging

### Logging
```javascript
// Service logs include:
logger.info('Google AI Studio service initialized successfully');
logger.info('Successfully generated content using Google AI: ${content.title}');
logger.error('Google AI content generation failed:', error);
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. API Key Not Working
```bash
# Check environment variable
echo $GOOGLE_AI_API_KEY

# Verify .env file loading
grep GOOGLE_AI_API_KEY .env
```

#### 2. Service Unavailable
- Check Google AI Studio quota limits
- Verify API key permissions
- Check network connectivity

#### 3. Content Generation Fails
- Review safety settings
- Check prompt formatting
- Verify model availability

### Debug Mode
```bash
# Enable debug logging
LOG_LEVEL=debug npm start
```

---

## 📈 Next Steps

### Recommended Enhancements
1. **Caching**: Implement Redis caching for generated content
2. **Analytics**: Track content generation metrics
3. **A/B Testing**: Compare different AI providers
4. **Custom Models**: Fine-tune models for educational content
5. **Multi-language**: Expand language support beyond English

### Integration with Frontend
```javascript
// Example frontend usage
const generateActivity = async (params) => {
  const response = await fetch('/api/ai/generate-activity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...params,
      provider: 'google' // Use Google AI as default
    })
  });
  return response.json();
};
```

---

## 📞 Support

For issues with:
- **Google AI Studio**: [Google AI Documentation](https://ai.google.dev/docs)
- **Backend Integration**: Check server logs and Application Insights
- **Azure Deployment**: Review Terraform configuration and Azure portal

---

**✅ Google AI Studio integration is now fully configured and ready for production use!**