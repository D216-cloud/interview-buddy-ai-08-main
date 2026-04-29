# Deploy Supabase Edge Function - Interview Chat

The interview-chat function needs to be deployed to Supabase to handle AI-powered interview questions.

## Prerequisites

1. **Supabase CLI installed**
   ```bash
   npm install -g supabase
   ```

2. **LOVABLE_API_KEY set up**
   - You need a valid API key for the AI service
   - This will be set in the Supabase project

## Deployment Steps

### Step 1: Login to Supabase CLI
```bash
supabase login
```

### Step 2: Deploy the Function
```bash
supabase functions deploy interview-chat
```

### Step 3: Set Environment Variables in Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `azngwtkqjokirocibtxb`
3. Go to **Settings → Functions**
4. Add the environment variable:
   - **Name:** `LOVABLE_API_KEY`
   - **Value:** Your Lovable AI API key

### Step 4: Verify Deployment

Check that the function is running:
```bash
supabase functions list
```

You should see `interview-chat` in the list.

## Testing the Function

Once deployed, the function will be available at:
```
https://azngwtkqjokirocibtxb.supabase.co/functions/v1/interview-chat
```

### Troubleshooting

**If you get CORS errors:**
- The function should automatically respond to OPTIONS requests
- Make sure CORS headers are set (✅ already configured)

**If you get "AI service not configured":**
- Check that LOVABLE_API_KEY environment variable is set in Supabase

**If you get "Rate limited" or "Credits exhausted":**
- Check your Lovable AI account for rate limits or credits

## What the Function Does

The `interview-chat` function:
1. Receives messages, domain, and difficulty level
2. Sends them to Lovable AI (google/gemini-3-flash-preview)
3. Streams back the AI response as server-sent events
4. Handles CORS properly for the frontend

---

**Quick Deploy Command:**
```bash
supabase functions deploy interview-chat
```

If you don't have Supabase CLI installed:
```bash
npm install -g supabase && supabase login && supabase functions deploy interview-chat
```
