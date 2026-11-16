// Preview-only simulated server. Mirrors the real API's rules (85% pass mark, 18+
// ambassadors, parent accounts for kids, showcase approval) with data kept in this
// browser. AI features answer with a clear "needs the full app" message.
import DATA from './data.json';

const KEY = 'mc-preview-db-v5';
const AI_OFF = 'AI features run in the full Marketcraft app once a Claude API key is added. This preview simulates everything else.';
const ROLE_LABELS = { kid: 'Kid Entrepreneur', adult: 'Adult Business Owner', professional: 'Professional', admin: 'Admin' };
const id = () => Math.random().toString(36).slice(2, 12);
const now = () => new Date().toISOString();
const code = (n) => Array.from({ length: n }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');

// ---- store ----------------------------------------------------------------------
let mem = null;
function seed() {
  const t = now();
  const stamp = (o) => ({ id: id(), createdAt: t, updatedAt: t, ...o });
  const users = [
    stamp({ uid: 'demo-admin', email: 'admin@preview.marketcraft', emailVerified: true, provider: 'password', name: 'Course Admin', role: 'admin', adultConfirmedAt: t, xp: 0, badges: [], completedLessons: [] }),
    stamp({ uid: 'demo-adult', email: 'learner@preview.marketcraft', emailVerified: true, provider: 'password', name: 'Ava Learner', role: 'adult', adultConfirmedAt: t, xp: 0, badges: [], completedLessons: [] }),
    stamp({ uid: 'demo-kid', email: 'parent@preview.marketcraft', emailVerified: true, provider: 'password', name: 'Leo', role: 'kid', ageGroup: 'under13', accountHolder: 'parent', parentName: 'Sam', guardianEmail: 'parent@preview.marketcraft', xp: 0, badges: [], completedLessons: [] }),
  ];
  const grad = stamp({ uid: 'demo-grad', email: 'graduate@preview.marketcraft', emailVerified: true, provider: 'password', name: 'Jordan Graduate', role: 'professional', adultConfirmedAt: t, xp: 420, badges: ['first-lesson', 'first-pitch', 'certified', 'ambassador', 'brand-certified'], completedLessons: [], ambassador: { code: 'GRAD2026', joinedAt: t }, lab: { brand: { name: 'Bright Scarves Co.', website: '', tagline: 'Cozy handmade scarves for every season', description: 'Hand-knitted wool and cotton scarves made in small batches.', products: 'Wool scarf $28\nCotton summer scarf $22', audience: 'Gift shoppers and people who love handmade goods', keyMessages: 'Handmade, soft, made to last', offers: '', voice: 'Warm and friendly', dos: '', donts: '', hashtags: '#BrightScarves' } } });
  users.push(grad);
  const challenges = DATA.challenges.map((c) => stamp(c));
  const missionC = challenges.find((c) => c.kind === 'ambassador');
  const practiceC = challenges[0];
  const certificates = [
    { id: id(), userId: grad.id, recipientName: grad.name, challengeId: practiceC.id, challengeTitle: practiceC.title, kind: 'practice', badge: practiceC.certificateBadge, color: practiceC.color, tier: 'Certified', score: 90, issuedAt: t, verifyCode: code(10) },
    { id: id(), userId: grad.id, recipientName: grad.name, challengeId: missionC.id, challengeTitle: 'Ambassador Mission: Grow the Partner Website', kind: 'ambassador', badge: 'Certified Brand Ambassador', color: missionC.color, tier: 'Certified', score: 88, issuedAt: t, verifyCode: code(10) },
  ];
  return {
    session: null,
    designs: [],
    toolRuns: [
      { id: id(), userId: grad.id, scope: 'lab', toolId: 'social-post', createdAt: t, inputs: {}, output: {
        options: [
          { style: 'Example: personal story', hook: 'I knit this scarf on a rainy Sunday', caption: 'Every Bright Scarves piece is hand-knitted in small batches, so no two are exactly alike. Which colour would you gift? (Example AI result)', hashtags: ['BrightScarves', 'handmade'], callToAction: 'Shop the new colours', visualIdea: 'Close-up of hands knitting by a window' },
          { style: 'Example: gift idea', hook: 'The cozy gift they will actually use', caption: 'Soft, handmade and made to last: a Bright Scarves wool scarf is the gift that gets worn all winter. (Example AI result)', hashtags: ['GiftIdeas', 'BrightScarves'], callToAction: 'Order before the holidays', visualIdea: 'Scarf wrapped in a gift box' },
        ],
        disclosureLine: 'Not needed: this is your own brand.', bestTimeToPost: 'Weekday evenings',
      } },
      { id: id(), userId: grad.id, scope: 'lab', toolId: 'video-script', createdAt: t, inputs: {}, output: {
        title: 'Example: 15-second scarf reel',
        hook: 'Rainy day? Wrap up in colour.',
        scenes: [
          { time: '0:00-0:03', visual: 'Rain on the window', voiceover: 'Rainy day?', onScreenText: 'Rainy day?' },
          { time: '0:03-0:07', visual: 'Hands knitting', voiceover: 'Every scarf is hand-knitted', onScreenText: 'Hand-knitted in small batches' },
          { time: '0:07-0:11', visual: 'Scarf being wrapped', voiceover: 'Soft, warm, made to last', onScreenText: 'Soft · Warm · Made to last' },
          { time: '0:11-0:15', visual: 'Logo', voiceover: 'Find yours today', onScreenText: 'Bright Scarves Co.' },
        ],
        callToAction: 'Link in bio', shotList: ['Window', 'Knitting close-up', 'Gift wrap'], filmingTips: ['Use window light'], disclosureLine: 'Not needed: own brand.',
      } },
    ],
    certificates,
    users,
    lessons: DATA.lessons.map((l) => stamp({ ...l, generatedBy: 'staff', published: true, originality: { score: 100, passed: true, revisions: 0 } })),
    challenges,
    interviews: DATA.interviews.map((i) => stamp(i)),
    submissions: [],
    brief: { displayName: 'Partner Website', name: '', website: '', tagline: '', description: '', products: '', audience: '', keyMessages: '', offers: '', voice: '', dos: '', donts: '', hashtags: '' },
    showcase: [
      stamp({ userId: users[1].id, title: 'Sample: 30-second bakery reel', description: 'Example community post. Hook: steam rising from fresh bread. Target: local families. CTA: visit Saturday.', channel: 'social', tags: ['bakery', 'reel'], visibility: 'community', status: 'approved', videoUrl: 'https://www.youtube.com/', cheers: [] }),
      stamp({ userId: users[2].id, title: 'Sample: lemonade stand sign', description: 'Example of a community post waiting for admin approval.', channel: 'outdoor', tags: ['kids'], visibility: 'community', status: 'pending', videoUrl: 'https://www.youtube.com/', cheers: [] }),
    ],
    blobs: {},
  };
}
function db() {
  if (mem) return mem;
  try {
    mem = JSON.parse(localStorage.getItem(KEY)) || seed();
  } catch {
    mem = seed();
  }
  return mem;
}
function save() {
  try {
    const { blobs, ...rest } = mem;
    localStorage.setItem(KEY, JSON.stringify({ ...rest, blobs: {} }));
  } catch {
    /* storage unavailable: keep in memory */
  }
}
export function resetPreview() {
  mem = seed();
  save();
}

// ---- helpers ----------------------------------------------------------------------
class HttpError extends Error {
  constructor(status, error, extra = {}) {
    super(error);
    this.status = status;
    this.extra = extra;
  }
}
const fail = (status, error, extra) => { throw new HttpError(status, error, extra); };
const me = () => db().users.find((u) => u.id === db().session) ?? null;
const need = () => me() ?? fail(401, 'Please log in to continue.');
const needAdmin = () => (need().role === 'admin' ? me() : fail(403, 'Admins only.'));
const pub = (u) => (u ? { ...u, uid: undefined, roleLabel: ROLE_LABELS[u.role] } : null);
const levelFor = (xp = 0) => Math.floor(Math.sqrt(xp / 50)) + 1;
const formObj = (body) => (body instanceof FormData ? Object.fromEntries([...body.entries()].filter(([, v]) => typeof v === 'string')) : body ?? {});
const fileOf = (body) => (body instanceof FormData ? body.get('video') : null);
function blobUrl(file) {
  if (!file || typeof file === 'string') return null;
  const url = URL.createObjectURL(file);
  db().blobs[url] = true;
  return url;
}
function embed(raw) {
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\.|^m\./, '');
    if (host === 'youtube.com' && u.searchParams.get('v')) return `https://www.youtube-nocookie.com/embed/${u.searchParams.get('v')}`;
    if (host === 'youtu.be') return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
  } catch { /* ignore */ }
  return null;
}
function reward(user, xp, badges) {
  const fresh = badges.filter((b) => DATA.badges[b] && !user.badges.includes(b));
  user.xp = (user.xp || 0) + xp;
  user.badges = [...user.badges, ...fresh];
  return fresh.map((key) => ({ key, ...DATA.badges[key] }));
}
const companyName = () => db().brief.displayName || 'Partner Website';
function personalize(c) {
  if (c.kind !== 'ambassador') return c;
  const f = (s) => (typeof s === 'string' ? s.replaceAll('{company}', companyName()) : s);
  return { ...c, title: f(c.title), product: f(c.product), brief: f(c.brief), certificateBadge: f(c.certificateBadge) };
}
const forRole = (u) => (c) => (u.role === 'admin' || c.audiences.includes(u.role)) && (c.kind !== 'ambassador' || u.role === 'admin' || Boolean(u.ambassador));
const visibleLesson = (u) => (l) => u.role === 'admin' || l.ownerId === u.id || (l.published && (!l.audiences || l.audiences.includes(u.role)));
const stripAnswers = (l) => ({ ...l, quiz: (l.quiz || []).map(({ answerIndex, ...q }) => q) });
const serializeSub = (s) => ({ ...s, videoSrc: s.videoBlob ?? null, embedUrl: s.videoUrl ? embed(s.videoUrl) : null });

