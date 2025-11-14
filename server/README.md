# Wardobie Backend API

Complete backend implementation for the Virtual Wardrobe application with all user stories implemented.

## ✅ Implementation Status

**All 24 User Stories Implemented (100%)**

### Epic 1: Authentication & User Management ✅
- [x] Story 1.1: Google OAuth Integration
- [x] Story 1.2: JWT Token Validation Middleware
- [x] Story 1.3: Get Current User

### Epic 2: Upload Management ✅
- [x] Story 2.1: Initialize Upload Session
- [x] Story 2.2: Complete Upload and Trigger Processing
- [x] Story 2.3: Check Upload Status

### Epic 3: Background Processing ✅
- [x] Story 3.1: Polling Worker for Pending Uploads
- [x] Story 3.2: Process Individual Upload
- [x] Story 3.3: OpenAI Vision API Integration

### Epic 4: Clothing Items Management ✅
- [x] Story 4.1: Get Pending Items for Review
- [x] Story 4.2: Update Clothing Item Attributes
- [x] Story 4.3: Get User's Wardrobe
- [x] Story 4.4: Delete Clothing Item

### Epic 5: Outfit Generation ✅
- [x] Story 5.1: Generate Outfit Suggestions
- [x] Story 5.2: Outfit Matching Algorithm
- [x] Story 5.3: Save Outfit
- [x] Story 5.4: Get Saved Outfits
- [x] Story 5.5: Delete Saved Outfit

### Epic 6: Error Handling & Logging ✅
- [x] Story 6.1: Centralized Error Handler
- [x] Story 6.2: Request Logging

### Epic 7: Database & Performance ✅
- [x] Story 7.1: Database Connection Pooling
- [x] Story 7.2: Database Indexes

## Tech Stack

- **Node.js** with Express.js
- **PostgreSQL** with connection pooling
- **AWS S3** for image storage
- **OpenAI GPT-4 Vision** for image analysis
- **Google OAuth 2.0** for authentication
- **JWT** for session management

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- AWS Account with S3 bucket
- OpenAI API key
- Google OAuth credentials

## Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Set Up Database
```bash
# Create PostgreSQL database
createdb wardobie

# Run schema
npm run db:init
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 4. Start Server
```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

Server runs on http://localhost:3001

## Environment Variables

```env
# Server
PORT=3001
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/wardobie

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=wardobie-uploads

# OpenAI
OPENAI_API_KEY=sk-your-api-key

# JWT
JWT_SECRET=your-random-secret-min-32-characters
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# Frontend (CORS)
FRONTEND_URL=http://localhost:5173
```

## API Endpoints

### Authentication
```
POST   /api/auth/google        - Google OAuth login
GET    /api/auth/me            - Get current user
```

### Uploads
```
POST   /api/uploads/start      - Initialize upload session
POST   /api/uploads/:id/complete - Complete upload
GET    /api/uploads/:id/status - Check upload status
```

### Clothing Items
```
GET    /api/clothing-items/pending - Get pending items
PATCH  /api/clothing-items/:id     - Update item
DELETE /api/clothing-items/:id     - Delete item
```

### Wardrobe
```
GET    /api/wardrobe              - Get approved items
GET    /api/wardrobe?category=top - Filter by category
```

### Outfits
```
POST   /api/outfits/generate  - Generate outfits
POST   /api/outfits           - Save outfit
GET    /api/outfits           - Get saved outfits
DELETE /api/outfits/:id       - Delete outfit
```

### Health Check
```
GET    /api/health            - Server health status
```

## Project Structure

