# Pull Request Checklist

## 📋 Dynamic Data Policy Compliance

**CRITICAL: All data must be 100% dynamic and database-driven**

### ✅ Static Data Elimination
- [ ] **No static data** - All hardcoded arrays, objects, and mock data removed
- [ ] **No placeholder content** - Lorem ipsum, sample text, or demo content removed
- [ ] **No hardcoded URLs** - All images/media fetched from database or CDN
- [ ] **No mock users** - All user data comes from real database queries
- [ ] **No static counts** - Follower/following/post counts are dynamic
- [ ] **No hardcoded timestamps** - All dates/times are real and dynamic

### 🔄 Dynamic Implementation
- [ ] **API integration** - All data fetched via proper API endpoints
- [ ] **Database queries** - Data sourced from database with proper relationships
- [ ] **Real-time updates** - Socket events for live data updates where applicable
- [ ] **Loading states** - Proper loading indicators while fetching data
- [ ] **Error handling** - Graceful error states for failed API calls
- [ ] **Empty states** - Proper handling when no data is available

### 🎯 User Journey Integration
- [ ] **Navigation flow** - Component integrates into complete user journey
- [ ] **State management** - Proper context/state updates across components
- [ ] **Route connections** - Links and navigation work with overall flow
- [ ] **Authentication** - Respects user auth state and permissions

### 🧪 Testing & Validation
- [ ] **Static data check passes** - `npm run check-static-data` returns clean
- [ ] **Manual testing** - Verified with real database data
- [ ] **Edge cases** - Tested with empty data, errors, and loading states
- [ ] **Cross-component** - Verified integration with other dynamic components

## 📝 Description

### What does this PR do?
<!-- Describe the changes and their purpose -->

### How does it maintain dynamic data policy?
<!-- Explain how this change ensures 100% dynamic data -->

### User journey impact
<!-- Describe how this fits into the overall user flow -->

## 🔗 User Journey Flow

### Entry Points
<!-- How do users reach this component/feature? -->
- [ ] From signup flow
- [ ] From profile page
- [ ] From feed/discover
- [ ] From notifications
- [ ] From messages
- [ ] Other: ___________

### Exit Points
<!-- Where can users go from here? -->
- [ ] To profile page
- [ ] To feed/discover
- [ ] To create post/reel
- [ ] To messages
- [ ] To notifications
- [ ] Other: ___________

## 🚀 Deployment Notes

- [ ] Database migrations included (if applicable)
- [ ] Environment variables documented (if applicable)
- [ ] API endpoints documented (if applicable)
- [ ] Socket events documented (if applicable)

## 📸 Screenshots/Demo

<!-- Add screenshots or GIFs showing the dynamic behavior -->

---

**⚠️ This PR will be automatically rejected if static data violations are detected by CI checks.**
