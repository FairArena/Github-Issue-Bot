import { callOpenRouter } from './openrouter.js';
import { createGitHubClient, postComment, addLabels } from './github.js';
import { saveMessage } from './utils/db.js';

const QUALITY_BUCKETS = {
  HIGH_QUALITY: 'high_quality',
  NEEDS_INFO: 'needs_info',
  LIKELY_SPAM: 'likely_spam'
};

const SUMMARIZE_PROMPT = `You are analyzing a GitHub issue. Extract:
1. Core problem (1 sentence)
2. Key details (bullet points)
3. Quality bucket (high_quality|needs_info|likely_spam)

Issue Title: {title}

Issue Body:
{body}

Format your response as:
## Summary
[1 sentence summary]

## Details
- [key point 1]
- [key point 2]
- [key point 3]

Quality: [bucket]`;

export async function summarizeIssue(data, settings) {
  const { repo_id, repo_full_name, installation_id, issue_number, issue_title, issue_body } = data;

  // Generate summary using OpenRouter
  const prompt = SUMMARIZE_PROMPT
    .replace('{title}', issue_title)
    .replace('{body}', issue_body || 'No description provided');

  const summary = await callOpenRouter(prompt, 'meta-llama/llama-3.2-3b-instruct:free');

  // Extract quality bucket from response
  const qualityMatch = summary.match(/Quality:\s*(high_quality|needs_info|likely_spam)/i);
  const quality = qualityMatch ? qualityMatch[1].toLowerCase() : QUALITY_BUCKETS.NEEDS_INFO;

  // Post comment with summary
  const github = await createGitHubClient(installation_id);
  const [owner, repo] = repo_full_name.split('/');

  const commentBody = `🤖 **Issue Summary**\n\n${summary.split('Quality:')[0].trim()}\n\n---\n*I'm an AI bot. Ask me questions about this repo by mentioning me in comments!*`;

  await postComment(github, owner, repo, issue_number, commentBody);

  // Add quality label if enabled
  if (settings.label_quality) {
    const labelMap = {
      [QUALITY_BUCKETS.HIGH_QUALITY]: '✅ high-quality',
      [QUALITY_BUCKETS.NEEDS_INFO]: '❓ needs-info',
      [QUALITY_BUCKETS.LIKELY_SPAM]: '⚠️ likely-spam'
    };

    const label = labelMap[quality];
    if (label) {
      try {
        await addLabels(github, owner, repo, issue_number, [label]);
      } catch (err) {
        console.error('Failed to add label:', err.message);
        // Don't fail if label doesn't exist
      }
    }
  }

  // Save to database
  await saveMessage({
    repo_id,
    issue_number,
    role: 'assistant',
    content: commentBody,
    github_comment_id: null // We don't get the comment ID back easily
  });

  return { summary, quality };
}
