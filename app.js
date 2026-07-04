async function loadStatus() {
  const fields = {
    mission: document.getElementById('mission'),
    systemStatus: document.getElementById('systemStatus'),
    lastRun: document.getElementById('lastRun'),
    topCandidate: document.getElementById('topCandidate'),
    targetMarket: document.getElementById('targetMarket'),
    liveSignals: document.getElementById('liveSignals'),
    sources: document.getElementById('sources'),
    opportunitiesScored: document.getElementById('opportunitiesScored'),
    decisionsStored: document.getElementById('decisionsStored'),
    experimentsDesigned: document.getElementById('experimentsDesigned'),
    decisionScore: document.getElementById('decisionScore'),
    decisionSummary: document.getElementById('decisionSummary'),
    decisionReason: document.getElementById('decisionReason'),
    experimentStatus: document.getElementById('experimentStatus'),
    experimentTitle: document.getElementById('experimentTitle'),
    experimentHypothesis: document.getElementById('experimentHypothesis'),
    experimentNextAction: document.getElementById('experimentNextAction'),
    experimentMetric: document.getElementById('experimentMetric'),
    ideas: document.getElementById('ideas'),
    logs: document.getElementById('logs')
  };

  try {
    const response = await fetch('data/status.json?ts=' + Date.now());
    if (!response.ok) throw new Error('status.json load failed');
    const data = await response.json();

    setText(fields.mission, data.company?.mission || '한국 시장 AI CEO 대시보드입니다.');
    setText(fields.systemStatus, data.systemStatus || 'Unknown');
    setText(fields.lastRun, data.lastRun || 'Never');
    setText(fields.topCandidate, data.topCandidate || 'None');
    setText(fields.targetMarket, data.company?.targetMarket || '한국');
    setText(fields.liveSignals, data.kpis?.liveSignals ?? '--');
    setText(fields.sources, data.kpis?.sources ?? '--');
    setText(fields.opportunitiesScored, data.kpis?.opportunitiesScored ?? '--');
    setText(fields.decisionsStored, data.kpis?.decisionsStored ?? '--');
    setText(fields.experimentsDesigned, data.kpis?.experimentsDesigned ?? '--');

    setText(fields.decisionScore, data.decision?.score ? `${data.decision.score}/100` : '--');
    setText(fields.decisionSummary, data.decision?.summary || 'No current decision.');
    setText(fields.decisionReason, data.decision?.reason || '');

    const experiment = data.experiment || {};
    setText(fields.experimentStatus, experiment.status || '--');
    setText(fields.experimentTitle, experiment.title || 'No experiment designed yet.');
    setText(fields.experimentHypothesis, experiment.hypothesis || '');
    setText(fields.experimentNextAction, experiment.nextAction ? `다음 행동: ${experiment.nextAction}` : '');
    setText(fields.experimentMetric, experiment.successMetric ? `성공 기준: ${experiment.successMetric}` : '');

    fields.ideas.innerHTML = '';
    for (const idea of data.ideas || []) {
      const item = document.createElement('div');
      item.className = 'idea';
      const evidence = (idea.evidence || []).slice(0, 3).map(e => `<li>${escapeHtml(e.source || '')}: ${escapeHtml(e.title || '')}</li>`).join('');
      item.innerHTML = `
        <strong>${escapeHtml(idea.name)} · ${escapeHtml(String(idea.score))}/100</strong>
        <span>${escapeHtml(idea.summary || '')}</span>
        <small>대상: ${escapeHtml(idea.target || '')}</small>
        <small>상품: ${escapeHtml(idea.product || '')}</small>
        ${evidence ? `<ul class="evidence">${evidence}</ul>` : ''}
      `;
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
    setText(fields.systemStatus, 'Error');
    fields.decisionSummary.innerHTML = `<span class="error">${escapeHtml(error.message)}</span>`;
  }
}

function setText(element, value) {
  if (element) element.textContent = String(value);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[char]));
}

loadStatus();
setInterval(loadStatus, 60000);
