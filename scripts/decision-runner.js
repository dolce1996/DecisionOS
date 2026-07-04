const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const statusPath = path.join(root, 'data', 'status.json');
const reportsDir = path.join(root, 'reports');
const memoryPath = path.join(root, 'data', 'memory.json');

const TARGET_MARKET = 'Korea';

const KOREAN_MARKET_QUERIES = [
  '한국 AI 자동화 사업',
  '한국 소상공인 자동화',
  '한국 중소기업 SaaS',
  '한국 노인 돌봄 서비스',
  '한국 요양원 비교',
  '한국 정부지원금 자동화',
  '한국 세금 신고 자동화',
  '한국 입찰 제안서 자동화',
  '한국 병원 예약 자동화',
  '한국 부동산 문서 자동화',
  '한국 법률 문서 자동화',
  '한국 B2B 리드 생성',
  '한국 가격 비교 서비스',
  '한국 규제 변화 알림',
  '한국 자영업 마케팅 자동화'
];

const HN_QUERIES = [
  'Korea AI SaaS',
  'Korea startup automation',
  'Korean small business software',
  'AI agent startup',
  'vertical AI SaaS'
];

const GITHUB_QUERIES = [
  'korea ai automation created:>2026-06-01',
  'korean saas created:>2026-06-01',
  'ai agent automation created:>2026-06-01',
  'proposal generator created:>2026-06-01',
  'compliance automation created:>2026-06-01'
];

const OPPORTUNITY_MODELS = [
  {
    name: '한국 소상공인 업무 자동화 Finder',
    keywords: ['소상공인', '자영업', '자동화', '예약', '인보이스', '매출', '고객관리', 'workflow', 'automation'],
    target: '한국 소상공인, 1인 사업자, 작은 학원/병원/매장',
    product: '업종별 반복 업무 자동화 템플릿 + 소형 SaaS',
    firstExperiment: '미용실/학원/작은 병원 중 하나를 골라 예약·문자·고객관리 자동화 랜딩페이지 제작',
    buildEase: 78,
    monetization: 84,
    maintenance: 68,
    risk: 45,
    summary: '한국 소상공인의 반복 업무를 찾아 자동화 도구나 템플릿으로 전환합니다.'
  },
  {
    name: '한국 요양원·시니어 케어 비교 엔진',
    keywords: ['요양원', '요양병원', '노인', '시니어', '돌봄', '간병', '치매', 'senior', 'care'],
    target: '부모님 요양시설을 찾는 가족',
    product: '시설 비교표, 체크리스트, 상담 리드, 프리미엄 리포트',
    firstExperiment: '서울/수도권 고급 요양시설 비교 페이지 1개 제작',
    buildEase: 72,
    monetization: 88,
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
    buildEase: 76,
    monetization: 86,
    maintenance: 58,
    risk: 54,
    summary: '복잡한 한국 정부지원금 정보를 업종별로 자동 매칭합니다.'
  },
  {
    name: '한국 입찰·제안서 AI 작성 도구',
    keywords: ['입찰', '제안서', '나라장터', '조달', 'RFP', 'proposal', 'bid', 'procurement'],
    target: '입찰에 참여하는 중소기업, SI 업체, 용역 회사',
    product: '입찰 공고 요약 + 제안서 초안 + 체크리스트',
    firstExperiment: '나라장터 제안서 체크리스트와 샘플 생성 페이지 제작',
    buildEase: 70,
    monetization: 92,
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
    buildEase: 62,
    monetization: 87,
    maintenance: 56,
    risk: 62,
    summary: '한국 자영업자가 놓치기 쉬운 세금·노무·규정 변화를 알림 서비스로 만듭니다.'
  },
  {
    name: '한국 로컬 서비스 리드 생성 사이트',
    keywords: ['견적', '이사', '인테리어', '청소', '수리', '로컬', '지역', 'lead', 'local'],
    target: '지역 서비스업체와 고객',
    product: '업종별 견적 요청 사이트 + 유료 리드 판매',
    firstExperiment: '한 지역/한 업종 견적 요청 페이지 제작',
    buildEase: 84,
    monetization: 82,
    maintenance: 70,
    risk: 52,
    summary: '한국 지역 서비스 시장에서 고객 문의를 모아 업체에 연결합니다.'
  },
  {
    name: '한국 가격비교·정보비대칭 Radar',
    keywords: ['가격비교', '가격', '비용', '견적', '비교', '보험', '렌탈', 'price', 'compare'],
    target: '가격 차이가 큰 서비스를 구매하는 소비자',
    product: '가격 비교 리포트 + 견적 수집 + 제휴 수익',
    firstExperiment: '요양원/렌탈/수리 중 가격 정보가 불투명한 카테고리 1개 조사',
    buildEase: 74,
    monetization: 85,
    maintenance: 62,
    risk: 50,
    summary: '한국 시장의 가격 불투명성을 비교 정보 서비스로 전환합니다.'
  }
];

