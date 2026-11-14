import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const isProd = process.env.NODE_ENV === 'production';

if (isProd && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production');
}

export const config = {
  isProd,
  port: Number(process.env.PORT || 4000),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me',
  dataFile: process.env.DATA_FILE || path.join(root, 'data', 'db.json'),
  uploadDir: process.env.UPLOAD_DIR || path.join(root, 'uploads'),
  clientDist: path.resolve(root, '..', 'client', 'dist'),

  // AI
  aiEnabled: Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN),
  aiModel: process.env.AI_MODEL || 'claude-opus-5-5',

  // Scoring: certificates require PASS_THRESHOLD (85% = professional quality); below it,
  // learners retry until they reach it. DISTINCTION_THRESHOLD earns the gold badge.
  passThreshold: Number(process.env.PASS_THRESHOLD || 85),
  distinctionThreshold: Number(process.env.DISTINCTION_THRESHOLD || 95),

  // Partner company the Ambassador Program promotes (details are edited in Admin → Company brief)
  companyUrl: process.env.COMPANY_URL || '',

  // Firebase Authentication
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
  hasServiceAccount: Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS),
  // Signed-in users whose (verified) email is listed here get the Admin role.
  adminEmails: (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
  emulator: Boolean(process.env.FIREBASE_AUTH_EMULATOR_HOST),

  maxVideoBytes: Number(process.env.MAX_VIDEO_MB || 200) * 1024 * 1024,
};
