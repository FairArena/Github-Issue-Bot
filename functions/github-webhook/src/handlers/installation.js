import { Client, Databases, ID, Query } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

export async function handleInstallation(payload, event) {
  const installationId = payload.installation.id.toString();
  const accountLogin = payload.installation.account.login;
  const accountType = payload.installation.account.type;

  try {
    if (event === 'installation' && payload.action === 'created') {
      // Create installation record
      await databases.createDocument(
        'main',
        'installations',
        ID.unique(),
        {
          installation_id: installationId,
          account_login: accountLogin,
          account_type: accountType,
          repositories: payload.repositories?.map(r => r.id.toString()) || []
        }
      );

      // Create repository records
      if (payload.repositories) {
        for (const repo of payload.repositories) {
          await databases.createDocument(
            'main',
            'repositories',
            ID.unique(),
            {
              repo_id: repo.id.toString(),
              installation_id: installationId,
              full_name: repo.full_name,
              auto_summarize: true,
              chatbot_enabled: true,
              label_quality: false,
              pinecone_namespace: repo.full_name.replace('/', '_')
            }
          );
        }
      }
    } else if (event === 'installation' && payload.action === 'deleted') {
      // Delete installation and associated repos
      const docs = await databases.listDocuments(
        'main',
        'installations',
        [Query.equal('installation_id', installationId)]
      );

      if (docs.documents.length > 0) {
        await databases.deleteDocument('main', 'installations', docs.documents[0].$id);
      }

      // Delete repos
      const repos = await databases.listDocuments(
        'main',
        'repositories',
        [Query.equal('installation_id', installationId)]
      );

      for (const repo of repos.documents) {
        await databases.deleteDocument('main', 'repositories', repo.$id);
      }
    } else if (event === 'installation_repositories') {
      if (payload.action === 'added') {
        for (const repo of payload.repositories_added) {
          await databases.createDocument(
            'main',
            'repositories',
            ID.unique(),
            {
              repo_id: repo.id.toString(),
              installation_id: installationId,
              full_name: repo.full_name,
              auto_summarize: true,
              chatbot_enabled: true,
              label_quality: false,
              pinecone_namespace: repo.full_name.replace('/', '_')
            }
          );
        }
      } else if (payload.action === 'removed') {
        for (const repo of payload.repositories_removed) {
          const docs = await databases.listDocuments(
            'main',
            'repositories',
            [Query.equal('repo_id', repo.id.toString())]
          );

          if (docs.documents.length > 0) {
            await databases.deleteDocument('main', 'repositories', docs.documents[0].$id);
          }
        }
      }
    }
  } catch (err) {
    console.error('Installation handler error:', err.message);
  }
}
