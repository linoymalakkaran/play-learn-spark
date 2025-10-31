#!/bin/bash

# Deploy container with proper Log Analytics integration
ENVIRONMENT=dev
RESOURCE_GROUP=play-learn-spark-${ENVIRONMENT}-rg
CONTAINER_NAME=play-learn-spark-${ENVIRONMENT}-backend
LOG_WORKSPACE_ID=818dbd94-83a6-4d2a-919e-a19c2fe5d48d
LOG_WORKSPACE_KEY=gaU4BeuIrYV/8lDe52Oq353VfEF21mqKdzmjokvD/WB+zIWu9AY+S9I4T52sAVdhUU6QqeDCT+nV4aYbwrIiEA==

echo "🗑️ Deleting existing container..."
az container delete --name $CONTAINER_NAME --resource-group $RESOURCE_GROUP --yes

echo "🚀 Creating new container with Log Analytics integration..."
az container create \
  --name $CONTAINER_NAME \
  --resource-group $RESOURCE_GROUP \
  --image ghcr.io/linoymalakkaran/play-learn-spark-backend:latest \
  --registry-login-server ghcr.io \
  --registry-username linoymalakkaran \
  --registry-password $GITHUB_TOKEN \
  --dns-name-label $CONTAINER_NAME \
  --ports 3000 \
  --os-type Linux \
  --cpu 1.0 \
  --memory 2.0 \
  --restart-policy OnFailure \
  --log-analytics-workspace $LOG_WORKSPACE_ID \
  --log-analytics-workspace-key $LOG_WORKSPACE_KEY \
  --environment-variables \
    NODE_ENV=$ENVIRONMENT \
    PORT=3000 \
    MONGODB_URI="mongodb+srv://playlearnspark_db_user:RGz0l3E44jXqyFog@cluster0.cmj1fjj.mongodb.net/playlearnspark?retryWrites=true&w=majority" \
    GOOGLE_AI_KEY="your_google_ai_key" \
    JWT_SECRET="your_jwt_secret"

echo "✅ Container created with Log Analytics integration"
echo "📋 New container IP:"
az container show --name $CONTAINER_NAME --resource-group $RESOURCE_GROUP --query "ipAddress.ip" --output tsv