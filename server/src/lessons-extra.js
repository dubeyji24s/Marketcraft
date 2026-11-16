// Original Marketcraft lessons, written in our own words from research on official sources
// (FTC, SBA, Google). Sources are listed for attribution and further reading.
const ALL = ['kid', 'adult', 'professional'];

export const EXTRA_LESSONS = [
  {
    slug: 'honest-reviews',
    title: 'Honest Reviews That Bring Customers',
    summary: 'Reviews are often the last thing people check before buying. Learn how to collect real ones, respond like a pro, and stay on the right side of the FTC rule against fake reviews.',
    level: 'beginner',
    estimatedMinutes: 7,
    costLevel: 'free',
    audiences: ALL,
    sections: [
      {
        heading: 'Why reviews matter so much',
        body: 'A stranger trusts other customers more than they trust you. A handful of genuine reviews, even a few with small complaints, makes a new business feel safe to try. Your job is to make leaving a review easy for the people who already liked what you sell.',
        sourceRefs: [2],
      },
      {
        heading: 'How to ask (the right way)',
        body: '- Ask every customer, not only the ones you think will be happy.\n- Ask soon after a good experience, while it is fresh.\n- Make it one tap: a short link or QR code on the receipt, bag or thank-you message.\n- Never offer a reward only for positive reviews. You may thank people for leaving a review, but not for leaving a *good* one.',
        sourceRefs: [0, 1],
      },
      {
        heading: 'What the FTC rule bans',
        body: 'Since October 21, 2024, a U.S. federal rule bans buying or selling fake reviews and testimonials, including AI-written ones from people who never used the product. It also bans paying for reviews that must be positive (or negative), buying fake followers or views, and threatening people to remove bad reviews. Breaking it can mean serious fines.',
        sourceRefs: [0, 1],
      },
      {
        heading: 'Answer every review',
        body: 'Thank happy customers by name. For a complaint, stay calm, apologize for the experience, and offer to fix it offline. Future customers read your replies too; a kind, helpful answer to a bad review can win more trust than a five-star one.',
        sourceRefs: [2],
      },
    ],
    keyTakeaways: ['Ask every customer, make it one tap', 'Never pay for positive-only reviews', 'Fake reviews and fake followers are banned', 'Reply to good and bad reviews kindly'],
    actionSteps: ['Make a short review link or QR code', 'Add it to receipts or thank-you messages', 'Reply to every review this week'],
    quiz: [
      { question: 'Which of these is allowed?', options: ['Paying for 5-star reviews only', 'Thanking everyone who leaves any honest review', 'Buying followers to look popular'], answerIndex: 1 },
      { question: 'How should you handle a negative review?', options: ['Ignore it', 'Threaten the reviewer', 'Reply politely and offer to fix the problem'], answerIndex: 2 },
    ],
    sources: [
      { url: 'https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials', title: 'FTC — Final Rule Banning Fake Reviews and Testimonials (2024)' },
      { url: 'https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers', title: 'FTC — Consumer Reviews and Testimonials Rule: Questions and Answers' },
      { url: 'https://support.google.com/business/answer/7039811', title: 'Google Business Profile Help — Get started' },
    ],
  },
  {
    slug: 'disclose-like-a-pro',
    title: 'Disclose Like a Pro: Ambassador & Influencer Rules',
    summary: 'If a brand gives you anything (money, free stuff, a discount, or you are its ambassador), your audience deserves to know. Here is exactly when, where and how to say it.',
    level: 'beginner',
    estimatedMinutes: 6,
    costLevel: 'free',
    audiences: ALL,
    sections: [
      {
        heading: 'When you must disclose',
        body: 'Disclose any connection that could change how people see your recommendation: being paid, getting free or discounted products, being a brand ambassador, working for the company, or being a friend or relative of the owner. A free product counts even if nobody asked you to post about it.',
        sourceRefs: [0, 1],
      },
      {
        heading: 'Where to put it',
        body: '- In the post itself, where people will see it without clicking "more".\n- Not hidden in a pile of hashtags, a bio or a profile page.\n- In a video, say it out loud **and** show it on screen, not only in the description.\n- In a live stream, repeat it from time to time for people who join late.\n- On **every** post, because followers don\'t read them all.',
        sourceRefs: [0, 2],
      },
      {
        heading: 'What to say',
        body: 'Use simple words anyone understands: "#ad", "Sponsored", "I\'m a brand ambassador for this brand", or "Thanks to the company for the free sample". Vague tags like "#sp" or "#collab" are not enough.',
        sourceRefs: [0],
      },
      {
        heading: 'Stay honest',
        body: 'Only talk about products you have actually tried, share your real opinion, and never make claims you can\'t prove (like health or money results). Honest ambassadors keep their audience\'s trust and keep the brand out of trouble.',
        sourceRefs: [0, 2],
      },
    ],
    keyTakeaways: ['Free products count as a connection', 'Disclose in every post, where it\'s seen', 'Say it AND show it in videos', 'Use clear words like #ad or "brand ambassador"'],
    actionSteps: ['Write your standard disclosure line', 'Add it to your post and video templates', 'Check old posts and add missing disclosures'],
    quiz: [
      { question: 'A brand sent you a free product. Do you need to disclose it?', options: ['No, it was free', 'Yes, free products count', 'Only if you were paid money'], answerIndex: 1 },
      { question: 'Which disclosure is clearest?', options: ['#sp', '#collab', '"I\'m a brand ambassador for this company"'], answerIndex: 2 },
      { question: 'Where should a video disclosure go?', options: ['Only in the description', 'Said and shown in the video itself', 'In your bio'], answerIndex: 1 },
    ],
    sources: [
      { url: 'https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers', title: 'FTC — Disclosures 101 for Social Media Influencers' },
      { url: 'https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking', title: 'FTC — Endorsement Guides: What People Are Asking' },
      { url: 'https://www.ftc.gov/news-events/topics/truth-advertising/advertisement-endorsements', title: 'FTC — Advertisement Endorsements' },
    ],
  },
  {
    slug: 'google-business-profile',
    title: 'Get Found on Google Maps (for Free)',
    summary: 'A free Google Business Profile puts a local business on Search and Maps. Learn what to fill in, which photos to add and how to turn views into visits.',
    level: 'beginner',
    estimatedMinutes: 7,
    costLevel: 'free',
    audiences: ['adult', 'professional'],
    sections: [
      {
        heading: 'Who can use it',
        body: 'Google Business Profiles are for businesses that meet customers in person, at a shop or by visiting them (like a plumber or tutor). Online-only businesses aren\'t eligible, so they should focus on their website and social profiles instead.',
        sourceRefs: [0, 1],
      },
      {
        heading: 'Fill in the basics perfectly',
        body: '- Correct name, address or service area, phone, website and hours (update them for holidays!).\n- A clear description (under 750 characters) of what you offer and what makes you different, written for customers, not search engines.\n- The right category; it decides which searches you show up in.',
        sourceRefs: [1, 2],
      },
      {
        heading: 'Photos and posts',
        body: 'Add real photos: the outside of your shop (so people recognize it), the inside, your products and your team. Use Posts to share offers, events and news, each with one clear button like "Book", "Order" or "Call".',
        sourceRefs: [1, 3],
      },
      {
        heading: 'Learn from your numbers',
        body: 'The profile shows how people found you (which words they searched) and what they did: calls, direction requests, website clicks. Check it monthly, then use those search words in your description and posts.',
        sourceRefs: [0],
      },
    ],
    keyTakeaways: ['Free listing on Search and Maps', 'For businesses that meet customers in person', 'Accurate hours and real photos build trust', 'Use Posts with one clear call to action'],
    actionSteps: ['Claim or create your profile', 'Add 5 real photos including the storefront', 'Publish one Post with a clear button'],
    quiz: [
      { question: 'Which business can NOT get a Google Business Profile?', options: ['A bakery with a shop', 'A mobile dog groomer', 'An online-only app with no in-person contact'], answerIndex: 2 },
      { question: 'Why add an outside photo of your shop?', options: ['It helps people recognize it when they arrive', 'Google requires 50 photos', 'It hides your address'], answerIndex: 0 },
    ],
    sources: [
      { url: 'https://business.google.com/us/business-profile/', title: 'Google — Business Profile' },
      { url: 'https://support.google.com/business/answer/7039811', title: 'Google Business Profile Help — Get started' },
      { url: 'https://support.google.com/business/answer/3039617', title: 'Google Business Profile Help — Edit your Business Profile' },
      { url: 'https://support.google.com/business/community-guide/411855960/google-business-profile-posts-best-practices?hl=en', title: 'Google Business Profile Community — Posts best practices' },
    ],
  },
  {
    slug: 'email-list-from-zero',
    title: 'Build an Email List From Zero',
    summary: 'Social apps can change their rules overnight, but an email list is yours. Learn how to grow one with permission, write emails people open, and follow the CAN-SPAM rules.',
    level: 'intermediate',
    estimatedMinutes: 8,
    costLevel: 'free',
    audiences: ['adult', 'professional'],
    sections: [
      {
        heading: 'Why email still wins',
        body: 'Followers on social media see only some of your posts, and you don\'t control the platform. People on your email list chose to hear from you, and you can reach them directly when you have a new product, event or offer.',
        sourceRefs: [0],
      },
      {
        heading: 'Grow it with permission',
        body: '- Offer something useful for signing up: a tip sheet, early access, or a small first-order perk.\n- Collect sign-ups everywhere you already are: checkout, events, your website, a QR code on your table.\n- Only add people who said yes. Never buy lists or add contacts without asking.',
        sourceRefs: [0, 1],
      },
      {
        heading: 'Emails people actually open',
        body: 'Write a short, specific subject line, one main message, and one button. Test one change at a time (two subject lines, or two send times) and compare how many people open and click. Keep what works.',
        sourceRefs: [0],
      },
      {
        heading: 'The rules (CAN-SPAM)',
        body: 'In the U.S., commercial emails must not use misleading subject lines or sender names, must include your business\'s physical address, and must give an easy way to unsubscribe, which you honor quickly.',
        sourceRefs: [1],
      },
    ],
    keyTakeaways: ['Your list is an audience you own', 'Grow only with permission', 'One message, one button per email', 'Honest subject, address and unsubscribe link'],
    actionSteps: ['Pick a sign-up perk', 'Put a sign-up QR code where customers pay', 'Send your first short email and check opens/clicks'],
    quiz: [
      { question: 'What is the best way to grow an email list?', options: ['Buy a list of emails', 'Ask people to opt in with a useful perk', 'Add everyone you have ever met'], answerIndex: 1 },
      { question: 'Which must every marketing email include?', options: ['An easy way to unsubscribe', 'At least 5 images', 'A countdown timer'], answerIndex: 0 },
    ],
    sources: [
      { url: 'https://www.sba.gov/blog/email-marketing-basics-small-business', title: 'U.S. Small Business Administration — Email marketing basics' },
      { url: 'https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business', title: 'FTC — CAN-SPAM Act: A Compliance Guide for Business' },
    ],
  },
  {
    slug: 'social-media-that-sells',
    title: 'Social Media That Sells (Without Paying for Ads)',
    summary: 'You don\'t need to be on every app. Pick one platform, post consistently, talk with people, and use social media to test ideas for free.',
    level: 'beginner',
    estimatedMinutes: 7,
    costLevel: 'free',
    audiences: ALL,
    sections: [
      {
        heading: 'Pick one platform first',
        body: 'Go where your customers already spend time. Teens and creators lean toward short video, local families often use community groups, and professionals use LinkedIn. Doing one platform well beats doing five badly.',
        sourceRefs: [0, 1],
      },
      {
        heading: 'A simple posting mix',
        body: '- **Show**: the product in action or how it\'s made.\n- **Teach**: a quick tip your customer will find useful.\n- **Tell**: a real story, such as a happy customer (with permission) or behind the scenes.\n- **Ask**: a question or poll so people reply.\nPost on a steady schedule you can keep, like three times a week.',
        sourceRefs: [0],
      },
      {
        heading: 'Be social, not just loud',
        body: 'Reply to comments and messages quickly and kindly; social media is also a customer-service desk. Thank people who tag you, and share their posts (with permission).',
        sourceRefs: [0, 1],
      },
      {
        heading: 'Test ideas for free',
        body: 'Want to try a new product, price or event? Post about it first and see how people react before spending money. Comments, saves and shares tell you what your audience cares about.',
        sourceRefs: [1],
      },
    ],
    keyTakeaways: ['One platform done well', 'Show, teach, tell, ask', 'Reply to everyone', 'Test ideas with a free post first'],
    actionSteps: ['Choose your one platform', 'Plan 3 posts for this week using the mix', 'Reply to every comment within a day'],
    quiz: [
      { question: 'What is the best first step on social media?', options: ['Join every app at once', 'Pick the one platform your customers use most', 'Only post ads'], answerIndex: 1 },
      { question: 'Why post a new idea before launching it?', options: ['To test the reaction for free', 'To confuse competitors', 'Because ads are banned'], answerIndex: 0 },
    ],
    sources: [
      { url: 'https://www.sba.gov/blog/5-tips-make-your-small-business-social-media-savvy', title: 'U.S. Small Business Administration — 5 tips to make your small business social media savvy' },
      { url: 'https://www.sba.gov/business-guide/manage-your-business/marketing-sales', title: 'U.S. Small Business Administration — Marketing and sales' },
    ],
  },
  {
    slug: 'track-what-works',
    title: 'Track What Works: Links, UTMs & Simple Numbers',
    summary: 'If you can\'t measure it, you can\'t improve it. Learn to tag your links so you know exactly which post, flyer or ambassador brought each visitor.',
    level: 'intermediate',
    estimatedMinutes: 8,
    costLevel: 'free',
    audiences: ['adult', 'professional'],
    sections: [
      {
        heading: 'What a UTM link is',
        body: 'A UTM link is a normal link with labels added to the end, like `?utm_source=instagram&utm_medium=social&utm_campaign=spring_sale`. When someone clicks it, website analytics tools (such as Google Analytics) record those labels, so you can see which campaign brought them.',
        sourceRefs: [0],
      },
      {
        heading: 'The three labels to always use',
        body: '- **utm_source**: where the click came from (instagram, flyer, newsletter).\n- **utm_medium**: the type of channel (social, email, print).\n- **utm_campaign**: the name of your campaign (spring_sale).\nOptional labels like **utm_content** help you compare two versions, such as two different buttons in the same email.',
        sourceRefs: [0],
      },
      {
        heading: 'Keep your labels tidy',
        body: 'Labels are case-sensitive: "Instagram" and "instagram" show up as two different sources. Pick one lowercase spelling for each label, write them down in a shared list, and use a free URL builder so you never make typos.',
        sourceRefs: [0, 1],
      },
      {
        heading: 'Simple numbers to watch',
        body: 'Follow the path from attention to action: how many people saw it, how many clicked, and how many bought or signed up. If many see but few click, improve the hook. If many click but few buy, improve the page or offer.',
        sourceRefs: [2],
      },
    ],
    keyTakeaways: ['UTM labels show which campaign worked', 'Always set source, medium and campaign', 'Use consistent lowercase labels', 'Track seen → clicked → bought'],
    actionSteps: ['Create one tagged link for your next post', 'Start a shared list of your label names', 'Check results after one week'],
    quiz: [
      { question: 'Which three UTM labels should you always include?', options: ['source, medium, campaign', 'color, size, price', 'name, email, phone'], answerIndex: 0 },
      { question: 'Why use lowercase labels consistently?', options: ['Labels are case-sensitive, so variants split your data', 'Uppercase is not allowed in links', 'It makes links shorter'], answerIndex: 0 },
    ],
    sources: [
      { url: 'https://support.google.com/analytics/answer/10917952?hl=en', title: 'Google Analytics Help — Collect campaign data with custom URLs' },
      { url: 'https://ga-dev-tools.google/ga4/campaign-url-builder/', title: 'Google — Campaign URL Builder' },
      { url: 'https://www.sba.gov/business-guide/manage-your-business/marketing-sales', title: 'U.S. Small Business Administration — Marketing and sales' },
    ],
  },
  {
    slug: 'one-page-marketing-plan',
    title: 'Your One-Page Marketing Plan',
    summary: 'Big companies write 50-page plans. You need one page: a goal, a customer, a message, three channels, a budget and a way to measure. Here is the template.',
    level: 'intermediate',
    estimatedMinutes: 9,
    costLevel: 'free',
    audiences: ALL,
    sections: [
      {
        heading: 'Start with one clear goal',
        body: 'Make it specific and measurable, with a deadline: "Get 100 email sign-ups by June 30" or "Sell 50 bracelets at the spring fair". A clear goal tells you which ideas are worth your time.',
        sourceRefs: [0, 1],
      },
      {
        heading: 'Customer and message',
        body: 'Write one sentence about who you are trying to reach, and one sentence about why they should choose you. Everything you create should repeat that message in different ways.',
        sourceRefs: [1],
      },
      {
        heading: 'Pick three channels and a budget',
        body: '- Choose up to three channels you can actually keep up with (for example: Instagram, an email list, and a flyer at the library).\n- Write down your budget in money **and** time (2 hours a week counts!).\n- Plan what you will post or do each week.',
        sourceRefs: [0, 1],
      },
      {
        heading: 'Measure and adjust',
        body: 'Decide in advance what number you will check (sign-ups, sales, clicks) and when. Every two weeks, keep what works and drop what doesn\'t. A plan you update is better than a perfect plan you never look at again.',
        sourceRefs: [0],
      },
    ],
    keyTakeaways: ['One specific, dated goal', 'One customer, one message', 'Max three channels you can sustain', 'Check numbers every two weeks'],
    actionSteps: ['Fill in the one-page template', 'Share it with someone for feedback', 'Set a reminder to review it in two weeks'],
    quiz: [
      { question: 'Which goal is best?', options: ['Be famous', 'Get 100 email sign-ups by June 30', 'Post a lot'], answerIndex: 1 },
      { question: 'How many channels should a beginner focus on?', options: ['As many as possible', 'Up to three they can keep up with', 'None'], answerIndex: 1 },
    ],
    sources: [
      { url: 'https://www.sba.gov/business-guide/manage-your-business/marketing-sales', title: 'U.S. Small Business Administration — Marketing and sales' },
      { url: 'https://www.score.org/', title: 'SCORE — Free small business mentoring and resources' },
    ],
  },
  {
    slug: 'partner-up',
    title: 'Partner Up: Grow With Nearby Businesses & Creators',
    summary: 'Teaming up with a business or creator who serves the same customers (but doesn\'t compete with you) doubles your reach for free.',
    level: 'intermediate',
    estimatedMinutes: 6,
    costLevel: 'free',
    audiences: ALL,
    sections: [
      {
        heading: 'Find the right partner',
        body: 'Look for someone with the same customers but a different product: a coffee shop and a bakery, a dog groomer and a pet photographer, a math tutor and a school supply store. List five possible partners near you or in your online community.',
        sourceRefs: [0, 1],
      },
      {
        heading: 'Simple partnership ideas',
        body: '- Swap shout-outs or posts.\n- Put each other\'s flyers or cards at the counter.\n- Create a joint bundle or giveaway.\n- Run a small event together (a workshop, pop-up or contest).\n- Cross-referral: "Show this receipt next door for a free extra".',
        sourceRefs: [0],
      },
      {
        heading: 'Make it fair and clear',
        body: 'Agree on who does what, how long it runs, and how you will measure success (for example, separate codes or links for each partner). If either partner gets something of value for a recommendation, disclose it in public posts.',
        sourceRefs: [0, 2],
      },
    ],
    keyTakeaways: ['Same customers, different products', 'Swap shout-outs, flyers or bundles', 'Agree on roles and measurement', 'Disclose paid or rewarded recommendations'],
    actionSteps: ['List 5 possible partners', 'Message one with a simple idea', 'Track the results with a code or link'],
    quiz: [
      { question: 'Which pair makes a good partnership?', options: ['Two pizza shops on the same street', 'A bakery and a coffee shop', 'You and your biggest competitor'], answerIndex: 1 },
    ],
    sources: [
      { url: 'https://www.sba.gov/business-guide/manage-your-business/marketing-sales', title: 'U.S. Small Business Administration — Marketing and sales' },
      { url: 'https://www.score.org/', title: 'SCORE — Free small business mentoring and resources' },
      { url: 'https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking', title: 'FTC — Endorsement Guides: What People Are Asking' },
    ],
  },
];
