const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const statusPath = path.join(root, 'data', 'status.json');
const reportsDir = path.join(root, 'reports');

function scoreIdea(idea, index) {
  const base = idea.baseScore || 70;
  const timeWave = new Date().getUTCHours() % 7;
  return Math.min(95, base + timeWave - index);
}

function main() {
  const now = new Date().toISOString();
  const ideas = [
    {
      name: 'Opportunity Discovery AI',
      baseScore: 82,
      summary: '정보 비대칭, 검색 수요, 결제 가능성이 겹치는 틈새 시장을 자동 발굴합니다.'
    },
    {
      name: 'AI Arbitrage Finder',
      baseScore: 77,
      summary: '지역·언어·가격 차이에서 자동화 가능한 수익 기회를 찾습니다.'
    },
    {
      name: 'Static Niche Site Factory',
      baseScore: 73,
      summary: '한 번 만들면 관리가 적은 정적 웹사이트 후보를 자동 생성합니다.'
    },
    {
      name: 'Retirement Micro-SaaS Radar',
      baseScore: 70,
      summary: '은퇴자·1인 사업자에게 필요한 작고 비싼 문제를 찾습니다.'
    }
  ].map(scoreIdeaObject);

  ideas.sort((a, b) => b.score - a.score);
  const top = ideas[0];
  const logs = [
    `[${now}] Autonomous decision cycle started.`,
    `[${now}] ${ideas.length} opportunity candidates scored.`,
    `[${now}] Top candidate selected: ${top.name} (${top.score}/100).`,
    `[${now}] Dashboard data updated.`
  ];

  const status = {
    systemStatus: 'Running by GitHub Actions',
    lastRun: now,
    topCandidate: top.name,
    decision: {
      score: top.score,
      summary: `${top.name}가 현재 1순위입니다. 이유: ${top.summary}`
    },
    ideas,
    logs
  };

  fs.mkdirSync(path.dirname(statusPath), { recursive: true });
  fs.writeFileSync(statusPath, JSON.stringify(status, null, 2) + '\n');

  fs.mkdirSync(reportsDir, { recursive: true });
  const reportName = `decision-report-${now.replace(/[:.]/g, '-')}.md`;
  const report = `# Decision OS Report\n\n- Run: ${now}\n- Top Candidate: ${top.name}\n- Score: ${top.score}/100\n\n## Why\n\n${top.summary}\n\n## Ranked Queue\n\n${ideas.map((idea, i) => `${i + 1}. ${idea.name} — ${idea.score}/100 — ${idea.summary}`).join('\n')}\n`;
  fs.writeFileSync(path.join(reportsDir, reportName), report);
}

function scoreIdeaObject(idea, index) {
  return {
    name: idea.name,
    score: scoreIdea(idea, index),
    summary: idea.summary
  };
}

main();
