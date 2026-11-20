// "What would you do?" — one real-world decision per lesson. Learners pick an option and
// immediately see what happens, which turns reading into practising judgement.
// Each scenario applies ideas already taught (and sourced) in its lesson.
const S = (setup, options) => ({ setup, options: options.map(([text, best, result]) => ({ text, best, result })) });

export const SCENARIOS = {
  'word-of-mouth': S('Maya sells hand-painted phone cases. A customer just messaged: "I LOVE it, everyone at school asked where I got it!" What should Maya do next?', [
    ['Say thanks and move on', false, 'Polite, but she missed the happiest moment to ask for a referral. That excitement fades fast.'],
    ['Thank her and ask: "Know anyone else who\'d love one? Here\'s a card with 10% off for a friend"', true, 'Perfect timing. Happy customers share most right after a great experience, and a small, clearly stated thank-you makes it easy.'],
    ['Ask her to post a 5-star review in return for a free case, without mentioning the gift', false, 'Rewards for reviews must be clearly disclosed. Hiding it breaks trust and advertising rules.'],
  ]),
  'know-your-customer': S('Sam is launching homemade dog treats and has a tiny budget. Who should Sam focus on first?', [
    ['"Everyone with a dog"', false, 'Too broad. A message for everyone ends up speaking to no one, and the budget runs out fast.'],
    ['"Busy dog owners at the local park who want healthy, simple treats"', true, 'Specific and reachable. Sam knows where they gather, what they care about and what words to use.'],
    ['"Big pet store chains"', false, 'Selling to big chains is a different, much harder business. Start with real customers you can meet.'],
  ]),
  'pitch-video-basics': S('Your 30-second pitch video starts with 8 seconds of your logo slowly spinning. Viewers drop off fast. What do you change?', [
    ['Make the logo spin faster', false, 'Still no reason to keep watching. People decide in the first couple of seconds.'],
    ['Open with the problem or the product in action, then show the brand', true, 'Hook first. Showing the product solving a problem grabs attention, and the brand can appear early without being a slow intro.'],
    ['Add more music', false, 'Music helps mood, but it doesn\'t fix a slow opening. Many people watch on mute, too.'],
  ]),
  'honest-marketing': S('A friend offers to post about your bracelet shop if you give them two free bracelets. What\'s the right way to do it?', [
    ['Let them post as if they bought it themselves', false, 'A free product is a connection that must be disclosed. Hiding it misleads followers.'],
    ['Ask them to clearly say they got the bracelets free (for example "#ad" or "gifted")', true, 'Right. Clear disclosure keeps it honest and follows endorsement rules, and followers still trust the post.'],
    ['Only gift bracelets to people with no followers', false, 'Disclosure rules aren\'t about follower counts. Any material connection should be disclosed.'],
  ]),
  'honest-reviews': S('You have 3 reviews and want more before a big weekend market. What\'s the best move?', [
    ['Ask family to write 5-star reviews as if they were customers', false, 'Fake reviews are banned and easy to spot. They can bring big penalties and destroy trust.'],
    ['Ask every real customer this week, with a one-tap QR code to your review page', true, 'Honest and effective. Asking everyone (not just happy-looking ones) and making it easy is how real reviews grow.'],
    ['Offer a discount only to people who promise 5 stars', false, 'Paying for positive-only reviews is not allowed. You can ask for honest reviews, not specific ratings.'],
  ]),
  'disclose-like-a-pro': S('You\'re an ambassador making a 15-second video for a brand that gave you free products. Where should the disclosure go?', [
    ['In the 20th hashtag at the bottom of the caption', false, 'Buried disclosures don\'t count. People must see it easily.'],
    ['Say it out loud and show it on screen near the start, plus in the caption', true, 'Say it and show it where people will notice. That\'s the clear, professional way.'],
    ['Only in your profile bio', false, 'Each post needs its own clear disclosure; people don\'t read bios before every video.'],
  ]),
  'google-business-profile': S('Your bakery\'s Google listing shows old hours, and two people complained they arrived to a closed shop. What first?', [
    ['Ignore it; regulars know the hours', false, 'New customers rely on the listing. Wrong hours lose sales and bring angry reviews.'],
    ['Update the hours, add holiday hours and fresh real photos today', true, 'Accurate hours and real photos build trust and stop wasted trips. Fast, free and high-impact.'],
    ['Buy ads to push the listing higher', false, 'Ads won\'t fix wrong information; they\'d just send more people to a closed door.'],
  ]),
  'email-list-from-zero': S('You collected 200 emails at a fair for a raffle. Can you add them all to your newsletter?', [
    ['Yes, they gave you their email', false, 'They agreed to a raffle, not a newsletter. Emailing without permission hurts trust and can break the rules.'],
    ['Send one message inviting them to join, with a clear "Yes, sign me up" button', true, 'Permission first. People who choose to join open more emails and unsubscribe less.'],
    ['Add them and hide the unsubscribe link', false, 'Commercial emails must offer a clear way to unsubscribe. Hiding it is a fast way to lose customers.'],
  ]),
  'social-media-that-sells': S('You have 30 minutes a day for social media. What\'s the smartest plan?', [
    ['Post on five platforms every day', false, 'Spread too thin, each account gets weak posts and no time for replies.'],
    ['Choose the one platform your customers use most, post well, and reply to everyone', true, 'One platform done well beats five done badly, and replies turn followers into customers.'],
    ['Post only "buy now" ads', false, 'People follow for value. Mix showing, teaching and stories, with some selling.'],
  ]),
  'track-what-works': S('You shared your shop link on a flyer, Instagram and an email. Sales went up. Which channel worked?', [
    ['Guess Instagram, because it got the most likes', false, 'Likes aren\'t sales. Without tracking, you\'re guessing.'],
    ['Next time give each channel its own tagged link (UTM) or code and compare', true, 'Tagged links show exactly where buyers came from, so you can do more of what works.'],
    ['Stop all three to be safe', false, 'You\'d lose the channel that was working. Measure first, then decide.'],
  ]),
  'one-page-marketing-plan': S('Your goal is "get more customers". What makes it a strong plan goal?', [
    ['Keep it as is; it\'s motivating', false, 'Too vague to plan or measure. When is it done?'],
    ['"Get 40 new customers by 31 March, mainly through the school fair and flyers"', true, 'Specific, dated and tied to channels. Now you can plan tasks and check progress.'],
    ['"Become famous"', false, 'Fun, but not measurable or useful for choosing what to do this week.'],
  ]),
  'partner-up': S('You sell handmade bookmarks. Which partner is the best fit?', [
    ['Another bookmark seller', false, 'Same product, same customers: that\'s a competitor, not a partner.'],
    ['The local bookshop or library café', true, 'Same customers, different products. You can swap flyers, bundle offers or host a reading event together.'],
    ['A car repair shop', false, 'Very different customers, so a partnership wouldn\'t reach the right people.'],
  ]),
  'pricing-for-profit': S('Your candles cost $6 each to make, plus $200 a month in fixed costs. A competitor sells similar candles for $8. What do you do?', [
    ['Price at $7 to beat them', false, 'You\'d make $1 per candle and need 200 sales a month just to break even. Very risky.'],
    ['Price around $16, and explain what makes yours better (scent, handmade, gift-ready)', true, 'At $16 you earn $10 per candle and break even at 20 sales. Value pricing plus a clear reason to choose you.'],
    ['Copy their $8 price', false, 'You\'d earn $2 per candle and need 100 sales just to cover costs, with no reason for customers to pick you.'],
  ]),
  'keep-your-customers': S('A regular customer hasn\'t ordered in 3 months. What\'s the best small step?', [
    ['Do nothing; they\'ll come back if they want', false, 'Many customers drift away simply because they forget. A small nudge often wins them back.'],
    ['Send a short personal note: "We miss you! Here\'s what\'s new this season"', true, 'Personal touches build loyalty, and winning back a past customer is usually easier than finding a new one.'],
    ['Email them daily discounts until they buy', false, 'Too pushy. You risk an unsubscribe and teach them to wait for discounts.'],
  ]),
  'seo-basics': S('Your website title is "Home". You sell custom cakes in Springfield. What\'s a better page title?', [
    ['"Welcome!!!"', false, 'Says nothing about what you sell or where. Search engines and people can\'t tell what the page is about.'],
    ['"Custom Birthday Cakes in Springfield | Sweet Layers Bakery"', true, 'It uses the words customers actually search for, plus the place and your name. Clear for people and for Google.'],
    ['"cakes cakes cakes best cakes cheap cakes"', false, 'Keyword stuffing reads badly and can hurt you. Write for people first.'],
  ]),
  'video-abcd': S('Your product video shows the brand name only in the last second. What does the ABCD framework suggest?', [
    ['Keep it; a surprise ending is fun', false, 'Many viewers leave before the end, so they never learn who made it.'],
    ['Show and say the brand early, naturally, while grabbing attention', true, 'Branding early (without a boring intro) helps viewers remember who the video is from.'],
    ['Put the logo in every single frame, huge', false, 'Overdoing it feels like a hard sell. Early, natural branding works better.'],
  ]),
  'first-ad-budget': S('You have $50 for your first online ad. What\'s the smartest first step?', [
    ['Spend it all in one day for maximum reach', false, 'You\'d learn little and could waste it all on an offer nobody wants.'],
    ['First check that people want your offer (free posts, friends, a market), then run a small test with one clear goal', true, 'Prove the offer for free first. Then a small, focused test teaches you the most per dollar.'],
    ['Target everyone in the country', false, 'Too broad for a tiny budget. Narrow, relevant audiences give better results.'],
  ]),
  'truth-in-advertising': S('Your new energy drink ad says "Doctors recommend it!" You asked one doctor friend, who said "seems fine". Can you use the claim?', [
    ['Yes, a doctor did say something nice', false, 'One casual comment isn\'t evidence that "doctors recommend" it. That claim is misleading.'],
    ['No. Remove it and use claims you can prove, like your real ingredients', true, 'Ads must be truthful and backed by evidence before you publish them. Stick to facts you can show.'],
    ['Yes, if you add tiny small print', false, 'Small print can\'t fix a misleading main claim.'],
  ]),
  'accessible-marketing': S('Your flyer image shows "SALE: 30% OFF ALL SCARVES" as text inside a photo on your website. What should you add?', [
    ['Nothing; the picture says it all', false, 'People using screen readers can\'t read text inside images, so they\'d miss your sale.'],
    ['Alt text with the key message, e.g. "Sale: 30% off all scarves this weekend"', true, 'Concise alt text shares the message with everyone, and it can help search engines understand the image too.'],
    ['Alt text "image123.jpg"', false, 'A file name doesn\'t help anyone. Describe what matters.'],
  ]),
  'marketing-and-kids-privacy': S('You run a kids\' craft class and want to post a video of the students on your page. What first?', [
    ['Post it; it\'s a cute video', false, 'A child\'s image and voice are personal information. You need a parent\'s permission first.'],
    ['Get each parent\'s clear permission first, and leave out names and school details', true, 'Parental consent first, and share as little personal info as possible. That protects the kids and your business.'],
    ['Blur only the teacher', false, 'The children are the ones whose privacy needs protecting.'],
  ]),
  'brand-identity': S('Your lemonade stand\'s posters use a different colour and font every week. Customers don\'t recognise them. Fix?', [
    ['Keep changing; variety is exciting', false, 'Inconsistency makes you forgettable. People recognise brands through repetition.'],
    ['Pick one main colour, one font and a simple logo, and use them everywhere', true, 'Consistency builds recognition. Save the colour codes so every poster, sign and post matches.'],
    ['Add more colours so it stands out', false, 'More colours make it harder to remember and more expensive to print.'],
  ]),
  'story-that-sells': S('Which opening line works best for your scarf shop\'s story post?', [
    ['"We are the best scarf company in the world."', false, 'A boast, not a story, and not provable. Customers tune out.'],
    ['"Last winter my grandma\'s hands got too cold to knit, so I learned, and now I make scarves for people like her."', true, 'True, specific and emotional. A real moment makes people care and remember.'],
    ['"Scarves: 100% wool, 180 cm, 5 colours."', false, 'Useful details, but facts alone rarely make people feel anything. Save them for the product page.'],
  ]),
  'market-research-free': S('You want to open a smoothie stall near school. What\'s the best free research first?', [
    ['Assume everyone loves smoothies', false, 'Assumptions are risky. A little research saves money and time.'],
    ['Count foot traffic at different times, check nearby competitors, and ask 10 students 3 short questions', true, 'Street research plus a quick competitor check tells you who will buy, when, and how to be different.'],
    ['Buy an expensive industry report', false, 'Not needed at this stage. Free data and real conversations go a long way.'],
  ]),
  'customer-journey': S('Lots of people visit your online shop, but almost nobody buys. Where\'s the problem most likely to be?', [
    ['Awareness: you need more visitors', false, 'People are already arriving. More visitors would just mean more people leaving.'],
    ['Decision: something stops them buying (unclear price, hard checkout, no reviews)', true, 'Fix the leakiest stage first. Make buying easy and reassuring before spending on more traffic.'],
    ['Loyalty: you need a rewards card', false, 'Loyalty matters after the first purchase. The leak is earlier.'],
  ]),
  'words-that-get-read': S('Pick the best first line for your bakery\'s product page.', [
    ['"Welcome to our page! We started baking in 2019 and love what we do…"', false, 'Readers scan. Starting with background buries the benefit they came for.'],
    ['"Fresh cookies delivered to your door in 30 minutes."', true, 'Most important thing first, clear and specific. Scanners get it instantly.'],
    ['"Amazing!!! The BEST cookies EVER!!!"', false, 'Hype words make people trust you less. Specific facts persuade better.'],
  ]),
  'call-to-action': S('Your ad says "Free sample this Saturday!" Where should the link take people?', [
    ['Your home page', false, 'People have to hunt for the offer, and many give up.'],
    ['A page with the free-sample sign-up front and centre', true, 'The landing page keeps the ad\'s promise. Less effort means more sign-ups.'],
    ['Your "About us" story', false, 'Nice to read later, but it doesn\'t deliver what the ad promised.'],
  ]),
  'phone-product-photos': S('You\'re photographing your handmade mug for your shop\'s main photo. Which setup?', [
    ['Night-time, phone flash, on a busy patterned tablecloth', false, 'Flash makes harsh shine and the pattern distracts from the mug.'],
    ['Daytime, next to a window, on a plain light background, mug filling most of the frame', true, 'Soft window light and a clean background make a clear, professional hero shot for free.'],
    ['Add big "SALE!" text across the photo', false, 'Text on the main product photo distracts shoppers. Put promotions elsewhere.'],
  ]),
  'content-calendar': S('It\'s Sunday night and you have nothing to post this week again. What\'s the long-term fix?', [
    ['Post whatever you think of each morning', false, 'That\'s how posting stops. Last-minute content is stressful and inconsistent.'],
    ['Pick 3 content pillars and batch a month of posts in one afternoon', true, 'Pillars give you endless ideas and batching saves time, so your feed stays consistent.'],
    ['Only post when you have a sale', false, 'A feed of only sales gives people little reason to follow.'],
  ]),
  'markets-and-events': S('At your market stall, people walk past without stopping. What\'s the quickest fix?', [
    ['Sit and wait; it\'s early', false, 'You have about three seconds to catch people as they pass. Waiting won\'t change that.'],
    ['Add a big readable sign with what you sell and the prices, and raise products to eye level', true, 'Clear signs and prices remove questions, and height makes products easy to see. Small changes, big difference.'],
    ['Call out to everyone to buy now', false, 'Pushy calls can scare people off. Make the stall itself inviting.'],
  ]),
  'effortless-service': S('A customer\'s order arrived damaged. What builds the most loyalty?', [
    ['Ask them to fill in a 3-page claims form and post the item back first', false, 'High effort is what makes customers disloyal. Make it easy.'],
    ['Apologise, send a replacement right away, and make it a one-step process', true, 'Solving it fast with little effort for the customer is what keeps them coming back.'],
    ['Send a surprise gift but take two weeks to fix the problem', false, 'Extras don\'t make up for a slow, effortful fix.'],
  ]),
  'bad-reviews': S('A customer left a 2-star review: "Order was late and nobody answered my message." How do you respond?', [
    ['Reply: "That\'s not true, you\'re lying."', false, 'Arguing in public makes every future customer nervous. It never "wins".'],
    ['Thank them, apologise, explain what you\'ve fixed, and invite them to message you directly', true, 'Calm and helpful. Future customers see you care, and the reviewer may update their review.'],
    ['Threaten legal action unless they delete it', false, 'Using threats to remove honest reviews is banned under U.S. consumer review rules.'],
  ]),
  'honest-green-claims': S('Your soap comes in a box made from 70% recycled cardboard. Which label is best?', [
    ['"100% eco-friendly!"', false, 'Vague and impossible to prove. Broad green claims are risky.'],
    ['"Box made from 70% recycled cardboard"', true, 'Specific and provable. Customers trust exact facts more than vague promises.'],
    ['"Saves the planet"', false, 'A huge, unprovable claim. Stick to what you can show.'],
  ]),
  'selling-online-promises': S('A supplier delay means you can\'t ship orders on the date you promised. What do you do?', [
    ['Say nothing and ship late', false, 'Customers feel ignored, and you must offer a choice when you can\'t ship on time.'],
    ['Tell customers right away, give a new date, and offer them a choice to wait or cancel for a refund', true, 'Honest and fair. Most customers appreciate being kept informed, and it follows the shipping rules.'],
    ['Send a different product instead without asking', false, 'Swapping in something different needs the customer\'s agreement first.'],
  ]),
  'protect-your-business': S('You get a message: "Your shop account will be deleted in 24 hours! Log in here to verify." What do you do?', [
    ['Click the link and log in quickly', false, 'Urgent threats with a link are a classic phishing trick to steal your password.'],
    ['Ignore the link, open the app or type the website yourself to check, and turn on two-step login', true, 'Going to the real site yourself keeps you safe, and two-step login protects you even if a password leaks.'],
    ['Reply with your password so they can check', false, 'Real platforms never ask for your password by message.'],
  ]),
  'launch-plan': S('Your new hoodie design is ready. When should you start telling people?', [
    ['On launch day, so it\'s a surprise', false, 'Nobody is waiting for it, so launch day is quiet.'],
    ['2–4 weeks before: share sneak peeks, build a waiting list, and email the list first on launch day', true, 'Warming people up means a crowd is ready to buy the moment you launch.'],
    ['After it sells out', false, 'Hard to sell out if nobody knows it exists.'],
  ]),
  'test-and-improve': S('You tried two flyers. Flyer A: 3 sign-ups. Flyer B: 5 sign-ups. Each was seen by about 40 people. What can you conclude?', [
    ['B is definitely better; use it forever', false, 'With numbers this small, the difference could easily be luck.'],
    ['It might be luck. Keep testing until each has many more responses before deciding', true, 'Small samples fool people. Wait for enough results, and change only one thing between A and B.'],
    ['Both flyers failed; stop flyers', false, 'You don\'t have enough data to judge either way yet.'],
  ]),
};
