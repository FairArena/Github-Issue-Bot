# GitHub Issue Bot

AI-powered issue summarization and chatbot for your GitHub repositories.

## Features

- 🤖 **Auto-summarize issues** - Get instant AI-generated summaries of new issues
- 💬 **Chatbot assistance** - Ask questions about your codebase in issue comments
- 🏷️ **Quality labeling** - Automatically label issues by quality (high-quality, needs-info, likely-spam)
- 🔍 **Context-aware** - Uses repository code context for accurate responses

## Quick Start

### 1. Install the GitHub App

1. Go to [GitHub App Installation URL] (you'll create this after registering the app)
2. Select the repositories you want to enable the bot on
3. Authorize the installation

### 2. Set Up Appwrite

1. Create an Appwrite Cloud project at https://cloud.appwrite.io
2. Note your Project ID and API endpoint
3. Create an API key with full permissions

### 3. Set Up Pinecone

1. Create a free account at https://www.pinecone.io
2. Create an index named `github-repos` with:
   - Dimensions: 768
   - Metric: cosine
3. Get your API key

### 4. Get API Keys

- **OpenRouter**: Sign up at https://openrouter.ai (free tier available)
- **Gemini**: Get API key from https://makersuite.google.com/app/apikey

### 5. Deploy Functions

```bash
# Install Appwrite CLI
npm install -g appwrite

# Login
appwrite login

# Deploy
appwrite deploy
```

### 6. Configure Environment Variables

Set these in your Appwrite function settings:

**github-webhook:**

- `GITHUB_WEBHOOK_SECRET` - From GitHub App settings
- `APPWRITE_ENDPOINT` - Your Appwrite endpoint
- `APPWRITE_PROJECT_ID` - Your project ID
- `APPWRITE_API_KEY` - Your API key
- `AI_PROCESSOR_FUNCTION_ID` - ID of ai-processor function

**ai-processor:**

- `OPENROUTER_API_KEY` - Your OpenRouter API key
- `GEMINI_API_KEY` - Your Gemini API key
- `PINECONE_API_KEY` - Your Pinecone API key
- `PINECONE_INDEX` - `github-repos`
- `GITHUB_APP_ID` - From GitHub App settings
- `GITHUB_PRIVATE_KEY` - From GitHub App settings (PEM format)
- `APPWRITE_ENDPOINT` - Your Appwrite endpoint
- `APPWRITE_PROJECT_ID` - Your project ID
- `APPWRITE_API_KEY` - Your API key

### 7. Register GitHub App

1. Go to https://github.com/settings/apps/new
2. Use the manifest.json or fill in:
   - **Webhook URL**: `https://[your-appwrite-endpoint]/v1/functions/[github-webhook-id]/executions`
   - **Permissions**: Issues (R/W), Contents (R), Metadata (R)
   - **Events**: Issues, Issue comments, Installation
3. Generate a private key and save it
4. Note your App ID

### 8. Deploy Frontend

Upload the `frontend/` directory to Appwrite Storage or any static hosting service.

Update `dashboard.js` with your Appwrite endpoint and project ID.

## Usage

### Auto-Summarization

When a new issue is created, the bot will automatically post a comment with:

- One-sentence summary
- Key details extracted
- Quality assessment (if enabled)

### Chatbot

Mention the bot in any issue comment to ask questions:

```
@github-issue-bot How does the authentication system work?
```

The bot will search your codebase and provide context-aware answers.

### Dashboard

Visit your dashboard to:

- Toggle features per repository
- View recent activity
- Trigger manual repository indexing

## Architecture

- **github-webhook**: Receives GitHub events, verifies signatures, routes to AI processor
- **ai-processor**: Generates summaries and replies using OpenRouter + Gemini + Pinecone
- **Frontend**: Simple dashboard for managing settings

## Tech Stack

- **Backend**: Appwrite Functions (Node.js 18)
- **AI**: OpenRouter (free LLMs), Gemini (embeddings)
- **Vector DB**: Pinecone
- **Database**: Appwrite Database
- **Frontend**: Vanilla HTML/CSS/JS

## Cost

- Appwrite Cloud: Free tier (up to 75k executions/month)
- OpenRouter: Free tier available
- Gemini: Free tier (15 requests/minute)
- Pinecone: Free tier (1 index, 100k vectors)

**Total**: $0/month for small-scale usage

## License

MIT

## Support

Open an issue or contact [your email/discord]
