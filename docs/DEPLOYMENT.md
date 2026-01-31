# Deployment Checklist

Use this checklist when deploying the GitHub Issue Bot.

## Pre-Deployment

- [ ] OpenRouter API key obtained
- [ ] Gemini API key obtained
- [ ] Pinecone account created
- [ ] Appwrite Cloud project created
- [ ] All environment variables documented

## Appwrite Setup

- [ ] Database `main` created
- [ ] Collection `installations` created with indexes
- [ ] Collection `repositories` created with indexes
- [ ] Collection `issue_messages` created with indexes
- [ ] API key created with full permissions

## Function Deployment

### github-webhook

- [ ] Function created in Appwrite
- [ ] Runtime set to Node.js 18
- [ ] Entrypoint set to `src/main.js`
- [ ] Code uploaded
- [ ] Environment variables configured:
  - [ ] GITHUB_WEBHOOK_SECRET
  - [ ] APPWRITE_ENDPOINT
  - [ ] APPWRITE_PROJECT_ID
  - [ ] APPWRITE_API_KEY
  - [ ] AI_PROCESSOR_FUNCTION_ID
- [ ] Function enabled
- [ ] Function URL copied

### ai-processor

- [ ] Function created in Appwrite
- [ ] Runtime set to Node.js 18
- [ ] Entrypoint set to `src/main.js`
- [ ] Timeout set to 300 seconds
- [ ] Code uploaded
- [ ] Environment variables configured:
  - [ ] OPENROUTER_API_KEY
  - [ ] GEMINI_API_KEY
  - [ ] PINECONE_API_KEY
  - [ ] PINECONE_INDEX
  - [ ] GITHUB_APP_ID
  - [ ] GITHUB_PRIVATE_KEY
  - [ ] APPWRITE_ENDPOINT
  - [ ] APPWRITE_PROJECT_ID
  - [ ] APPWRITE_API_KEY
- [ ] Function enabled

## Pinecone Setup

- [ ] Index `github-repos` created
- [ ] Dimensions set to 768
- [ ] Metric set to cosine
- [ ] API key copied

## GitHub App Registration

- [ ] App created at github.com/settings/apps/new
- [ ] App name set
- [ ] Homepage URL set
- [ ] Webhook URL set (github-webhook function URL)
- [ ] Webhook secret generated and saved
- [ ] Permissions configured:
  - [ ] Issues: Read & Write
  - [ ] Contents: Read
  - [ ] Metadata: Read
- [ ] Events subscribed:
  - [ ] Issues
  - [ ] Issue comments
  - [ ] Installation
  - [ ] Installation repositories
- [ ] Private key generated and downloaded
- [ ] App ID copied
- [ ] Webhook secret added to github-webhook env vars
- [ ] Private key added to ai-processor env vars (with \n)
- [ ] App ID added to ai-processor env vars

## Frontend Deployment

- [ ] `dashboard.js` updated with Appwrite credentials
- [ ] Files uploaded to hosting (Vercel/Netlify/Appwrite Storage)
- [ ] Frontend URL updated in GitHub App settings
- [ ] OAuth callback URL verified

## Testing

- [ ] Install app on test repository
- [ ] Create test issue
- [ ] Verify bot comments with summary
- [ ] Comment mentioning bot
- [ ] Verify bot replies
- [ ] Check dashboard loads
- [ ] Test settings toggles
- [ ] Verify activity log updates

## Go Live

- [ ] Install on 5 target repositories
- [ ] Monitor Appwrite function logs
- [ ] Monitor Pinecone usage
- [ ] Monitor OpenRouter usage
- [ ] Check for errors in first 24 hours

## Week 1 Monitoring

- [ ] Track number of issues summarized
- [ ] Track number of chatbot replies
- [ ] Monitor response accuracy
- [ ] Collect user feedback
- [ ] Check for false positives in quality detection
- [ ] Monitor API costs
- [ ] Check for any uninstalls

## Success Metrics

Target for Week 1:

- [ ] 5 repos installed
- [ ] 20+ issues summarized
- [ ] 10+ chatbot replies
- [ ] 0 uninstalls
- [ ] 3+ positive reactions

If metrics hit, proceed with:

- [ ] Auto-indexing on push
- [ ] Better context retrieval
- [ ] Multi-turn conversation memory
- [ ] Landing page
