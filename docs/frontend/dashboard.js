import { Client, Databases, Query } from 'https://cdn.jsdelivr.net/npm/appwrite@14.0.1/+esm';

// Initialize Appwrite
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1') // Appwrite Cloud Endpoint
  .setProject('69735edc00127d2033d8'); // FairArena Project ID

const databases = new Databases(client);

// Load repositories
async function loadRepositories() {
  const reposList = document.getElementById('repos-list');
  
  try {
    const response = await databases.listDocuments('main', 'repositories');
    
    if (response.documents.length === 0) {
      reposList.innerHTML = '<div class="empty">No repositories found. Install the app on your repositories to get started.</div>';
      return;
    }

    reposList.innerHTML = '';
    
    for (const repo of response.documents) {
      const card = createRepoCard(repo);
      reposList.appendChild(card);
    }
  } catch (error) {
    console.error('Failed to load repositories:', error);
    reposList.innerHTML = '<div class="error">Failed to load repositories. Please refresh the page.</div>';
  }
}

// Create repository card
function createRepoCard(repo) {
  const card = document.createElement('div');
  card.className = 'repo-card';
  
  card.innerHTML = `
    <div class="repo-header">
      <a href="https://github.com/${repo.full_name}" target="_blank" class="repo-name">
        ${repo.full_name}
      </a>
      <button class="index-btn" data-repo-id="${repo.$id}">
        Index Repository
      </button>
    </div>
    <div class="repo-settings">
      <div class="setting">
        <label class="toggle">
          <input type="checkbox" ${repo.auto_summarize ? 'checked' : ''} 
                 data-repo-id="${repo.$id}" data-setting="auto_summarize">
          <span class="slider"></span>
        </label>
        <label>Auto-summarize issues</label>
      </div>
      <div class="setting">
        <label class="toggle">
          <input type="checkbox" ${repo.chatbot_enabled ? 'checked' : ''} 
                 data-repo-id="${repo.$id}" data-setting="chatbot_enabled">
          <span class="slider"></span>
        </label>
        <label>Chatbot replies</label>
      </div>
      <div class="setting">
        <label class="toggle">
          <input type="checkbox" ${repo.label_quality ? 'checked' : ''} 
                 data-repo-id="${repo.$id}" data-setting="label_quality">
          <span class="slider"></span>
        </label>
        <label>Label by quality</label>
      </div>
    </div>
  `;

  // Add event listeners
  const toggles = card.querySelectorAll('input[type="checkbox"]');
  toggles.forEach(toggle => {
    toggle.addEventListener('change', async (e) => {
      await updateSetting(e.target.dataset.repoId, e.target.dataset.setting, e.target.checked);
    });
  });

  const indexBtn = card.querySelector('.index-btn');
  indexBtn.addEventListener('click', async () => {
    await indexRepository(repo.$id, indexBtn);
  });

  return card;
}

// Update repository setting
async function updateSetting(repoId, setting, value) {
  try {
    await databases.updateDocument('main', 'repositories', repoId, {
      [setting]: value
    });
  } catch (error) {
    console.error('Failed to update setting:', error);
    alert('Failed to update setting. Please try again.');
  }
}

// Index repository (placeholder - actual indexing would be a backend task)
async function indexRepository(repoId, button) {
  button.disabled = true;
  button.textContent = 'Indexing...';
  
  // In a real implementation, this would trigger a backend function
  // For now, just simulate the process
  setTimeout(() => {
    button.textContent = 'Indexed ✓';
    setTimeout(() => {
      button.textContent = 'Index Repository';
      button.disabled = false;
    }, 2000);
  }, 3000);
}

// Load activity log
async function loadActivity() {
  const activityLog = document.getElementById('activity-log');
  
  try {
    const response = await databases.listDocuments('main', 'issue_messages', [
      Query.orderDesc('$createdAt'),
      Query.limit(50)
    ]);
    
    if (response.documents.length === 0) {
      activityLog.innerHTML = '<div class="empty">No activity yet.</div>';
      return;
    }

    activityLog.innerHTML = '';
    
    for (const message of response.documents) {
      const item = createActivityItem(message);
      activityLog.appendChild(item);
    }
  } catch (error) {
    console.error('Failed to load activity:', error);
    activityLog.innerHTML = '<div class="error">Failed to load activity.</div>';
  }
}

// Create activity item
function createActivityItem(message) {
  const item = document.createElement('div');
  item.className = 'activity-item';
  
  const time = new Date(message.$createdAt).toLocaleString();
  const preview = message.content.substring(0, 100) + (message.content.length > 100 ? '...' : '');
  
  item.innerHTML = `
    <div class="activity-time">${time}</div>
    <div>
      <span class="activity-repo">Issue #${message.issue_number}</span> - 
      ${message.role === 'assistant' ? 'Bot replied' : 'User commented'}
    </div>
    <div style="margin-top: 5px; color: #8b949e; font-size: 0.85rem;">${preview}</div>
  `;
  
  return item;
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  loadRepositories();
  loadActivity();
  
  // Refresh activity every 30 seconds
  setInterval(loadActivity, 30000);
});
