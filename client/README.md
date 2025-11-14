# Wardobie - Virtual Wardrobe Frontend

An AI-powered virtual wardrobe application that helps you organize your clothes and get outfit suggestions.

## Features

### Phase 1: Core Flow
- ✅ **Google OAuth Login** - Sign in with your Google account
- ✅ **Persistent Login** - Stay logged in across sessions
- ✅ **Image Upload** - Upload multiple clothing photos with drag-and-drop
- ✅ **S3 Upload** - Direct upload to S3 with progress tracking
- ✅ **Processing Status** - Real-time polling for AI analysis completion

### Phase 2: Review & Wardrobe
- ✅ **Review Pending Items** - View and approve AI-analyzed items
- ✅ **Edit Attributes** - Correct category, colors, pattern, and formality
- ✅ **Approve Items** - Add items to your wardrobe
- ✅ **Reject Items** - Remove incorrectly analyzed items
- ✅ **Wardrobe View** - Browse all approved items
- ✅ **Category Filtering** - Filter by tops, bottoms, dresses, shoes, outerwear

### Phase 3: Outfits
- ✅ **Occasion Selection** - Choose from Casual Friday, Date Night, Business Meeting, Weekend Casual
- ✅ **Generate Outfits** - AI-powered outfit combinations
- ✅ **Save Outfits** - Bookmark your favorite combinations
- ✅ **View Saved Outfits** - Access your saved outfit library

### Phase 4: Polish
- ✅ **Navigation** - Responsive header with mobile menu
- ✅ **Loading States** - Spinners and skeleton screens
- ✅ **Error Handling** - User-friendly error messages with retry options
- ✅ **Item Details** - Modal view with full item information
- ✅ **Edit Wardrobe Items** - Modify items after approval
- ✅ **Delete Items** - Remove items from wardrobe
- ✅ **Logout** - Secure sign out

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **@react-oauth/google** - Google authentication

## Prerequisites

- Node.js 18+ and npm
- Google OAuth 2.0 credentials
- Backend API running (see backend repository)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_API_BASE_URL=http://localhost:3000/api
```

#### Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized JavaScript origins:
   - `http://localhost:5173` (for development)
   - Your production domain
6. Copy the Client ID to your `.env` file

### 3. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Project Structure

```
src/
├── components/
│   ├── auth/              # Authentication components
│   ├── common/            # Reusable UI components
│   ├── upload/            # Upload flow components
│   ├── review/            # Review flow components
│   ├── wardrobe/          # Wardrobe components
│   └── outfits/           # Outfit generation components
├── pages/                 # Page components
├── contexts/              # React contexts
├── hooks/                 # Custom hooks
├── services/              # API services
└── utils/                 # Utility functions
```

## API Integration

The app expects a backend API with the following endpoints:

- Authentication: `/api/auth/google`, `/api/auth/me`
- Uploads: `/api/uploads/*`
- Clothing Items: `/api/clothing-items/*`
- Wardrobe: `/api/wardrobe/*`
- Outfits: `/api/outfits/*`

See the full API documentation in the backend repository.

## Development

This project was created with Vite and uses:
- Fast HMR (Hot Module Replacement)
- ESLint for code quality
- Tailwind CSS for styling
- React Router for navigation

## License

[Your License Here]