// Offline scorer (same signals as the real server's demo mode)
const SIGNALS = {
  clarity: ['first', 'then', 'finally', 'step', 'hook', 'call to action', 'because', 'so that'],
  audience: ['customer', 'audience', 'parents', 'students', 'neighbors', 'teens', 'moms', 'local', 'age', 'who', 'people who'],
  value: ['benefit', 'save', 'unique', 'only', 'better', 'free', 'discount', 'why', 'problem', 'solve', 'buy', 'order'],
  visual: ['video', 'show', 'close-up', 'lighting', 'caption', 'text', 'color', 'sign', 'flyer', 'demo', 'thumbnail', 'background'],
  brand: ['#ad', 'ambassador', 'disclose', 'partner', 'brand', 'honest', 'official', 'link'],
};
function evaluate(challenge, sub) {
  const rubric = DATA.rubrics[challenge.kind === 'ambassador' ? 'ambassador' : 'standard'];
  const text = `${sub.explanation} ${sub.transcript ?? ''}`.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean).length;
  const scale = rubric.points / 25;
  const bonus = Math.min(7, Math.floor(words / 25));
  const criteria = rubric.criteria.map((r) => {
    const hits = SIGNALS[r.key].filter((s) => text.includes(s)).length;
    let score = 6 + hits * 3 + bonus;
    if (r.key === 'visual' && sub.frameCount) score += 4;
    if (r.key === 'value' && text.includes(challenge.product.toLowerCase().split(' ')[0])) score += 2;
    score = Math.max(0, Math.min(rubric.points, Math.round(Math.min(25, score) * scale)));
    return {
      key: r.key, label: r.label, max: rubric.points, score,
      evidence: hits ? `Your text touches on ${r.label.toLowerCase()} (${hits} signal${hits > 1 ? 's' : ''} found).` : `We didn't find much about ${r.label.toLowerCase()} yet.`,
      tip: `Strengthen ${r.label.toLowerCase()}: ${r.description}`,
    };
  });
  const total = criteria.reduce((s, c) => s + c.score, 0);
  const max = rubric.criteria.length * rubric.points;
  const percent = Math.round((total / max) * 100);
  const good = Math.round(rubric.points * 0.85);
  return {
    criteria, total, max, percent, passThreshold: DATA.passThreshold,
    passed: percent >= DATA.passThreshold, distinction: percent >= DATA.distinctionThreshold,
    strengths: criteria.filter((c) => c.score >= good).map((c) => `Good ${c.label.toLowerCase()}.`),
    nextSteps: criteria.filter((c) => c.score < good).map((c) => rubric.criteria.find((r) => r.key === c.key).description),
    encouragement: 'Preview scoring is a rough keyword guide. In the full app, the AI coach watches your frames and grades in detail.',
    mode: 'offline-demo', evaluatedAt: now(),
  };
}
const isAdultAccount = (u) => u.role === 'admin' || Boolean(u.adultConfirmedAt) || u.accountHolder === 'parent';
const hasCert = (u) => db().certificates.some((c) => c.userId === u.id && c.kind !== 'ambassador' && c.score >= DATA.passThreshold);
const eligible = (u) => u.role === 'admin' || (isAdultAccount(u) && hasCert(u));
function ambassadorStatus(u) {
  const b = db().brief;
  const mission = db().challenges.find((c) => c.kind === 'ambassador');
  const cert = mission && db().certificates.find((c) => c.userId === u.id && c.challengeId === mission.id);
  let referralLink = '';
  if (b.website && u.ambassador) {
    try {
      const url = new URL(b.website);
      url.searchParams.set('ref', u.ambassador.code);
      url.searchParams.set('utm_source', 'marketcraft');
      url.searchParams.set('utm_medium', 'ambassador');
      url.searchParams.set('utm_campaign', u.ambassador.code);
      referralLink = url.toString();
    } catch { /* invalid url */ }
  }
  return {
    eligible: eligible(u), adultAccount: isAdultAccount(u), certified: u.role === 'admin' || hasCert(u),
    joined: Boolean(u.ambassador), ambassador: u.ambassador ?? null, referralLink, passThreshold: DATA.passThreshold,
    company: { name: companyName(), website: b.website, tagline: b.tagline, description: b.description, products: b.products, hashtags: b.hashtags, configured: Boolean(b.description) },
    guidelines: [...DATA.guidelines.map((g) => g.replaceAll('{company}', companyName())), ...(u.role === 'kid' ? [DATA.kidRule] : [])],
    isKid: u.role === 'kid',
    mission: mission ? { id: mission.id, title: personalize(mission).title, certificateId: cert?.id ?? null } : null,
    tools: DATA.tools, aiEnabled: false,
  };
}
function serializeShow(item, u) {
  const owner = db().users.find((x) => x.id === item.userId);
  return {
    ...item, cheers: item.cheers.length, cheeredByMe: item.cheers.includes(u.id), mine: item.userId === u.id,
    ownerName: owner?.name ?? 'Learner', ownerRole: ROLE_LABELS[owner?.role] ?? '',
    videoSrc: item.videoBlob ?? null, embedUrl: item.videoUrl ? embed(item.videoUrl) : null,
  };
}