async function main() {
  const now = new Date().toISOString();
  const logs = [`[${now}] Korea-target CEO cycle started.`];
  const memory = readJson(memoryPath, { runs: [], decisions: [], experiments: [] });

  const signals = await collectAllSignals(logs);
  const ideas = scoreOpportunities(signals, memory);
  ideas.sort((a, b) => b.score - a.score);

  const top = ideas[0];
  const decision = makeCeoDecision(top, ideas, signals, now);
  const experiment = designExperiment(top, now);

  memory.runs.unshift({ at: now, targetMarket: TARGET_MARKET, topCandidate: top.name, score: top.score, signalCount: signals.length });
  memory.decisions.unshift(decision);
  memory.experiments.unshift(experiment);
  memory.runs = memory.runs.slice(0, 100);
  memory.decisions = memory.decisions.slice(0, 100);
  memory.experiments = memory.experiments.slice(0, 100);

  logs.push(`[${now}] ${signals.length} Korean-market signals collected from ${countSources(signals)} public sources.`);
  logs.push(`[${now}] ${ideas.length} Korea opportunity models scored.`);
  logs.push(`[${now}] CEO decision: ${decision.action} — ${top.name} (${top.score}/100).`);
  logs.push(`[${now}] Next experiment: ${experiment.title}.`);

  const status = {
    systemStatus: 'AI CEO running Korea market engine',
    lastRun: now,
    topCandidate: top.name,
    company: {
      mission: '한국 시장에서 실제 공개 신호를 읽고, 수익성 높은 사업을 골라, 실험을 설계하는 자동 회사 운영체제',
      ceo: 'Decision OS CEO Agent',
      board: 'Bek',
      targetMarket: '한국',
      currentGoal: '첫 번째 한국 시장 수익 실험 후보 선정'
    },
    kpis: {
      liveSignals: signals.length,
      sources: countSources(signals),
      opportunitiesScored: ideas.length,
      topScore: top.score,
      experimentsDesigned: memory.experiments.length,
      decisionsStored: memory.decisions.length
    },
    decision: {
      score: top.score,
      summary: `${top.name}가 현재 한국 시장 1순위입니다. 공개 신호 ${top.signalCount}개, 수익성 ${top.monetization}, 제작용이성 ${top.buildEase}, 관리부담점수 ${top.maintenance}, 위험도 ${top.risk}를 반영했습니다.`,
      action: decision.action,
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
  writeReport(now, top, ideas, signals, decision, experiment);
}

async function collectAllSignals(logs) {
  const results = await Promise.allSettled([
    collectGoogleNewsSignals(logs),
    collectHackerNewsSignals(logs),
    collectRedditSignals(logs),
    collectGitHubSignals(logs)
  ]);

  const all = results.flatMap(result => result.status === 'fulfilled' ? result.value : []);
  const deduped = [];
  const seen = new Set();
  for (const signal of all) {
    const key = `${signal.source}:${signal.title}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(signal);
  }
  return deduped.slice(0, 500);
}

async function collectGoogleNewsSignals(logs) {
  const signals = [];
  for (const query of KOREAN_MARKET_QUERIES) {
    try {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`;
      const xml = await fetchText(url);
      const items = [...xml.matchAll(/<item>[\s\S]*?<\/item>/g)].slice(0, 12);
      for (const match of items) {
        const item = match[0];
        const title = decodeXml(extractTag(item, 'title'));
        const link = decodeXml(extractTag(item, 'link'));
        const pubDate = decodeXml(extractTag(item, 'pubDate'));
        if (!title) continue;
        signals.push({
          source: 'Google News KR',
          query,
          title: clean(title),
          url: link,
          createdAt: pubDate,
          points: 0,
          comments: 0,
          text: `${title} ${query}`.toLowerCase()
        });
      }
    } catch (error) {
      logs.push(`[${new Date().toISOString()}] Google News KR failed: ${query} — ${error.message}`);
    }
  }
  return signals;
}

async function collectHackerNewsSignals(logs) {
  const signals = [];
  for (const query of HN_QUERIES) {
    try {
      const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=15`;
      const data = await fetchJson(url);
      for (const hit of data.hits || []) {
        const title = clean(hit.title || hit.story_title || '');
        if (title.length < 5) continue;
        signals.push({
          source: 'Hacker News',
          query,
          title,
          url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
          points: Number(hit.points || 0),
          comments: Number(hit.num_comments || 0),
          createdAt: hit.created_at || null,
          text: `${title} ${query} ${hit.url || ''}`.toLowerCase()
        });
      }
    } catch (error) {
      logs.push(`[${new Date().toISOString()}] Hacker News failed: ${query} — ${error.message}`);
    }
  }
  return signals;
}

async function collectRedditSignals(logs) {
  const signals = [];
  for (const source of REDDIT_SOURCES) {
    try {
      const url = `https://www.reddit.com/r/${source.subreddit}/search.json?q=${encodeURIComponent(source.query)}&restrict_sr=1&sort=new&limit=15`;
      const data = await fetchJson(url);
      for (const child of data.data?.children || []) {
        const post = child.data || {};
        const title = clean(post.title || '');
        if (title.length < 5) continue;
        signals.push({
          source: `Reddit r/${source.subreddit}`,
          query: source.query,
          title,
          url: post.permalink ? `https://www.reddit.com${post.permalink}` : '',
          points: Number(post.score || 0),
          comments: Number(post.num_comments || 0),
          createdAt: post.created_utc ? new Date(post.created_utc * 1000).toISOString() : null,
          text: `${title} ${post.selftext || ''} ${source.query}`.toLowerCase()
        });
      }
    } catch (error) {
      logs.push(`[${new Date().toISOString()}] Reddit failed: r/${source.subreddit} — ${error.message}`);
    }
  }
  return signals;
}

async function collectGitHubSignals(logs) {
  const signals = [];
  for (const query of GITHUB_QUERIES) {
    try {
      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=10`;
      const data = await fetchJson(url);
      for (const repo of data.items || []) {
        const title = clean(`${repo.full_name}: ${repo.description || ''}`);
        signals.push({
          source: 'GitHub Search',
          query,
          title,
          url: repo.html_url,
          points: Number(repo.stargazers_count || 0),
          comments: Number(repo.forks_count || 0),
          createdAt: repo.created_at || null,
          text: `${repo.full_name} ${repo.description || ''} ${query}`.toLowerCase()
        });
      }
    } catch (error) {
      logs.push(`[${new Date().toISOString()}] GitHub Search failed: ${query} — ${error.message}`);
    }
  }
  return signals;
}

function scoreOpportunities(signals, memory) {
  return OPPORTUNITY_MODELS.map(model => {
    const matched = signals.filter(signal =>
      model.keywords.some(keyword => signal.text.includes(keyword.toLowerCase()))
    );

    const sourceDiversity = new Set(matched.map(signal => signal.source)).size;
    const signalStrength = Math.min(100, matched.reduce((sum, signal) => {
      const engagement = Math.min(12, signal.points / 10) + Math.min(10, signal.comments / 5);
      const sourceWeight = signal.source.includes('Google News') ? 6 : signal.source.includes('GitHub') ? 5 : 4;
      return sum + sourceWeight + engagement;
    }, 0));
    const diversityBonus = Math.min(12, sourceDiversity * 3);
    const noveltyBonus = wasRecentlyTop(model.name, memory) ? -4 : 4;

    const score = clamp(Math.round(
      signalStrength * 0.34 +
      model.monetization * 0.27 +
      model.buildEase * 0.18 +
      model.maintenance * 0.12 +
      diversityBonus +
      noveltyBonus -
      model.risk * 0.08
    ), 0, 100);

    return {
      ...model,
      score,
      signalCount: matched.length,
      sourceDiversity,
      evidence: matched.slice(0, 7).map(signal => ({
        source: signal.source,
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

function makeCeoDecision(top, ideas, signals, now) {
  const runnerUp = ideas[1];
  const action = top.score >= 78 ? 'BUILD_EXPERIMENT' : top.score >= 65 ? 'VALIDATE_DEMAND' : 'KEEP_SCANNING';
  const reason = top.score >= 78
    ? `한국 시장 신호와 수익성 점수가 충분하므로 ${top.name}의 첫 실험을 제작합니다.`
    : top.score >= 65
      ? `${top.name}는 가능성이 있으나 즉시 제작 전 수요 검증이 필요합니다.`
      : '아직 강한 시장 신호가 부족하므로 추가 관찰합니다.';
  return {
    id: `DEC-${now.replace(/[-:.TZ]/g, '').slice(0, 14)}`,
    at: now,
    targetMarket: '한국',
    action,
    selected: top.name,
    score: top.score,
    runnerUp: runnerUp?.name || null,
    signalCount: signals.length,
    reason
  };
}

function designExperiment(top, now) {
  return {
    id: `EXP-${now.replace(/[-:.TZ]/g, '').slice(0, 14)}`,
    title: `${top.name} 한국 시장 48시간 검증`,
    market: '한국',
    hypothesis: `${top.target}는 ${top.product}에 비용을 지불할 가능성이 있다.`,
    nextAction: top.firstExperiment,
    successMetric: '방문자 100명 기준 문의/클릭/이메일 등록 3건 이상',
    buildTime: '1~2일',
    budget: '도메인/광고 없이 0원으로 시작',
    status: 'designed'
  };
}

function writeReport(now, top, ideas, signals, decision, experiment) {
  fs.mkdirSync(reportsDir, { recursive: true });
  const reportName = `korea-ceo-report-${now.replace(/[:.]/g, '-')}.md`;
  const report = [
    '# Decision OS Korea CEO Report',
    '',
    `- Run: ${now}`,
    '- Target Market: Korea',
    `- Live Signals Collected: ${signals.length}`,
    `- CEO Decision: ${decision.action}`,
    `- Top Candidate: ${top.name}`,
    `- Score: ${top.score}/100`,
    '',
    '## CEO Decision',
    '',
    decision.reason,
    '',
    '## Next Experiment',
    '',
    `- Title: ${experiment.title}`,
    `- Hypothesis: ${experiment.hypothesis}`,
    `- Next Action: ${experiment.nextAction}`,
    `- Success Metric: ${experiment.successMetric}`,
    '',
    '## Ranking',
    '',
    ...ideas.map((idea, i) => `${i + 1}. **${idea.name}** — ${idea.score}/100 — signals: ${idea.signalCount}, sources: ${idea.sourceDiversity} — ${idea.summary}`),
    '',
    '## Evidence For Top Candidate',
    '',
    ...(top.evidence.length ? top.evidence.map(item => `- [${item.source}] ${item.title} (${item.query})`) : ['- No direct live evidence found in this run.']),
    '',
    '## Limits',
    '',
    '- This version uses public Google News RSS, Hacker News, Reddit public JSON, and GitHub Search.',
    '- It is not yet connected to paid keyword volume, CPC, Naver search volume, or OpenAI API reasoning.',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(reportsDir, reportName), report);
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'DecisionOS-Korea-CEO/0.2' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'DecisionOS-Korea-CEO/0.2' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

function extractTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  return match ? match[1].replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '') : '';
}

function decodeXml(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

function wasRecentlyTop(name, memory) {
  return (memory.runs || []).slice(0, 5).some(run => run.topCandidate === name);
}

function countSources(signals) {
  return new Set(signals.map(signal => signal.source)).size;
}

function clean(value) {
  return String(value || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

main().catch(error => {
  const now = new Date().toISOString();
  const fallback = {
    systemStatus: 'Korea CEO engine error',
    lastRun: now,
    topCandidate: 'None',
    company: { targetMarket: '한국' },
    kpis: {},
    decision: { score: 0, summary: `Decision engine failed: ${error.message}`, action: 'ERROR', reason: error.message },
    experiment: null,
    ideas: [],
    logs: [`[${now}] ERROR: ${error.stack || error.message}`]
  };
  writeJson(statusPath, fallback);
  process.exitCode = 1;
});
