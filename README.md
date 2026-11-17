# Marketcraft

A full-stack, responsive web app that teaches low-cost, direct-to-consumer marketing to **Kid Entrepreneurs**, **Adult Business Owners** and **Professionals**, through AI-researched lessons, real business-owner interviews, hands-on pitch-video challenges with AI coaching, and verifiable certificates.

Graduates aged 18+ can then join the **Ambassador Program**. They market the partner company **NexaEdits** with six AI marketing tools and earn a *Certified Brand Ambassador* certificate. The partner company shares Marketcraft's Firebase project, so the same login gives them normal user access on its website.

```
marketcraft/
├── server/      Express 5 API · Firebase Admin token checks · Claude AI modules · JSON store · tests
├── client/      React 19 + Vite · React Router 7 · Zustand · Firebase Auth SDK · role-based themes
├── firebase.json  Firebase Auth emulator config for local development
└── Dockerfile   Production image (client + API on one origin)
```

## 1. Set up Firebase (one time)

1. In the [Firebase console](https://console.firebase.google.com/), create a project (or open yours).
2. **Authentication → Sign-in method:** enable **Email/Password** and **Google**.
3. **Authentication → Settings → Authorized domains:** `localhost` is there by default. Add your real domain when you deploy.
4. **Project settings → Your apps → Add a Web app** and copy its config into `client/.env`:

   ```bash
   cp client/.env.example client/.env
   ```

   The web config (`apiKey`, `authDomain`, `projectId`, `appId`) is **not secret**: it identifies your project and ships in the browser.
5. Put the same **project ID** and your admin email(s) in `server/.env`:

   ```bash
   cp server/.env.example server/.env
   ```

   ```
   FIREBASE_PROJECT_ID=your-project-id
   ADMIN_EMAILS=you@school.edu
   JWT_SECRET=<long random string>
   ANTHROPIC_API_KEY=<for AI features>
   ```

   No service-account key is needed for sign-in. Optionally, point `GOOGLE_APPLICATION_CREDENTIALS` at one so revoked accounts get rejected too. Never commit that file.

## 2. Run locally

```bash
npm run install:all
npm run dev:server     # http://localhost:4000
npm run dev:client     # http://localhost:5173  (open this one)
```

**No Firebase project yet?** Use the local Auth emulator instead (needs the Firebase CLI: `npm i -g firebase-tools`):

```bash
firebase emulators:start --only auth --project demo-marketcraft
```

Then set `FIREBASE_PROJECT_ID=demo-marketcraft` and `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099` in `server/.env`. In `client/.env`, set `VITE_FIREBASE_PROJECT_ID=demo-marketcraft`, any `VITE_FIREBASE_API_KEY` (e.g. `demo-key`), and `VITE_FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099`.

Tests: `npm test` covers sign-in rules plus signup → fail → retry → pass → certificate.

## Share it for free from your own computer (no domain)

Two scripts run the full app on your computer and give it a free public link through a [Cloudflare quick tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/do-more-with-tunnels/trycloudflare/). You don't need an account or a domain.

**On a Chromebook:** first turn on Linux: **Settings → About ChromeOS → Developers → Linux development environment → Turn on**, then open the **Terminal** app. (A school-managed Chromebook may not allow this.)

```bash
git clone https://github.com/dubeyji24s/Marketcraft.git
cd Marketcraft
bash scripts/setup-local.sh     # one time: installs Node 22 + packages, asks for your Firebase web config and admin email
bash scripts/start-public.sh    # every time: prints your https://….trycloudflare.com link
```

- The link only works while the Terminal window stays open and the computer is awake. Press **Ctrl+C** to stop.
- You get a new link each time you start it. Your data stays in `server/data/` on your computer.
- Email/password sign-in works straight away. For **Sign in with Google**, add the link's domain under Firebase → Authentication → Settings → Authorized domains.
- Cloudflare says quick tunnels are for testing and offers no uptime guarantee. For anything bigger, see Deploy below.

## 3. Deploy (later)

No domain is needed for the school project: run it locally as above. When the project grows (and your school approves), deploy with Docker:

```bash
docker build -t marketcraft \
  --build-arg VITE_FIREBASE_API_KEY=... --build-arg VITE_FIREBASE_AUTH_DOMAIN=... \
  --build-arg VITE_FIREBASE_PROJECT_ID=... --build-arg VITE_FIREBASE_APP_ID=... .
docker run -p 4000:4000 --env-file server/.env -v mc-data:/app/server/data -v mc-uploads:/app/server/uploads marketcraft
```

The image works on any container host (Cloud Run, Render, Fly.io, Railway…). Add the site's domain to Firebase's **Authorized domains** and set `CLIENT_ORIGIN` to the public URL.

## Free by default (no AI key needed)

- **Starter engine** (`server/src/ai/starter.js`): free, offline versions of all six marketing tools. They write from the brand brief using proven copy formulas, with no key and no cost. If `ANTHROPIC_API_KEY` is ever set, the tools switch to Claude automatically.
- **Creator** (`client/src/lib/creator.js`): describe a design in plain words. Creator works out the format, occasion, mood, colours and details (dates, prices, places, quoted headlines) and makes 6 editable designs, or video scenes. It is free and offline.
  - Optional **free AI picture** from the Pollinations service: no key, rate-limited and best effort. The description is sent to that service.
- **Connect your own Canva** (`server/src/routes/canva.js`): learners can link their Canva Free or Pro account (Canva Connect API, OAuth + PKCE, encrypted tokens). **Send to Canva** uploads a design and opens it in their Canva. To switch it on, create an integration at canva.com/developers and set `CANVA_CLIENT_ID`, `CANVA_CLIENT_SECRET` and `CANVA_REDIRECT_URI`. Until Canva approves the integration, only accounts on the owner's Canva team can connect.

## AI team: Director + agents (fewer tokens, more work)

All AI work goes through the **Director** (`server/src/agents/director.js`):

| Agent | Job | Token cost |
|---|---|---|
| 🧭 Director | Routes jobs, re-uses identical answers (24 h cache), enforces a daily token budget per learner, falls back to the free engine | 0 |
| 🛡️ Partner Guard (`agents/guard.js`) | In Partner mode, checks requests, designs, videos, results and Canva sends for the partner's name, website, hashtags or topic words | 0 (rules). Only unclear cases go to a small model (`AI_GUARD_MODEL`, default `claude-haiku-5-5`), and only when AI is on |
| ✍️ Copywriter | The six marketing tools (Starter engine, or Claude when configured) | 0 in Starter mode |
| 🎨 Designer / 🎬 Video Producer | Creator designs, video scenes and music, in the browser | 0 |

The Guard's rules are shared with the browser, so checks are instant and also enforced on the server. Settings: `AI_DAILY_TOKEN_BUDGET` (default 60,000 per learner per day) and `AI_GUARD_MODEL`. Learners see their team's work in **My Lab → AI team**.

## My Marketing Lab

Opens in **Partner mode** as soon as a learner joins the Ambassador Program: every tool works, but everything made must promote the partner (the Partner Guard checks it). The **Ambassador certificate** unlocks **Own mode**, where graduates market their **own** product or service:

- **My brand**: their own facts. The AI never invents prices, results or reviews.
- **AI Toolkit**: all six tools on one screen, run in "own brand" mode with no ambassador disclosure needed. Each result can be copied or downloaded.
- **17 free templates** (`components/templates.js`): sale, events, launch, tips and thumbnails. Text auto-fits, and each template can be filled from an AI result (**🎨 Make a design**). A video script result becomes Video Maker scenes (**🎬 Make a video**). An "Open Canva" link lets learners also use their own free Canva account; Canva's editor can't be embedded inside other apps.
- **Design Studio** (`components/DesignEditor.jsx`): a Canva-style editor with size presets (post, story, flyer, poster, thumbnail), templates, text, shapes, photos, gradients, layers and undo. Exports PNG or JPG. Designs are saved per user.
- **Video Maker** (`components/VideoMaker.jsx`): scenes with animated backgrounds or the learner's own photos and clips, plus animated text. **Music is generated in the browser** (`lib/beats.js`), so every track is original and copyright-free. Exports MP4 or WebM, depending on the browser, and can send a video to the Showcase.
- **My files**: download every draft (single files or all at once) and every design.

The partner company is shown to learners only by its public label (Admin → Company brief → *Public label*, default "Partner Website"). The real name stays in the admin-only brief.

## Showcase

Learners post their own marketing videos (upload or link) in **Showcase**. Videos are private by default, which makes them a portfolio. Choosing "Community" sends a video to **Admin → Showcase review**, and others see it only once an admin approves it. Learners can cheer 👏 each other's videos.

## Sources

Every source behind the lessons and research, with links: [docs/SOURCES.md](docs/SOURCES.md).

## Clickable preview (artifact)

`npm run build:preview` builds a self-contained demo at `preview/marketcraft-preview.html`. It uses a simulated server and sign-in (`client/src/preview/`) and keeps data in the viewer's browser, so it can be shared as a claude.ai artifact. Downloads in the artifact go through the claude.ai `downloads` permission, which asks the viewer to confirm each save. It has demo accounts for Admin, Adult learner and Kid on a parent account. AI features answer "runs in the full app".

## Ambassador Program

```
Pass a Studio challenge at 85%+ (18+ account, or a kid on a parent's account) ─▶ unlocks the Ambassador hub
Join (agree to guidelines; kids need parent approval) ─▶ referral code + link
Log in to the company website with the same account (normal user access)
Use the AI Marketing Toolkit ─▶ Ambassador Mission (5-criterion rubric, 85%+) ─▶ certificate
```

- **Company brief** (Admin → Company brief; the name defaults to NexaEdits) is the only source of facts for the AI tools and the Mission grader. Fill it in first, including the website URL, which builds referral links: `?ref=CODE&utm_source=marketcraft&utm_medium=ambassador`.
- **AI Marketing Toolkit** (`server/src/ai/ambassadorTools.js`). Each tool has a learner guide (what it does / when to use / how-to steps / pro tip), validated inputs and a structured output:
  🎯 Audience Persona Builder · 📱 Social Post Writer · 🎬 Video Script Writer · 🪧 Ad & Flyer Copy · 🗓️ Content Calendar Planner · ✅ Compliance & Brand Checker.
  Shared guardrails: facts only from the brief (otherwise "[ask the company]"), an ambassador disclosure is always included, no spam or fake reviews, and kid-safe rules for kid profiles. Results are saved as drafts (30 most recent per user).
- **Ambassador Mission**: a real campaign video graded on clarity, audience, value, visuals **and brand accuracy & honest disclosure** (5 × 20 pts).
- **Admin → Ambassadors** lists members, codes, AI usage and Mission status.
- Marketcraft changes nothing in Firebase. Access on the company website is whatever that site gives any signed-in user.

## Age rules

- **Under 18 (Kid Entrepreneur):** must use a **parent's own** account (parent's email/password or Google). The child's first name goes on certificates. The parent gives consent and supervises.
- **Adult Business Owner / Professional:** the account holder confirms they are **18 or older** at signup.
- **Ambassador Program:** only for 18+ account holders. Kids take part through the parent's account, and the parent approves joining and posts anything public.

