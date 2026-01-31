# Setup Guide

## Prerequisites

- GitHub account
- Appwrite Cloud account (or self-hosted)
- Pinecone account
- OpenRouter API key
- Gemini API key

## Step-by-Step Setup

### 1. Create Appwrite Project

1. Go to https://cloud.appwrite.io
2. Create a new project
3. Note your:
   - Project ID
   - API Endpoint (usually `https://cloud.appwrite.io/v1`)
4. Go to Settings → API Keys → Create API Key
   - Name: "GitHub Issue Bot"
   - Scopes: Select all
   - Save the key securely

### 2. Create Database Collections

Run these commands using Appwrite CLI or create manually in the console:

```bash
# Install CLI
npm install -g appwrite

# Login
appwrite login

# Create database
appwrite databases create --databaseId main --name "Main Database"

# Create collections (or use the appwrite.json file)
appwrite deploy collection
```

Alternatively, import the `appwrite.json` configuration.

### 3. Register GitHub App

1. Go to https://github.com/settings/apps/new
2. Fill in:
   - **Name**: GitHub Issue Bot (or your preferred name)
   - **Homepage URL**: Your frontend URL
   - **Webhook URL**: `https://cloud.appwrite.io/v1/functions/[WEBHOOK_FUNCTION_ID]/executions`
     - You'll get the function ID after deploying
   - **Webhook secret**: Generate a random string (save it)
   - **Permissions**:
     - Repository permissions:
       - Issues: Read & Write
       - Contents: Read
       - Metadata: Read
   - **Subscribe to events**:
     - Issues
     - Issue comments
     - Installation
     - Installation repositories
3. Create the app
4. Generate a private key (download the PEM file)
5. Note your App ID

### 4. Set Up Pinecone

1. Sign up at https://www.pinecone.io
2. Create a new index:
   - Name: `github-repos`
   - Dimensions: `768`
   - Metric: `cosine`
   - Cloud: `aws` (free tier)
   - Region: `us-east-1`
3. Get your API key from the dashboard

### 5. Get AI API Keys

**OpenRouter:**

1. Go to https://openrouter.ai
2. Sign up
3. Go to Keys → Create Key
4. Free models are available (llama-3.2-3b-instruct:free)

**Gemini:**

1. Go to https://makersuite.google.com/app/apikey
2. Create API key
3. Free tier: 15 requests/minute

### 6. Deploy Functions

```bash
# From project root
cd functions/github-webhook
npm install

cd ../ai-processor
npm install

# Deploy using Appwrite CLI
cd ../..
appwrite deploy function
```

Or manually:

1. Zip each function folder
2. Upload to Appwrite Console → Functions
3. Set runtime to Node.js 18
4. Set entrypoint to `src/main.js`

### 7. Configure Environment Variables

In Appwrite Console → Functions → [Function] → Settings → Variables:

**github-webhook:**

```
GITHUB_WEBHOOK_SECRET=your_webhook_secret
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
AI_PROCESSOR_FUNCTION_ID=your_ai_processor_function_id
```

**ai-processor:**

```
OPENROUTER_API_KEY=your_openrouter_key
GEMINI_API_KEY=your_gemini_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX=github-repos
GITHUB_APP_ID=your_github_app_id
GITHUB_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\nYour\nMultiline\nKey\n-----END RSA PRIVATE KEY-----
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
```

**Important**: For `GITHUB_PRIVATE_KEY`, replace actual newlines with `\n` in the environment variable.

### 8. Update GitHub App Webhook URL

1. Go to your GitHub App settings
2. Update Webhook URL with your deployed `github-webhook` function URL:
   - Format: `https://cloud.appwrite.io/v1/functions/[FUNCTION_ID]/executions`
3. Save

### 9. Deploy Frontend

**Option A: Appwrite Storage**

```bash
appwrite storage createBucket --bucketId frontend --name "Frontend"
appwrite storage createFile --bucketId frontend --file frontend/dashboard.html
appwrite storage createFile --bucketId frontend --file frontend/callback.html
appwrite storage createFile --bucketId frontend --file frontend/style.css
appwrite storage createFile --bucketId frontend --file frontend/dashboard.js
```

**Option B: Any static host** (Vercel, Netlify, GitHub Pages)

- Just upload the `frontend/` folder
- Update `dashboard.js` with your Appwrite credentials

### 10. Update Frontend Config

Edit `frontend/dashboard.js`:

```javascript
const client = new Client().setEndpoint('YOUR_APPWRITE_ENDPOINT').setProject('YOUR_PROJECT_ID');
```

### 11. Install on Repositories

1. Go to `https://github.com/apps/[your-app-name]/installations/new`
2. Select repositories
3. Install

### 12. Test

1. Create a new issue in an installed repository
2. Check if bot comments with summary
3. Comment mentioning the bot
4. Verify it replies

## Troubleshooting

**Bot not responding:**

- Check Appwrite function logs
- Verify webhook is being received (GitHub App → Advanced → Recent Deliveries)
- Check environment variables are set correctly

**"Repository not configured" error:**

- Check database has repository entry
- Verify installation was successful

**Pinecone errors:**

- Ensure index exists and has correct dimensions (768)
- Check API key is valid

**GitHub API errors:**

- Verify private key format (newlines as `\n`)
- Check App ID is correct
- Ensure app has correct permissions

## Next Steps

- Index your repositories (click "Index Repository" in dashboard)
- Customize AI prompts in `ai-processor/src/summarize.js` and `reply.js`
- Add custom labels to your repositories for quality detection
- Monitor usage in Appwrite and Pinecone dashboards
