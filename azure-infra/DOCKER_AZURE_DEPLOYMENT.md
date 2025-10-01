# Play Learn Spark - Docker & Azure Deployment

## 🐳 Docker Setup

### Local Development with Docker

```bash
# Build and run with docker-compose
docker-compose up --build

# Access applications
# Frontend: http://localhost:80
# Backend: http://localhost:3001
```

### Individual Container Commands

```bash
# Frontend
docker build -t play-learn-spark-frontend .
docker run -p 80:80 play-learn-spark-frontend

# Backend
cd server
docker build -t play-learn-spark-backend .
docker run -p 3001:3001 play-learn-spark-backend
```

## ☁️ Azure Deployment

### Quick Deploy to Azure

```bash
cd azure-infra

# For Linux/Mac
chmod +x deploy.sh
./deploy.sh

# For Windows
deploy.bat
```

### Manual Deployment Steps

1. **Configure Variables**
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your settings
   ```

2. **Deploy Infrastructure**
   ```bash
   ./deploy.sh infra
   ```

3. **Build and Push Images**
   ```bash
   ./deploy.sh images
   ```

4. **Update App Services**
   ```bash
   ./deploy.sh update
   ```

### Azure Resources Created

- **Resource Group**: Contains all resources
- **Container Registry**: Stores Docker images
- **App Service Plan**: Hosting plan for applications
- **Frontend App Service**: React application with Nginx
- **Backend App Service**: Node.js API
- **Application Insights**: Monitoring and analytics

### Cost Estimates

- **Development**: $0-5/month (Free/Shared tier)
- **Production**: $20-50/month (Basic tier)

For detailed deployment instructions, see [azure-infra/README.md](azure-infra/README.md).

## 🔧 Environment Configuration

### Frontend Environment Variables

```env
REACT_APP_API_URL=https://your-backend-url
NODE_ENV=production
```

### Backend Environment Variables

```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-frontend-url
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │
│   (React/Nginx) │◄──►│   (Node.js)     │
│   Port 80       │    │   Port 3001     │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────┬───────────────┘
                 │
    ┌─────────────────────────┐
    │ Azure Container Registry│
    └─────────────────────────┘
```

## 📊 Monitoring

- **Application Insights**: Performance monitoring
- **App Service Logs**: Application logs and metrics
- **Health Checks**: `/health` endpoints for both apps

## 🛠️ Development

### Prerequisites

- Node.js 20+
- Docker
- Azure CLI (for deployment)
- Terraform (for infrastructure)

### Local Setup

1. **Install Dependencies**
   ```bash
   npm install
   cd server && npm install
   ```

2. **Run Development Servers**
   ```bash
   # Frontend
   npm run dev

   # Backend
   cd server && npm run dev
   ```

3. **Run with Docker**
   ```bash
   docker-compose up --build
   ```

### Deployment Commands

```bash
# Full deployment
./azure-infra/deploy.sh

# Infrastructure only
./azure-infra/deploy.sh infra

# Images only
./azure-infra/deploy.sh images

# Update services
./azure-infra/deploy.sh update

# Destroy resources
./azure-infra/deploy.sh destroy
```

## 📚 Documentation

- [Azure Deployment Guide](azure-infra/README.md)
- [Frontend Documentation](src/README.md)
- [Backend Documentation](server/README.md)