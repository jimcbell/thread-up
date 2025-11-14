# Wardobie Backend - API Documentation

Complete API reference for all endpoints.

## Base URL

```
Development: http://localhost:3001/api
Production: https://api.yourdomain.com/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### Health Check

#### GET /health

Check server status (no auth required).

**Response 200:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:00:00.000Z"
}
```

---

## Authentication Endpoints

### POST /auth/google

Authenticate user with Google OAuth token.

**Request Body:**
```json
{
  "googleToken": "ya29.a0AfH6SMBx..."
}
```

**Response 200:**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "picture": "https://lh3.googleusercontent.com/..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- 400: Missing Google token
- 401: Invalid Google token
- 500: Database error

---

### GET /auth/me

Get current user profile (protected).

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "picture": "https://lh3.googleusercontent.com/..."
  }
}
```

**Errors:**
- 401: Invalid/missing/expired token
- 404: User not found

---

## Upload Endpoints

### POST /uploads/start

Initialize upload session and get S3 signed URLs (protected).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "image_count": 5
}
```

**Response 200:**
```json
{
  "upload_id": "650e8400-e29b-41d4-a716-446655440000",
  "signed_urls": [
    {
      "image_id": "750e8400-e29b-41d4-a716-446655440000",
      "url": "https://bucket.s3.amazonaws.com/uploads/user-id/upload-id/image-id.jpg?signature=...",
      "s3_key": "uploads/user-id/upload-id/image-id.jpg"
    }
  ]
}
```

**Errors:**
- 400: Invalid image_count (must be 1-10)
- 401: Unauthorized
- 500: S3 or database error

---

### POST /uploads/:id/complete

Mark upload as complete and trigger processing (protected).

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "status": "processing"
}
```

**Errors:**
- 400: Upload not in 'uploading' state
- 401: Unauthorized
- 403: Upload belongs to different user
- 404: Upload not found

---

### GET /uploads/:id/status

Check upload processing status (protected).

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "upload_id": "650e8400-e29b-41d4-a716-446655440000",
  "status": "ready_for_review",
  "image_count": 5,
  "processed_count": 5,
  "items_pending_review": 5,
  "created_at": "2025-01-15T10:00:00.000Z",
  "updated_at": "2025-01-15T10:02:30.000Z",
  "error_message": null
}
```

**Status Values:**
- `uploading` - Initial state
- `processing` - Images being analyzed
- `ready_for_review` - Analysis complete
- `completed` - All items reviewed
- `error` - Processing failed

**Errors:**
- 401: Unauthorized
- 403: Upload belongs to different user
- 404: Upload not found

---

## Clothing Items Endpoints

### GET /clothing-items/pending

Get all items pending review (protected).

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
[
  {
    "id": "850e8400-e29b-41d4-a716-446655440000",
    "s3_url": "https://bucket.s3.amazonaws.com/uploads/.../image.jpg",
    "category": "top",
    "colors": ["blue", "white"],
    "pattern": "striped",
    "formality_level": "casual",
    "created_at": "2025-01-15T10:30:00.000Z"
  }
]
```

**Errors:**
- 401: Unauthorized
- 500: Database error

---

### PATCH /clothing-items/:id

Update item attributes or approval status (protected).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (all fields optional):**
```json
{
  "category": "top",
  "colors": ["navy", "white"],
  "pattern": "solid",
  "formality_level": "business_casual",
  "status": "approved"
}
```

**Valid Values:**
- `category`: top, bottom, dress, shoes, outerwear
- `pattern`: solid, striped, floral, plaid, printed, other
- `formality_level`: casual, business_casual, formal
- `status`: pending_review, approved, rejected

**Response 200:**
```json
{
  "success": true,
  "item": {
    "id": "850e8400-e29b-41d4-a716-446655440000",
    "category": "top",
    "colors": ["navy", "white"],
    "pattern": "solid",
    "formality_level": "business_casual",
    "status": "approved",
    "updated_at": "2025-01-15T10:35:00.000Z"
  }
}
```

**Errors:**
- 400: Invalid field values
- 401: Unauthorized
- 403: Item belongs to different user
- 404: Item not found

---

### DELETE /clothing-items/:id

Delete clothing item (protected).

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true
}
```

**Errors:**
- 401: Unauthorized
- 403: Item belongs to different user
- 404: Item not found

---

## Wardrobe Endpoints

### GET /wardrobe

Get all approved items, optionally filtered by category (protected).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `category` (optional): top, bottom, dress, shoes, outerwear

**Example:**
```
GET /wardrobe?category=top
```