```
server/
├── db/
│   └── schema.sql                # Database schema
├── src/
│   ├── config/
│   │   ├── database.js          # PostgreSQL connection pool
│   │   └── aws.js               # AWS S3 client
│   ├── controllers/
│   │   ├── authController.js    # Auth handlers
│   │   ├── uploadController.js  # Upload handlers
│   │   ├── clothingController.js # Clothing handlers
│   │   └── outfitController.js  # Outfit handlers
│   ├── middleware/
│   │   ├── auth.js              # JWT validation
│   │   ├── errorHandler.js      # Error handling
│   │   └── requestLogger.js     # Request logging
│   ├── routes/
│   │   └── index.js             # All API routes
│   ├── services/
│   │   ├── authService.js       # Auth business logic
│   │   ├── uploadService.js     # Upload business logic
│   │   ├── clothingService.js   # Clothing business logic
│   │   └── outfitService.js     # Outfit business logic
│   ├── workers/
│   │   └── uploadProcessor.js   # Background worker
│   └── index.js                 # Server entry point
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Database Schema

**Tables:**
- `users` - User accounts
- `uploads` - Upload sessions
- `upload_images` - Individual uploaded images
- `clothing_items` - Analyzed clothing items
- `outfits` - Saved outfit combinations

See [db/schema.sql](db/schema.sql) for complete schema.

## Background Worker

The upload processor runs in the same process as the API server and:
1. Polls for uploads with status='processing' every 2 seconds
2. Downloads images from S3
3. Analyzes with OpenAI Vision API
4. Creates clothing_items records
5. Updates upload status to 'ready_for_review'

## Authentication Flow

1. Frontend sends Google OAuth token
2. Backend verifies token with Google
3. User created/retrieved from database
4. JWT token generated and returned
5. JWT used in Authorization header for all protected routes

## Upload Flow

1. Frontend requests signed URLs
2. Backend creates upload session and upload_images records
3. Frontend uploads directly to S3
4. Frontend notifies backend upload complete
5. Backend marks status='processing'
6. Background worker processes images
7. Frontend polls status until 'ready_for_review'

## Error Handling

All errors return consistent JSON format:
```json
{
  "error": {
    "message": "User-friendly message",
    "code": "ERROR_CODE"
  }
}
```

Status codes:
- 400: Bad Request (validation errors)
- 401: Unauthorized (auth errors)
- 403: Forbidden (permission errors)
- 404: Not Found
- 500: Internal Server Error

## Development

### Run with Auto-Reload
```bash
npm run dev
```

### Initialize Database
```bash
npm run db:init
```

### Test API with curl
```bash
# Health check
curl http://localhost:3001/api/health

# Login (need actual Google token)
curl -X POST http://localhost:3001/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"googleToken":"..."}'
```

## Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure production database
4. Set up S3 bucket with CORS
5. Configure environment variables

### S3 Bucket Configuration

CORS Configuration:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": ["https://yourdomain.com"],
    "ExposeHeaders": []
  }
]
```

Bucket Policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket/*"
    }
  ]
}
```

### Google OAuth Setup
1. Add production URLs to authorized origins
2. Add production URLs to redirect URIs

### Database Migrations
```bash
psql $DATABASE_URL -f db/schema.sql
```

## Performance Optimizations

- Connection pooling (20 connections)
- Database indexes on frequently queried columns
- Direct S3 uploads (not through backend)
- Background worker processes uploads asynchronously

## Cost Estimates

**Per 1000 Images:**
- OpenAI API: ~$10 (GPT-4 Vision)
- AWS S3 Storage: ~$0.023/GB/month
- AWS S3 Requests: ~$0.005

## Monitoring

Check logs for:
- Request timing
- Upload processing success/failure
- Worker errors
- Database connection issues

## Troubleshooting

### "Database connection error"
- Check DATABASE_URL is correct
- Ensure PostgreSQL is running
- Verify network connectivity

### "S3 upload fails"
- Check AWS credentials
- Verify S3 bucket exists
- Check bucket CORS configuration

### "OpenAI analysis fails"
- Verify OPENAI_API_KEY is valid
- Check API quota/billing
- Review image URL accessibility

### "Worker not processing"
- Check worker logs
- Verify uploads table has status='processing'
- Check OpenAI API connectivity

## Security Considerations

- JWT tokens expire after 7 days
- Google OAuth tokens verified server-side
- User isolation (can only access own data)
- SQL injection prevention (parameterized queries)
- CORS configured for frontend domain only

## License

[Your License]