## How sign-in works

```
Browser ──Firebase Auth (email/password · Google · reset · verify)──▶ ID token
Browser ──POST /api/auth/session {idToken, profile?}──▶ Server verifies token with Firebase Admin
Server  ──finds/creates learner profile──▶ sets httpOnly "mc_session" cookie (5 days)
```

- Firebase owns passwords, Google sign-in, password-reset and verification emails. The app never stores passwords.
- New sessions require a sign-in from the last 10 minutes, so an old leaked token can't start a session.
- **Onboarding:** a first Google sign-in has no learner profile yet. The app asks for name, role and (for kids) guardian consent.
- **Admins** are the emails in `ADMIN_EMAILS`, granted only once the email is verified. Remove an email to revoke admin on the next sign-in.
- Users can change the name printed on certificates in **Settings**.

## Features → code

| Feature | Backend | Frontend |
|---|---|---|
| Firebase auth, roles, themed UI | `firebase.js`, `auth.js`, `routes/auth.js` | `lib/firebase.js`, `store/auth.js`, `pages/Public.jsx`, `pages/Settings.jsx`, `AppShell.jsx` |
| AI research engine + anti-plagiarism | `ai/research.js`, `ai/originality.js`, `routes/lessons.js` | `pages/Learn.jsx` |
| Business Owner Interviews hub | `routes/interviews.js`, `ai/interviews.js` | `pages/Interviews.jsx`, `pages/Admin.jsx` |
| Practice Studio | `routes/studio.js` | `pages/Studio.jsx`, `lib/frames.js` |
| AI evaluator + retries | `ai/evaluator.js` | `EvaluationReport` in `Studio.jsx` |
| Ambassador Program + AI toolkit | `routes/ambassador.js`, `ai/ambassadorTools.js`, `company.js` | `pages/Ambassador.jsx`, Admin → Company brief / Ambassadors |
| Certificates + public verification | `routes/studio.js` | `components/Certificate.jsx`, `/verify/:code` |

