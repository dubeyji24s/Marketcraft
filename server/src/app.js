import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import { config } from './config.js';
import { loadUser } from './auth.js';
import authRoutes from './routes/auth.js';
import lessonRoutes from './routes/lessons.js';
import interviewRoutes from './routes/interviews.js';
import studioRoutes from './routes/studio.js';
import ambassadorRoutes from './routes/ambassador.js';
import showcaseRoutes from './routes/showcase.js';
import { AIError } from './ai/client.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  // Firebase Auth needs its token endpoints, Google's sign-in scripts, and the auth-domain
  // iframe/popup. The emulator is allowed only when configured.
  const emulator = process.env.FIREBASE_AUTH_EMULATOR_HOST ? [`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`] : [];
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", 'https://apis.google.com'],
          connectSrc: ["'self'", 'https://identitytoolkit.googleapis.com', 'https://securetoken.googleapis.com', 'https://www.googleapis.com', ...emulator],
          imgSrc: ["'self'", 'data:', 'blob:', 'https://lh3.googleusercontent.com'],
          mediaSrc: ["'self'", 'blob:'],
          frameSrc: ['https://www.youtube-nocookie.com', 'https://player.vimeo.com', 'https://www.loom.com', 'https://*.firebaseapp.com', 'https://*.web.app', 'https://accounts.google.com', ...emulator],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          upgradeInsecureRequests: config.isProd ? [] : null,
        },
      },
      // signInWithPopup needs to talk to its popup window
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(loadUser);

  // CSRF defence for cookie auth: state-changing API calls must come from our own origin.
  app.use('/api', (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const origin = req.get('origin');
    // same-origin, including when served behind a preview/hosting proxy (trust proxy is on)
    const allowed = [config.clientOrigin, `${req.protocol}://${req.get('host')}`, `${req.protocol}://${req.get('x-forwarded-host') ?? req.get('host')}`];
    if (origin && !allowed.includes(origin)) return res.status(403).json({ error: 'Cross-site request blocked.' });
    next();
  });

  app.get('/api/health', (_req, res) => res.json({ ok: true, aiEnabled: config.aiEnabled }));
  app.use('/api/auth', authRoutes);
  app.use('/api/lessons', lessonRoutes);
  app.use('/api/interviews', interviewRoutes);
  app.use('/api/studio', studioRoutes);
  app.use('/api/ambassador', ambassadorRoutes);
  app.use('/api/showcase', showcaseRoutes);
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));

  // Serve the built React app in production
  if (fs.existsSync(config.clientDist)) {
    app.use(express.static(config.clientDist));
    app.get(/^\/(?!api).*/, (_req, res) => res.sendFile(path.join(config.clientDist, 'index.html')));
  }

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err instanceof AIError) return res.status(err.status).json({ error: err.message });
    if (err instanceof multer.MulterError) {
      const msg = err.code === 'LIMIT_FILE_SIZE' ? `Video is too large (max ${config.maxVideoBytes / 1024 / 1024} MB).` : err.message;
      return res.status(400).json({ error: msg });
    }
    if (err.status && err.status < 500) return res.status(err.status).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: 'Something went wrong on our side.' });
  });

  return app;
}
