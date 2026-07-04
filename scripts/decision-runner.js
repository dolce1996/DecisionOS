const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const statusPath = path.join(root, 'data', 'status.json');
const memoryPath = path.join(root, 'data', 'memory.json');
const reportsDir = path.join(root, 'reports');

const MARKET = '한국';

const GOOGLE_NEWS_QUERIES = [
  '한국 소상공인 자동화',
  '한국 중소기업 AI',
  '한국 요양원 비교',
  '한국 정부지원금 소상공인',
  '한국 입찰 제안서 AI',
  '한국 세금 신고 자동화',
  '한국 규제 변화 자영업',
  '한국 가격 비교 서비스',
  '한국 병원 예약 자동화',
  '한국 부동산 문서 자동화'
];

const HN_QUERIES = [
  'Korea AI SaaS',
  'Korean startup automation',
  'AI agent startup',
  'vertical AI SaaS'
];

const GITHUB_QUERIES = [
  'korea ai automation created:>2026-06-01',
  'korean saas created:>2026-06-01',
  'proposal generator created:>2026-06-01',
  'compliance automation created:>2026-06-01'
];

const REDDIT_SOURCES = [
  { subreddit: 'korea', query: 'AI startup Korea' },
  { subreddit: 'Entrepreneur', query: 'Korea SaaS' },
  { subreddit: 'smallbusiness', query: 'automation' },
  { subreddit: 'SaaS', query: 'AI automation' }
];

const MODELS = [
  {
    name: '한국 소상공인 업무 자동화 Finder',
    keywords: ['소상공인', '자영업', '자동화', '예약', '매출', '고객관리', 'automation', 'workflow'],
    target: '한국 소상공인, 학원, 병원, 매장, 1인 사업자',
    product: '업종별 반복 업무 자동화 템플릿 + 소형 SaaS',
    firstExperiment: '미용실/학원/소형 병원 중 하나를 골라 예약·문자·고객관리 자동화 랜딩페이지 제작',
    monetization: 84,
    buildEase: 78,
    maintenance: 68,
    risk: 45,
    summary: '반복 수작업이 많은 한국 소상공인의 업무를 자동화 상품으로 전환합니다.'
  },
  {
    name: '한국 요양원·시니어 케어 비교 엔진',
    keywords: ['요양원', '요양병원', '노인', '시니어', '돌봄', '간병', '치매', 'senior', 'care'],
    target: '부모님 요양시설을 찾는 가족',
    product: '시설 비교표, 체크리스트, 상담 리드, 프리미엄 리포트',
    firstExperiment: '서울/수도권 고급 요양시설 비교 페이지 1개 제작',
    monetization: 88,
    buildEase: 72,
    maintenance: 64,
    risk: 50,
    summary: '고령화와 정보 비대칭이 큰 요양시설 선택 문제를 비교 서비스로 만듭니다.'
  },
  {
    name: '한국 정부지원금·보조금 Finder',
    keywords: ['정부지원금', '보조금', '지원사업', '창업지원', '소상공인 지원', '정책자금', 'grant'],
    target: '소상공인, 스타트업, 중소기업',
    product: '지원사업 자동 매칭 + 신청 체크리스트 + 알림',
    firstExperiment: '소상공인 지원금 검색/알림 랜딩페이지 제작',
    monetization: 86,
    buildEase: 76,
    maintenance: 58,
    risk: 54,
    summary: '복잡한 한국 정부지원금 정보를 업종별로 자동 매칭합니다.'
  },
  {
    name: '한국 입찰·제안서 AI 작성 도구',
    keywords: ['입찰', '제안서', '나라장터', '조달', 'RFP', 'proposal', 'bid', 'procurement'],
    target: '입찰 참여 중소기업, SI 업체, 용역 회사',
    product: '입찰 공고 요약 + 제안서 초안 + 체크리스트',
    firstExperiment: '나라장터 제안서 체크리스트와 샘플 생성 페이지 제작',
    monetization: 92,
    buildEase: 70,
    maintenance: 60,
    risk: 58,
    summary: '한국 중소기업의 입찰·제안서 작성 부담을 줄이는 문서 자동화 서비스입니다.'
  },
  {
    name: '한국 규제·세금 변경 알림 서비스',
    keywords: ['세금', '부가세', '종합소득세', '규제', '법률', '노무', '4대보험', 'compliance', 'tax'],
    target: '자영업자, 프리랜서, 작은 법인',
    product: '세금/노무/규정 변경 알림 + 체크리스트',
    firstExperiment: '자영업자 세금 일정 알림 페이지 제작',
    monetization: 87,
    buildEase: 62,
    maintenance: 56,
    risk: 62,
    summary: '자영업자가 놓치기 쉬운 세금·노무·규정 변화를 알림 서비스로 만듭니다.'
  },
  {
    name: '한국 로컬 서비스 리드 생성 사이트',
    keywords: ['견적', '이사', '인테리어', '청소', '수리', '로컬', '지역', 'lead', 'local'],
    target: '지역 서비스업체와 고객',
    product: '업종별 견적 요청 사이트 + 유료 리드 판매',
    firstExperiment: '한 지역/한 업종 견적 요청 페이지 제작',
    monetization: 82,
    buildEase: 84,
    maintenance: 70,
    risk: 52,
    summary: '한국 지역 서비스 시장에서 고객 문의를 모아 업체에 연결합니다.'
  }
];

