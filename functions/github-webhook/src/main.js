import { verifySignature } from './utils/verify.js';
import { queueAIProcessor } from './queue.js';
import { handleInstallation } from './handlers/installation.js';

export default async ({ req, res, log, error }) => {
  try {
    // Verify GitHub signature
    const signature = req.headers['x-hub-signature-256'];
    const event = req.headers['x-github-event'];

    if (!verifySignature(req.bodyRaw, signature, process.env.GITHUB_WEBHOOK_SECRET)) {
      error('Invalid signature');
      return res.json({ error: 'Invalid signature' }, 401);
    }

    const payload = JSON.parse(req.bodyRaw);
    log(`Received ${event} event`);

    // Handle events
    switch (event) {
      case 'issues':
        if (payload.action === 'opened') {
          await queueAIProcessor({
            type: 'summarize',
            repo_id: payload.repository.id.toString(),
            repo_full_name: payload.repository.full_name,
            installation_id: payload.installation.id.toString(),
            issue_number: payload.issue.number,
            issue_title: payload.issue.title,
            issue_body: payload.issue.body || '',
            issue_user: payload.issue.user.login,
          });
        }
        break;

      case 'issue_comment':
        if (payload.action === 'created') {
          const comment = payload.comment.body.toLowerCase();
          // Check if bot is mentioned (will be @github-issue-bot or similar)
          if (comment.includes('@') || comment.includes('bot')) {
            await queueAIProcessor({
              type: 'reply',
              repo_id: payload.repository.id.toString(),
              repo_full_name: payload.repository.full_name,
              installation_id: payload.installation.id.toString(),
              issue_number: payload.issue.number,
              comment_id: payload.comment.id.toString(),
              comment_body: payload.comment.body,
              comment_user: payload.comment.user.login,
            });
          }
        }
        break;

      case 'installation':
      case 'installation_repositories':
        await handleInstallation(payload, event);
        break;

      default:
        log(`Unhandled event: ${event}`);
    }

    return res.json({ received: true }, 200);
  } catch (err) {
    error(`Error: ${err.message}`);
    // Still return 200 to GitHub to avoid retries
    return res.json({ error: 'Internal error' }, 200);
  }
};
