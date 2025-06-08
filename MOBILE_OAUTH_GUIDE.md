# Mobile OAuth Troubleshooting Guide

## Changes Made

### 1. Enhanced OAuth Authentication (`app/appwrite/auth.ts`)

- Added mobile device detection
- Implemented redirect-based OAuth for mobile devices
- Added popup detection and fallback mechanisms
- Enhanced error handling with proper fallbacks

### 2. New OAuth Callback Route (`app/routes/auth/callback.tsx`)

- Dedicated route to handle OAuth redirects
- Proper user data storage for new users
- Handles both popup and redirect scenarios
- Mobile-friendly redirect handling

### 3. Improved Sign-in Component (`app/routes/root/sign-in.tsx`)

- Added loading states and error handling
- OAuth error detection from URL parameters
- Better user feedback during authentication

### 4. Mobile-Optimized Configuration

- Updated Vite config for mobile testing
- Added mobile-friendly meta tags
- CORS configuration for cross-origin requests

## Testing Steps

### Desktop Testing

1. Open http://localhost:5173/sign-in
2. Click "Sign in with Google"
3. Should work as before

### Mobile Testing

1. Find your computer's IP address from the terminal output (e.g., http://192.168.178.20:5173/)
2. On your mobile device, connect to the same WiFi network
3. Open the IP address in your mobile browser
4. Navigate to /sign-in
5. Try Google OAuth login

### Debug Console Commands

If you encounter issues, open browser console and run:

```javascript
// Check OAuth debug information
debugOAuth();

// Check if user is already authenticated
account
  .get()
  .then((user) => console.log("Current user:", user))
  .catch((err) => console.log("No user:", err));

// Clear OAuth redirect data
localStorage.removeItem("oauth_redirect_after_login");
```

## Appwrite Console Configuration Required

### 1. Platform Settings

In your Appwrite console:

1. Go to your project
2. Navigate to "Auth" → "Settings"
3. Add these domains to your allowed origins:
   - `http://localhost:5173` (development)
   - `http://192.168.178.20:5173` (mobile testing)
   - Your production domain

### 2. OAuth Provider Settings

1. Go to "Auth" → "Settings" → "OAuth2 Providers"
2. Configure Google OAuth:
   - Add redirect URLs:
     - `http://localhost:5173/auth/callback`
     - `http://192.168.178.20:5173/auth/callback`
     - Your production domain callback URL
   - Ensure mobile domains are included

### 3. Security Settings

1. Check "Security" settings in Appwrite console
2. Ensure session length is appropriate for mobile (e.g., 7 days)
3. Verify CORS settings allow your mobile testing IP

## Common Mobile OAuth Issues & Solutions

### Issue 1: Popup Blocked

**Solution**: Our code now detects mobile devices and uses redirect-based OAuth instead of popups.

### Issue 2: Session Not Persisting

**Solution**: Added proper session handling and localStorage for redirect tracking.

### Issue 3: Wrong Redirect URL

**Solution**: Created dedicated `/auth/callback` route that handles OAuth completion.

### Issue 4: CORS Errors

**Solution**: Updated Vite config and ensure Appwrite console has correct domains.

## Environment Variables Check

Ensure these are properly set in your `.env` file:

```
VITE_APPWRITE_API_ENDPOINT=your_endpoint
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_USERS_COLLECTION_ID=your_users_collection
VITE_APPWRITE_TRIPS_COLLECTION_ID=your_trips_collection
```

## Next Steps

1. Test on desktop to ensure nothing broke
2. Test on mobile using the network IP address
3. Check Appwrite console logs for any errors
4. Update production OAuth settings when deploying