// ---- routes -----------------------------------------------------------------------
const routes = [];
const on = (method, pattern, handler) => routes.push({ method, re: new RegExp(`^${pattern.replace(/:(\w+)/g, '(?<$1>[^/?]+)')}(?:\\?(?<qs>.*))?$`), handler });

on('GET', '/auth/me', () => ({ user: pub(me()) }));
on('POST', '/auth/logout', () => { db().session = null; return { ok: true }; });
on('POST', '/auth/session', (_, body) => {
  const claims = JSON.parse(body.idToken);
  let user = db().users.find((u) => u.uid === claims.uid);
  if (!user) {
    const p = body.profile;
    if (!p) fail(404, 'Profile needed', { needsProfile: true, email: claims.email, suggestedName: claims.name ?? '' });
    if (!p.name || p.name.trim().length < 2) fail(400, 'Please enter a name (at least 2 characters).');
    if (p.role === 'kid' && (!p.ageGroup || !p.parentAccount || !p.guardianConsent)) fail(400, 'Learners under 18 must use a parent\'s account, and the parent must give consent.');
    if (p.role !== 'kid' && !p.adultConfirmed) fail(400, 'Please confirm you are 18 or older.');
    user = {
      id: id(), createdAt: now(), uid: claims.uid, email: claims.email, emailVerified: true, provider: 'password', name: p.name.trim(), role: p.role,
      ageGroup: p.role === 'kid' ? p.ageGroup : undefined, accountHolder: p.role === 'kid' ? 'parent' : 'self',
      adultConfirmedAt: p.role === 'kid' ? undefined : now(), parentName: p.parentName || undefined,
      xp: 0, badges: [], completedLessons: [],
    };
    db().users.push(user);
  }
  db().session = user.id;
  return { user: pub(user) };
});
on('PATCH', '/auth/profile', (_, body) => { const u = need(); if (!body.name || body.name.trim().length < 2) fail(400, 'Please enter a name of 2-60 characters.'); u.name = body.name.trim(); return { user: pub(u) }; });

