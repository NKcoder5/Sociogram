#!/bin/bash

# Sociogram Frontend Deployment Script for Render
echo "🚀 Starting Sociogram frontend deployment for Render..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Set environment variables for production
echo "🌐 Setting production environment variables..."
export NODE_ENV=production
export VITE_API_URL=https://sociogram-n73b.onrender.com/api/v1
export VITE_SOCKET_URL=https://sociogram-n73b.onrender.com
export VITE_APP_NAME=Sociogram
export VITE_APP_VERSION=3.0.0

# Build the application
echo "🔨 Building application with production environment..."
npm run build:render

# Verify build output
if [ -d "dist" ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build output directory: dist"
    echo "📊 Build size:"
    du -sh dist/
    
    # Check if environment variables are properly embedded
    echo "🔍 Checking if API URL is properly configured..."
    if grep -r "sociogram-n73b.onrender.com" dist/ > /dev/null; then
        echo "✅ Production API URL found in build"
    else
        echo "❌ Production API URL not found in build - check environment variables"
    fi
else
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "🎉 Frontend deployment complete!"
echo "🔗 Backend URL: https://sociogram-n73b.onrender.com"
echo "🔗 Frontend URL: https://sociogram-1.onrender.com"
