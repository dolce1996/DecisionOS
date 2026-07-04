const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const statusPath = path.join(root, 'data', 'status.json');
const reportsDir = path.join(root, 'reports');

const SIGNAL_QUERIES = [
  'AI automation business',
  'boring SaaS',
  'niche website',
  'small business software',
  'workflow automation',
  'lead generation',
  'market research tool',
  'directory website',
  'pricing data',
  'compliance software'
];

const OPPORTUNITY_TEMPLATES = [
  {
    name: 'B2B Workflow Automation Finder',
    keywords: ['workflow', 'automation', 'small business', 'operations', 'spreadsheet', 'manual'],
    buildEase: 78,
    monetization: 86,
    maintenance: 68,
    summary: '반복 수작업이 많은 소규모 사업자의 업무를 찾아 자동화 도구나 템플릿으로 전환합니다.'
  },
  {
    name: 'Static Niche Site Factory',
    keywords: ['niche', 'website', 'seo', 'directory', 'content', 'search'],
    buildEase: 90,
    monetization: 70,
    maintenance: 86,
    summary: '검색 수요는 있지만 경쟁이 약한 주제를 찾아 정적 웹사이트로 빠르게 실험합니다.'
  },
  {
    name: 'AI Lead Generation Microsite',
    keywords: ['lead', 'sales', 'local', 'service', 'directory', 'business'],
    buildEase: 82,
    monetization: 83,
    maintenance: 72,
    summary: '특정 업종·지역의 고객 문의를 모아 사업자에게 판매하는 마이크로 사이트를 만듭니다.'
  },
  {
    name: 'Price Gap / Arbitrage Radar',
    keywords: ['price', 'pricing', 'marketplace', 'data', 'compare', 'cost'],
    buildEase: 70,
    monetization: 88,
    maintenance: 60,
    summary: '가격 차이, 정보 비대칭, 비교 수요가 있는 시장을 찾아 유료 데이터/리포트로 전환합니다.'
  },
  {
    name: 'Compliance Change Monitor',
    keywords: ['compliance', 'law', 'regulation', 'policy', 'risk', 'tax'],
    buildEase: 58,
    monetization: 92,
    maintenance: 55,
    summary: '규정 변경을 추적하기 어려운 업종에 알림·요약·체크리스트 서비스를 제공합니다.'
  },
  {
    name: 'Retirement Micro-SaaS Radar',
    keywords: ['retirement', 'senior', 'care', 'pension', 'healthcare', 'insurance'],
    buildEase: 65,
    monetization: 80,
    maintenance: 62,
    summary: '은퇴자·고령자·가족 돌봄에서 반복되는 정보 문제를 소형 유료 서비스로 만듭니다.'
  }
];

async function main() {
  const now = new Date().toISOString();
  const logs = [`[${now}] Autonomous opportunity discovery cycle started.`];

  const signals = await collectSignals(logs);
  const ideas = scoreOpportunities(signals);
  ideas.sort((a, b) => b.score - a.score);

  const top = ideas[0];
  logs.push(`[${now}] ${signals.length} live market signals collected from public sources.`);
  logs.push(`[${now}] ${ideas.length} opportunity models scored.`);
  logs.push(`[${now}] Top candidate selected: ${top.name} (${top.score}/100).`);

  const status = {
    systemStatus: 'Running live discovery engine',
    lastRun: now,
    topCandidate: top.name,
    decision: {
      score: top.score,
      summary: `${top.name}가 현재 1순위입니다. 실제 공개 신호 ${top.signalCount}개와 수익성/제작난이도/관리부담 점수를 반영했습니다.`
    },
    ideas: ideas.map(idea => ({
      name: idea.name,
      score: idea.score,
      summary: `${idea.summary} 신호 ${idea.signalCount}개, 수익성 ${idea.monetization}, 제작용이성 ${idea.buildEase}, 관리부담점수 ${idea.maintenance}.`
    })),
    logs
  };

  writeStatus(status);
  writeReport(now, top, ideas, signals);
}