// lessons
on('GET', '/lessons', () => {
  const u = need();
  return { lessons: db().lessons.filter(visibleLesson(u)).map(({ sections, quiz, ...m }) => ({ ...m, sectionCount: sections?.length ?? 0, completed: u.completedLessons.includes(m.id) })) };
});
on('POST', '/lessons/research', () => { need(); fail(503, AI_OFF); });
on('GET', '/lessons/:id', ({ id: lid }) => {
  const u = need();
  const l = db().lessons.find((x) => x.id === lid && visibleLesson(u)(x)) ?? fail(404, 'Lesson not found.');
  return { lesson: stripAnswers(l), completed: u.completedLessons.includes(l.id) };
});
on('POST', '/lessons/:id/complete', ({ id: lid }, body) => {
  const u = need();
  const l = db().lessons.find((x) => x.id === lid) ?? fail(404, 'Lesson not found.');
  const results = (l.quiz || []).map((q, i) => ({ correct: body.answers[i] === q.answerIndex, answerIndex: q.answerIndex }));
  const correct = results.filter((r) => r.correct).length;
  const first = !u.completedLessons.includes(l.id);
  let newBadges = [];
  if (first) {
    u.completedLessons.push(l.id);
    newBadges = reward(u, 20 + correct * 10, ['first-lesson', ...(results.length && correct === results.length ? ['quiz-ace'] : [])]);
  }
  return { results, correct, total: results.length, xpEarned: first ? 20 + correct * 10 : 0, newBadges };
});
on('PATCH', '/lessons/:id', ({ id: lid }, body) => { needAdmin(); const l = db().lessons.find((x) => x.id === lid) ?? fail(404, 'Lesson not found.'); Object.assign(l, body); return { lesson: l }; });
on('DELETE', '/lessons/:id', ({ id: lid }) => { needAdmin(); db().lessons = db().lessons.filter((x) => x.id !== lid); return { ok: true }; });

