async function loadStatus() {
  const fields = {
    systemStatus: document.getElementById('systemStatus'),
    lastRun: document.getElementById('lastRun'),
    topCandidate: document.getElementById('topCandidate'),
    decisionScore: document.getElementById('decisionScore'),
    decisionSummary: document.getElementById('decisionSummary'),
    ideas: document.getElementById('ideas'),
    logs: document.getElementById('logs')
  };

  try {
    const response = await fetch('data/status.json?ts=' + Date.now());
    if (!response.ok) throw new Error('status.json load failed');
    const data = await response.json();

    fields.systemStatus.textContent = data.systemStatus || 'Unknown';
    fields.lastRun.textContent = data.lastRun || 'Never';
    fields.topCandidate.textContent = data.topCandidate || 'None';
    fields.decisionScore.textContent = data.decision?.score ? `${data.decision.score}/100` : '--';
    fields.decisionSummary.textContent = data.decision?.summary || 'No current decision.';

    fields.ideas.innerHTML = '';
    for (const idea of data.ideas || []) {
      const item = document.createElement('div');
      item.className = 'idea';
      item.innerHTML = `<strong>${escapeHtml(idea.name)} · ${escapeHtml(String(idea.score))}</strong><span>${escapeHtml(idea.summary)}</span>`;
      fields.ideas.appendChild(item);
    }

    fields.logs.innerHTML = '';
    for (const log of data.logs || []) {
      const item = document.createElement('div');
      item.className = 'log-entry';
      item.textContent = log;
      fields.logs.appendChild(item);
    }
  } catch (error) {
    fields.systemStatus.textContent = 'Error';
    fields.decisionSummary.innerHTML = `<span class="error">${escapeHtml(error.message)}</span>`;
  }
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[char]));
}

loadStatus();
setInterval(loadStatus, 60000);
