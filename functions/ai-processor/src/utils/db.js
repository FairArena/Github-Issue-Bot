import { Client, Databases, Query, ID } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

export async function getRepoSettings(repoId) {
  try {
    const docs = await databases.listDocuments(
      'main',
      'repositories',
      [Query.equal('repo_id', repoId)]
    );

    if (docs.documents.length === 0) {
      return null;
    }

    const doc = docs.documents[0];
    return {
      auto_summarize: doc.auto_summarize,
      chatbot_enabled: doc.chatbot_enabled,
      label_quality: doc.label_quality,
      pinecone_namespace: doc.pinecone_namespace
    };
  } catch (err) {
    console.error('Failed to get repo settings:', err.message);
    return null;
  }
}

export async function getConversationHistory(repoId, issueNumber, limit = 5) {
  try {
    const docs = await databases.listDocuments(
      'main',
      'issue_messages',
      [
        Query.equal('repo_id', repoId),
        Query.equal('issue_number', issueNumber),
        Query.orderDesc('$createdAt'),
        Query.limit(limit)
      ]
    );

    return docs.documents.map(doc => ({
      role: doc.role,
      content: doc.content
    })).reverse();
  } catch (err) {
    console.error('Failed to get conversation history:', err.message);
    return [];
  }
}

export async function saveMessage(data) {
  try {
    await databases.createDocument(
      'main',
      'issue_messages',
      ID.unique(),
      {
        repo_id: data.repo_id,
        issue_number: data.issue_number,
        role: data.role,
        content: data.content,
        github_comment_id: data.github_comment_id
      }
    );
  } catch (err) {
    console.error('Failed to save message:', err.message);
  }
}
