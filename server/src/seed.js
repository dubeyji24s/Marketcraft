import { db } from './db.js';
import { EXTRA_LESSONS } from './lessons-extra.js';
import { PRO_LESSONS } from './lessons-pro.js';
import { MONTH_LESSONS } from './lessons-month.js';

export const BADGES = {
  'first-lesson': { label: 'Curious Mind', emoji: '📚', description: 'Completed your first lesson' },
  'quiz-ace': { label: 'Quiz Ace', emoji: '🎯', description: 'Perfect score on a lesson quiz' },
  'first-pitch': { label: 'Lights, Camera!', emoji: '🎬', description: 'Submitted your first pitch' },
  comeback: { label: 'Comeback Kid', emoji: '🔁', description: 'Passed after a retry' },
  certified: { label: 'Certified Marketer', emoji: '🏅', description: 'Earned a certificate' },
  distinction: { label: 'Gold Pitch', emoji: '🏆', description: 'Scored distinction (95%+)' },
  ambassador: { label: 'Brand Ambassador', emoji: '🤝', description: 'Joined the Ambassador Program' },
  'brand-certified': { label: 'Certified Ambassador', emoji: '🌟', description: 'Passed the Ambassador Mission' },
  lab: { label: 'Founder Mode', emoji: '🧪', description: 'Set up your own brand in the Marketing Lab' },
  showcase: { label: 'On Stage', emoji: '🎥', description: 'Shared a marketing video in the Showcase' },
  'idea-builder': { label: 'Idea Builder', emoji: '💡', description: 'Finished every step of an idea on your Idea Board' },
  'streak-7': { label: 'On Fire', emoji: '🔥', description: 'Learned 7 days in a row' },
  swiper: { label: 'Quick Learner', emoji: '📱', description: 'Finished 5 swipe lessons' },
  medal: { label: 'Marketcraft Medal', emoji: '🥇', description: 'Junior whose marketing video reached 1,000 views' },
};

export const CHALLENGES = [
  {
    slug: 'lemonade-launch',
    title: 'Launch Weekend Lemonade',
    product: 'Fresh-squeezed lemonade stand',
    brief: 'You are opening a lemonade stand this Saturday near a park. Create a 30-60 second pitch video that gets neighbors to come by. Plan a sign, a hook, and a reason to visit today.',
    channel: 'outdoor',
    budget: '$10',
    difficulty: 'starter',
    audiences: ['kid', 'adult', 'professional'],
    certificateBadge: 'Street-Smart Seller',
    color: '#FFC83D',
  },
  {
    slug: 'handmade-reel',
    title: 'Handmade Goods Reel',
    product: 'Handmade beaded bracelets',
    brief: 'Make a short vertical video for social media that shows how your bracelets are made and why they make a great gift. End with how to order.',
    channel: 'social',
    budget: '$0',
    difficulty: 'starter',
    audiences: ['kid', 'adult', 'professional'],
    certificateBadge: 'Social Spark',
    color: '#FF5DA2',
  },
  {
    slug: 'bakery-referral',
    title: 'Neighborhood Bakery Referral Push',
    product: 'Small-batch sourdough bakery',
    brief: 'Pitch a referral program ("bring a friend, get a free cookie") in a 60 second video for Instagram and a printed counter card. Explain who you target and how you will measure it.',
    channel: 'social',
    budget: '$50',
    difficulty: 'intermediate',
    audiences: ['adult', 'professional'],
    certificateBadge: 'Word-of-Mouth Builder',
    color: '#FF8A3D',
  },
  {
    slug: 'tutoring-ad',
    title: 'Local Tutoring Mini-Ad',
    product: 'After-school math tutoring',
    brief: 'Record a 30 second ad that could run as a short paid social ad targeted to parents within 5 miles. Show credibility, a clear offer, and a call to action.',
    channel: 'digital-ad',
    budget: '$100',
    difficulty: 'intermediate',
    audiences: ['adult', 'professional'],
    certificateBadge: 'Ad Architect',
    color: '#3DD6FF',
  },
  {
    slug: 'popup-market',
    title: 'Pop-Up Market Booth Demo',
    product: 'Eco-friendly reusable snack bags',
    brief: 'Film a live-style product demo you would run at a weekend farmers market booth. Show the product in action, handle one objection, and invite people to join your email list.',
    channel: 'outdoor',
    budget: '$75',
    difficulty: 'advanced',
    audiences: ['kid', 'adult', 'professional'],
    certificateBadge: 'Live Demo Pro',
    color: '#5BE37D',
  },
  {
    slug: 'saas-founder',
    title: 'Founder-Led Launch Video',
    product: 'A budgeting app for freelancers',
    brief: 'Record a founder-style launch video for LinkedIn and an email to your waitlist. Define the niche, the pain point, proof, and a time-limited offer. Explain how you will track conversions.',
    channel: 'digital-ad',
    budget: '$200',
    difficulty: 'advanced',
    audiences: ['professional'],
    certificateBadge: 'Launch Strategist',
    color: '#9B6BFF',
  },
];

