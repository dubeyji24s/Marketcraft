// In-depth professional lessons (original writing, researched from official and
// authoritative sources: Google, FTC, W3C, Harvard Business Review, SBA, SCORE).
const ALL = ['kid', 'adult', 'professional'];
const GROWN = ['adult', 'professional'];

export const PRO_LESSONS = [
  // ---------------------------------------------------------------------------------
  {
    slug: 'pricing-for-profit',
    title: 'Pricing for Profit: Set Prices That Pay You',
    summary: `Price is marketing too. It tells customers what your product is worth, and it decides whether your business survives. Learn the three professional pricing methods, how to find your break-even point, and why discounting is riskier than it looks.`,
    level: 'intermediate',
    estimatedMinutes: 14,
    costLevel: 'free',
    audiences: ALL,
    sections: [
      {
        heading: 'Why pricing is a marketing decision',
        body: `Many new business owners pick a price by guessing, or by copying the cheapest competitor. That's risky. Your price sends a message: a very low price can say "budget" or even "low quality", while a confident price says "this is worth it". Price also decides how many sales you need to make a profit. If your price is too low, you can be busy every day and still lose money. Professional marketers decide on price on purpose, using numbers, and revisit it regularly.`,
        sourceRefs: [0, 1],
      },
      {
        heading: 'Method 1: Cost-plus pricing',
        body: `Start by adding up everything one unit costs you: materials, packaging, your time, and a share of your fixed costs (rent, tools, website, fees). Then add a markup on top. The key mistake to avoid is counting only materials. If a bracelet's beads cost $3 but you forget the 30 minutes it takes to make it, the bag it goes in and the card-reader fee, your "profit" is an illusion.\n\n- List every cost per unit, including your time.\n- Add a share of monthly fixed costs.\n- Add a markup that leaves real profit.`,
        sourceRefs: [1, 2],
      },
      {
        heading: 'Method 2: Value-based pricing',
        body: `Value-based pricing asks a different question: what is this worth to the customer? A handmade gift, a time-saving service or a product with a story can be worth much more than its cost. To find out, ask real people. Short surveys and conversations ("What would you expect to pay for this?") and looking at what similar products sell for give you a realistic range. Value pricing works best when you can clearly explain why yours is different.`,
        sourceRefs: [2, 3],
      },
      {
        heading: 'Method 3: Competitive (market) pricing',
        body: `Look at what competitors charge, then decide your position on purpose:\n\n- **Premium**: higher price, justified by better quality, service or experience.\n- **Market price**: similar to others, competing on convenience or relationship.\n- **Discount**: lower price. This is hard for small businesses to sustain, because big companies can usually go lower than you.\n\nMost professionals combine all three methods: cost-plus sets the floor, competitors show the market range, and value tells you how high you can go.`,
        sourceRefs: [2, 3],
      },
      {
        heading: 'Know your break-even point',
        body: `Your break-even point is the number of sales you need to cover all your costs. The formula is simple: **fixed costs ÷ (price − variable cost per unit)**. For example, if your monthly fixed costs are $200 and each candle costs $6 to make and sells for $16, each sale contributes $10, so you need 20 sales a month just to break even. Sale 21 is your first real profit. Knowing this number makes every marketing decision clearer: you know exactly how many customers each campaign must bring in.`,
        sourceRefs: [0, 4],
      },
      {
        heading: 'The hidden danger of discounts',
        body: `Discounts feel like easy marketing, but they have costs. Frequent sales can teach customers to wait for the next discount, and they can lower how valuable your product feels. Very low prices can also start a price war you can't win. Better alternatives:\n\n- Add value instead of cutting price (a free gift wrap, a bonus sample).\n- Create bundles ("3 for $40") that raise the order size.\n- Make limited offers truly limited, and honest.`,
        sourceRefs: [2, 3],
      },
      {
        heading: 'Review prices regularly',
        body: `Costs change quietly: supplies get more expensive, platform fees rise, your time becomes more valuable. Put a reminder in your calendar every three months to recheck your costs and your break-even point. If you raise prices, explain the value honestly; loyal customers usually understand when you're open with them.`,
        sourceRefs: [2],
      },
    ],
    keyTakeaways: ['Price is part of your marketing message', 'Count every cost, including your time', 'Combine cost-plus, value and competitor pricing', 'Know your break-even number', 'Add value before you cut price', 'Recheck prices every few months'],
    actionSteps: ['Write down every cost for one product, including your time', 'Calculate your break-even point', 'Ask 5 people what they would expect to pay', 'Decide: premium, market or discount position, and why'],
    quiz: [
      { question: 'Fixed costs are $200/month, a product costs $6 to make and sells for $16. How many sales to break even?', options: ['10', '20', '33'], answerIndex: 1 },
      { question: 'Which cost do beginners most often forget?', options: ['Materials', 'Their own time', 'The product name'], answerIndex: 1 },
      { question: 'Why are constant discounts risky?', options: ['They teach customers to wait and lower perceived value', 'They are illegal', 'They always increase profit'], answerIndex: 0 },
    ],
    sources: [
      { url: 'https://www.sba.gov/business-guide/manage-your-business/marketing-sales', title: 'U.S. Small Business Administration — Marketing and sales' },
      { url: 'https://ascent.sba.gov/c6/8f/a63aed55494cadad8837b640db33/strategic-marketing-5-3-pricing-strategy-tool.pdf', title: 'SBA Ascent — Pricing strategy tool (PDF)' },
      { url: 'https://www.score.org/resource/pricing-strategies-small-business', title: 'SCORE — Pricing Strategy: Appeal to the Heart, Then the Brain' },
      { url: 'https://www.score.org/southerncolorado/resource/blog-post/pricing-strategy-products-or-services', title: 'SCORE — Pricing Strategy for Products or Services' },
      { url: 'https://www.sba.gov/counseling/plan-your-business/', title: 'U.S. Small Business Administration — Plan your business' },
    ],
  },

  // ---------------------------------------------------------------------------------
  {
    slug: 'keep-your-customers',
    title: 'Keep the Customers You Win: Retention & Loyalty',
    summary: `Getting a new customer takes effort and money. Keeping the right customers coming back is often the most profitable marketing there is. Learn how to choose who to keep, build loyalty without big budgets, and win back customers who drifted away.`,
    level: 'intermediate',
    estimatedMinutes: 13,
    costLevel: 'free',
    audiences: ALL,
    sections: [
      {
        heading: 'Why retention matters',
        body: `Most beginners spend all their energy finding new customers. Professionals also ask: how many of our customers come back? Returning customers already trust you, need less convincing, and often recommend you to friends. Experts at Harvard Business School point out that the right level of customer loss ("churn") depends on your business model. A one-time product works differently from a subscription. But for most small businesses, a loyal group of repeat customers is the steadiest foundation you can build.`,
        sourceRefs: [0],
      },
      {
        heading: 'Keep the RIGHT customers',
        body: `Not every customer is a good fit. Some cost more time than they bring in, or want something you don't offer. Professionals decide up front who they serve best: the customers they can genuinely help, and who are valuable to the business. Then they focus their energy, offers and attention on those people. Write a short description of your ideal repeat customer and use it to guide your decisions.`,
        sourceRefs: [0],
      },
      {
        heading: 'The loyalty toolkit (low cost)',
        body: `- **Remember people**: use names, remember preferences, send a thank-you note.\n- **Make the first experience great**: the first purchase decides if there's a second one.\n- **Stay in touch with permission**: an email list or follow, with useful updates (not spam).\n- **Simple rewards**: a stamp card ("buy 9, get the 10th free") is cheap and effective.\n- **Ask for feedback**: a two-question survey shows you care, and tells you what to fix.\n- **Fix problems fast**: a well-handled complaint can create a more loyal customer than no problem at all.`,
        sourceRefs: [0, 2],
      },
      {
        heading: 'Measure your repeat rate',
        body: `You can't improve what you don't measure. Track two simple numbers every month:\n\n- **Repeat rate**: of last month's customers, how many bought again?\n- **Time between purchases**: how long until people come back?\n\nIf people usually return after about six weeks, a friendly reminder at week five ("New colours are in!") can bring them back right on time.`,
        sourceRefs: [0],
      },
      {
        heading: 'Win back customers who drifted away',
        body: `Customers who left aren't always lost for good. Research published in Harvard Business Review found that customers who came back to a service had a higher average lifetime value the second time ($1,410) than during their first stay ($1,262). The lesson: a respectful "we miss you" message, an honest explanation of what has improved, or an invitation to try something new can be well worth sending. Ask why they left, and fix it if you can.`,
        sourceRefs: [1],
      },
      {
        heading: 'Stay honest and respectful',
        body: `Loyalty is built on trust. Only message people who agreed to hear from you, make unsubscribing easy, and never invent fake urgency ("last chance!" when it isn't). If you offer a reward for reviews, follow the rules on honest reviews: reward people for reviewing, never only for positive reviews.`,
        sourceRefs: [2, 3],
      },
    ],
    keyTakeaways: ['Returning customers are your most stable growth', 'Decide which customers you serve best', 'Small personal touches build loyalty', 'Track repeat rate and time between purchases', 'Win-back messages can be very valuable', 'Loyalty depends on honesty and permission'],
    actionSteps: ['Describe your ideal repeat customer', 'Set up a simple stamp card or thank-you note', 'Check how many customers bought twice this month', 'Write a respectful "we miss you" message'],
    quiz: [
      { question: 'What did HBR research find about returning customers?', options: ['They are worth nothing', 'Their average lifetime value was higher the second time', 'They always leave again'], answerIndex: 1 },
      { question: 'Which is a low-cost loyalty idea?', options: ['A stamp card', 'A billboard', 'Buying followers'], answerIndex: 0 },
      { question: 'When should you send a reminder to a customer who usually returns every 6 weeks?', options: ['After 6 months', 'Around week 5', 'Every day'], answerIndex: 1 },
    ],
    sources: [
      { url: 'https://hbr.org/2014/10/the-value-of-keeping-the-right-customers', title: 'Harvard Business Review — The Value of Keeping the Right Customers (2014)' },
      { url: 'https://hbr.org/2016/03/winning-back-lost-customers', title: 'Harvard Business Review — Winning Back Lost Customers (2016)' },
      { url: 'https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business', title: 'FTC — CAN-SPAM Act: A Compliance Guide for Business' },
      { url: 'https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers', title: 'FTC — Consumer Reviews and Testimonials Rule: Q&A' },
    ],
  },

  // ---------------------------------------------------------------------------------
  {
    slug: 'seo-basics',
    title: 'Be Found on Google: SEO Basics That Actually Work',
    summary: `Search engine optimization (SEO) is how people find you when they search. There are no secret tricks. Google's own guidance says to make helpful pages for people, describe them clearly, and avoid spam. Here's how to apply that to a small business website.`,
    level: 'intermediate',
    estimatedMinutes: 15,
    costLevel: 'free',
    audiences: ALL,
    sections: [
      {
        heading: 'What SEO really is',
        body: `When someone types "birthday cakes near me" or "how to choose a wool scarf", Google tries to show the most helpful pages. SEO means making your pages easy for Google to understand and genuinely useful for the people searching. Google publishes an official SEO Starter Guide for anyone who owns or promotes content, and it was refreshed in 2024. Its message is consistent: build for people first. Be wary of anyone promising "guaranteed #1 rankings": Google itself warns about this when hiring an SEO.`,
        sourceRefs: [0, 1, 3],
      },
      {
        heading: 'Think like your customer: search words',
        body: `List the words real customers use, not your internal jargon. A bakery might call it "artisan levain", but customers search for "sourdough bread". Useful ways to find these words:\n\n- Ask customers how they would search for you.\n- Type your topic into Google and look at the suggestions.\n- Later, Google Search Console shows the exact searches that brought people to your site.`,
        sourceRefs: [0, 4],
      },
      {
        heading: 'Make each page clear',
        body: `- **Page title**: a short, specific title for each page ("Handmade Wool Scarves in Portland").\n- **Headings**: use clear headings that match what the section is about.\n- **Readable web addresses**: /wool-scarves is clearer than /page?id=123.\n- **Descriptive images**: give images meaningful file names and alt text. This also helps people who use screen readers.\n- **One topic per page**: a page about gift boxes should be about gift boxes.`,
        sourceRefs: [0, 5],
      },
      {
        heading: 'Write helpful, original content',
        body: `Google's guidance repeatedly comes back to helpful, people-first content. For a small business, that means answering the real questions customers ask: How long does delivery take? How do I care for this? Which size should I choose? A short FAQ page, a care guide or a "how to choose" article can bring in searches for months. Write it in your own words, from your own experience. Copying other sites doesn't help you and can hurt you.`,
        sourceRefs: [0, 2],
      },
      {
        heading: 'Play by the rules: Search Essentials',
        body: `Google's Search Essentials (formerly the Webmaster Guidelines) explains what can get a site demoted or removed. Avoid:\n\n- Stuffing pages with repeated keywords.\n- Hidden text or misleading pages.\n- Buying links or joining link schemes.\n- Copying content from other sites.\n\nThe safe strategy is also the effective one: useful pages, honest information, and a site that works well on phones.`,
        sourceRefs: [2],
      },
      {
        heading: 'Measure with Search Console',
        body: `Google Search Console is a free tool that shows how your site appears in Google Search: which searches show your pages, how often people click, and any problems Google finds. Check it monthly. If a page appears often but few people click, improve its title. If people search for something you don't cover yet, consider writing a helpful page about it.`,
        sourceRefs: [4],
      },
      {
        heading: 'Local businesses: combine SEO with your Business Profile',
        body: `If you meet customers in person, your website and your free Google Business Profile work together. Keep your name, address and hours the same everywhere, link your profile to your website, and collect honest reviews. For local searches, these signals together help people choose you.`,
        sourceRefs: [6],
      },
    ],
    keyTakeaways: ['SEO = helpful pages that are easy to understand', 'Use the words customers actually search', 'Clear titles, headings, addresses and alt text', 'Answer real customer questions', 'Avoid keyword stuffing, hidden text and bought links', 'Measure with free Search Console'],
    actionSteps: ['List 10 search phrases your customers use', 'Rewrite the title of your most important page', 'Write one helpful FAQ or "how to choose" page', 'Set up Google Search Console'],
    quiz: [
      { question: 'What does Google\'s guidance say to focus on?', options: ['Secret ranking tricks', 'Helpful, people-first content', 'Repeating keywords many times'], answerIndex: 1 },
      { question: 'Which of these is against Google\'s Search Essentials?', options: ['A clear FAQ page', 'Buying links', 'Descriptive image alt text'], answerIndex: 1 },
      { question: 'Which free tool shows the searches that bring people to your site?', options: ['Google Search Console', 'A spreadsheet', 'A printer'], answerIndex: 0 },
    ],
    sources: [
      { url: 'https://developers.google.com/search/docs', title: 'Google Search Central — Documentation (includes the SEO Starter Guide)' },
      { url: 'https://developers.google.com/search/docs/beginner/get-started', title: 'Google Search Central — Beginner\'s guide to SEO' },
      { url: 'https://developers.google.com/search/docs/essentials', title: 'Google Search Essentials' },
      { url: 'https://developers.google.com/search/docs/beginner/do-i-need-seo', title: 'Google Search Central — Do you need an SEO?' },
      { url: 'https://developers.google.com/search/docs/monitor-debug/search-console-start', title: 'Google Search Central — How to use Search Console' },
      { url: 'https://www.w3.org/WAI/alt/', title: 'W3C WAI — Resources on alternative text for images' },
      { url: 'https://support.google.com/business/answer/7039811', title: 'Google Business Profile Help — Get started' },
    ],
  },

  // ---------------------------------------------------------------------------------
  {
    slug: 'video-abcd',
    title: 'Video That Works: Google\'s ABCD Framework',
    summary: `Google studied what makes video ads effective on YouTube and summed it up as the ABCDs: Attention, Branding, Connection, Direction. Here's how to use this professional framework for any short marketing video, whether it's an ad, a Reel or your Studio pitch.`,
    level: 'intermediate',
    estimatedMinutes: 13,
    costLevel: 'free',
    audiences: ALL,
    sections: [
      {
        heading: 'Why a framework helps',
        body: `It's easy to film something that looks nice but doesn't sell. Google's ABCDs come from analysing what works in real YouTube ads, and they give you a checklist for every video you make. Google is clear that they are principles, not a formula. They help you check your ideas, but the creativity is still yours. Use them when you plan, and again before you post.`,
        sourceRefs: [0, 1, 3],
      },
      {
        heading: 'A is for Attention: win the first seconds',
        body: `People decide almost instantly whether to keep watching. Google's playbook recommends grabbing attention early with pacing, tight framing and bold, high-contrast visuals, for example using two or more shots in the first five seconds.\n\n- Open on motion or the product in action, not a logo or "Hi, my name is…"\n- Frame close: faces and products should fill the screen.\n- Start with a question, a surprise or a result.`,
        sourceRefs: [1, 0],
      },
      {
        heading: 'B is for Branding: make it clear who this is',
        body: `A great video that nobody remembers you for doesn't help your business. Show your brand early and more than once: the product, the logo, the name. Google's research notes that a brand mentioned out loud by a person on screen tends to work better than a voice-over mention. So say your brand name yourself, naturally, in the video.`,
        sourceRefs: [1],
      },
      {
        heading: 'C is for Connection: make people feel something',
        body: `Facts tell; feelings sell. Use humour, surprise, a small story, or real emotion. Show real people using the product. And keep the message focused: one main idea per video. Google's guidance specifically warns against cramming in too much. If you have three messages, make three videos.`,
        sourceRefs: [2, 1],
      },
      {
        heading: 'D is for Direction: tell people what to do',
        body: `Every video needs a clear call to action: visit, follow, order, sign up. Reinforce it two ways, by saying it out loud and by showing it on screen as text. Make it specific ("Order by Friday for weekend delivery") rather than vague ("Check us out").`,
        sourceRefs: [1, 2],
      },
      {
        heading: 'Make versions for each screen',
        body: `People watch on phones held upright and on TVs and laptops held sideways. Google's recent guidance says both vertical (9:16) and horizontal (16:9) versions matter. Film with space around your subject so you can crop both, or make two edits. Try variations too: two different openings, then keep the one that performs better.`,
        sourceRefs: [4, 5],
      },
      {
        heading: 'ABCD checklist before you post',
        body: `- **A**: Does something interesting happen in the first 3–5 seconds?\n- **B**: Is the brand shown and said early, and again later?\n- **C**: Is there one clear idea, and a human or emotional moment?\n- **D**: Is the call to action spoken and shown on screen?\n- **Honesty**: If you're an ambassador or were paid, is the disclosure said and shown?`,
        sourceRefs: [1, 6],
      },
    ],
    keyTakeaways: ['Attention: hook in the first seconds', 'Branding: show and say your brand early', 'Connection: one focused idea with real emotion', 'Direction: a specific call to action, said and shown', 'Make vertical and horizontal versions', 'Test two openings and keep the winner'],
    actionSteps: ['Plan your next video with the ABCD checklist', 'Rewrite your opening so something happens in 3 seconds', 'Say your brand name on camera', 'Add an on-screen call to action'],
    quiz: [
      { question: 'What does the "B" in ABCD stand for?', options: ['Budget', 'Branding', 'Background'], answerIndex: 1 },
      { question: 'What does Google\'s research say about brand mentions?', options: ['Never mention your brand', 'A person saying it on screen tends to beat a voice-over', 'Only show the logo at the end'], answerIndex: 1 },
      { question: 'How many main messages should one short video have?', options: ['One', 'Five', 'As many as possible'], answerIndex: 0 },
    ],
    sources: [
      { url: 'https://business.google.com/us/think/future-of-marketing/youtube-video-ad-creative/', title: 'Think with Google — YouTube ABCDs: video ad best practices' },
      { url: 'https://www.thinkwithgoogle.com/_qs/documents/8472/ABCD_Complete_V7b_HR_1.pdf', title: 'Think with Google — ABCD playbook (PDF)' },
      { url: 'https://support.google.com/google-ads/answer/14783551?hl=en', title: 'Google Ads Help — About the ABCDs of effective video ads' },
      { url: 'https://www.thinkwithgoogle.com/_qs/documents/15987/ABCDs_PDFPlaybook_April2022_Final.pdf', title: 'Think with Google — ABCDs storytelling playbook (PDF, 2022)' },
      { url: 'https://business.google.com/en-all/think/future-of-marketing/how-to-improve-youtube-ad-creative-performance/', title: 'Think with Google — Improve your YouTube ads performance' },
      { url: 'https://www.thinkwithgoogle.com/future-of-marketing/creativity/creative-best-practices-youtube-ads/', title: 'Think with Google — 5 creative best practices for YouTube ads' },
      { url: 'https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers', title: 'FTC — Disclosures 101 for Social Media Influencers' },
    ],
  },

  // ---------------------------------------------------------------------------------
  {
    slug: 'first-ad-budget',
    title: 'Your First Small Ad Budget (Without Wasting It)',
    summary: `Paid ads can speed up growth, but only if you control the spend. Learn how ad budgets really work on Google Ads (including why a day can cost double your daily budget), how to start small, and how to decide whether an ad paid for itself.`,
    level: 'advanced',
    estimatedMinutes: 14,
    costLevel: 'under $200',
    audiences: GROWN,
    sections: [
      {
        heading: 'Free first, paid second',
        body: `Paid ads amplify what already works. They rarely fix a weak offer. Before spending money, make sure your free marketing is working: you know your customer, your message gets a reaction, and your website or shop turns visitors into buyers. Then a small, controlled ad budget can bring more of the right people to something already proven.`,
        sourceRefs: [0, 5],
      },
      {
        heading: 'How "average daily budget" really works',
        body: `In Google Ads, you set an **average daily budget**: roughly what you're comfortable spending per day, averaged over a month. Two details surprise beginners:\n\n- On a single day, Google may spend **up to about twice** your average daily budget (a $10 budget can spend up to $20 on a busy day).\n- Over a month, you won't be charged more than about **30.4 × your daily budget** (about $304 for a $10 budget).\n\nSo if you have a monthly amount in mind, divide it by 30.4 to get your daily budget.`,
        sourceRefs: [1, 2],
      },
      {
        heading: 'Start small and focused',
        body: `With a small budget, focus beats spreading out: splitting a small amount of money across many campaigns means none of them gets enough to learn what works. Start with one campaign:\n\n- One product or offer.\n- One clear audience or area (for example, your town).\n- One goal: calls, visits, sign-ups or sales.`,
        sourceRefs: [1, 3],
      },
      {
        heading: 'Watch automated bidding',
        body: `Automated "smart" bidding strategies can be powerful, but read the settings carefully. For example, Google notes that strategies like Maximize conversions try to spend your full average daily budget. So if you set the budget higher than you can truly afford, the system will use it. Always set the budget at an amount you're genuinely comfortable spending, and check spending in the first days.`,
        sourceRefs: [3, 4],
      },
      {
        heading: 'Did the ad pay for itself?',
        body: `Before launching, decide how you'll judge success. A simple professional check:\n\n- **Cost per customer** = ad spend ÷ new customers from the ad.\n- Compare it with the **profit** you make from a customer (see the Pricing for Profit lesson).\n\nIf an ad costs $50 and brings 5 customers who each bring $15 profit, you made $75 profit on $50: a win. Use tracked links (UTM tags) so you know which customers came from which ad.`,
        sourceRefs: [5, 6],
      },
      {
        heading: 'Honest ads only',
        body: `Paid ads must follow the same truth-in-advertising rules as everything else: claims must be true and backed by evidence, and important conditions must be clear, not hidden in fine print. Also follow each ad platform's own policies. Never promise results you can't prove.`,
        sourceRefs: [7],
      },
    ],
    keyTakeaways: ['Prove your offer with free marketing first', 'A day can spend up to ~2× the average daily budget', 'Monthly spend is capped at ~30.4× the daily budget', 'Keep small budgets focused in one campaign', 'Judge ads by cost per customer vs. profit', 'Ads must be truthful and clear'],
    actionSteps: ['Pick one offer, one audience, one goal', 'Turn your monthly budget into a daily budget (÷ 30.4)', 'Set up tracked links for the ad', 'Check spend and results after 3 days and after 2 weeks'],
    quiz: [
      { question: 'With a $10 average daily budget, roughly what is the most Google may spend on one busy day?', options: ['$10', 'About $20', '$100'], answerIndex: 1 },
      { question: 'You have $150 for a month. About what daily budget should you set?', options: ['About $5', '$150', '$30'], answerIndex: 0 },
      { question: 'An ad cost $50 and brought 5 customers with $15 profit each. Was it profitable?', options: ['Yes: $75 profit vs $50 spend', 'No', 'You can\'t tell'], answerIndex: 0 },
    ],
    sources: [
      { url: 'https://www.sba.gov/business-guide/manage-your-business/marketing-sales', title: 'U.S. Small Business Administration — Marketing and sales' },
      { url: 'https://support.google.com/google-ads/answer/6385083?hl=en', title: 'Google Ads Help — About average daily budgets' },
      { url: 'https://support.google.com/google-ads/answer/6312?hl=en', title: 'Google Ads Help — Average daily budget: definition' },
      { url: 'https://support.google.com/google-ads/answer/10486536?hl=en', title: 'Google Ads Help — Budgets overview' },
      { url: 'https://support.google.com/google-ads/answer/1704424?hl=en', title: 'Google Ads Help — Manage your spend in Google Ads' },
      { url: 'https://support.google.com/google-ads/answer/10486637?hl=en', title: 'Google Ads Help — About spending limits' },
      { url: 'https://support.google.com/analytics/answer/10917952?hl=en', title: 'Google Analytics Help — Collect campaign data with custom URLs' },
      { url: 'https://www.ftc.gov/business-guidance/resources/advertising-faqs-guide-small-business', title: 'FTC — Advertising FAQ\'s: A Guide for Small Business' },
    ],
  },

  // ---------------------------------------------------------------------------------
  {
    slug: 'truth-in-advertising',
    title: 'Truth in Advertising: Claims You Can Prove',
    summary: `Honest marketing isn't just ethical. In the U.S. it's the law. Learn the FTC's core advertising rules in plain words: no misleading claims, evidence before you advertise, clear disclosures, and honest endorsements. Then use them to write confident, trustworthy marketing.`,
    level: 'intermediate',
    estimatedMinutes: 13,
    costLevel: 'free',
    audiences: ALL,
    sections: [
      {
        heading: 'The three core rules',
        body: `The Federal Trade Commission's guide for small businesses sums up U.S. advertising law in three ideas:\n\n- **Ads must be truthful and not misleading.**\n- **You need evidence for your claims before you make them.**\n- **Ads can't be unfair.**\n\nThese apply to every kind of marketing: social posts, flyers, videos, emails, websites and ads.`,
        sourceRefs: [0, 1],
      },
      {
        heading: 'What "misleading" means',
        body: `An ad can mislead by what it says or by what it leaves out. The FTC looks at whether a statement, or a missing piece of information, is likely to mislead a reasonable customer about something that matters to their decision. "100% natural" when it isn't, a "sale" price that was never the normal price, or hiding that a "free trial" turns into a paid subscription are all classic examples.`,
        sourceRefs: [0],
      },
      {
        heading: 'Evidence first',
        body: `Before you say it, be able to prove it. The FTC calls this having a "reasonable basis": objective evidence that backs up your claim. Simple claims ("handmade in small batches") need simple proof (it's true, and you can show it). Health, safety and performance claims need much stronger, often scientific, evidence. If you can't prove it, rewrite it as something true and specific: "customers say it's the coziest scarf they own" (only if they really did) instead of "the warmest scarf in the world".`,
        sourceRefs: [0, 1],
      },
      {
        heading: 'Disclosures must be clear',
        body: `If a claim needs extra information to be accurate ("results vary", "while supplies last", "subscription renews monthly"), that information must be clear and easy to notice. Tiny fine print, fast-scrolling text or a note hidden behind a link usually doesn't fix a misleading main message. A good test: would a busy customer see and understand it before deciding?`,
        sourceRefs: [0, 2],
      },
      {
        heading: 'Endorsements and reviews',
        body: `Testimonials must be real and reflect what customers typically experience. If someone was paid, got a free product, is an employee or a relative, or is a brand ambassador, that connection must be disclosed. And fake reviews (including AI-written ones) are banned under the FTC's 2024 rule.`,
        sourceRefs: [0, 3, 4],
      },
      {
        heading: 'Write confident AND honest copy',
        body: `Honest doesn't mean boring. Strong, truthful copy is specific:\n\n- Instead of "the best bakery", try "bread baked fresh every morning at 6am".\n- Instead of "guaranteed results", try "here's what our last 20 customers said".\n- Instead of "limited time!!!", give the real end date.\n\nSpecific truth beats vague hype, and it builds the trust that brings customers back.`,
        sourceRefs: [1],
      },
      {
        heading: 'Other rules may apply',
        body: `Every U.S. state has its own consumer-protection laws, and some products (like food, alcohol, credit or children's products) have extra rules. If you sell in a regulated area, check the specific rules or ask an expert. The FTC doesn't pre-approve ads, so it's your job to get them right.`,
        sourceRefs: [0],
      },
    ],
    keyTakeaways: ['Ads must be truthful, evidence-based and fair', 'Leaving things out can also mislead', 'Have proof before you make a claim', 'Disclosures must be clear, not fine print', 'Disclose paid or gifted endorsements; no fake reviews', 'Specific truth beats vague hype'],
    actionSteps: ['Find every claim in your marketing and note your proof', 'Rewrite one vague claim as a specific true fact', 'Check that every important condition is easy to see', 'Add disclosures to any paid or gifted endorsements'],
    quiz: [
      { question: 'When do you need evidence for an advertising claim?', options: ['Only if a customer complains', 'Before you make the claim', 'Never'], answerIndex: 1 },
      { question: 'Can tiny fine print fix a misleading headline?', options: ['Usually not', 'Always', 'Only on Fridays'], answerIndex: 0 },
      { question: 'Which claim is more trustworthy?', options: ['"The best bread in the world"', '"Baked fresh every morning at 6am"', '"Guaranteed to change your life"'], answerIndex: 1 },
    ],
    sources: [
      { url: 'https://www.ftc.gov/business-guidance/resources/advertising-faqs-guide-small-business', title: 'FTC — Advertising FAQ\'s: A Guide for Small Business' },
      { url: 'https://www.ftc.gov/business-guidance/advertising-marketing/advertising-marketing-basics', title: 'FTC — Advertising and Marketing Basics' },
      { url: 'https://www.ftc.gov/system/files/ftc_gov/pdf/bus28-rulesroad-2023_508.pdf', title: 'FTC — Advertising and Marketing on the Internet: Rules of the Road (PDF, 2023)' },
      { url: 'https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking', title: 'FTC — Endorsement Guides: What People Are Asking' },
      { url: 'https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials', title: 'FTC — Final Rule Banning Fake Reviews and Testimonials (2024)' },
    ],
  },

  // ---------------------------------------------------------------------------------
  {
    slug: 'accessible-marketing',
    title: 'Marketing Everyone Can Use: Accessible Content',
    summary: `Many of your customers use screen readers, captions, zoom or high-contrast settings. Accessible marketing reaches more people, and it is simply good practice. Learn the essentials from the W3C (the organization behind web standards): alt text, captions, colour contrast, and clear design.`,
    level: 'beginner',
    estimatedMinutes: 12,
    costLevel: 'free',
    audiences: ALL,
    sections: [
      {
        heading: 'Why accessibility is great marketing',
        body: `Many potential customers use screen readers, captions, zoom, or high-contrast settings. If your posts, flyers and website don't work for them, you're shutting the door on real people. Accessible content is also clearer for everyone: captions help people watching in a quiet place, and good contrast helps anyone reading on a phone in sunlight. The World Wide Web Consortium's Web Accessibility Initiative (W3C WAI) publishes free, practical guidance.`,
        sourceRefs: [0, 3],
      },
      {
        heading: 'Alt text: describe images that carry meaning',
        body: `Alt text is a short written description of an image, read aloud by screen readers. W3C's guidance:\n\n- **Informative images** (a product photo, a chart): describe what matters, concisely. "Blue hand-knitted wool scarf folded on a wooden table."\n- **Decorative images** (a background swirl): give them empty alt text so screen readers skip them.\n- Skip phrases like "image of" or "picture of"; screen readers already announce that it's an image.\n\nMost social platforms let you add alt text when you post. Use it.`,
        sourceRefs: [0, 1, 2],
      },
      {
        heading: 'Images of text',
        body: `Flyers and promo graphics often put words inside an image. Screen readers can't read those words unless you add them as alt text or in the caption. W3C advises using real text instead of images of text where possible. When you must use an image of text, include the same words in the alt text or the post caption.`,
        sourceRefs: [4],
      },
      {
        heading: 'Captions for every video',
        body: `Add captions to your videos. They help people who are deaf or hard of hearing, and the many viewers who watch with the sound off. W3C explains that good captions include more than dialogue: important sound effects, music that matters to the meaning, and who is speaking. Keep caption lines short (W3C suggests one or two lines, generally under about 32 characters per line). Most platforms can auto-generate captions; always review them, because automatic captions make mistakes with names and product words. Also say important information out loud rather than only showing it, for people who can't see the screen.`,
        sourceRefs: [6, 7, 8],
      },
      {
        heading: 'Colour, contrast and clear design',
        body: `- Use strong contrast between text and background (dark on light or light on dark).\n- Don't rely on colour alone to show meaning ("items in red are on sale"); add a word or icon.\n- Use readable font sizes and avoid long blocks of text in all capitals.\n- Keep layouts simple, with one clear message per design.\n\nW3C's "Easy Checks" page offers quick ways to spot common problems on web pages.`,
        sourceRefs: [5],
      },
      {
        heading: 'Plain language and clear links',
        body: `Write in short, simple sentences. Make link text describe where it goes ("See our gift guide") instead of "click here". Use emoji sparingly: screen readers read out each emoji's full name, so a string of ten emoji becomes a long, confusing sentence. Put hashtags at the end, and capitalize each word in multi-word hashtags (#HandmadeGifts), which screen readers can read more clearly. (These last tips are widely used social-media accessibility practice.)`,
        sourceRefs: [5],
      },
    ],
    keyTakeaways: ['Accessible marketing reaches more customers', 'Add concise alt text to meaningful images', 'Decorative images get empty alt text', 'Caption every video, and check auto-captions', 'Strong contrast; never colour alone', 'Plain language, clear links, few emoji'],
    actionSteps: ['Add alt text to your next 3 posts', 'Turn on and correct captions for your next video', 'Check a flyer\'s contrast and make the headline bigger', 'Rewrite hashtags in CamelCase'],
    quiz: [
      { question: 'What alt text should a purely decorative image get?', options: ['A long description', 'Empty alt text so screen readers skip it', 'The word "image"'], answerIndex: 1 },
      { question: 'Why should you review automatic captions?', options: ['They can get names and product words wrong', 'They are illegal', 'They slow down videos'], answerIndex: 0 },
      { question: 'Which hashtag is easier for screen readers?', options: ['#handmadegifts', '#HandmadeGifts', '#HANDMADEGIFTS'], answerIndex: 1 },
    ],
    sources: [
      { url: 'https://www.w3.org/WAI/alt/', title: 'W3C WAI — Resources on alternative text for images' },
      { url: 'https://www.w3.org/WAI/tutorials/images/informative/', title: 'W3C WAI Tutorials — Informative images' },
      { url: 'https://www.w3.org/WAI/tutorials/images/decorative/', title: 'W3C WAI Tutorials — Decorative images' },
      { url: 'https://www.w3.org/WAI/tutorials/images/tips/', title: 'W3C WAI Tutorials — Images: tips and tricks' },
      { url: 'https://www.w3.org/WAI/tutorials/images/textual/', title: 'W3C WAI Tutorials — Images of text' },
      { url: 'https://www.w3.org/WAI/test-evaluate/preliminary/', title: 'W3C WAI — Easy Checks: a first review of web accessibility' },
      { url: 'https://www.w3.org/WAI/media/av/', title: 'W3C WAI — Making Audio and Video Media Accessible' },
      { url: 'https://www.w3.org/WAI/media/av/captions/', title: 'W3C WAI — Captions/Subtitles' },
      { url: 'https://www.w3.org/WAI/media/av/transcribing/', title: 'W3C WAI — Transcribing audio to text' },
    ],
  },

  // ---------------------------------------------------------------------------------
  {
    slug: 'marketing-and-kids-privacy',
    title: 'Marketing & Children\'s Privacy: COPPA Basics',
    summary: `If your business has a website or app that children under 13 might use, a U.S. law called COPPA applies. Learn what it covers, why photos and voice recordings count as personal information, and a responsible checklist for marketing that involves kids.`,
    level: 'advanced',
    estimatedMinutes: 12,
    costLevel: 'free',
    audiences: GROWN,
    sections: [
      {
        heading: 'What COPPA is',
        body: `The Children's Online Privacy Protection Act (COPPA) and the FTC's COPPA Rule protect children under 13 online. It applies to websites, apps and online services that are directed to children, and to general-audience services that actually know they are collecting personal information from a child. The FTC's "Complying with COPPA: Frequently Asked Questions" is the main official guide for businesses.`,
        sourceRefs: [0, 1],
      },
      {
        heading: 'What counts as personal information',
        body: `It's broader than most people think. Beyond names and email addresses, the FTC's FAQ treats photos, videos and voice recordings of a child as personal information. That matters for marketing: a contest asking kids to upload a video, a "send us your drawing with your photo" campaign, or a sign-up form for a newsletter can all collect personal information from children. The Rule applies even when the child volunteers it.`,
        sourceRefs: [0],
      },
      {
        heading: 'Parental consent comes first',
        body: `In general, a covered service must get verifiable consent from a parent before collecting personal information from a child under 13, and must tell parents clearly what it collects and why. That's why Marketcraft requires anyone under 18 to use a parent's own account: the parent is the account holder and gives consent. For your own business, the simplest responsible approach is to market to parents, not directly to young children.`,
        sourceRefs: [0, 2],
      },
      {
        heading: 'Third-party tools are your responsibility too',
        body: `Many websites and apps include outside tools: analytics, ads, chat widgets, video embeds. The FTC has reminded businesses that if they run a child-directed site or app, they must look into what every third-party tool collects through it. Choose tools carefully and turn off tracking and ad personalisation where children may be involved.`,
        sourceRefs: [0, 4],
      },
      {
        heading: 'Keep only what you need',
        body: `Collect the minimum, and don't keep children's personal information longer than reasonably necessary for the purpose you collected it for. Delete it securely afterwards. If a business discovers it isn't complying, the first step is to stop collecting, using or sharing children's personal information until the problem is fixed.`,
        sourceRefs: [0],
      },
      {
        heading: 'A responsible checklist',
        body: `- Aim your marketing at parents when your product is for children.\n- Don't ask kids for names, photos, videos, voice or contact details without verified parental consent.\n- Check every third-party tool on pages kids might visit.\n- Keep data to a minimum and delete it when you're done.\n- Use the FTC's six-step compliance plan if your site or app is directed to children.\n- When in doubt, get expert advice.`,
        sourceRefs: [0, 2, 3],
      },
    ],
    keyTakeaways: ['COPPA protects children under 13 online', 'Photos, video and voice of a child count as personal info', 'Get verifiable parental consent first', 'You\'re responsible for third-party tools too', 'Collect little and delete when done', 'Market to parents, not young kids'],
    actionSteps: ['List every place your business collects information online', 'Check which tools run on pages kids might visit', 'Rewrite one kids\' product campaign to speak to parents', 'Read the FTC six-step compliance plan'],
    quiz: [
      { question: 'Who does COPPA protect?', options: ['Children under 13', 'Teens under 18 only', 'Adults'], answerIndex: 0 },
      { question: 'Is a child\'s photo or voice recording personal information under COPPA?', options: ['Yes', 'No', 'Only if it shows their name'], answerIndex: 0 },
      { question: 'What is the simplest responsible approach for marketing a kids\' product?', options: ['Collect kids\' emails', 'Market to parents', 'Run a kids\' selfie contest'], answerIndex: 1 },
    ],
    sources: [
      { url: 'https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions', title: 'FTC — Complying with COPPA: Frequently Asked Questions' },
      { url: 'https://www.ftc.gov/business-guidance/privacy-security/childrens-privacy', title: 'FTC — Children\'s Privacy (business guidance)' },
      { url: 'https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business', title: 'FTC — COPPA: A Six-Step Compliance Plan for Your Business' },
      { url: 'https://www.ftc.gov/enforcement/coppa-safe-harbor-program', title: 'FTC — COPPA Safe Harbor Program' },
      { url: 'https://www.ftc.gov/business-guidance/blog/2025/09/using-third-partys-software-your-app-make-sure-youre-all-complying-coppa', title: 'FTC Business Blog — Using a third party\'s software in your app? (2025)' },
    ],
  },
];