// interviews
const withMedia = (i) => ({ ...i, videoSrc: i.videoBlob ?? null });
on('GET', '/interviews', () => { const u = need(); return { interviews: db().interviews.filter((i) => i.published || u.role === 'admin').map(withMedia) }; });
on('POST', '/interviews/summarize', () => { needAdmin(); fail(503, AI_OFF); });
on('POST', '/interviews', (_, body) => {
  needAdmin();
  const f = formObj(body);
  const file = fileOf(body);
  const embedUrl = f.videoUrl ? embed(f.videoUrl) : null;
  if (!f.title || f.title.length < 3) fail(400, 'Add a title.');
  if (!(file instanceof File && file.size) && !f.videoUrl) fail(400, 'Upload a video file or paste a link.');
  const lines = (s) => (s || '').split('\n').map((x) => x.trim()).filter(Boolean);
  const item = { id: id(), createdAt: now(), title: f.title, businessName: f.businessName, ownerName: f.ownerName, summary: f.summary, transcriptSummary: f.transcriptSummary, takeaways: lines(f.takeaways), tags: lines(f.tags), published: true, videoUrl: f.videoUrl, embedUrl, videoBlob: file instanceof File && file.size ? blobUrl(file) : null };
  db().interviews.unshift(item);
  return { interview: withMedia(item) };
});
on('PATCH', '/interviews/:id', ({ id: iid }, body) => { needAdmin(); const i = db().interviews.find((x) => x.id === iid) ?? fail(404, 'Interview not found.'); Object.assign(i, body); return { interview: withMedia(i) }; });
on('DELETE', '/interviews/:id', ({ id: iid }) => { needAdmin(); db().interviews = db().interviews.filter((x) => x.id !== iid); return { ok: true }; });