// Original, hand-written starter lessons. Sources are attribution for the underlying
// concepts; the text is our own.
export const LESSONS = [
  {
    slug: 'word-of-mouth',
    title: 'Word of Mouth: Your Free Megaphone',
    summary: 'Happy customers are the cheapest advertising you will ever get. Learn how to make your product easy and fun to talk about, then give people a reason to share it.',
    level: 'beginner',
    estimatedMinutes: 6,
    costLevel: 'free',
    audiences: ['kid', 'adult', 'professional'],
    sections: [
      {
        heading: 'Why people share',
        body: 'People pass along things that make them look helpful, smart, or in-the-know. If your product solves a small annoying problem, or feels like a secret find, customers will want to tell friends about it. Your job is to make that story short enough to repeat in one breath.',
        sourceRefs: [0],
      },
      {
        heading: 'Make it easy to talk about',
        body: '- Pick one memorable thing (the "only" or "first" about you).\n- Give it a name people can say out loud.\n- Hand out something tangible: a sticker, a card, a sample to share.',
        sourceRefs: [0],
      },
      {
        heading: 'Ask, and say thank you',
        body: 'Most happy customers never think to recommend you until you ask. At the moment someone smiles about your product, ask: "Know anyone else who would like this?" Then thank them publicly or with a small perk. If you reward reviews or referrals, tell people clearly that the reviewer got something in return; honesty keeps trust high and follows advertising rules.',
        sourceRefs: [1],
      },
    ],
    keyTakeaways: ['Referrals cost almost nothing', 'One memorable hook beats ten features', 'Ask at the happiest moment', 'Disclose any rewards for reviews'],
    actionSteps: ['Write your one-breath description', 'Make 20 referral cards', 'Ask your next 5 customers for a referral'],
    quiz: [
      { question: 'When is the best time to ask for a referral?', options: ['Before they buy', 'Right when they are happy with the product', 'A year later'], answerIndex: 1 },
      { question: 'If you give someone a free gift for a review, you should…', options: ['Keep it secret', 'Clearly disclose it', 'Only give gifts to family'], answerIndex: 1 },
    ],
    sources: [
      { url: 'https://www.sba.gov/business-guide/manage-your-business/marketing-sales', title: 'U.S. Small Business Administration — Marketing and sales' },
      { url: 'https://www.ftc.gov/business-guidance/advertising-marketing/endorsements-influencers-reviews', title: 'FTC — Endorsements, Influencers, and Reviews' },
    ],
  },
  {
    slug: 'know-your-customer',
    title: 'Find Your First 100 Fans',
    summary: 'Marketing to "everyone" is marketing to no one. Learn to describe one specific customer and go where they already hang out.',
    level: 'beginner',
    estimatedMinutes: 7,
    costLevel: 'free',
    audiences: ['kid', 'adult', 'professional'],
    sections: [
      {
        heading: 'Draw your customer',
        body: 'Picture one real person who would love your product. How old are they? What do they do on a Saturday? What bugs them that your product fixes? Write it down as a short character sketch and give them a name. Every flyer, post, and video should speak to that one person.',
        sourceRefs: [0],
      },
      {
        heading: 'Go where they already are',
        body: 'Instead of paying to bring people to you, show up where your customer already spends time: a school club, a community board, a local online group, a weekend market. List three places, then pick the one you can reach this week for free.',
        sourceRefs: [0, 1],
      },
      {
        heading: 'Test, listen, adjust',
        body: 'Try a message, see who responds, and ask a few buyers why they bought. Their words are your best marketing copy next time.',
        sourceRefs: [1],
      },
    ],
    keyTakeaways: ['Describe one specific customer', 'Meet customers where they already gather', 'Use buyers\' own words in your ads'],
    actionSteps: ['Write a 5-line customer sketch', 'List 3 places they gather', 'Ask 3 buyers why they bought'],
    quiz: [
      { question: 'Who should your marketing speak to?', options: ['Everyone', 'One specific type of customer', 'Only your friends'], answerIndex: 1 },
    ],
    sources: [
      { url: 'https://www.sba.gov/business-guide/plan-your-business/market-research-competitive-analysis', title: 'U.S. Small Business Administration — Market research and competitive analysis' },
      { url: 'https://www.score.org/', title: 'SCORE — Free small business mentoring and resources' },
    ],
  },
  {
    slug: 'pitch-video-basics',
    title: 'The 30-Second Pitch Video Formula',
    summary: 'A great short video has four beats: hook, problem, solution, call to action. Here is how to film one with just a phone.',
    level: 'beginner',
    estimatedMinutes: 8,
    costLevel: 'free',
    audiences: ['kid', 'adult', 'professional'],
    sections: [
      {
        heading: 'Hook in 3 seconds',
        body: 'Open with motion, a surprising question, or the product in action. If the first moment is a logo or "Hi, my name is…", viewers scroll away.',
        sourceRefs: [0],
      },
      {
        heading: 'Problem → Solution → Proof',
        body: 'Name the annoying problem your customer has, show your product solving it on camera, then add proof: a happy customer, a before/after, or a number.',
        sourceRefs: [0],
      },
      {
        heading: 'Phone filming checklist',
        body: '- Face a window for free, soft light.\n- Hold the phone vertically for social, horizontally for screens.\n- Get close: the product should fill the frame.\n- Add captions; many people watch with the sound off.\n- End with ONE clear action: "Visit us Saturday", "DM to order".',
        sourceRefs: [0],
      },
    ],
    keyTakeaways: ['Hook fast', 'Show, don\'t tell', 'Captions on', 'One call to action'],
    actionSteps: ['Write your four beats on a sticky note', 'Film three takes', 'Pick the best and add captions'],
    quiz: [
      { question: 'What should the first 3 seconds show?', options: ['Your logo', 'Something that grabs attention', 'A long introduction'], answerIndex: 1 },
    ],
    sources: [{ url: 'https://www.thinkwithgoogle.com/', title: 'Think with Google — marketing insights' }],
  },
  {
    slug: 'honest-marketing',
    title: 'Honest Marketing & the Rules',
    summary: 'Low-cost marketing still has rules. Learn the basics of truthful claims, disclosing paid endorsements, and respecting people\'s inboxes.',
    level: 'intermediate',
    estimatedMinutes: 6,
    costLevel: 'free',
    audiences: ['adult', 'professional', 'kid'],
    sections: [
      {
        heading: 'Claims must be true',
        body: 'If you say "best", "fastest", or "100% natural", be ready to back it up. Specific, honest claims ("baked this morning") build more trust than big vague ones.',
        sourceRefs: [0],
      },
      {
        heading: 'Disclose relationships',
        body: 'If a friend, influencer, or customer got free product or money to talk about you, that connection should be clear to viewers, in plain words, right where people will see it.',
        sourceRefs: [0],
      },
      {
        heading: 'Email with permission',
        body: 'Only email people who asked to hear from you, include your business contact info, and make unsubscribing easy.',
        sourceRefs: [1],
      },
    ],
    keyTakeaways: ['Be specific and truthful', 'Disclose paid or gifted endorsements', 'Get permission before emailing'],
    actionSteps: ['Review your claims for proof', 'Add a disclosure line template', 'Add an unsubscribe link to emails'],
    quiz: [
      { question: 'An influencer got your product for free. What should their post include?', options: ['Nothing extra', 'A clear disclosure', 'A discount code only'], answerIndex: 1 },
    ],
    sources: [
      { url: 'https://www.ftc.gov/business-guidance/advertising-marketing/endorsements-influencers-reviews', title: 'FTC — Endorsements, Influencers, and Reviews' },
      { url: 'https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business', title: 'FTC — CAN-SPAM Act: A Compliance Guide for Business' },
    ],
  },
];

