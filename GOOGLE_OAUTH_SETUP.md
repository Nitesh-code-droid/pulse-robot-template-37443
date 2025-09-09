# Google OAuth Setup Guide

## Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" 
   - Click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "Pulse Counselling App"
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `http://localhost:5173`
     - `https://mtpndckrfzkctusscyoi.supabase.co`
   - Authorized redirect URIs:
     - `https://mtpndckrfzkctusscyoi.supabase.co/auth/v1/callback`

5. Copy your Client ID and Client Secret

## Step 2: Supabase Dashboard Setup

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `mtpndckrfzkctusscyoi`
3. Go to Authentication > Providers
4. Find "Google" and click configure
5. Enable Google provider
6. Add your Google Client ID and Client Secret
7. Save configuration

## Step 3: Deploy Database Changes

Run these commands in your project directory:

```bash
# Deploy the migrations
supabase db push

# Or if you have supabase CLI locally:
npx supabase db push
```

## Step 4: Test the Flow

1. Start your development server
2. Go to login page
3. Select "Student" tab
4. Click "Continue with Google"
5. Should redirect to Google OAuth
6. After approval, should redirect back and log you in

## Troubleshooting

- Check browser console for errors
- Verify redirect URIs match exactly
- Ensure Google+ API is enabled
- Check Supabase logs in dashboard
