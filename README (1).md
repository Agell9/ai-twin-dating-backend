# AI Twin Dating SaaS Backend

Standalone Node.js backend API for AI Twin Dating platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY  
- OPENAI_API_KEY

3. Start server:
```bash
npm start
```

## API Endpoints

### User Profiles
- POST `/api/user/profile` - Create user profile
- GET `/api/user/profile/:user_id` - Get user profile
- PUT `/api/user/profile/:user_id` - Update user profile
- DELETE `/api/user/profile/:user_id` - Delete user profile

### Digital Twin
- POST `/api/twin/generate` - Generate AI twin
- GET `/api/twin/:user_id` - Get twin profile
- PUT `/api/twin/:user_id` - Update twin profile

### Compatibility
- POST `/api/compatibility/evaluate` - Generate compatibility evaluation
- GET `/api/compatibility/evaluation/:id` - Get evaluation

### Emotional Profiles
- POST `/api/emotional/profile` - Create emotional profile
- GET `/api/emotional/profile/:user_id` - Get emotional profile

### Deep Self Profiles
- POST `/api/deepself/profile` - Create deep self profile
- GET `/api/deepself/profile/:user_id` - Get deep self profile

### Matchmaking
- POST `/api/matchmaking/feed/:user_id` - Generate match feed
- GET `/api/matchmaking/feed/:user_id` - Get match feed

### Messages
- POST `/api/messages` - Send message
- GET `/api/messages/conversation/:user1/:user2` - Get conversation
- GET `/api/messages/conversations/:user_id` - Get conversations list
- PUT `/api/messages/read` - Mark messages as read

### Subscriptions
- POST `/api/subscription` - Create subscription
- GET `/api/subscription/:user_id` - Get user subscription
- PUT `/api/subscription/:subscription_id` - Update subscription
- DELETE `/api/subscription/:subscription_id` - Cancel subscription

### Health Check
- GET `/health` - Server health status

## Deployment

Ready for deployment on Render.com or similar platforms.