// studio
on('GET', '/studio/rubric', () => ({ rubrics: DATA.rubrics, passThreshold: DATA.passThreshold, distinctionThreshold: DATA.distinctionThreshold, aiEnabled: false }));
on('GET', '/studio/dashboard', () => {
  const u = need();
  const subs = db().submissions.filter((s) => s.userId === u.id);
  return {
    user: pub(u), level: levelFor(u.xp), badgeCatalog: DATA.badges, passThreshold: DATA.passThreshold,
    stats: {
      lessonsCompleted: u.completedLessons.length,
      lessonsTotal: db().lessons.filter((l) => l.published && (u.role === 'admin' || l.audiences.includes(u.role))).length,
      submissions: subs.length,
      passed: new Set(subs.filter((s) => s.evaluation.passed).map((s) => s.challengeId)).size,
      certificates: db().certificates.filter((c) => c.userId === u.id).length,
      bestScore: Math.max(0, ...subs.map((s) => s.evaluation.percent)),
    },
  };
});
on('GET', '/studio/challenges', () => {
  const u = need();
  const mine = db().submissions.filter((s) => s.userId === u.id);
  return {
    challenges: db().challenges.filter(forRole(u)).map((c) => {
      const a = mine.filter((s) => s.challengeId === c.id);
      return { ...personalize(c), attempts: a.length, bestScore: Math.max(0, ...a.map((s) => s.evaluation.percent)), passed: a.some((s) => s.evaluation.passed) };
    }),
  };
});
on('POST', '/studio/challenges/assign', () => {
  const u = need();
  const order = { starter: 0, intermediate: 1, advanced: 2 };
  const passed = new Set(db().submissions.filter((s) => s.userId === u.id && s.evaluation.passed).map((s) => s.challengeId));
  const next = db().challenges.filter(forRole(u)).filter((c) => c.kind !== 'ambassador' && !passed.has(c.id)).sort((a, b) => order[a.difficulty] - order[b.difficulty])[0];
  return next ? { challenge: next } : { challenge: null, message: 'You have passed every challenge. Legendary!' };
});
on('GET', '/studio/challenges/:id', ({ id: cid }) => {
  const u = need();
  const c = db().challenges.find((x) => x.id === cid && forRole(u)(x)) ?? fail(404, 'Challenge not found.');
  return { challenge: personalize(c), attempts: db().submissions.filter((s) => s.userId === u.id && s.challengeId === c.id).reverse().map(serializeSub) };
});
on('POST', '/studio/submissions', (_, body) => {
  const u = need();
  const f = formObj(body);
  const file = fileOf(body);
  const hasFile = file instanceof File && file.size > 0;
  if (!f.explanation || f.explanation.trim().length < 60) fail(400, 'Explain your strategy in at least 60 characters.');
  if (!hasFile && !f.videoUrl) fail(400, 'Upload your pitch video or paste a link to it.');
  const stored = db().challenges.find((x) => x.id === f.challengeId && forRole(u)(x)) ?? fail(404, 'Challenge not found.');
  const c = personalize(stored);
  if (c.kind === 'ambassador' && !db().brief.description) fail(409, 'The company brief has not been filled in yet. Ask an admin to complete it.');
  const frames = f.frames ? JSON.parse(f.frames) : [];
  const previous = db().submissions.filter((s) => s.userId === u.id && s.challengeId === c.id);
  const evaluation = evaluate(c, { explanation: f.explanation, transcript: f.transcript, frameCount: frames.length });
  const sub = { id: id(), createdAt: now(), userId: u.id, challengeId: c.id, challengeTitle: c.title, attempt: previous.length + 1, channel: f.channel, explanation: f.explanation, transcript: f.transcript, videoUrl: f.videoUrl || null, videoBlob: hasFile ? blobUrl(file) : null, frameCount: frames.length, evaluation };
  db().submissions.push(sub);
  let certificate = null;
  const badges = ['first-pitch'];
  let xp = 15;
  if (evaluation.passed) {
    xp += 50 + (evaluation.distinction ? 50 : 0);
    badges.push('certified');
    if (evaluation.distinction) badges.push('distinction');
    if (previous.some((s) => !s.evaluation.passed)) badges.push('comeback');
    if (c.kind === 'ambassador') badges.push('brand-certified');
    const tier = evaluation.distinction ? 'Distinction' : 'Certified';
    const existing = db().certificates.find((x) => x.userId === u.id && x.challengeId === c.id);
    if (existing) {
      if (evaluation.percent > existing.score) Object.assign(existing, { tier, score: evaluation.percent, issuedAt: now() });
      certificate = existing;
    } else {
      certificate = { id: id(), userId: u.id, recipientName: u.name, challengeId: c.id, challengeTitle: c.title, kind: c.kind ?? 'practice', badge: c.certificateBadge, color: c.color, tier, score: evaluation.percent, issuedAt: now(), verifyCode: code(10) };
      db().certificates.push(certificate);
    }
  }
  const newBadges = reward(u, xp, badges);
  return { submission: serializeSub(sub), certificate, newBadges, xpEarned: xp };
});
on('GET', '/studio/submissions', () => { const u = need(); return { submissions: db().submissions.filter((s) => s.userId === u.id).map(serializeSub) }; });
on('GET', '/studio/certificates', () => { const u = need(); return { certificates: db().certificates.filter((c) => c.userId === u.id) }; });
on('GET', '/studio/certificates/verify/:code', ({ code: vc }) => {
  const c = db().certificates.find((x) => x.verifyCode === vc.toUpperCase());
  if (!c) fail(404, 'Not found', { valid: false });
  return { valid: true, recipientName: c.recipientName, challengeTitle: c.challengeTitle, badge: c.badge, tier: c.tier, issuedAt: c.issuedAt };
});
on('GET', '/studio/certificates/:id', ({ id: cid }) => {
  const u = need();
  const c = db().certificates.find((x) => x.id === cid && (x.userId === u.id || u.role === 'admin')) ?? fail(404, 'Certificate not found.');
  return { certificate: c };
});

