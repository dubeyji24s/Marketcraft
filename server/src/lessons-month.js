// Month-long course extension: 16 more in-depth lessons (original writing, researched
// from official and authoritative sources: SBA, FTC, SCORE, USDA, Google, Harvard
// Business Review, Harvard Business School Online, Nielsen Norman Group).
const ALL = ['kid', 'adult', 'professional'];

export const MONTH_LESSONS = [
  // ---------------------------------------------------------------------------------
  {
    slug: 'brand-identity',
    title: 'Build a Brand People Remember',
    summary: `Your brand is the feeling people get when they think of you. Learn what a brand really is, how to choose a name, colours and fonts on purpose, and how to write a simple style guide so everything you make looks like it came from the same business.`,
    level: 'beginner',
    estimatedMinutes: 12,
    costLevel: 'free',
    audiences: ALL,
    sections: [
      {
        heading: 'A brand is more than a logo',
        body: `Many people think "brand" means "logo". A logo is only one piece. Your brand identity includes everything people see and hear from you: your name, logo, slogan, colours, fonts, symbols and the way you talk (your "voice"). Your brand as a whole is the reputation those pieces build over time. A small business with a simple logo but a friendly, reliable, consistent voice can have a stronger brand than one with an expensive logo and messy messages.`,
        sourceRefs: [0],
      },
      {
        heading: 'Start with your position',
        body: `Before you design anything, write one sentence that explains who you serve and why you're different:\n\n**"For [who], [business] is the [what] that [main benefit], because [reason to believe]."**\n\nFor example: "For busy parents, Sunny Snacks is the after-school snack box that's ready in 30 seconds, because every item is pre-portioned." Every colour, word and picture you choose later should support this sentence.`,
        sourceRefs: [],
      },
      {
        heading: 'Choose colours on purpose',
        body: `Colours carry feelings. Business guidance commonly links blue with calm and trust, green with nature and health, yellow with sunshine and happiness, and red with strong, energetic feelings. These are associations, not rules, so pick colours that match your position sentence and that your audience likes.\n\n- Pick **one main colour** and **one or two supporting colours**.\n- Write down the exact colour codes (hex codes like #6C4CF1) so you use the same shades every time.\n- Check that text on your colours is easy to read.`,
        sourceRefs: [0],
      },
      {
        heading: 'A logo that works everywhere',
        body: `A good small-business logo is simple. It should still be recognisable when it's tiny (on a phone screen or a sticker) and when it's printed in plain black and white. Keep it to about two colours and one or two font styles: extra colours make printing more expensive and the logo harder to remember. Test your logo by shrinking it to the size of a thumbnail. If you can still tell what it is, it works.`,
        sourceRefs: [0, 1],
      },
      {
        heading: 'Find your voice',
        body: `Your brand voice is your personality in words. Choose three words that describe how you sound, such as "friendly, clear, encouraging" or "calm, expert, honest". Then use them as a filter: before you post anything, ask "Does this sound friendly, clear and encouraging?" A consistent voice makes customers feel they know you, which builds trust.`,
        sourceRefs: [0],
      },
      {
        heading: 'Write a one-page style guide',
        body: `A style guide keeps everything consistent, even when friends or family help you. It can be one page:\n\n- Your position sentence\n- Your logo and the smallest size it may be used\n- Colour hex codes\n- Your fonts (one for headings, one for text)\n- Your three voice words, with a "we say / we don't say" example\n\nUse the same colours, fonts and attitude on your signs, posts, flyers and packaging. Repeating them everywhere is what makes people remember you.`,
        sourceRefs: [0, 2],
      },
    ],
    keyTakeaways: ['A brand is a reputation, not just a logo', 'Start with a one-sentence position', 'Pick 1 main colour and save the hex codes', 'Simple logos work at every size', 'Choose three voice words', 'Consistency is what makes a brand memorable'],
    actionSteps: ['Write your position sentence', 'Choose your colours and note their hex codes', 'Pick your three voice words', 'Make a one-page style guide in the Marketing Lab Design Studio'],
    quiz: [
      { question: 'Which of these is the best description of a brand?', options: ['Just the logo', 'The reputation built by everything people see and hear from you', 'The most expensive colour'], answerIndex: 1 },
      { question: 'Why should a logo use only a few colours?', options: ['It is easier to remember and cheaper to print', 'Colours are not allowed', 'It loads slower'], answerIndex: 0 },
      { question: 'What helps you use exactly the same colours every time?', options: ['Guessing by eye', 'Writing down the hex codes', 'Changing colours every month'], answerIndex: 1 },
    ],
    sources: [
      { url: 'https://www.score.org/resource/blog-post/visual-identity-how-bring-your-brand-life', title: 'SCORE — Visual Identity: How to Bring Your Brand to Life' },
      { url: 'https://www.score.org/articles/creating-your-business-logo/', title: 'SCORE — Creating Your Business Logo' },
      { url: 'https://www.score.org/articles/building-your-brand-signage/', title: 'SCORE — Building Your Brand With Signage' },
    ],
  },

  // ---------------------------------------------------------------------------------
  {
    slug: 'story-that-sells',
    title: 'Tell a Story That Sells (Honestly)',
    summary: `People remember stories much better than lists of features. Learn a simple story structure for your business, how to make the customer the hero, and why the best brand stories are backed up by real actions.`,
    level: 'beginner',
    estimatedMinutes: 11,
    costLevel: 'free',
    audiences: ALL,
    sections: [
      {
        heading: 'Why stories work',
        body: `Our brains are built to follow stories with a challenge, a hero and a change. Research summarised in Harvard Business Review explains that people aren't purely logical decision-makers: feelings shape what we believe and what we do. A story lets a customer *feel* the problem and imagine the better ending, which a list of features rarely does.`,
        sourceRefs: [0, 1],
      },
      {
        heading: 'Make the customer the hero',
        body: `A common mistake is making your business the hero of every story. Customers care most about themselves. Try this structure:\n\n1. **The hero**: your customer, and what they want.\n2. **The problem**: what's getting in the way.\n3. **The guide**: you, with a plan or product that helps.\n4. **The ending**: what their life looks like after.\n\nExample: "Maya wanted to bring something homemade to class but had no time on school mornings (problem). Our 5-minute muffin kit (guide) meant she arrived with warm muffins and a big smile (ending)."`,
        sourceRefs: [],
      },
      {
        heading: 'Your origin story',
        body: `Customers also like to know why you started. A good origin story is short and true: the moment you noticed a problem, what you tried, and why you care. Keep it to three or four sentences on your website or profile. Details make it believable ("I spent my first summer testing 14 lemonade recipes on my neighbours"), and an honest small struggle makes it relatable.`,
        sourceRefs: [],
      },
      {
        heading: 'Be a story-doer, not just a storyteller',
        body: `A Harvard Business Review article describes "storydoing" companies: businesses whose stories are proven by what they actually do, not only by what their ads say. For a small business that might mean really donating the part of each sale you promised, or really using the local ingredients you mention. When actions match the story, customers share it for you.`,
        sourceRefs: [2],
      },
      {
        heading: 'Keep it honest',
        body: `Stories are powerful, which is exactly why they must be true. A Harvard Business Review discussion of storytelling warns that because stories persuade indirectly, using them to sell carries a responsibility to be honest. Never invent customers, results or hardships. Real stories, even small ones, are more convincing and keep you on the right side of advertising law.`,
        sourceRefs: [3],
      },
    ],
    keyTakeaways: ['Stories make people feel, not just think', 'The customer is the hero; you are the guide', 'Short, specific origin stories build trust', 'Back your story up with real actions', 'Never invent stories or results'],
    actionSteps: ['Write a 4-part hero story about a real customer (with permission)', 'Write your 3–4 sentence origin story', 'List one action that proves your story', 'Turn the story into a 30-second video script with the Lab'],
    quiz: [
      { question: 'In a good marketing story, who is the hero?', options: ['The business', 'The customer', 'The competitor'], answerIndex: 1 },
      { question: 'What is "storydoing"?', options: ['Proving your story with real actions', 'Writing longer stories', 'Using only video'], answerIndex: 0 },
      { question: 'Is it OK to invent a customer story if it sounds realistic?', options: ['Yes', 'Only on social media', 'No, stories must be true'], answerIndex: 2 },
    ],
    sources: [
      { url: 'https://hbr.org/2023/02/your-strategy-needs-a-story', title: 'Harvard Business Review — Your Strategy Needs a Story' },
      { url: 'https://hbr.org/2024/05/a-great-sales-pitch-hinges-on-the-right-story', title: 'Harvard Business Review — A Great Sales Pitch Hinges on the Right Story' },
      { url: 'https://hbr.org/2013/07/good-companies-are-storyteller', title: 'Harvard Business Review — Good Companies Are Storytellers. Great Companies Are Storydoers' },
      { url: 'https://hbr.org/podcast/2022/02/the-positives-and-perils-of-storytelling', title: 'Harvard Business Review — The Positives—and Perils—of Storytelling (podcast)' },
    ],
  },

  // ---------------------------------------------------------------------------------
  {
    slug: 'market-research-free',
    title: 'Market Research on a $0 Budget',
    summary: `Before you spend money on marketing, find out who your customers are and who you're competing with. Learn free ways to size your market, study competitors, and run a quick SWOT analysis like a professional.`,
    level: 'intermediate',
    estimatedMinutes: 13,
    costLevel: 'free',
    audiences: ALL,
    sections: [
      {
        heading: 'Two questions every business must answer',
        body: `The U.S. Small Business Administration describes two kinds of research that work together. **Market research** helps you find customers: who they are, how many there are, and what they want. **Competitive analysis** helps you stand out: who else serves those customers and how you can be different. Put the answers together and you find your competitive advantage.`,
        sourceRefs: [0],
      },
      {
        heading: 'Describe your customer in 3–5 traits',
        body: `Professional planning tools ask for a short, specific description of your audience. Use both kinds of traits:\n\n- **Demographics**: facts such as age group, location, income or business size.\n- **Psychographics**: interests, values and habits, such as "cares about the environment" or "shops on their phone".\n\nThen ask: is this group growing or shrinking? Where do they already buy similar things? How do they like to pay?`,
        sourceRefs: [1],
      },
      {
        heading: 'Free data you can use',
        body: `You don't need to buy expensive reports. Government sites offer free statistics: the SBA's market research page links to tools such as Census Business Builder and data from the Census Bureau and Bureau of Labor Statistics. For a local business, also do "street research":\n\n- Count how many people walk past a spot at different times.\n- Read reviews of similar businesses to learn what customers love and complain about.\n- Ask 10 potential customers three short questions (and listen more than you talk).`,
        sourceRefs: [0],
      },
      {
        heading: 'Direct and indirect competitors',
        body: `**Direct competitors** sell something similar to the same people (another cookie stall at the same market). **Indirect competitors** solve the same need differently (the café selling muffins). Make a simple table comparing 3–5 competitors on product, price, quality, location, customer service and reputation. Look for a gap: something customers want that nobody does well.`,
        sourceRefs: [1, 2],
      },
      {
        heading: 'Run a SWOT analysis',
        body: `A SWOT is a four-box summary professionals use everywhere:\n\n- **Strengths**: what you do well (inside your control).\n- **Weaknesses**: what you need to improve (inside your control).\n- **Opportunities**: outside trends you can use (a new park opening nearby).\n- **Threats**: outside risks (a big store selling the same thing).\n\nUse strengths to grab opportunities, and fix weaknesses that threats could exploit.`,
        sourceRefs: [2],
      },
      {
        heading: 'Turn research into decisions',
        body: `Research is only useful if it changes what you do. After your research, write down three decisions: who exactly you'll target first, what makes you different, and where you'll reach those people. Repeat a quick version of this research every few months, because markets change.`,
        sourceRefs: [0, 1],
      },
    ],
    keyTakeaways: ['Market research finds customers; competitive analysis helps you stand out', 'Describe customers with demographics and psychographics', 'Free government data and street research go a long way', 'Track direct and indirect competitors', 'SWOT turns research into a clear picture', 'Research must lead to decisions'],
    actionSteps: ['Write your 3–5 customer traits', 'Interview 10 potential customers', 'Build a competitor table with 3–5 rivals', 'Complete a SWOT and write 3 decisions'],
    quiz: [
      { question: 'A café selling muffins is what kind of competitor to a cookie stall?', options: ['Direct', 'Indirect', 'Not a competitor'], answerIndex: 1 },
      { question: 'In a SWOT, which two boxes are things inside your control?', options: ['Opportunities and Threats', 'Strengths and Weaknesses', 'Strengths and Threats'], answerIndex: 1 },
      { question: '"Cares about the environment" is an example of a…', options: ['Demographic', 'Psychographic', 'Competitor'], answerIndex: 1 },
    ],
    sources: [
      { url: 'https://www.sba.gov/business-guide/plan-your-business/market-research-competitive-analysis', title: 'U.S. Small Business Administration — Market research and competitive analysis' },
      { url: 'https://ascent.sba.gov/06/6a/fcc401424cebb897d79710455587/strategic-marketing-2-2-market-information-tool.pdf', title: 'SBA Ascent — Target market information tool (PDF)' },
      { url: 'https://ascent.sba.gov/c3/5d/f8c2792b4cc89b2f42b22dcd7534/strategic-marketing-3-3-competition-tool.pdf', title: 'SBA Ascent — Competitive analysis tool (PDF)' },
    ],
  },

  // ---------------------------------------------------------------------------------
  {
    slug: 'customer-journey',
    title: 'Map Your Customer Journey',
    summary: `Customers don't buy in one step. They notice you, think about it, compare, decide, and (hopefully) come back. Learn the stages of the customer journey, what to do at each one, and which number to watch at each stage.`,
    level: 'intermediate',
    estimatedMinutes: 12,
    costLevel: 'free',
    audiences: ALL,
    sections: [
      {
        heading: 'From stranger to fan',
        body: `A customer journey map is a simple diagram of the steps a customer goes through when dealing with your business. Harvard Business School Online explains that the stages often mirror the marketing "funnel": **awareness** (they find out you exist), **consideration** (they think about it and compare), and **decision** (they buy). Smart businesses add two more: **experience** (using what they bought) and **loyalty** (coming back and telling friends).`,
        sourceRefs: [0, 1],
      },
      {
        heading: 'Different stages need different marketing',
        body: `What works at one stage fails at another. A Harvard professor quoted by HBS Online stresses that the activity you need at each stage is very different:\n\n- **Awareness**: be seen — posts, flyers, events, word of mouth.\n- **Consideration**: answer questions — photos, prices, reviews, FAQs.\n- **Decision**: make buying easy — clear call to action, simple checkout, reassurance.\n- **Experience**: deliver on the promise — great product, quick help.\n- **Loyalty**: stay in touch — thank-you notes, rewards, asking for referrals.`,
        sourceRefs: [0, 1],
      },
      {
        heading: 'Find the "pain points"',
        body: `Walk through your own journey as if you were a customer, and write down every moment that's confusing, slow or annoying. Maybe your price isn't shown, or people must message you to find out where you are. Harvard Business Review describes journey maps as a tool for spotting exactly these problems so you can fix the experience. Each fix can bring more customers through to the next stage.`,
        sourceRefs: [2],
      },
      {
        heading: 'One number per stage',
        body: `Pick a simple measure for each stage, so you know where customers are dropping off:\n\n- Awareness: how many people saw your post or visited your stall.\n- Consideration: how many asked a question or visited your page.\n- Decision: how many bought (your conversion rate = buyers ÷ visitors).\n- Loyalty: how many came back or referred a friend.\n\nIf lots of people visit but few buy, fix the decision stage before spending more on awareness.`,
        sourceRefs: [0],
      },
      {
        heading: 'Draw your map',
        body: `On one page, draw five columns (the stages). Under each, write: what the customer is doing, what they're thinking or feeling, where they meet you (the "touchpoint"), one pain point, and one improvement. Update the map whenever customers tell you something new.`,
        sourceRefs: [0, 2],
      },
    ],
    keyTakeaways: ['Customers move through stages: awareness, consideration, decision, experience, loyalty', 'Each stage needs different marketing', 'Look for pain points and fix them', 'Track one number per stage', 'Fix the leakiest stage first'],
    actionSteps: ['Draw your 5-stage journey map', 'Walk through your business as a customer and list 3 pain points', 'Choose one number to track per stage', 'Fix the biggest pain point this week'],
    quiz: [
      { question: 'Many people visit your page but almost nobody buys. Which stage should you fix first?', options: ['Awareness', 'Decision', 'Loyalty'], answerIndex: 1 },
      { question: 'What is a "touchpoint"?', options: ['Any place a customer meets your business', 'A type of discount', 'A logo'], answerIndex: 0 },
      { question: 'Conversion rate is…', options: ['Visitors ÷ buyers', 'Buyers ÷ visitors', 'Price × cost'], answerIndex: 1 },
    ],
    sources: [
      { url: 'https://online.hbs.edu/blog/post/customer-journey-map', title: 'Harvard Business School Online — What Is a Customer Journey Map?' },
      { url: 'https://online.hbs.edu/blog/post/buying-journey', title: 'Harvard Business School Online — Mastering the Buying Journey' },
      { url: 'https://hbr.org/2010/11/using-customer-journey-maps-to', title: 'Harvard Business Review — Using Customer Journey Maps to Improve Customer Experience' },
    ],
  },

  // ---------------------------------------------------------------------------------
  {
    slug: 'words-that-get-read',
    title: 'Write Words People Actually Read',
    summary: `Most people scan instead of reading. Learn what usability research says about how people read online, and how to write headlines, posts and product descriptions that get noticed in the first few seconds.`,
    level: 'beginner',
    estimatedMinutes: 11,
    costLevel: 'free',
    audiences: ALL,
    sections: [
      {
        heading: 'People scan, they don\'t read',
        body: `The Nielsen Norman Group, a respected research company that studies how people use websites, found that most people scan web pages instead of reading word by word. In one of their studies, 79% of test users always scanned new pages, and only 16% read word by word. On an average page, people read only about a fifth of the text. So your words must work even when someone only glances at them.`,
        sourceRefs: [0, 1],
      },
      {
        heading: 'Put the most important thing first',
        body: `Journalists use the "inverted pyramid": the conclusion goes first, then the details. Do the same: start with the benefit or the answer, not with a long introduction.\n\n- ❌ "Welcome to our shop! We started in 2024 and we love baking…"\n- ✅ "Fresh cookies delivered to your door in 30 minutes."\n\nResearch also shows people's eyes often move across the top of the content and then down the left side, so the first words of each line and heading matter most.`,
        sourceRefs: [1, 2],
      },
      {
        heading: 'Make it scannable',
        body: `Usability research found that making text concise, scannable and objective each improved how well people understood and used it — and combining all three improved it the most. In practice:\n\n- Use clear headings that say what's below them.\n- Use bullet lists for features and steps.\n- Keep one idea per paragraph.\n- Cut every word that doesn't help.\n- Bold the few words that matter most.`,
        sourceRefs: [2],
      },
      {
        heading: 'Headlines: clear beats clever',
        body: `People look at headlines first. Research found readers prefer straightforward headlines over cute or funny ones, because clever wording makes them work harder to understand. A great headline tells people what they get. Try formulas like:\n\n- **Benefit + time**: "Learn to draw cartoons in one weekend"\n- **Problem + solution**: "Tired of tangled earbuds? Meet the 2-second clip"\n- **Number + promise**: "5 lunchbox ideas kids actually eat"`,
        sourceRefs: [0, 3],
      },
      {
        heading: 'The first two words',
        body: `When people scan lists and links, they often only see the first two words or so. Start each bullet, button and subject line with the words that carry the meaning: "Free delivery on orders over $20" works better than "We are happy to offer free delivery…". Check your posts: if someone only saw the first two words of each line, would they understand?`,
        sourceRefs: [3],
      },
      {
        heading: 'Be objective and honest',
        body: `Hype words like "the best ever" or "amazing!!!" make readers trust you less, and the research above found that objective language helped people more than promotional language. Use specific facts instead: "Handmade in 3 days from 100% cotton" is more convincing than "the most amazing shirt ever". It also keeps your claims honest.`,
        sourceRefs: [2],
      },
    ],
    keyTakeaways: ['Most people scan; write for scanners', 'Put the most important thing first', 'Use headings, bullets and short paragraphs', 'Clear headlines beat clever ones', 'Front-load the first two words', 'Specific facts beat hype'],
    actionSteps: ['Rewrite your bio so the benefit comes first', 'Write 5 headlines using the formulas', 'Turn one long paragraph into bullets', 'Replace every hype word with a specific fact'],
    quiz: [
      { question: 'According to the research, what do most people do on a web page?', options: ['Read every word', 'Scan it', 'Print it'], answerIndex: 1 },
      { question: 'Which headline is best?', options: ['"Magic in a jar!!!"', '"Homemade jam delivered free this weekend"', '"Welcome to our page"'], answerIndex: 1 },
      { question: 'What does "front-loading" mean?', options: ['Putting the most important words first', 'Adding images at the top', 'Writing longer intros'], answerIndex: 0 },
    ],
    sources: [
      { url: 'https://www.nngroup.com/articles/how-users-read-on-the-web/', title: 'Nielsen Norman Group — How Users Read on the Web' },
      { url: 'https://www.nngroup.com/articles/how-little-do-users-read/', title: 'Nielsen Norman Group — How Little Do Users Read?' },
      { url: 'https://www.nngroup.com/articles/concise-scannable-and-objective-how-to-write-for-the-web/', title: 'Nielsen Norman Group — Concise, SCANNABLE, and Objective: How to Write for the Web' },
      { url: 'https://www.nngroup.com/articles/first-2-words-a-signal-for-scanning/', title: 'Nielsen Norman Group — First 2 Words: A Signal for the Scanning Eye' },
    ],
  },

  // ---------------------------------------------------------------------------------
  {
    slug: 'call-to-action',
    title: 'Calls to Action & Pages That Convert',
    summary: `A great post is wasted if people don't know what to do next. Learn how to write a clear call to action, and how to make the page people land on keep the promise your ad or post made.`,
    level: 'intermediate',
    estimatedMinutes: 12,
    costLevel: 'free',
    audiences: ALL,
    sections: [
      {
        heading: 'What a call to action is',
        body: `A call to action (CTA) is the one thing you want people to do next: "Order now", "Book a free trial", "Visit our stall Saturday", "Reply YES to join". Every flyer, post, video and page should have one clear CTA. If you give people five choices, many choose nothing.`,
        sourceRefs: [0],
      },
      {
        heading: 'Writing a strong CTA',
        body: `- **Start with an action verb**: Get, Book, Try, Join, Visit.\n- **Say what they get**: "Get your free sample" beats "Click here".\n- **Remove worry**: "No sign-up needed", "Cancel anytime" (only if true!).\n- **Add a real reason to act now**: "Only 20 made this week" — but only if it's actually true. Fake urgency breaks trust and can break advertising law.`,
        sourceRefs: [0, 3],
      },
      {
        heading: 'Keep the promise on the landing page',
        body: `The "landing page" is wherever people end up after they tap your link or ad. Google's advertising help explains that this page should repeat the ad's call to action and deliver exactly what the ad promised. If your ad says "Free tour", the page should show a big sign-up form for the free tour. If it says "Call us", show your phone number clearly. If it mentions a special offer, link straight to that offer — not your home page.`,
        sourceRefs: [0, 2],
      },
      {
        heading: 'What makes a page useful',
        body: `Google describes "landing page experience" as how relevant and useful your page is to the people who click. Useful pages:\n\n- Clearly describe what the product or service does.\n- Show prices and important details up front.\n- Include honest reviews if you have them.\n- Make it easy to contact you (phone, form or message button) without hunting.`,
        sourceRefs: [1, 2],
      },
      {
        heading: 'Fast and phone-friendly',
        body: `Most people will see your page on a phone. Google's guidance recommends mobile-friendly pages and fast loading, because a slow page can be the difference between someone leaving and someone buying. Check your own page on a phone: Can you read it without zooming? Can you tap the button easily with a thumb? Does it load in a few seconds on mobile data?`,
        sourceRefs: [1, 4],
      },
      {
        heading: 'No website? Use what you have',
        body: `You don't need an expensive website. A free Google Business Profile, a social media profile with a clear link, or a simple one-page site can be your landing page. Google even lets advertisers use a Business Profile as a landing page. What matters is that it's clear, up to date, and matches what your marketing promised.`,
        sourceRefs: [5],
      },
    ],
    keyTakeaways: ['One clear call to action per piece', 'Start CTAs with a verb and say what people get', 'Only use real urgency', 'The landing page must keep the ad\'s promise', 'Make contact easy and pages phone-friendly'],
    actionSteps: ['Write 3 CTA options for your next post', 'Check that your link goes to the exact offer', 'Test your page on a phone with mobile data', 'Put your contact button where a thumb can reach it'],
    quiz: [
      { question: 'Your ad says "Free sample". Where should the link go?', options: ['Your home page', 'A page where people can get the free sample', 'Your about page'], answerIndex: 1 },
      { question: 'Which CTA is strongest?', options: ['"Click here"', '"Get your free sample"', '"Learn more maybe"'], answerIndex: 1 },
      { question: 'Is it OK to say "Only 3 left!" when you have 100?', options: ['Yes, it creates urgency', 'No, urgency must be real', 'Only on weekends'], answerIndex: 1 },
    ],
    sources: [
      { url: 'https://support.google.com/google-ads/answer/6238826?hl=en', title: 'Google Ads Help — Optimize your ads and landing pages' },
      { url: 'https://support.google.com/google-ads/answer/2404197?hl=en', title: 'Google Ads Help — About Quality Score for Search campaigns' },
      { url: 'https://support.google.com/google-ads/answer/11776459?hl=en', title: 'Google Ads Help — Optimize your landing page for your Smart campaign' },
      { url: 'https://www.ftc.gov/business-guidance/advertising-marketing', title: 'FTC — Advertising and Marketing business guidance' },
      { url: 'https://support.google.com/google-ads/answer/7324514', title: 'Google Ads Help — Optimize your ads for mobile' },
      { url: 'https://support.google.com/google-ads/answer/14325369?hl=en', title: 'Google Ads Help — Use your Business Profile as a landing page' },
    ],
  },

  // ---------------------------------------------------------------------------------
  {
    slug: 'phone-product-photos',
    title: 'Product Photos That Sell (With Just a Phone)',
    summary: `Good photos do a lot of the selling for you, and a phone camera is enough. Learn the "hero shot", lighting with a window, backgrounds, angles and lifestyle photos, using the same standards big online shopping platforms ask for.`,
    level: 'beginner',
    estimatedMinutes: 10,
    costLevel: 'free',
    audiences: ALL,
    sections: [
      {
        heading: 'Why photos matter',
        body: `Online, customers can't touch your product, so photos have to answer their questions: What does it look like? How big is it? What colour is it really? Big shopping platforms take photos so seriously that Google's Merchant Center has detailed rules and best practices for product images. You can use the same standards for free.`,
        sourceRefs: [0],
      },
      {
        heading: 'The hero shot',
        body: `Your main photo (the "hero shot") should show the whole product clearly, on a plain white or light background, with the product filling most of the frame — Google suggests roughly 75–90%. For this main image, skip extra text, stickers, borders or watermarks: Google's guidance says added promotional text distracts shoppers, and it can get images rejected on its platform.`,
        sourceRefs: [0, 1],
      },
      {
        heading: 'Free lighting: use a window',
        body: `Daylight from a window is the best free light. Put your product on a table next to a window (not in harsh direct sun), with a sheet of white paper or card on the other side to bounce light into the shadows. Turn off the room's yellow lights so colours stay true. Tap your phone screen on the product to focus, and clean the lens first!`,
        sourceRefs: [],
      },
      {
        heading: 'Angles, details and size',
        body: `After the hero shot, add extra photos that answer questions:\n\n- Front, back and side views\n- Close-ups of texture, stitching or ingredients\n- Something for scale (a hand holding it)\n- Each colour or style photographed separately, so customers see exactly what they'll get\n\nGoogle recommends a separate image for every variant rather than one group photo.`,
        sourceRefs: [0, 2],
      },
      {
        heading: 'Lifestyle photos',
        body: `Lifestyle photos show the product being used in real life: the backpack on a hiking trail, the candle glowing on a cosy shelf. They help people imagine owning it. Use them as extra images (not the main one). If people appear in your photos, get their permission, and for children get a parent's permission.`,
        sourceRefs: [3],
      },
      {
        heading: 'Size and honesty',
        body: `Take photos at your phone's highest quality; large, sharp images look better everywhere (Google recommends around 1500 × 1500 pixels or more for product images). Light edits for brightness are fine, but never change the product's real colour or hide flaws. Misleading photos lead to returns, bad reviews and broken trust. If you use AI to create or change images, be honest about it — some platforms require AI-generated images to be labelled.`,
        sourceRefs: [0, 1],
      },
    ],
    keyTakeaways: ['Photos answer the questions customers can\'t ask', 'Hero shot: whole product, plain background, no text', 'Window light is the best free light', 'Show angles, details, scale and each variant', 'Lifestyle photos help people imagine owning it', 'Never misrepresent the product'],
    actionSteps: ['Set up a window "studio" with white card', 'Take a hero shot and 3 detail shots', 'Take one lifestyle photo', 'Compare before and after in the Design Studio'],
    quiz: [
      { question: 'What should the main product photo usually look like?', options: ['Product on a plain light background, filling most of the frame', 'Product with big sale text on it', 'A group photo of every colour'], answerIndex: 0 },
      { question: 'What is the best free light source?', options: ['A window', 'A yellow ceiling bulb', 'The phone flash only'], answerIndex: 0 },
      { question: 'Is it OK to edit a photo so a product looks a different colour?', options: ['Yes', 'No, photos must be honest', 'Only for small products'], answerIndex: 1 },
    ],
    sources: [
      { url: 'https://support.google.com/merchants/answer/18353357?hl=en', title: 'Google Merchant Center Help — Image best practices' },
      { url: 'https://support.google.com/merchants/answer/6324350?hl=en', title: 'Google Merchant Center Help — Image link [image_link]' },
      { url: 'https://support.google.com/merchants/answer/6324370?hl=en', title: 'Google Merchant Center Help — Additional image link' },
      { url: 'https://support.google.com/merchants/answer/9103186?hl=en', title: 'Google Merchant Center Help — Lifestyle image link' },
    ],
  },

  // ---------------------------------------------------------------------------------
  {
    slug: 'content-calendar',
    title: 'Plan a Month of Content in One Afternoon',
    summary: `Posting "whenever you remember" leads to silence. Learn how professionals plan content with themes, a calendar and a direction sheet, so you can create a whole month of posts in one sitting.`,
    level: 'intermediate',
    estimatedMinutes: 13,
    costLevel: 'free',
    audiences: ALL,
    sections: [
      {
        heading: 'What content marketing is',
        body: `Content marketing means sharing useful, interesting or entertaining things — tips, how-tos, stories, behind-the-scenes videos — so people get to know and trust you before they buy. SCORE, a nonprofit that mentors small businesses, calls the content calendar a business's greatest organisational asset for doing this well.`,
        sourceRefs: [0],
      },
      {
        heading: 'Choose 3–4 content pillars',
        body: `Pillars are the main themes you post about again and again. For a bakery they might be:\n\n1. **Teach**: baking tips\n2. **Show**: behind the scenes\n3. **Prove**: customer reviews (real ones)\n4. **Sell**: this week's specials\n\nRotate through your pillars so your feed isn't all "buy now". A common rule of thumb is to make most of your posts helpful or fun and only some of them direct sales.`,
        sourceRefs: [],
      },
      {
        heading: 'Build the calendar',
        body: `Make a simple table with columns for date, pillar, topic, format (photo, video, carousel), channel, call to action and status. SCORE suggests planning one or two months ahead and working on each piece a couple of weeks before it goes live. Add holidays, school breaks and local events — content tied to the season is easy to plan and timely.`,
        sourceRefs: [0, 1],
      },
      {
        heading: 'Use a direction sheet for bigger pieces',
        body: `For important content like a launch video, fill in a one-page "direction sheet" first: purpose, target audience, key message, call to action, format, channels, deadline and budget. SCORE offers a template for this. It stops you from creating something beautiful that has no clear job.`,
        sourceRefs: [2],
      },
      {
        heading: 'Batch it',
        body: `Batching means doing the same kind of task all at once: write all the captions in one sitting, take all the photos in another, then schedule everything. It's faster and your posts look more consistent. One afternoon can produce a month of content.\n\n- Hour 1: pick topics for the month\n- Hour 2: write captions\n- Hour 3: make images and short videos\n- Hour 4: schedule and double-check`,
        sourceRefs: [],
      },
      {
        heading: 'Learn from what worked',
        body: `At the end of each month, look at your top posts: what did they have in common — a topic, a format, a time of day? SCORE recommends analysing your past top performers and paying attention to what customers are looking for right now. Do more of what worked next month.`,
        sourceRefs: [0, 1],
      },
    ],
    keyTakeaways: ['Content builds trust before people buy', 'Pick 3–4 pillars and rotate them', 'Plan 1–2 months ahead in a calendar', 'Use a direction sheet for big pieces', 'Batch similar tasks together', 'Review your top posts monthly'],
    actionSteps: ['Choose your 3–4 pillars', 'Make a calendar with 12 posts for next month', 'Use the Lab\'s Content Calendar tool to fill gaps', 'Batch-create your first week of posts'],
    quiz: [
      { question: 'What is a content pillar?', options: ['A main theme you post about regularly', 'A type of camera', 'A paid ad'], answerIndex: 0 },
      { question: 'What is "batching"?', options: ['Doing similar tasks all at once', 'Posting 50 times a day', 'Deleting old posts'], answerIndex: 0 },
      { question: 'How far ahead does SCORE suggest planning your calendar?', options: ['One day', 'One or two months', 'Five years'], answerIndex: 1 },
    ],
    sources: [
      { url: 'https://www.score.org/articles/fundamentals-content-marketing-small-businesses/', title: 'SCORE — The Fundamentals of Content Marketing for Small Businesses' },
      { url: 'https://www.score.org/articles/maximize-impact-your-content-marketing/', title: 'SCORE — Maximize the Impact of Your Content Marketing' },
      { url: 'https://www.score.org/articles/content-marketing-direction-sheet/', title: 'SCORE — Content Marketing Direction Sheet' },
    ],
  },

  // ---------------------------------------------------------------------------------
  {
    slug: 'markets-and-events',
    title: 'Win at Markets, Fairs & Local Events',
    summary: `Farmers' markets, school fairs and community events put you face to face with hundreds of potential customers. Learn how to prepare weeks ahead, design a stall that stops people, and turn one-time visitors into returning customers.`,
    level: 'beginner',
    estimatedMinutes: 12,
    costLevel: 'low',
    audiences: ALL,
    sections: [
      {
        heading: 'Why in-person events work',
        body: `At an event, people can see, touch and taste what you sell, and meet you. That builds trust fast. The U.S. Department of Agriculture's farmers' market guides note that consistent, simple messages and good promotion bring people in. The SBA notes that many markets also welcome non-food makers such as candle, soap or jewellery sellers, depending on local rules — always check what your event allows, and whether you need a permit.`,
        sourceRefs: [1, 5],
      },
      {
        heading: 'Start preparing weeks ahead',
        body: `SCORE suggests starting to prepare for a major local event as much as 12 weeks ahead, with signs, updated online listings, posts and messages to existing customers. A simple countdown for a smaller event:\n\n- **4+ weeks**: book your spot, check rules, plan stock.\n- **2–3 weeks**: make signs and flyers; update your online profiles with the date.\n- **1 week**: post a countdown; message existing customers.\n- **Event day**: post a photo of your stall so followers can find you.\n\nSCORE also found that during events, businesses that kept things fast and simple did better than those with complicated promotions.`,
        sourceRefs: [0],
      },
      {
        heading: 'Design a stall that stops people',
        body: `You have about three seconds as people walk past. Make them count:\n\n- A big, readable sign: your name and what you sell.\n- Prices clearly shown, so people don't have to ask.\n- Products at different heights (use boxes or crates) instead of flat on the table.\n- Your brand colours on the tablecloth, sign and bags.\n- A sample, demo or something to touch.`,
        sourceRefs: [3],
      },
      {
        heading: 'Flyers that work',
        body: `USDA's market toolkit advises that flyers clearly show the name, date, time and location. Keep one main message and one call to action. Give out flyers or cards with every purchase so people can find you again, and add a QR code that leads to your page or email sign-up.`,
        sourceRefs: [2],
      },
      {
        heading: 'Turn visitors into regulars',
        body: `The real prize is the customer who comes back. At every event:\n\n- Invite people to join your email list or follow you (with a sign-up sheet or QR code).\n- Offer a "next visit" perk on your card.\n- Team up with neighbouring stalls to recommend each other.\n- Write down what sold well and what people asked for.`,
        sourceRefs: [0, 2],
      },
      {
        heading: 'Adapt quickly',
        body: `USDA's lessons from running an evening market found that vendors who quickly adjusted to what customers responded to did significantly better. If one product flies off the table and another is ignored, move the popular one to the front, change a price, or try a new sample — during the event, not next month.`,
        sourceRefs: [4],
      },
    ],
    keyTakeaways: ['Events build trust face to face', 'Check rules and permits first', 'Prepare with a countdown plan', 'Big signs, clear prices, products at different heights', 'Collect contacts to turn visitors into regulars', 'Adapt during the event'],
    actionSteps: ['Find one local market or fair and check its rules', 'Make a 4-week countdown plan', 'Design your stall sign and flyer in the Lab', 'Prepare a sign-up sheet or QR code'],
    quiz: [
      { question: 'What must a good event flyer show?', options: ['Name, date, time and location', 'Only a logo', 'Your life story'], answerIndex: 0 },
      { question: 'Why show prices clearly?', options: ['So people don\'t have to ask and can decide fast', 'It is required for every product', 'To make the sign bigger'], answerIndex: 0 },
      { question: 'One product is selling much better. What should you do?', options: ['Wait until next month', 'Adjust during the event, e.g. move it to the front', 'Hide it'], answerIndex: 1 },
    ],
    sources: [
      { url: 'https://www.score.org/resource/article/how-prepare-your-business-major-events-your-local-area', title: 'SCORE — How to Prepare Your Business for Major Events in Your Local Area' },
      { url: 'https://www.ams.usda.gov/sites/default/files/media/Marketing%20the%20Farmers%20Market.pdf', title: 'USDA Agricultural Marketing Service — Marketing the Farmers Market (PDF)' },
      { url: 'https://www.ams.usda.gov/sites/default/files/media/FMC_Starting-aFarmersMarketat-aUniversityToolkit_Final.pdf', title: 'USDA Agricultural Marketing Service — Starting a Farmers Market at a University toolkit (PDF)' },
      { url: 'https://www.score.org/articles/building-your-brand-signage/', title: 'SCORE — Building Your Brand With Signage' },
      { url: 'https://usda.gov/media/blog/2015/12/10/five-lessons-learned-usdas-farmers-market-night', title: 'USDA — Five Lessons Learned from USDA\'s Farmers Market at Night' },
      { url: 'https://legacy.sba.gov/blog/farmers-markets-provide-needed-goods-communities-during-covid-19', title: 'SBA — Farmers Markets Provide Needed Goods to Communities' },
    ],
  },

  // ---------------------------------------------------------------------------------
  {
    slug: 'effortless-service',
    title: 'Customer Service Is Marketing',
    summary: `Every time a customer needs help, you either win a fan or lose one. Learn what research says actually builds loyalty (hint: it's not over-the-top "wow" moments), and how to make getting help fast and easy.`,
    level: 'intermediate',
    estimatedMinutes: 11,
    costLevel: 'free',
    audiences: ALL,
    sections: [
      {
        heading: 'The surprising research',
        body: `Many businesses try to "delight" customers with extra surprises. A well-known Harvard Business Review study of more than 75,000 people contacting customer service found that going above and beyond made surprisingly little difference to loyalty. What mattered most was how much **effort** customers had to put in to get their problem solved. The follow-up reported that 96% of customers with high-effort experiences became more disloyal, compared with 9% of those with low-effort experiences.`,
        sourceRefs: [0, 1],
      },
      {
        heading: 'Reduce customer effort',
        body: `Make getting help easy:\n\n- **One contact, one fix**: solve it the first time, so they don't have to come back.\n- **Don't make them repeat themselves**: keep notes on each customer's issue.\n- **Be easy to reach**: show how to contact you on every page and package.\n- **Answer common questions in advance**: a short FAQ saves everyone time.\n- **Think one step ahead**: if a customer asks about delivery, also tell them how to track it.`,
        sourceRefs: [0, 1],
      },
      {
        heading: 'A simple recovery recipe',
        body: `When something goes wrong, a simple approach many businesses use is **LAST**:\n\n1. **Listen** — let them explain without interrupting.\n2. **Apologise** — sincerely, without blaming.\n3. **Solve** — fix it quickly or offer a fair choice (replace, refund).\n4. **Thank** — thank them for telling you; they've helped you improve.\n\nHandled well, a problem can make customers trust you more, because they've seen you keep your word.`,
        sourceRefs: [],
      },
      {
        heading: 'Measure effort',
        body: `The HBR researchers suggested a "Customer Effort Score": after you help someone, ask one question such as "How easy was it to get your problem solved?" on a 1–5 scale. If scores are low, look for the step that causes the most effort and fix it.`,
        sourceRefs: [0],
      },
      {
        heading: 'Not every moment should be effortless',
        body: `A later Harvard Business Review article adds balance: for some experiences, like a challenging fitness class or game, customers *want* a challenge or surprise. The lesson: make the boring parts (buying, getting help, returns) effortless, and save the excitement for the parts customers enjoy.`,
        sourceRefs: [2],
      },
    ],
    keyTakeaways: ['Low customer effort builds loyalty more than "wow" extras', 'Solve problems the first time', 'Be easy to reach', 'Use Listen–Apologise–Solve–Thank', 'Ask "How easy was that?"', 'Make boring parts effortless'],
    actionSteps: ['Write a 5-question FAQ', 'Put your contact details on every page and package', 'Write your LAST recovery script', 'Ask your next 5 customers how easy buying was'],
    quiz: [
      { question: 'According to the HBR study, what predicts loyalty best?', options: ['Over-the-top surprises', 'How little effort customers needed to solve their problem', 'The logo colour'], answerIndex: 1 },
      { question: 'What does the "S" in LAST stand for?', options: ['Sell', 'Solve', 'Smile'], answerIndex: 1 },
      { question: 'Which question measures customer effort?', options: ['"How easy was it to get your problem solved?"', '"Do you like our logo?"', '"How old are you?"'], answerIndex: 0 },
    ],
    sources: [
      { url: 'https://hbr.org/2010/07/stop-trying-to-delight-your-customers', title: 'Harvard Business Review — Stop Trying to Delight Your Customers' },
      { url: 'https://hbr.org/2012/01/stop-trying-to-delight-your-cu', title: 'Harvard Business Review — Stop Trying to Delight Your Customers: The Idea in Practice' },
      { url: 'https://hbr.org/2022/07/what-youre-getting-wrong-about-customer-journeys', title: 'Harvard Business Review — What You\'re Getting Wrong About Customer Journeys' },
    ],
  },

  // ---------------------------------------------------------------------------------
  {
    slug: 'bad-reviews',
    title: 'Handling Bad Reviews the Right Way',
    summary: `Every business gets a bad review eventually. Learn how to respond calmly and professionally, what U.S. law says you must never do to hide negative reviews, and how to turn criticism into improvements.`,
    level: 'intermediate',
    estimatedMinutes: 12,
    costLevel: 'free',
    audiences: ALL,
    sections: [
      {
        heading: 'Bad reviews aren\'t the end',
        body: `A business with only perfect reviews can look suspicious. A few honest negative reviews, answered well, show future customers that you're real and that you care. Many people read your reply as carefully as the review itself. Your goal isn't to "win" — it's to show everyone else how you treat customers.`,
        sourceRefs: [],
      },
      {
        heading: 'How to reply',
        body: `1. **Wait** until you're calm. Never reply angry.\n2. **Thank** them for the feedback.\n3. **Apologise** for their experience (even if you see it differently).\n4. **Explain briefly** what you're doing to fix it — no excuses, no arguing.\n5. **Take it offline**: invite them to contact you directly.\n\nExample: "Thanks for telling us, Sam. We're sorry your order arrived late — that's not the experience we want. We've changed our delivery partner. Please message us so we can make it right."`,
        sourceRefs: [],
      },
      {
        heading: 'What the law says you must not do',
        body: `In the United States, the FTC's Consumer Reviews and Testimonials Rule took effect in October 2024. Among other things, it bans:\n\n- Using **unfounded legal threats, intimidation or false accusations** to get a negative review removed.\n- Showing only good reviews in a way that suggests they represent most reviews when bad ones were held back.\n- Buying or writing **fake reviews**.\n\nThe FTC can seek large money penalties for violations, and it has already sent warning letters to companies.`,
        sourceRefs: [0, 1],
      },
      {
        heading: 'No "gag clauses"',
        body: `Under the Consumer Review Fairness Act, a business can't put terms in its contracts or website terms that punish or fine customers for posting honest reviews. Customers have the right to share their honest opinion, positive or negative.`,
        sourceRefs: [2],
      },
      {
        heading: 'Reporting vs. hiding',
        body: `Review platforms let businesses flag reviews that are fake or break the site's rules (for example, spam or hate speech). The FTC warns not to misuse those tools to get rid of honest negative reviews. If a review is genuinely fake, report it with evidence. If it's honest but harsh, reply professionally.`,
        sourceRefs: [3],
      },
      {
        heading: 'Use criticism to improve',
        body: `Keep a simple list of every complaint. When the same problem shows up twice, fix it. Then tell people: "You told us our boxes were hard to open, so we redesigned them." Showing that you listen turns critics into fans and gives you great content.`,
        sourceRefs: [],
      },
    ],
    keyTakeaways: ['Honest bad reviews, answered well, build trust', 'Reply calmly: thank, apologise, fix, take offline', 'Never threaten or pressure reviewers', 'Never hide negatives to look perfect, never buy fake reviews', 'Gag clauses are banned', 'Turn repeated complaints into improvements'],
    actionSteps: ['Write a reply template for negative reviews', 'Start a complaint log', 'Check your website terms for anything that limits reviews', 'Reply to one real review this week (if you have one)'],
    quiz: [
      { question: 'A customer leaves an honest 2-star review. What should you do?', options: ['Threaten to sue', 'Reply calmly, apologise and offer to fix it', 'Ask friends to post fake 5-star reviews'], answerIndex: 1 },
      { question: 'Can a business fine customers for posting honest negative reviews in the U.S.?', options: ['Yes', 'No, the Consumer Review Fairness Act bans that', 'Only online'], answerIndex: 1 },
      { question: 'When should you use a platform\'s "report" button on a review?', options: ['For any negative review', 'When a review is genuinely fake or breaks the rules', 'Never'], answerIndex: 1 },
    ],
    sources: [
      { url: 'https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers', title: 'FTC — The Consumer Reviews and Testimonials Rule: Questions and Answers' },
      { url: 'https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials', title: 'FTC — Final Rule Banning Fake Reviews and Testimonials (press release)' },
      { url: 'https://www.ftc.gov/business-guidance/resources/consumer-review-fairness-act-what-businesses-need-know', title: 'FTC — Consumer Review Fairness Act: What Businesses Need to Know' },
      { url: 'https://www.ftc.gov/business-guidance/resources/featuring-online-customer-reviews-guide-platforms', title: 'FTC — Featuring Online Customer Reviews: A Guide for Platforms' },
    ],
  },

  // ---------------------------------------------------------------------------------
  {
    slug: 'honest-green-claims',
    title: 'Eco-Friendly Claims: Say Only What You Can Prove',
    summary: `Customers love products that are better for the planet, so "green" words are tempting. Learn what the FTC's Green Guides say about environmental claims, why "eco-friendly" on its own is risky, and how to make specific, honest claims instead.`,
    level: 'intermediate',
    estimatedMinutes: 11,
    costLevel: 'free',
    audiences: ALL,
    sections: [
      {
        heading: 'Why green claims need care',
        body: `Many shoppers want to buy products that are better for the environment. That makes environmental claims powerful — and easy to misuse. In the U.S., the FTC publishes the "Green Guides" to help marketers avoid environmental claims that mislead people. Misleading green claims can be treated as deceptive advertising.`,
        sourceRefs: [0, 1],
      },
      {
        heading: 'Avoid vague words on their own',
        body: `Broad words like "green", "eco-friendly" or "planet-safe" are risky, because the FTC says they're very hard (often impossible) to prove. Every product has some environmental impact. Instead, say exactly what the benefit is:\n\n- ❌ "Eco-friendly packaging"\n- ✅ "Packaging made from 80% recycled cardboard"`,
        sourceRefs: [1, 2],
      },
      {
        heading: 'Recyclable and compostable',
        body: `"Recyclable" should only be used without explanation if recycling for that item is widely available to the people who buy it; the Green Guides use a benchmark of 60% of consumers or communities. Otherwise, add a clear qualifier, like "Check if recycling is available in your area." "Compostable" requires evidence that the whole item really breaks down into compost safely and in a reasonable time.`,
        sourceRefs: [1, 2],
      },
      {
        heading: 'Comparisons and certifications',
        body: `If you say "less waste", say less than what: "20% less plastic than our previous bottle." If you show a certification seal, you still need to be able to prove every claim the seal suggests. And you must be able to back up every claim with evidence *before* you make it, not after someone asks.`,
        sourceRefs: [1, 2],
      },
      {
        heading: 'Small businesses can still shine',
        body: `Honest, specific green claims are actually more convincing than vague ones. If you reuse jars, use local ingredients or deliver by bike, say exactly that, and show it in photos and videos. Customers trust what they can see. Keep a simple folder of proof: receipts, supplier details, test results.`,
        sourceRefs: [0, 2],
      },
    ],
    keyTakeaways: ['Green claims are powerful and regulated', 'Avoid vague words like "eco-friendly" on their own', 'Be specific: what, how much, compared to what', 'Only say "recyclable" if recycling is widely available', 'Have proof before you make a claim', 'Specific honest claims are more convincing'],
    actionSteps: ['List every green word in your marketing', 'Replace vague words with specific facts', 'Create a proof folder for your claims', 'Post one photo showing a real eco action'],
    quiz: [
      { question: 'Which claim is safest?', options: ['"100% eco-friendly"', '"Bottle made from 50% recycled plastic"', '"Good for the planet"'], answerIndex: 1 },
      { question: 'When do you need proof for a green claim?', options: ['Before you make it', 'Only if someone complains', 'Never'], answerIndex: 0 },
      { question: '"Less waste" should be followed by…', options: ['Nothing', 'What it is compared to', 'An emoji'], answerIndex: 1 },
    ],
    sources: [
      { url: 'https://www.ftc.gov/news-events/topics/truth-advertising/green-guides', title: 'FTC — Green Guides' },
      { url: 'https://www.ftc.gov/business-guidance/resources/environmental-claims-summary-green-guides', title: 'FTC — Environmental Claims: Summary of the Green Guides' },
      { url: 'https://www.ftc.gov/business-guidance/advertising-marketing/environmental-marketing', title: 'FTC — Environmental Marketing business guidance' },
    ],
  },

  // ---------------------------------------------------------------------------------
  {
    slug: 'selling-online-promises',
    title: 'Selling Online: Shipping, Refunds & Promises',
    summary: `Selling online is exciting, but customers can't see you. Learn the rules for shipping promises in the U.S., how to handle delays and refunds fairly, and the basic "rules of the road" for advertising online.`,
    level: 'intermediate',
    estimatedMinutes: 12,
    costLevel: 'free',
    audiences: ALL,
    sections: [
      {
        heading: 'Trust is everything online',
        body: `When someone buys from you online, they pay before they receive anything. Clear promises — what they'll get, when it arrives, what happens if something goes wrong — are some of the strongest marketing you have. Broken promises spread quickly through reviews. Under-promise and over-deliver.`,
        sourceRefs: [],
      },
      {
        heading: 'The shipping rule',
        body: `In the U.S., the FTC's Mail, Internet, or Telephone Order Merchandise Rule covers most products ordered online, by phone or by mail. Key points:\n\n- If you say you'll ship within a certain time, you must have a reasonable basis to believe you can.\n- If you don't state a time, you must reasonably expect to ship within **30 days**.\n- That's why it's often called the "30-day rule".`,
        sourceRefs: [0, 1],
      },
      {
        heading: 'When there\'s a delay',
        body: `If you can't ship on time, the rule says you must tell the customer and offer them a choice: agree to the delay or cancel and get a prompt refund. If you can't ship at all, cancel and refund promptly. You also can't swap in a noticeably different product unless the customer agrees first. Being upfront about delays usually earns sympathy instead of anger.`,
        sourceRefs: [0],
      },
      {
        heading: 'Clear policies build confidence',
        body: `Write short, friendly policies and link them near your "Buy" button:\n\n- **Shipping**: how long it takes to make and send, and the cost.\n- **Returns/refunds**: whether you accept them, how, and how long.\n- **Contact**: how to reach you if there's a problem.\n\nClear policies reduce questions and make hesitant customers more likely to buy.`,
        sourceRefs: [0],
      },
      {
        heading: 'Online advertising rules of the road',
        body: `The FTC's "Rules of the Road" guide explains that the same truth-in-advertising rules apply online as anywhere else: ads must be truthful, not misleading, and backed by evidence. Important information (like extra fees or conditions) must be clear and easy to notice — not hidden in tiny print or behind a link nobody clicks.`,
        sourceRefs: [2],
      },
      {
        heading: 'Under-18 sellers',
        body: `If you're under 18, check each platform's age rules: many selling and payment services set minimum ages for account holders. Make your online shop a family project — a parent manages the account and payments while you handle products and marketing.`,
        sourceRefs: [],
      },
    ],
    keyTakeaways: ['Clear promises are strong marketing', 'Only promise shipping times you can meet', 'No stated time = ship within 30 days', 'Delays: tell customers and offer cancel + refund', 'Show shipping, return and contact policies clearly', 'Under 18? Sell with a parent\'s account'],
    actionSteps: ['Write your shipping policy with a realistic time', 'Write your return/refund policy', 'Write a delay message template', 'Check your ads for hidden fees or fine print'],
    quiz: [
      { question: 'If you don\'t state a shipping time, within how many days should you expect to ship?', options: ['7', '30', '90'], answerIndex: 1 },
      { question: 'You can\'t ship on time. What should you do?', options: ['Say nothing', 'Tell the customer and offer to cancel with a prompt refund', 'Send a different product without asking'], answerIndex: 1 },
      { question: 'Do advertising truth rules apply online?', options: ['Yes, the same rules apply', 'No, the internet is different', 'Only for big companies'], answerIndex: 0 },
    ],
    sources: [
      { url: 'https://www.ftc.gov/business-guidance/resources/business-guide-ftcs-mail-internet-or-telephone-order-merchandise-rule', title: 'FTC — Business Guide to the Mail, Internet, or Telephone Order Merchandise Rule' },
      { url: 'https://www.ftc.gov/legal-library/browse/rules/mail-internet-or-telephone-order-merchandise-rule', title: 'FTC — Mail, Internet, or Telephone Order Merchandise Rule' },
      { url: 'https://www.ftc.gov/system/files/ftc_gov/pdf/bus28-rulesroad-2023_508.pdf', title: 'FTC — Advertising and Marketing on the Internet: Rules of the Road (PDF)' },
    ],
  },

  // ---------------------------------------------------------------------------------
  {
    slug: 'protect-your-business',
    title: 'Protect Your Business From Scams & Hacks',
    summary: `Small businesses and their social accounts are popular targets for scammers. Learn the most common tricks — fake invoices, phishing and account hijacking — and the simple habits that keep your business, followers and money safe.`,
    level: 'beginner',
    estimatedMinutes: 11,
    costLevel: 'free',
    audiences: ALL,
    sections: [
      {
        heading: 'Why marketers need security',
        body: `Your social media accounts, email list and website are business assets. If a scammer takes over your account, they can trick your followers and damage the trust you worked hard to build. The SBA and FTC both publish free guides because small businesses are frequent targets.`,
        sourceRefs: [0, 2],
      },
      {
        heading: 'Fake invoices and "you owe us" scams',
        body: `The FTC warns about fake bills for things you never ordered, such as website listings, "SEO services" or domain names, sometimes marked "past due" to rush you. Protect yourself:\n\n- Check every bill against what you actually ordered.\n- Limit who can approve payments (for a young seller: a parent).\n- Search an unfamiliar company's name with the word "scam" or "complaint".\n- Never pay anyone who demands gift cards, wire transfers or cryptocurrency.`,
        sourceRefs: [0, 1],
      },
      {
        heading: 'Spot phishing',
        body: `Phishing messages pretend to be from a platform, bank or customer to steal your password. Warning signs:\n\n- Urgent threats ("Your account will be deleted in 24 hours!")\n- Links to strange web addresses\n- Requests for passwords or codes\n\nNever click the link. Instead, open the app or type the website address yourself to check. Real platforms won't ask for your password by message.`,
        sourceRefs: [0, 3],
      },
      {
        heading: 'Lock down your accounts',
        body: `- Use a **long, unique password** for every account; the FTC suggests at least 12 characters, and a passphrase of random words is easy to remember.\n- Turn on **multi-factor authentication** (a code or app as a second step) everywhere it's offered.\n- Keep a list of all your business accounts and who has access.\n- Remove access for anyone who no longer helps you.`,
        sourceRefs: [2, 3, 4],
      },
      {
        heading: 'If something goes wrong',
        body: `Act quickly: change your password, turn on multi-factor authentication, and use the platform's account recovery tools. Warn your followers or customers through another channel so they don't fall for the scammer. In the U.S., you can report scams to the FTC at ReportFraud.ftc.gov. Young sellers should tell a parent or guardian right away.`,
        sourceRefs: [0, 1],
      },
    ],
    keyTakeaways: ['Your accounts are business assets', 'Check every invoice; never pay by gift card', 'Don\'t click urgent links — go to the site yourself', 'Long unique passwords + multi-factor authentication', 'Keep an access list', 'Report scams and warn customers fast'],
    actionSteps: ['Turn on multi-factor authentication on every business account', 'Make a list of your accounts and who can access them', 'Change any reused passwords', 'Save the FTC report link'],
    quiz: [
      { question: 'Someone demands payment in gift cards for an invoice. What should you do?', options: ['Pay quickly', 'Don\'t pay — it\'s a scam warning sign', 'Pay half'], answerIndex: 1 },
      { question: 'What is multi-factor authentication?', options: ['A second step like a code when logging in', 'A longer username', 'A type of ad'], answerIndex: 0 },
      { question: 'You get an urgent message with a login link. Best move?', options: ['Click and log in', 'Open the app or type the site address yourself', 'Reply with your password'], answerIndex: 1 },
    ],
    sources: [
      { url: 'https://www.ftc.gov/business-guidance/resources/scams-your-small-business-guide-business', title: 'FTC — Scams and Your Small Business: A Guide for Business' },
      { url: 'https://consumer.ftc.gov/consumer-alerts/2026/05/run-small-business-pay-your-bills-not-scammers', title: 'FTC Consumer Alert — Run a small business? Pay your bills, not scammers' },
      { url: 'https://www.sba.gov/business-guide/manage-your-business/strengthen-your-cybersecurity', title: 'U.S. Small Business Administration — Strengthen your cybersecurity' },
      { url: 'https://www.ftc.gov/business-guidance/small-businesses/cybersecurity', title: 'FTC — Cybersecurity for Small Business' },
      { url: 'https://www.sba.gov/blog/2024/2024-10/todays-economy-cyber-safety-critical-small-business-success/', title: 'SBA — In Today\'s Economy, Cyber Safety Is Critical to Small Business Success' },
    ],
  },

  // ---------------------------------------------------------------------------------
  {
    slug: 'launch-plan',
    title: 'Plan a Product Launch',
    summary: `A launch is your chance to make a splash. Learn how to plan a launch in phases — before, during and after — with a timeline, a mix of free channels, and clear goals so you know whether it worked.`,
    level: 'intermediate',
    estimatedMinutes: 13,
    costLevel: 'free',
    audiences: ALL,
    sections: [
      {
        heading: 'Why plan a launch?',
        body: `Putting something new up for sale without telling anyone is like throwing a party without invitations. A launch plan makes sure the right people hear about it at the right time. SBA's marketing plan guidance recommends writing down your goals, action plan and budget before you start, and SCORE's marketing plan guide walks through the same kind of planning step by step.`,
        sourceRefs: [0, 1],
      },
      {
        heading: 'Set a clear goal',
        body: `Decide what success looks like, with a number and a date: "Sell 50 bracelets in the first two weeks" or "Get 100 people on the waiting list before launch day." A goal helps you choose the right activities and tells you afterwards whether the launch worked.`,
        sourceRefs: [0],
      },
      {
        heading: 'Phase 1: Before launch (2–4 weeks)',
        body: `- **Test first**: let a few real customers try it and give feedback.\n- **Build a waiting list**: an email sign-up or "notify me" message list.\n- **Tease it**: behind-the-scenes photos, a countdown, a sneak peek.\n- **Prepare everything**: photos, product description, prices, policies, stock.\n- **Line up helpers**: friends, partners or local groups who'll share on launch day.`,
        sourceRefs: [],
      },
      {
        heading: 'Phase 2: Launch day',
        body: `Make it an event: post across all your channels at once, email your waiting list first (they're your biggest fans), go live or post a video, and reply to every comment quickly. A real launch-only offer (like a free gift for the first 20 orders) gives people a reason to act now — but keep it honest and simple.`,
        sourceRefs: [],
      },
      {
        heading: 'Choose your channel mix',
        body: `A good digital launch mixes several channels that support each other: your website or shop page, email to your list, social media posts and short videos, search (a complete Google Business Profile), and partners. You don't need all of them — pick the two or three where your customers already spend time, and do those well.`,
        sourceRefs: [],
      },
      {
        heading: 'Phase 3: After launch',
        body: `The launch isn't over on day one. In the following weeks: thank your first customers, ask for honest reviews, share real customer photos (with permission), and compare results with your goal. Write down what worked and what didn't — your next launch will be even better.`,
        sourceRefs: [],
      },
    ],
    keyTakeaways: ['A launch plan saves time and money', 'Set a goal with a number and a date', 'Before: test, waiting list, tease, prepare', 'Launch day: all channels, waiting list first', 'Pick 2–3 channels and do them well', 'After: thank, ask for reviews, measure'],
    actionSteps: ['Write your launch goal', 'Create a 4-week launch timeline', 'Start a waiting list', 'Plan launch-day posts with the Lab\'s Content Calendar'],
    quiz: [
      { question: 'Which is a clear launch goal?', options: ['"Do well"', '"Sell 50 bracelets in the first two weeks"', '"Be famous"'], answerIndex: 1 },
      { question: 'Who should hear about the launch first?', options: ['Your waiting list', 'Nobody', 'Only competitors'], answerIndex: 0 },
      { question: 'What should you do after the launch?', options: ['Stop marketing', 'Thank customers, ask for reviews and compare results with your goal', 'Delete the posts'], answerIndex: 1 },
    ],
    sources: [
      { url: 'https://www.sba.gov/business-guide/manage-your-business/marketing-sales', title: 'U.S. Small Business Administration — Marketing and sales' },
      { url: 'https://www.score.org/e-guides/marketing-plan-guide/', title: 'SCORE — Marketing Plan Guide' },
    ],
  },

  // ---------------------------------------------------------------------------------
  {
    slug: 'test-and-improve',
    title: 'Test, Learn, Improve: A/B Testing for Beginners',
    summary: `Professionals don't guess which headline or picture works best — they test. Learn how to run simple, fair A/B tests on posts, flyers and offers, read the results without fooling yourself, and keep improving.`,
    level: 'advanced',
    estimatedMinutes: 12,
    costLevel: 'free',
    audiences: ALL,
    sections: [
      {
        heading: 'What an A/B test is',
        body: `An A/B test compares two versions of something — version A and version B — to see which works better. Big advertising platforms build this in: Google Ads, for example, has an Experiments page that lets advertisers test a proposed change against the original and then apply the winner. You can use the same idea for free with posts, flyers, emails and signs.`,
        sourceRefs: [0],
      },
      {
        heading: 'Change one thing only',
        body: `The most important rule: change **only one thing** between A and B. Google's own testing guidance recommends comparing versions that differ in just one variable. If you change the picture *and* the headline, you won't know which one made the difference. Good things to test:\n\n- Headline wording\n- Main photo\n- Call to action ("Order now" vs "Get yours today")\n- Price display or offer`,
        sourceRefs: [1],
      },
      {
        heading: 'Make it fair',
        body: `Both versions should get a similar chance: similar time of day, similar audience, similar number of people. Google's testing tools often split traffic 50/50 for this reason. For a market stall, you might use sign A on Saturday morning and sign B the next Saturday morning — not one on a rainy day and one on a sunny day.`,
        sourceRefs: [1],
      },
      {
        heading: 'Wait for enough results',
        body: `Small numbers can fool you. If 3 people clicked A and 5 clicked B, that could just be luck. Professional tools wait for a minimum amount of data before showing a result — Google's Demand Gen experiments, for instance, need at least 50 conversions per version when using conversion-based bidding. For small businesses: run tests long enough to get dozens of responses, and be careful about drawing big conclusions from tiny numbers.`,
        sourceRefs: [1],
      },
      {
        heading: 'Measure the right thing',
        body: `Choose your measure *before* the test: sales, sign-ups, messages or clicks. "Likes" are nice but don't always mean sales. Write down your guess (the "hypothesis") first: "I think a photo of someone using the product will get more orders than a plain product photo." Then see if you were right.`,
        sourceRefs: [],
      },
      {
        heading: 'Keep a test log',
        body: `Keep a simple log: date, what you tested, version A, version B, results, winner and what you learned. Over months this becomes your own playbook of what works for your customers. USDA's experience with a night market found that vendors who adapted to what customers responded to did better — testing is how you find out what customers respond to.`,
        sourceRefs: [2],
      },
    ],
    keyTakeaways: ['A/B tests compare two versions', 'Change only one thing', 'Give both versions a fair chance', 'Wait for enough results', 'Decide what to measure first', 'Keep a test log'],
    actionSteps: ['Write a hypothesis for one test', 'Make version A and version B in the Design Studio', 'Run the test for at least a week', 'Record results in a test log'],
    quiz: [
      { question: 'What is the most important A/B test rule?', options: ['Change everything at once', 'Change only one thing', 'Only test on weekends'], answerIndex: 1 },
      { question: 'A got 3 clicks, B got 5. What should you conclude?', options: ['B is definitely better', 'It might be luck — get more results', 'Delete both'], answerIndex: 1 },
      { question: 'When should you decide what to measure?', options: ['Before the test', 'After seeing results', 'Never'], answerIndex: 0 },
    ],
    sources: [
      { url: 'https://support.google.com/google-ads/answer/10682377?hl=en', title: 'Google Ads Help — About the "Experiments" page' },
      { url: 'https://support.google.com/google-ads/answer/13719071?hl=en', title: 'Google Ads Help — Create A/B experiments for Demand Gen campaigns' },
      { url: 'https://usda.gov/media/blog/2015/12/10/five-lessons-learned-usdas-farmers-market-night', title: 'USDA — Five Lessons Learned from USDA\'s Farmers Market at Night' },
    ],
  },
];