async function main() {
  const now = new Date().toISOString();
  const logs = [`[${now}] Korea CEO engine started.`];
  const memory = readJson(memoryPath, { runs: [], decisions: [], experiments: [] });

  const signals = await collectSignals(logs);
  const ideas = scoreModels(signals, memory).sort((a, b) => b.score - a.score);
  const top = ideas[0];
  const decision = makeDecision(top, ideas[1], signals, now);
  const experiment = makeExperiment(top, now);

  memory.runs.unshift({ at: now, market: MARKET, topCandidate: top.name, score: top.score, signals: signals.length });
  memory.decisions.unshift(decision);
  memory.experiments.unshift(experiment);
  memory.runs = memory.runs.slice(0, 100);
  memory.decisions = memory.decisions.slice(0, 100);
  memory.experiments = memory.experiments.slice(0, 100);

  logs.push(`[${now}] ${signals.length} Korean-market signals collected.`);
  logs.push(`[${now}] ${new Set(signals.map(s => s.source)).size} public sources used.`);
  logs.push(`[${now}] CEO selected: ${top.name} (${top.score}/100).`);
  logs.push(`[${now}] Next experiment designed: ${experiment.title}.`);

  const status = {
    systemStatus: 'AI CEO running Korea market engine',
    lastRun: now,
    topCandidate: top.name,
    company: {
      mission: '한국 시장에서 실제 공개 신호를 읽고, 수익성 높은 사업을 고르고, 다음 실험을 설계하는 AI CEO 대시보드입니다.',
      ceo: 'Decision OS CEO Agent',
      board: 'Bek',
      targetMarket: MARKET,
      currentGoal: '첫 번째 한국 시장 수익 실험 후보 선정'
    },
    kpis: {
      liveSignals: signals.length,
      sources: new Set(signals.map(s => s.source)).size,
      opportunitiesScored: ideas.length,
      topScore: top.score,
      experimentsDesigned: memory.experiments.length,
      decisionsStored: memory.decisions.length
    },
    decision: {
      score: top.score,
      action: decision.action,
      summary: `${top.name}가 현재 한국 시장 1순위입니다. 실제 공개 신호 ${top.signalCount}개와 수익성/제작용이성/관리부담/위험도를 반영했습니다.`,
      reason: decision.reason
    },
    experiment,
    ideas: ideas.map(idea => ({
      name: idea.name,
      score: idea.score,
      summary: `${idea.summary} 신호 ${idea.signalCount}개, 수익성 ${idea.monetization}, 제작용이성 ${idea.buildEase}, 관리부담점수 ${idea.maintenance}, 위험도 ${idea.risk}.`,
      target: idea.target,
      product: idea.product,
      evidence: idea.evidence
    })),
    logs
  };

  writeJson(statusPath, status);
  writeJson(memoryPath, memory);
  writeReport(now, status, signals);
}

