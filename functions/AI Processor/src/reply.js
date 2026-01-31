import { callOpenRouter } from './openrouter.js';
import { createGitHubClient, postComment } from './github.js';
import { searchPinecone } from './pinecone.js';
import { getConversationHistory, saveMessage } from './utils/db.js';

const REPLY_PROMPT = `You are a helpful bot for the {repo_name} repository.
Answer the user's question using the provided code context.

Relevant code from the repository:
{context}

Recent conversation:
{conversation}

User's question:
{question}

Reply concisely and helpfully. If you don't know something, say so. Don't make up information.`;

export async function generateReply(data, settings) {
  const { repo_id, repo_full_name, installation_id, issue_number, comment_body, comment_user } = data;

  // Get conversation history
  const history = await getConversationHistory(repo_id, issue_number, 5);

  // Search Pinecone for relevant context
  const namespace = settings.pinecone_namespace || repo_full_name.replace('/', '_');
  const context = await searchPinecone(comment_body, namespace, 3);

  // Build context string
  const contextStr = context.length > 0
    ? context.map(c => `File: ${c.metadata.file_path}\n\`\`\`\n${c.metadata.content}\n\`\`\``).join('\n\n')
    : 'No relevant code found.';

  // Build conversation string
  const conversationStr = history.length > 0
    ? history.map(m => `${m.role === 'user' ? 'User' : 'Bot'}: ${m.content}`).join('\n')
    : 'No previous conversation.';

  // Generate reply
  const prompt = REPLY_PROMPT
    .replace('{repo_name}', repo_full_name)
    .replace('{context}', contextStr)
    .replace('{conversation}', conversationStr)
    .replace('{question}', comment_body);

  const reply = await callOpenRouter(prompt, 'meta-llama/llama-3.2-3b-instruct:free');

  // Post comment
  const github = await createGitHubClient(installation_id);
  const [owner, repo] = repo_full_name.split('/');

  const commentReply = `@${comment_user} ${reply}\n\n---\n*I'm an AI bot powered by repository context.*`;

  await postComment(github, owner, repo, issue_number, commentReply);

  // Save to database
  await saveMessage({
    repo_id,
    issue_number,
    role: 'user',
    content: comment_body,
    github_comment_id: data.comment_id
  });

  await saveMessage({
    repo_id,
    issue_number,
    role: 'assistant',
    content: commentReply,
    github_comment_id: null
  });

  return { reply };
}
