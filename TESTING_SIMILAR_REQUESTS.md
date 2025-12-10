# Testing Similar Painting Request System

## Overview
The similar painting request system allows customers to request a custom painting similar to one that has been sold. This feature is automatically displayed when a painting is marked as "sold".

## How to Test

### Step 1: Mark a Painting as Sold
1. Go to the admin panel: https://victoriaocara-com.vercel.app/admin
2. Login with: admin@victoriaocara.com / AdminVictoria2024!
3. Navigate to "Manage Paintings"
4. Edit any existing painting
5. Check the "Sold" checkbox
6. Save the painting

### Step 2: Test the Request Form
1. Go to the gallery: https://victoriaocara-com.vercel.app/galerie
2. Find the sold painting (it will show "Sold" status)
3. Click on the painting to view details
4. You should see an orange "Request Similar Painting" button instead of "Add to Cart"
5. Click the button to open the request form

### Step 3: Fill Out the Request Form
The form includes:
- Customer name and contact information
- Preferred size options (same, smaller, larger, custom)
- Budget range
- Urgency level (low, medium, high)
- Additional message/preferences

### Step 4: View Requests in Admin
1. Go back to admin dashboard
2. Click "Similar Requests" 
3. View all submitted requests
4. Respond to requests by updating status, adding notes, estimated price, and delivery date

## Features Implemented

### Customer Side:
- ✅ Automatic detection of sold paintings
- ✅ "Request Similar Painting" button for sold items
- ✅ Comprehensive request form with all necessary fields
- ✅ Bilingual support (English/Romanian)
- ✅ Form validation and error handling
- ✅ Success notifications

### Admin Side:
- ✅ View all similar painting requests
- ✅ Request details with original painting info
- ✅ Status management (pending, contacted, in progress, completed, cancelled)
- ✅ Response system with notes and estimates
- ✅ Update API for managing requests

### Database:
- ✅ SimilarRequest model with all necessary fields
- ✅ Relationship to original sold painting
- ✅ Status tracking and timestamps
- ✅ Admin notes and estimates

## API Endpoints

- `GET /api/similar-requests` - Fetch all requests (admin only)
- `POST /api/similar-requests` - Create new request
- `PUT /api/similar-requests/[id]` - Update request (admin only)
- `DELETE /api/similar-requests/[id]` - Delete request (admin only)

## Translation Keys
All text is fully translated in both English and Romanian through the LanguageContext system.

## Status
✅ **COMPLETE** - The similar painting request system is fully implemented and ready for use.