async function collectSignals(logs) {
  const groups = await Promise.allSettled([
    collectGoogleNews(logs),
    collectHackerNews(logs),
    collectGitHub(logs),
    collectReddit(logs)
  ]);
  const all = groups.flatMap(g => g.status === 'fulfilled' ? g.value : []);
  const seen = new Set();
  return all.filter(signal => {
    const key = `${signal.source}:${signal.title}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 500);
}

async function collectGoogleNews(logs) {
  const signals = [];
  for (const query of GOOGLE_NEWS_QUERIES) {
    try {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`;
      const xml = await fetchText(url);
      const items = [...xml.matchAll(/<item>[\s\S]*?<\/item>/g)].slice(0, 10);
      for (const match of items) {
        const item = match[0];
        const title = clean(decodeXml(extractTag(item, 'title')));
        if (!title) continue;
        signals.push({
          source: 'Google News KR',
          query,
          title,
          url: decodeXml(extractTag(item, 'link')),
          createdAt: decodeXml(extractTag(item, 'pubDate')),
          points: 0,
          comments: 0,
          text: `${title} ${query}`.toLowerCase()
        });
      }
    } catch (error) {
      logs.push(`[${new Date().toISOString()}] Google News failed: ${query} — ${error.message}`);
    }
  }
  return signals;
}

async function collectHackerNews(logs) {
  const signals = [];
  for (const query of HN_QUERIES) {
    try {
      const data = await fetchJson(`https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=10`);
      for (const hit of data.hits || []) {
        const title = clean(hit.title || hit.story_title || '');
        if (!title) continue;
        signals.push({
          source: 'Hacker News',
          query,
          title,
          url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
          createdAt: hit.created_at || null,
          points: Number(hit.points || 0),
          comments: Number(hit.num_comments || 0),
          text: `${title} ${query}`.toLowerCase()
        });
      }
    } catch (error) {
      logs.push(`[${new Date().toISOString()}] HN failed: ${query} — ${error.message}`);
    }
  }
  return signals;
}