// ambassador
on('GET', '/ambassador/status', () => ambassadorStatus(need()));
on('POST', '/ambassador/join', (_, body) => {
  const u = need();
  if (u.ambassador) return { ...ambassadorStatus(u), newBadges: [] };
  if (!isAdultAccount(u)) fail(403, 'The Ambassador Program is for account holders 18 and older. Kids can join through a parent\'s account.');
  if (!eligible(u)) fail(403, `Earn a practice certificate (${DATA.passThreshold}%+) in the Studio to unlock the Ambassador Program.`);
  if (body.agreeGuidelines !== true) fail(400, 'Please agree to the ambassador guidelines.');
  if (u.role === 'kid' && body.parentApproval !== true) fail(400, 'A parent or guardian needs to approve joining the Ambassador Program.');
  u.ambassador = { code: code(8), joinedAt: now() };
  const newBadges = reward(u, 50, ['ambassador']);
  return { ...ambassadorStatus(u), newBadges };
});
on('POST', '/ambassador/tools/:id', () => { need(); fail(503, AI_OFF); });
on('GET', '/ambassador/runs', () => { need(); return { runs: [] }; });
on('GET', '/ambassador/brief', () => { needAdmin(); return { brief: db().brief }; });
on('PUT', '/ambassador/brief', (_, body) => { needAdmin(); if (body.website && !/^https?:\/\//.test(body.website)) fail(400, 'website: Invalid URL'); db().brief = { ...db().brief, ...body }; return { brief: db().brief }; });
on('GET', '/ambassador/roster', () => {
  needAdmin();
  const mission = db().challenges.find((c) => c.kind === 'ambassador');
  return { ambassadors: db().users.filter((u) => u.ambassador).map((u) => ({ ...pub(u), toolRuns: 0, missionCertified: db().certificates.some((c) => c.userId === u.id && c.challengeId === mission?.id) })) };
});

// showcase
on('GET', '/showcase', (_p, _b, qs) => {
  const u = need();
  const mine = new URLSearchParams(qs).get('scope') === 'mine';
  return { items: db().showcase.filter((i) => (mine ? i.userId === u.id : i.visibility === 'community' && i.status === 'approved')).map((i) => serializeShow(i, u)) };
});
on('GET', '/showcase/review/queue', () => { const u = needAdmin(); return { items: db().showcase.filter((i) => i.visibility === 'community' && i.status === 'pending').map((i) => serializeShow(i, u)) }; });
on('POST', '/showcase', (_, body) => {
  const u = need();
  const f = formObj(body);
  const file = fileOf(body);
  const hasFile = file instanceof File && file.size > 0;
  if (!f.title || f.title.trim().length < 3) fail(400, 'Give your video a title (3+ characters).');
  if (!hasFile && !f.videoUrl) fail(400, 'Upload your video or paste a link to it.');
  const item = {
    id: id(), createdAt: now(), userId: u.id, title: f.title.trim(), description: f.description ?? '', channel: f.channel || 'social',
    tags: (f.tags || '').split(/[,\n]/).map((t) => t.trim().replace(/^#/, '').toLowerCase()).filter(Boolean).slice(0, 6),
    visibility: f.visibility || 'private', status: f.visibility === 'community' && u.role !== 'admin' ? 'pending' : 'approved',
    videoUrl: f.videoUrl || null, videoBlob: hasFile ? blobUrl(file) : null, cheers: [],
  };
  db().showcase.unshift(item);
  return { item: serializeShow(item, u), newBadges: reward(u, 20, ['showcase']) };
});
on('PATCH', '/showcase/:id', ({ id: sid }, body) => {
  const u = need();
  const it = db().showcase.find((x) => x.id === sid && x.userId === u.id) ?? fail(404, 'Video not found.');
  const alreadyPublic = it.visibility === 'community' && it.status === 'approved';
  it.status = body.visibility === 'private' || u.role === 'admin' || alreadyPublic ? 'approved' : 'pending';
  it.visibility = body.visibility;
  return { item: serializeShow(it, u) };
});
on('DELETE', '/showcase/:id', ({ id: sid }) => { const u = need(); db().showcase = db().showcase.filter((x) => !(x.id === sid && (x.userId === u.id || u.role === 'admin'))); return { ok: true }; });
on('POST', '/showcase/:id/cheer', ({ id: sid }) => {
  const u = need();
  const it = db().showcase.find((x) => x.id === sid && (x.userId === u.id || u.role === 'admin' || (x.visibility === 'community' && x.status === 'approved'))) ?? fail(404, 'Video not found.');
  it.cheers = it.cheers.includes(u.id) ? it.cheers.filter((x) => x !== u.id) : [...it.cheers, u.id];
  return { item: serializeShow(it, u) };
});
on('POST', '/showcase/:id/review', ({ id: sid }, body) => {
  const u = needAdmin();
  const it = db().showcase.find((x) => x.id === sid) ?? fail(404, 'Video not found.');
  Object.assign(it, { status: body.status, reviewNote: body.note || null });
  return { item: serializeShow(it, u) };
});

// lab
const labUnlocked = (u) => u.role === 'admin' || db().certificates.some((c) => c.userId === u.id && c.kind === 'ambassador' && c.score >= DATA.passThreshold);
const needLab = () => { const u = need(); if (!labUnlocked(u)) fail(403, 'Your Marketing Lab unlocks when you earn the Ambassador certificate (complete the Ambassador Mission).'); return u; };
const BRAND_KEYS = ['name', 'website', 'tagline', 'description', 'products', 'audience', 'keyMessages', 'offers', 'voice', 'dos', 'donts', 'hashtags'];
on('GET', '/lab/status', () => {
  const u = need();
  const mission = db().challenges.find((c) => c.kind === 'ambassador');
  return { unlocked: labUnlocked(u), missionId: mission?.id ?? null, passThreshold: DATA.passThreshold, brand: { ...Object.fromEntries(BRAND_KEYS.map((k) => [k, ''])), ...(u.lab?.brand ?? {}) }, tools: DATA.tools, aiEnabled: false };
});
on('PUT', '/lab/brand', (_, body) => {
  const u = needLab();
  if (!body.name?.trim()) fail(400, 'Give your brand a name.');
  if (body.website && !/^https?:\/\//.test(body.website)) fail(400, 'Website must be a full link, like https://…');
  const first = !u.lab?.brand?.name;
  u.lab = { ...(u.lab ?? {}), brand: body };
  return { brand: body, newBadges: first ? reward(u, 30, ['lab']) : [] };
});
on('POST', '/lab/tools/:id', () => { needLab(); fail(503, AI_OFF); });
on('GET', '/lab/runs', () => { const u = needLab(); return { runs: db().toolRuns.filter((r) => r.userId === u.id) }; });
const designMeta = ({ doc, ...d }) => ({ ...d, width: doc.width, height: doc.height, preset: doc.preset ?? null });
on('GET', '/lab/designs', () => { const u = needLab(); return { designs: db().designs.filter((d) => d.userId === u.id).map(designMeta) }; });
on('GET', '/lab/designs/:id', ({ id: did }) => { const u = needLab(); return { design: db().designs.find((d) => d.id === did && d.userId === u.id) ?? fail(404, 'Design not found.') }; });
on('POST', '/lab/designs', (_, body) => { const u = needLab(); const d = { id: id(), createdAt: now(), updatedAt: now(), userId: u.id, name: body.name, doc: body.doc }; db().designs.unshift(d); return { design: designMeta(d) }; });
on('PUT', '/lab/designs/:id', ({ id: did }, body) => { const u = needLab(); const d = db().designs.find((x) => x.id === did && x.userId === u.id) ?? fail(404, 'Design not found.'); Object.assign(d, { name: body.name, doc: body.doc, updatedAt: now() }); return { design: designMeta(d) }; });
on('DELETE', '/lab/designs/:id', ({ id: did }) => { const u = needLab(); db().designs = db().designs.filter((x) => !(x.id === did && x.userId === u.id)); return { ok: true }; });

// ---- entry point used by lib/api.js ------------------------------------------------
export async function send(method, url, body) {
  await new Promise((r) => setTimeout(r, 120)); // feel like a network
  for (const r of routes) {
    if (r.method !== method) continue;
    const m = r.re.exec(url);
    if (!m) continue;
    try {
      const data = r.handler(m.groups ?? {}, body ?? {}, m.groups?.qs ?? '');
      save();
      return { ok: true, status: 200, data };
    } catch (err) {
      if (err instanceof HttpError) return { ok: false, status: err.status, data: { error: err.message, ...err.extra } };
      console.error(err);
      return { ok: false, status: 500, data: { error: 'Something went wrong in the preview.' } };
    }
  }
  return { ok: false, status: 404, data: { error: 'Not found.' } };
}
