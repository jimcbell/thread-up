# Wardobie - Quick Start Guide

## Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` and add your Google OAuth Client ID:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_API_BASE_URL=http://localhost:3000/api
```

### 3. Start Development Server
```bash
npm run dev
```

Visit: `http://localhost:5173`

## Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add to Authorized JavaScript origins:
   - `http://localhost:5173`
6. Copy Client ID to `.env`

## User Stories Implemented

All user stories from the specification have been implemented:

### Epic 1: Authentication ✅
- [x] Story 1.1: Google OAuth Login
- [x] Story 1.2: Persistent Login
- [x] Story 1.3: Logout

### Epic 2: Upload & Processing ✅
- [x] Story 2.1: Select Images for Upload
- [x] Story 2.2: Upload Images to S3
- [x] Story 2.3: Wait for Processing with Polling
- [x] Story 2.4: Resume After Leaving During Processing

### Epic 3: Review & Approval ✅
- [x] Story 3.1: View Pending Items
- [x] Story 3.2: Edit Item Attributes
- [x] Story 3.3: Approve Items
- [x] Story 3.4: Reject Items

### Epic 4: Wardrobe Management ✅
- [x] Story 4.1: View All Wardrobe Items
- [x] Story 4.2: Filter Wardrobe by Category
- [x] Story 4.3: View Item Details
- [x] Story 4.4: Edit Item from Wardrobe
- [x] Story 4.5: Delete Item from Wardrobe

### Epic 5: Outfit Generation ✅
- [x] Story 5.1: Select Occasion
- [x] Story 5.2: View Generated Outfits
- [x] Story 5.3: Save Favorite Outfits
- [x] Story 5.4: View Saved Outfits
- [x] Story 5.5: Handle Insufficient Items for Outfits

### Epic 6: Navigation & Layout ✅
- [x] Story 6.1: Main Navigation
- [x] Story 6.2: Loading States
- [x] Story 6.3: Error Handling

## Project Structure

```
src/
├── components/
│   ├── auth/              # GoogleSignInButton
│   ├── common/            # Header, Loading, Modals, Errors, Toast
│   ├── upload/            # FileDropzone, ImagePreview, ProcessingStatus
│   ├── review/            # ItemReviewCard, EditableAttribute
│   ├── wardrobe/          # CategoryFilter, ItemCard, ItemDetailModal
│   └── outfits/           # OccasionSelector, OutfitCard
├── pages/                 # LandingPage, UploadPage, ReviewPage, etc.
├── contexts/              # AuthContext
├── hooks/                 # useUploadPolling
├── services/              # api.js (centralized API calls)
└── App.jsx                # Routes and providers
```

## Key Features

### 1. Authentication Flow
- Google OAuth integration
- JWT token stored in localStorage
- Persistent sessions across browser refreshes
- Automatic token validation on app load

### 2. Upload Flow
- Drag-and-drop file selection
- Multi-file upload (up to 10 images)
- File validation (type, size)
- Direct S3 upload with progress tracking
- Real-time processing status polling
- Resume support if user leaves page

### 3. Review Flow
- View AI-analyzed pending items
- Inline editing of all attributes
- Approve/reject with animations
- Category, colors, pattern, formality fields

### 4. Wardrobe Management
- Grid view of all items
- Filter by category (persisted in localStorage)
- Click to view item details in modal
- Edit and delete from modal

### 5. Outfit Generation
- Select occasion (Casual Friday, Date Night, Business Meeting, Weekend)
- AI-generated outfit combinations
- Save/unsave outfits
- Separate tab for saved outfits

## API Endpoints Required

Your backend must implement these endpoints:

```
POST   /api/auth/google              - Exchange Google token for JWT
GET    /api/auth/me                  - Verify session

POST   /api/uploads/start            - Get S3 signed URLs
POST   /api/uploads/:id/complete     - Notify upload complete
GET    /api/uploads/:id/status       - Poll processing status

GET    /api/clothing-items/pending   - Get items needing review
PATCH  /api/clothing-items/:id       - Update item
DELETE /api/clothing-items/:id       - Delete item

GET    /api/wardrobe                 - Get approved items
GET    /api/wardrobe/:id             - Get single item

POST   /api/outfits/generate         - Generate outfits
POST   /api/outfits/:id/save         - Save outfit
DELETE /api/outfits/:id              - Unsave outfit
GET    /api/outfits                  - Get saved outfits
```

## Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Customization

### Colors
Edit `tailwind.config.js` to change the primary color scheme.

### API Base URL
Update `VITE_API_BASE_URL` in `.env` to point to your backend.

### Supported File Types
Currently: JPG, JPEG, PNG, WebP (max 10MB each)

### Polling Configuration
Edit `src/hooks/useUploadPolling.js`:
- Poll interval: 3 seconds (default)
- Timeout: 5 minutes (default)

## Troubleshooting

### "Google OAuth not working"
- Check that VITE_GOOGLE_CLIENT_ID is set correctly
- Verify localhost:5173 is in authorized origins
- Clear browser cache and localStorage

### "Cannot connect to API"
- Ensure backend is running
- Check VITE_API_BASE_URL in .env
- Verify CORS is enabled on backend

### "Build fails"
- Delete node_modules and run npm install
- Clear Vite cache: rm -rf node_modules/.vite

## Production Deployment

1. Update `.env.production` with production values
2. Run `npm run build`
3. Deploy `dist/` folder to your hosting provider
4. Update Google OAuth authorized origins with production URL

## Next Steps

1. Set up backend API (see backend repository)
2. Configure S3 bucket for image storage
3. Integrate AI service for clothing analysis
4. Deploy to production

## Support

For issues or questions:
- Check the main README.md
- Review user stories specification
- Open an issue on GitHub