async function collectGitHub(logs) {
  const signals = [];
  for (const query of GITHUB_QUERIES) {
    try {
      const data = await fetchJson(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=10`);
      for (const repo of data.items || []) {
        const title = clean(`${repo.full_name}: ${repo.description || ''}`);
        signals.push({
          source: 'GitHub Search',
          query,
          title,
          url: repo.html_url,
          createdAt: repo.created_at || null,
          points: Number(repo.stargazers_count || 0),
          comments: Number(repo.forks_count || 0),
          text: `${title} ${query}`.toLowerCase()
        });
      }
    } catch (error) {
      logs.push(`[${new Date().toISOString()}] GitHub failed: ${query} — ${error.message}`);
    }
  }
  return signals;
}

async function collectReddit(logs) {
  const signals = [];
  for (const source of REDDIT_SOURCES) {
    try {
      const data = await fetchJson(`https://www.reddit.com/r/${source.subreddit}/search.json?q=${encodeURIComponent(source.query)}&restrict_sr=1&sort=new&limit=10`);
      for (const child of data.data?.children || []) {
        const post = child.data || {};
        const title = clean(post.title || '');
        if (!title) continue;
        signals.push({
          source: `Reddit r/${source.subreddit}`,
          query: source.query,
          title,
          url: post.permalink ? `https://www.reddit.com${post.permalink}` : '',
          createdAt: post.created_utc ? new Date(post.created_utc * 1000).toISOString() : null,
          points: Number(post.score || 0),
          comments: Number(post.num_comments || 0),
          text: `${title} ${post.selftext || ''} ${source.query}`.toLowerCase()
        });
      }
    } catch (error) {
      logs.push(`[${new Date().toISOString()}] Reddit failed: r/${source.subreddit} — ${error.message}`);
    }
  }
  return signals;
}

function scoreModels(signals, memory) {
  return MODELS.map(model => {
    const matched = signals.filter(signal => model.keywords.some(keyword => signal.text.includes(keyword.toLowerCase())));
    const sourceDiversity = new Set(matched.map(s => s.source)).size;
    const signalStrength = Math.min(100, matched.reduce((sum, signal) => {
      const sourceWeight = signal.source.includes('Google News') ? 6 : signal.source.includes('GitHub') ? 5 : 4;
      const engagement = Math.min(12, signal.points / 10) + Math.min(10, signal.comments / 5);
      return sum + sourceWeight + engagement;
    }, 0));
    const novelty = (memory.runs || []).slice(0, 5).some(run => run.topCandidate === model.name) ? -4 : 4;
    const score = clamp(Math.round(signalStrength * 0.34 + model.monetization * 0.27 + model.buildEase * 0.18 + model.maintenance * 0.12 + sourceDiversity * 3 + novelty - model.risk * 0.08), 0, 100);
    return {
      ...model,
      score,
      signalCount: matched.length,
      sourceDiversity,
      evidence: matched.slice(0, 5).map(s => ({ source: s.source, title: s.title, query: s.query, url: s.url, createdAt: s.createdAt }))
    };
  });
}

function makeDecision(top, runnerUp, signals, now) {
  const action = top.score >= 78 ? 'BUILD_EXPERIMENT' : top.score >= 65 ? 'VALIDATE_DEMAND' : 'KEEP_SCANNING';
  const reason = action === 'BUILD_EXPERIMENT'
    ? `한국 시장 신호가 충분합니다. ${top.name}의 첫 MVP 실험을 시작합니다.`
    : action === 'VALIDATE_DEMAND'
      ? `${top.name}의 가능성은 있으나, 제작 전 수요 검증이 먼저입니다.`
      : '강한 시장 신호가 아직 부족합니다. 계속 수집합니다.';
  return { id: `DEC-${now.replace(/[-:.TZ]/g, '').slice(0, 14)}`, at: now, market: MARKET, action, selected: top.name, runnerUp: runnerUp?.name || null, score: top.score, signalCount: signals.length, reason };
}

function makeExperiment(top, now) {
  return {
    id: `EXP-${now.replace(/[-:.TZ]/g, '').slice(0, 14)}`,
    title: `${top.name} 48시간 한국 시장 검증`,
    market: MARKET,
    hypothesis: `${top.target}는 ${top.product}에 비용을 지불할 가능성이 있다.`,
    nextAction: top.firstExperiment,
    successMetric: '방문자 100명 기준 문의/클릭/이메일 등록 3건 이상',
    buildTime: '1~2일',
    budget: '0원으로 시작',
    status: 'designed'
  };
}

function writeReport(now, status, signals) {
  fs.mkdirSync(reportsDir, { recursive: true });
  const name = `korea-ceo-report-${now.replace(/[:.]/g, '-')}.md`;
  const lines = [
    '# Decision OS Korea CEO Report', '',
    `- Run: ${now}`,
    `- Target Market: ${MARKET}`,
    `- System: ${status.systemStatus}`,
    `- Live Signals: ${signals.length}`,
    `- Top Candidate: ${status.topCandidate}`,
    `- Score: ${status.decision.score}/100`, '',
    '## CEO Decision', '',
    status.decision.reason, '',
    '## Next Experiment', '',
    `- ${status.experiment.title}`,
    `- Hypothesis: ${status.experiment.hypothesis}`,
    `- Next Action: ${status.experiment.nextAction}`,
    `- Success Metric: ${status.experiment.successMetric}`, '',
    '## Ranking', '',
    ...status.ideas.map((idea, i) => `${i + 1}. **${idea.name}** — ${idea.score}/100 — ${idea.summary}`), '',
    '## Limits', '',
    '- Uses public Google News RSS, Hacker News, GitHub Search, and Reddit public JSON.',
    '- Naver DataLab, CPC/search volume, and OpenAI reasoning are not connected yet.', ''
  ];
  fs.writeFileSync(path.join(reportsDir, name), lines.join('\n'));
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'DecisionOS-Korea-CEO/0.3' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'DecisionOS-Korea-CEO/0.3' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function extractTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  return match ? match[1].replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '') : '';
}

function decodeXml(value) {
  return String(value || '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function clean(value) {
  return String(value || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function readJson(filePath, fallback) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return fallback; }
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

main().catch(error => {
  const now = new Date().toISOString();
  writeJson(statusPath, {
    systemStatus: 'Korea CEO engine error',
    lastRun: now,
    topCandidate: 'None',
    company: { targetMarket: MARKET, mission: '한국 시장 AI CEO 대시보드입니다.' },
    kpis: {},
    decision: { score: 0, action: 'ERROR', summary: `Decision engine failed: ${error.message}`, reason: error.message },
    experiment: null,
    ideas: [],
    logs: [`[${now}] ERROR: ${error.stack || error.message}`]
  });
  process.exitCode = 1;
});
