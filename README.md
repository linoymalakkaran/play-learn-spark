# Play Learn Spark 🌟

**An Interactive Educational Platform for Children (Ages 3-6)**

Play Learn Spark is a comprehensive learning application that makes education fun and engaging for young children. Our platform combines English, Mathematics, Science, and multilingual learning (Malayalam & Arabic) with AI-powered content generation.

## 🚀 Features

- **Multi-Subject Learning**: English vocabulary, Mathematics, Science experiments, and Good Habits
- **Multilingual Support**: Native language learning for Malayalam and Arabic
- **AI-Powered Content**: Generate custom activities from uploaded documents
- **Age-Appropriate Design**: Specifically designed for children aged 3-6
- **Progress Tracking**: Monitor learning progress and achievements
- **Interactive Activities**: Engaging games and exercises with sound effects
- **Parent Dashboard**: Tools for parents to track and guide learning

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ and npm installed ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Modern web browser with Web Audio API support

### Installation

```bash
# Clone the repository
git clone https://github.com/linoymalakkaran/play-learn-spark.git

# Navigate to the project directory
cd play-learn-spark

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:8080`

### Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript for robust component development
- **Vite** for fast development and building
- **TailwindCSS** for responsive, utility-first styling
- **Shadcn-UI** for accessible, customizable components
- **Framer Motion** for smooth animations
- **Web Audio API** for interactive sound effects

### Backend
- **Node.js** with Express.js
- **In-Memory Database** for development (SQLite for production)
- **Google AI Studio (Gemini)** as primary AI provider
- **Multiple AI Providers** (OpenAI, Hugging Face, Anthropic) for fallback
- **Docker** for containerization
- **Azure App Service** for hosting
- **JWT Authentication** for secure access

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── activities/      # Learning activities
│   ├── ui/             # Reusable UI components
│   └── common/         # Shared components
├── pages/              # Application pages
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── stores/             # State management
```

## 🚀 Deployment

### Frontend Deployment
The frontend can be deployed to various platforms:
- **Vercel**: Connect your GitHub repository for automatic deployments
- **Netlify**: Deploy with continuous integration
- **Azure Static Web Apps**: For integration with Azure backend services

### Backend Deployment (Planned)
- **Azure App Service**: Containerized backend deployment
- **MongoDB Atlas**: Cloud database hosting
- **Docker**: Containerization for consistent environments

## 📝 Development Roadmap

## 🤖 AI Integration

**Google AI Studio (Gemini) Integration**: Our platform now includes powerful AI-driven content generation using Google's latest Gemini models.

### Features
- **Educational Content Generation**: Create age-appropriate activities automatically
- **Story Generation**: Generate engaging stories for children
- **Multi-language Support**: Content generation in English with expandability
- **Safety First**: Built-in content safety filters for child-appropriate content

### Quick Setup
1. Get your API key from [Google AI Studio](https://aistudio.google.com/)
2. Add to `.env` file: `GOOGLE_AI_API_KEY=your-api-key-here`
3. Start the server and test AI endpoints

📖 **[Read the full Google AI Integration Guide](./GOOGLE_AI_INTEGRATION_GUIDE.md)** for detailed setup and usage instructions.

---

## � CI/CD & Deployment

This project includes automated GitHub Actions pipelines for continuous integration and deployment to Azure.

### Quick Deploy to Production
```bash
# Create and push to prod branch to trigger deployment
git checkout -b prod
git push origin prod
```

### Environments
- **Development**: Automatic deployment from `develop` branch
- **Production**: Automatic deployment from `prod` branch

📖 **[Getting Started with CI/CD](.github/GETTING_STARTED.md)** - 5-minute setup guide
📖 **[Complete Pipeline Documentation](.github/PIPELINE_README.md)** - Detailed pipeline documentation

## �📋 Additional Documentation

See [README-plan.md](./README-plan.md) for detailed implementation plans and technical specifications.

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines and submit pull requests for any improvements.

### Development Workflow
1. Fork the repository
2. Create feature branch from `develop`
3. Make changes and ensure tests pass
4. Submit PR to `develop` branch
5. After review, changes will auto-deploy to development environment

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions, please open an issue on GitHub or contact the development team.

---

**Made with ❤️ for young learners everywhere**