export const INTERVIEWS = [
  {
    title: 'How a Corner Café Grew With Chalkboards and Regulars',
    businessName: 'Sample: Corner Café',
    ownerName: 'Demo interview',
    videoUrl: '',
    embedUrl: '',
    summary: 'Placeholder interview so the gallery is not empty. Admins can upload real interviews from the Admin page and delete this one.',
    takeaways: ['A sidewalk chalkboard with a daily joke pulled in walk-ins', 'Learning regulars\' names turned them into referrers', 'Partnering with the bookstore next door doubled weekend traffic'],
    transcriptSummary: 'This is sample content for demonstration.',
    tags: ['local', 'signage', 'partnerships'],
    published: true,
  },
];

// Real campaign for the partner company; "{company}" is filled from the company brief.
export const AMBASSADOR_MISSION = {
  slug: 'ambassador-mission',
  kind: 'ambassador',
  title: 'Ambassador Mission: Grow the {company}',
  product: '{company}',
  brief: 'Create a real, professional marketing campaign for {company}. Use the AI tools to pick a persona, plan your content and write a script, then film a 30-90 second video that could be posted today. Explain who you target, why they should care, where you will post, how you stay honest (disclosure!), and how you will measure results with your referral link.',
  channel: 'social',
  budget: '$0 – your own time and phone',
  difficulty: 'advanced',
  audiences: ['kid', 'adult', 'professional'],
  certificateBadge: 'Certified Brand Ambassador',
  color: '#00C2A8',
};

export async function seed() {
  const mission = db.find('challenges', (c) => c.kind === 'ambassador');
  if (!mission) await db.insert('challenges', AMBASSADOR_MISSION);
  else if (mission.title !== AMBASSADOR_MISSION.title || mission.certificateBadge !== AMBASSADOR_MISSION.certificateBadge) {
    await db.update('challenges', mission.id, { title: AMBASSADOR_MISSION.title, certificateBadge: AMBASSADOR_MISSION.certificateBadge });
  }
  if (db.all('challenges', (c) => c.kind !== 'ambassador').length === 0) for (const c of CHALLENGES) await db.insert('challenges', c);
  // staff lessons are added by slug, so new lessons also reach existing databases
  for (const l of [...LESSONS, ...EXTRA_LESSONS, ...PRO_LESSONS, ...MONTH_LESSONS]) {
    if (!db.find('lessons', (x) => x.slug === l.slug)) {
      await db.insert('lessons', { ...l, generatedBy: 'staff', published: true, originality: { score: 100, passed: true, revisions: 0 } });
    }
  }
  if (db.all('interviews').length === 0) for (const i of INTERVIEWS) await db.insert('interviews', i);
}