### API

```
POST /api/auth/session · POST /api/auth/logout · GET /api/auth/me · PATCH /api/auth/profile
GET  /api/lessons · GET /api/lessons/:id · POST /api/lessons/:id/complete · POST /api/lessons/research
PATCH|DELETE /api/lessons/:id (admin)
GET  /api/interviews · GET /api/interviews/:id/video · POST /api/interviews (admin, multipart)
PATCH|DELETE /api/interviews/:id · POST /api/interviews/summarize (admin)
GET  /api/studio/dashboard | /rubric | /challenges | /challenges/:id · POST /api/studio/challenges/assign
POST /api/studio/submissions (multipart) · GET /api/studio/submissions · GET /api/studio/submissions/:id/video
GET  /api/studio/certificates | /certificates/:id · GET /api/studio/certificates/verify/:code (public)
GET  /api/ambassador/status · POST /api/ambassador/join · POST /api/ambassador/tools/:id · GET|DELETE /api/ambassador/runs
GET|PUT /api/ambassador/brief (admin) · GET /api/ambassador/roster (admin)
```

## How the AI works

All AI calls use Claude (`claude-opus-5-5` by default; override with `AI_MODEL`) through `@anthropic-ai/sdk`, with structured outputs validated by zod. Server-side refusal fallback is on in `ai/client.js` (`fallbacks: "default"`). Remove those two lines to opt out.

