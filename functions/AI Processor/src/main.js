import { summarizeIssue } from './summarize.js';
import { generateReply } from './reply.js';
import { getRepoSettings } from './utils/db.js';

export default async ({ req, res, log, error }) => {
  try {
    const data = JSON.parse(req.bodyRaw);
    log(`Processing ${data.type} for ${data.repo_full_name}#${data.issue_number}`);

    // Get repository settings
    const settings = await getRepoSettings(data.repo_id);
    
    if (!settings) {
      log('Repository not found in database');
      return res.json({ error: 'Repository not configured' }, 404);
    }

    let result;
    
    if (data.type === 'summarize') {
      if (!settings.auto_summarize) {
        log('Auto-summarize disabled for this repo');
        return res.json({ skipped: true }, 200);
      }
      
      result = await summarizeIssue(data, settings);
    } else if (data.type === 'reply') {
      if (!settings.chatbot_enabled) {
        log('Chatbot disabled for this repo');
        return res.json({ skipped: true }, 200);
      }
      
      result = await generateReply(data, settings);
    } else {
      return res.json({ error: 'Unknown type' }, 400);
    }

    log('Processing complete');
    return res.json({ success: true, result }, 200);

  } catch (err) {
    error(`Error: ${err.message}`);
    return res.json({ error: err.message }, 500);
  }
};
