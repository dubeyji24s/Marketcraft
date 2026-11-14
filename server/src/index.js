import { createApp } from './app.js';
import { config } from './config.js';
import { seed } from './seed.js';

await seed();
createApp().listen(config.port, () => {
  console.log(`Marketcraft API on http://localhost:${config.port}`);
  if (!config.firebaseProjectId) console.warn('Sign-in disabled: set FIREBASE_PROJECT_ID.');
  if (!config.adminEmails.length) console.warn('No admins: set ADMIN_EMAILS to grant the Admin role.');
  console.log(config.aiEnabled ? `AI enabled (${config.aiModel})` : 'AI disabled: set ANTHROPIC_API_KEY. Evaluator runs in offline demo mode.');
});