async function collectSignals(logs) {
  const all = [];
  for (const query of SIGNAL_QUERIES) {
    try {
      const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=20`;
      const response = await fetch(url, { headers: { 'user-agent': 'DecisionOS/0.1' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      for (const hit of data.hits || []) {
        const title = clean(hit.title || hit.story_title || '');
        const text = `${title} ${hit.url || ''}`.toLowerCase();
        if (title.length < 5) continue;
        all.push({
          query,
          title,
          url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
          points: Number(hit.points || 0),
          comments: Number(hit.num_comments || 0),
          createdAt: hit.created_at || null,
          text
        });
      }
    } catch (error) {
      logs.push(`[${new Date().toISOString()}] Signal query failed: ${query} — ${error.message}`);
    }
  }

  const deduped = [];
  const seen = new Set();
  for (const signal of all) {
    const key = signal.title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(signal);
  }
  return deduped;
}

function scoreOpportunities(signals) {
  return OPPORTUNITY_TEMPLATES.map(template => {
    const matched = signals.filter(signal =>
      template.keywords.some(keyword => signal.text.includes(keyword.toLowerCase()))
    );

    const signalStrength = Math.min(100, matched.reduce((sum, signal) => {
      return sum + 3 + Math.min(10, signal.points / 20) + Math.min(8, signal.comments / 10);
    }, 0));

    const score = Math.round(
      signalStrength * 0.35 +
      template.monetization * 0.30 +
      template.buildEase * 0.20 +
      template.maintenance * 0.15
    );

    return {
      ...template,
      score,
      signalCount: matched.length,
      evidence: matched.slice(0, 8).map(signal => ({
        title: signal.title,
        query: signal.query,
        url: signal.url,
        points: signal.points,
        comments: signal.comments,
        createdAt: signal.createdAt
      }))
    };
  });
}

function writeStatus(status) {
  fs.mkdirSync(path.dirname(statusPath), { recursive: true });
  fs.writeFileSync(statusPath, JSON.stringify(status, null, 2) + '\n');
}

function writeReport(now, top, ideas, signals) {
  fs.mkdirSync(reportsDir, { recursive: true });
  const reportName = `decision-report-${now.replace(/[:.]/g, '-')}.md`;
  const report = [
    '# Decision OS Report',
    '',
    `- Run: ${now}`,
    `- Top Candidate: ${top.name}`,
    `- Score: ${top.score}/100`,
    `- Live Signals Collected: ${signals.length}`,
    '',
    '## Decision',
    '',
    `${top.name}가 현재 1순위입니다. ${top.summary}`,
    '',
    '## Ranking',
    '',
    ...ideas.map((idea, i) => `${i + 1}. **${idea.name}** — ${idea.score}/100 — signals: ${idea.signalCount} — ${idea.summary}`),
    '',
    '## Evidence For Top Candidate',
    '',
    ...(top.evidence.length ? top.evidence.map(item => `- ${item.title} (${item.query}) — points: ${item.points}, comments: ${item.comments}`) : ['- No direct live evidence found in this run.']),
    '',
    '## Notes',
    '',
    '- This engine uses public Hacker News Algolia signals and rule-based scoring.',
    '- Next upgrade: add Google Trends, Reddit, GitHub repo growth, and paid keyword demand signals.',
    ''
  ].join('\n');

  fs.writeFileSync(path.join(reportsDir, reportName), report);
}

function clean(value) {
  return String(value).replace(/\s+/g, ' ').trim();
}

main().catch(error => {
  const now = new Date().toISOString();
  const fallback = {
    systemStatus: 'Engine error',
    lastRun: now,
    topCandidate: 'None',
    decision: {
      score: 0,
      summary: `Decision engine failed: ${error.message}`
    },
    ideas: [],
    logs: [`[${now}] ERROR: ${error.stack || error.message}`]
  };
  writeStatus(fallback);
  process.exitCode = 1;
});
