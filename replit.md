# SocializeIn - Social Media Platform

## Overview
A full-stack social media platform built with React frontend and Express.js backend. Features include user authentication, posts, comments, real-time messaging with Socket.io, and file uploads with Cloudinary integration. Now enhanced with a professional landing page and advanced post reactions system.

## Recent Changes (2025-09-25)
- ✅ **Landing Page**: Complete professional landing page with modern design, responsive layout, app branding, and clear calls-to-action
- ✅ **Post Reactions**: Multiple emoji reactions system (❤️ 😂 😮 😢 👍) with real-time updates, toggle functionality, and reaction counts
- ✅ **Enhanced UI/UX**: Improved routing structure with landing page as default, conditional layout rendering
- ✅ **Backend Integration**: New reaction API endpoints, database models, and proper data population
- ✅ **Bug Fixes**: Fixed API URL issues, user ID comparison, and routing conflicts
- Configured for Replit environment with proper port handling and CORS configuration
- Updated Vite config to bind to 0.0.0.0:5000 with allowedHosts: true
- Created unified start script for both frontend and backend
- Set up workflow for development server and configured deployment settings

## Project Architecture
- **Frontend**: React + Vite + TailwindCSS (Port 5000)
- **Backend**: Express.js + Socket.io (Port 8000, localhost)
- **Database**: MongoDB (external Atlas connection)
- **File Storage**: Cloudinary for image/media uploads
- **Authentication**: JWT + bcryptjs
- **Real-time**: Socket.io for messaging

## Key Features
- **Landing Page**: Professional welcome page with app branding and feature highlights
- **Post Reactions**: Multiple emoji reactions (❤️ 😂 😮 😢 👍) with hover effects and detailed breakdowns
- **User Authentication**: Registration and login with JWT authentication
- **Post System**: Create posts with image uploads, comments, and traditional likes
- **Real-time Messaging**: Chat functionality with Socket.io integration
- **User Profiles**: Profile management and following system
- **Stories & Reels**: Media sharing features
- **Search & Explore**: Discovery and content exploration

## Environment Setup
- Uses existing MongoDB Atlas connection
- Cloudinary credentials for file uploads
- JWT secret for authentication
- All environment variables configured in backend/.env

## Development
- Run `node start.js` to start both frontend and backend servers
- Frontend accessible at port 5000
- Backend API at port 8000
- Hot reload enabled for both servers

## Deployment
- Configured for Replit autoscale deployment
- Builds frontend assets with `npm run build-frontend`
- Serves production app via Express static files
- Production API calls use relative paths