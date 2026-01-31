import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';

export async function createGitHubClient(installationId) {
  const auth = createAppAuth({
    appId: process.env.GITHUB_APP_ID,
    privateKey: process.env.GITHUB_PRIVATE_KEY.replace(/\\n/g, '\n'),
    installationId
  });

  const { token } = await auth({ type: 'installation' });

  return new Octokit({ auth: token });
}

export async function postComment(octokit, owner, repo, issueNumber, body) {
  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body
  });
}

export async function addLabels(octokit, owner, repo, issueNumber, labels) {
  await octokit.issues.addLabels({
    owner,
    repo,
    issue_number: issueNumber,
    labels
  });
}

export async function getFileContent(octokit, owner, repo, path) {
  try {
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path
    });

    if (response.data.type === 'file') {
      return Buffer.from(response.data.content, 'base64').toString('utf-8');
    }
    return null;
  } catch (err) {
    console.error(`Failed to get file ${path}:`, err.message);
    return null;
  }
}

export async function listRepoFiles(octokit, owner, repo, path = '') {
  try {
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path
    });

    let files = [];
    
    if (Array.isArray(response.data)) {
      for (const item of response.data) {
        if (item.type === 'file') {
          files.push(item.path);
        } else if (item.type === 'dir') {
          const subFiles = await listRepoFiles(octokit, owner, repo, item.path);
          files = files.concat(subFiles);
        }
      }
    }

    return files;
  } catch (err) {
    console.error(`Failed to list files in ${path}:`, err.message);
    return [];
  }
}
