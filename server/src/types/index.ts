import { Request } from 'express';

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  google_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface GoogleUserData {
  email: string;
  name: string;
  picture: string;
  googleId: string;
}

// Upload types
export type UploadStatus = 'uploading' | 'processing' | 'ready_for_review' | 'completed' | 'error';

export interface Upload {
  id: string;
  user_id: string;
  status: UploadStatus;
  image_count: number;
  processed_count: number;
  error_message: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface UploadImage {
  id: string;
  upload_id: string;
  s3_key: string;
  s3_url: string;
  status: 'uploaded' | 'processing' | 'analyzed' | 'error';
  error_message: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface SignedUrl {
  image_id: string;
  url: string;
  s3_key: string;
}

// Clothing item types
export type Category = 'top' | 'bottom' | 'dress' | 'shoes' | 'outerwear';
export type Pattern = 'solid' | 'striped' | 'floral' | 'plaid' | 'printed' | 'other';
export type FormalityLevel = 'casual' | 'business_casual' | 'formal';
export type ItemStatus = 'pending_review' | 'approved' | 'rejected';

export interface ClothingItem {
  id: string;
  user_id: string;
  upload_image_id: string | null;
  s3_url: string;
  category: Category;
  colors: string[];
  pattern: Pattern;
  formality_level: FormalityLevel;
  status: ItemStatus;
  created_at: Date;
  updated_at: Date;
}

export interface ClothingItemUpdate {
  category?: Category;
  colors?: string[];
  pattern?: Pattern;
  formality_level?: FormalityLevel;
  status?: ItemStatus;
}

export interface AIAnalysis {
  category: Category;
  colors: string[];
  pattern: Pattern;
  formality_level: FormalityLevel;
}

// Outfit types
export type Occasion = 'casual_friday' | 'date_night' | 'business_meeting' | 'weekend_casual';

export interface Outfit {
  id: string;
  user_id: string;
  occasion: Occasion;
  item_ids: Record<string, string>;
  created_at: Date;
}

export interface OutfitItem {
  id: string;
  s3_url: string;
  category: Category;
  colors: string[];
  pattern: Pattern;
}

export interface GeneratedOutfit {
  items: {
    top?: OutfitItem | null;
    bottom?: OutfitItem | null;
    dress?: OutfitItem | null;
    shoes?: OutfitItem | null;
  };
}

// Request types
export interface AuthRequest extends Request {
  user?: User;
}

export interface AuthenticatedRequest extends Request {
  user: User;
}

// Error types
export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

// Response types
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    picture: string | null;
  };
  token: string;
}

export interface UploadStatusResponse {
  upload_id: string;
  status: UploadStatus;
  image_count: number;
  processed_count: number;
  items_pending_review: number;
  created_at: Date;
  updated_at: Date;
  error_message: string | null;
}