**Response 200:**
```json
[
  {
    "id": "850e8400-e29b-41d4-a716-446655440000",
    "s3_url": "https://bucket.s3.amazonaws.com/uploads/.../image.jpg",
    "category": "top",
    "colors": ["blue", "white"],
    "pattern": "striped",
    "formality_level": "casual",
    "created_at": "2025-01-15T10:30:00.000Z"
  }
]
```

**Errors:**
- 400: Invalid category value
- 401: Unauthorized
- 500: Database error

---

## Outfit Endpoints

### POST /outfits/generate

Generate outfit suggestions for an occasion (protected).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "occasion": "casual_friday"
}
```

**Valid Occasions:**
- `casual_friday` → business_casual formality
- `date_night` → business_casual formality
- `business_meeting` → formal formality
- `weekend_casual` → casual formality

**Response 200:**
```json
{
  "outfits": [
    {
      "items": {
        "top": {
          "id": "...",
          "s3_url": "https://...",
          "category": "top",
          "colors": ["blue", "white"],
          "pattern": "striped"
        },
        "bottom": {
          "id": "...",
          "s3_url": "https://...",
          "category": "bottom",
          "colors": ["navy"],
          "pattern": "solid"
        },
        "shoes": {
          "id": "...",
          "s3_url": "https://...",
          "category": "shoes",
          "colors": ["brown"],
          "pattern": "solid"
        }
      }
    }
  ]
}
```

**Errors:**
- 400: Invalid occasion
- 401: Unauthorized
- 500: Database error

**Note:** Returns empty array if insufficient items for outfits.

---

### POST /outfits

Save outfit combination (protected).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "occasion": "casual_friday",
  "item_ids": {
    "top": "850e8400-e29b-41d4-a716-446655440000",
    "bottom": "950e8400-e29b-41d4-a716-446655440000",
    "shoes": "a50e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Response 200:**
```json
{
  "success": true,
  "outfit_id": "b50e8400-e29b-41d4-a716-446655440000"
}
```

**Errors:**
- 400: Invalid item IDs or missing required fields
- 401: Unauthorized
- 403: Items belong to different user
- 404: One or more items not found

---

### GET /outfits

Get all saved outfits (protected).

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
[
  {
    "id": "b50e8400-e29b-41d4-a716-446655440000",
    "occasion": "casual_friday",
    "items": {
      "top": {
        "id": "...",
        "s3_url": "https://...",
        "category": "top",
        "colors": ["blue", "white"],
        "pattern": "striped"
      },
      "bottom": { },
      "shoes": { }
    },
    "created_at": "2025-01-15T10:40:00.000Z"
  }
]
```

**Errors:**
- 401: Unauthorized
- 500: Database error

---

### DELETE /outfits/:id

Delete saved outfit (protected).

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true
}
```

**Errors:**
- 401: Unauthorized
- 403: Outfit belongs to different user
- 404: Outfit not found

---

## Error Response Format

All errors return consistent JSON:

```json
{
  "error": {
    "message": "User-friendly error message",
    "code": "ERROR_CODE"
  }
}
```

**Common Error Codes:**
- `NO_TOKEN` - Authorization header missing
- `INVALID_TOKEN` - JWT token invalid/expired
- `TOKEN_EXPIRED` - JWT token expired
- `FORBIDDEN` - Resource belongs to different user
- `NOT_FOUND` - Resource not found
- `INVALID_INPUT` - Validation failed
- `INTERNAL_ERROR` - Server error

---

## Rate Limiting

(Not implemented in MVP - add for production)

Recommended: 100 requests per 15 minutes per user.

---

## CORS

The API allows requests from configured frontend URL only.

**Allowed Methods:** GET, POST, PATCH, DELETE, OPTIONS

**Allowed Headers:** Authorization, Content-Type

---

## Testing Examples

### cURL Examples

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"googleToken":"YOUR_GOOGLE_TOKEN"}'
```

**Get Current User:**
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Start Upload:**
```bash
curl -X POST http://localhost:3001/api/uploads/start \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"image_count":3}'
```

**Get Pending Items:**
```bash
curl -X GET http://localhost:3001/api/clothing-items/pending \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Generate Outfits:**
```bash
curl -X POST http://localhost:3001/api/outfits/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"occasion":"casual_friday"}'
```

---

## Postman Collection

Import the following JSON to Postman for easy testing:

```json
{
  "info": {
    "name": "Wardobie API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Google Login",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\"googleToken\":\"{{GOOGLE_TOKEN}}\"}"
            },
            "url": "{{BASE_URL}}/auth/google"
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "BASE_URL",
      "value": "http://localhost:3001/api"
    }
  ]
}
```

---

## WebSocket Support

(Not implemented in MVP - add for real-time updates)

Potential future enhancement for real-time upload progress.
