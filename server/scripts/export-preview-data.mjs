// Exports the course content the preview build needs (no user data, no secrets).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

process.env.DATA_FILE = '/dev/null';
const { CHALLENGES, LESSONS, INTERVIEWS, AMBASSADOR_MISSION, BADGES } = await import('../src/seed.js');
const { EXTRA_LESSONS } = await import('../src/lessons-extra.js');
const { PRO_LESSONS } = await import('../src/lessons-pro.js');
const { MONTH_LESSONS } = await import('../src/lessons-month.js');
const { RUBRICS } = await import('../src/ai/evaluator.js');
const { toolCatalog } = await import('../src/ai/ambassadorTools.js');
const { GUIDELINES, KID_RULE } = await import('../src/routes/ambassador.js');

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/src/preview/data.json');
const { SCENARIOS } = await import('../src/lessons-scenarios.js');
const data = {
  scenarios: SCENARIOS,
  lessons: [...LESSONS, ...EXTRA_LESSONS, ...PRO_LESSONS, ...MONTH_LESSONS],
  challenges: [...CHALLENGES, AMBASSADOR_MISSION],
  interviews: INTERVIEWS,
  badges: BADGES,
  rubrics: RUBRICS,
  tools: toolCatalog(),
  guidelines: GUIDELINES,
  kidRule: KID_RULE,
  passThreshold: 85,
  distinctionThreshold: 95,
};
fs.writeFileSync(out, JSON.stringify(data));
console.log(`wrote ${out}: ${data.lessons.length} lessons, ${data.challenges.length} challenges, ${data.tools.length} tools`);