- **Research engine:**
  - Web search is limited to trusted domains (`RESEARCH_DOMAINS`).
  - A separate call writes an original lesson with per-section citations.
  - An 8-gram overlap check against the cited excerpts triggers one rewrite. Drafts that still fail can't be published.
  - Learners' lessons are private. Admin drafts need publishing.
- **Evaluator:**
  - 6 frames are taken from uploaded videos in the browser, plus the written strategy and optional script.
  - Scoring uses a 4 × 25-point rubric: clarity, audience, value proposition, visual appeal. The server computes the total.
  - Certificates require **85%** (professional standard; `PASS_THRESHOLD`). Below that, learners see how many points they need and retry as often as they like. Distinction is at 95%.
- **Without an API key** the app still runs. Scoring uses a labelled offline demo scorer.

## Security & privacy

- **Headers:** Helmet CSP allows only Firebase and Google sign-in, the video embeds, and Google Fonts. The cross-origin opener policy permits the Google sign-in popup.
- **Cookies and requests:** session cookies are httpOnly and SameSite. Mutating requests get an Origin check.
- **Rate limits** apply to sign-in, research and submissions.
- **Uploads:** submission videos are visible only to their owner and admins. Uploads get random names, a type allow-list and size limits.
- **Kids:** accounts need a guardian email and consent. AI prompts for kids use simpler language.
- **Policies:** `/privacy` and `/terms` are **drafts for a school project**. Have them reviewed before a public launch.

## Roadmap to production

- Move data from the JSON store (`server/src/db.js`, the single adapter) to Firestore or Postgres, and videos to Firebase/Cloud Storage with signed URLs.
- Verify guardian consent by email link, as COPPA-style rules require.
- Transcribe uploaded audio so the evaluator hears the pitch.
- Add analytics, teacher/classroom dashboards, and a moderation queue before any public sharing features.
