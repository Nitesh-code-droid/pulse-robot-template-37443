# Google OAuth Quick Fix Guide

## Step 1: Google Cloud Console (5 minutes)

1. Go to https://console.cloud.google.com/
2. Create new project or select existing
3. Go to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth 2.0 Client IDs"
5. Application type: **Web application**
6. Name: **Pulse App**
7. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   http://localhost:5173
   https://mtpndckrfzkctusscyoi.supabase.co
   ```
8. **Authorized redirect URIs:**
   ```
   https://mtpndckrfzkctusscyoi.supabase.co/auth/v1/callback
   ```
9. Click **Create** and copy Client ID & Secret

## Step 2: Supabase Dashboard (2 minutes)

1. Go to https://supabase.com/dashboard/project/mtpndckrfzkctusscyoi
2. Authentication > Providers
3. Find **Google** and click **Configure**
4. Toggle **Enable Google provider** to ON
5. Paste your **Client ID** and **Client Secret**
6. Click **Save**

## Step 3: Test

1. Go to your login page
2. Select "Student" tab
3. Click "Continue with Google"
4. Should redirect to Google OAuth

## Common Issues

- **"redirect_uri_mismatch"**: Check redirect URI matches exactly
- **"invalid_client"**: Check Client ID/Secret are correct
- **Button doesn't work**: Check browser console for errors
- **"OAuth not configured"**: Complete Step 2 in Supabase dashboard
