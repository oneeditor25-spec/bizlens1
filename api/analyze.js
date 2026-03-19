export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { product } = req.body || {};
  if (!product) return res.status(400).json({ error: 'Product name required' });

  const query = product.trim();

  try {
    const wikiRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`,
      { headers: { 'User-Agent': 'BizLens/1.0 (bizlens.in)' } }
    );
    const wiki = wikiRes.ok ? await wikiRes.json() : null;

    const wdSearch = await fetch(
      `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&format=json&limit=1`,
      { headers: { 'User-Agent': 'BizLens/1.0' } }
    );
    const wdData = wdSearch.ok ? await wdSearch.json() : null;
    const entityId = wdData?.search?.[0]?.id;

    let wdProps = {};
    if (entityId) {
      const wdEntity = await fetch(
        `https://www.wikidata.org/wiki/Special:EntityData/${entityId}.json`,
        { headers: { 'User-Agent': 'BizLens/1.0' } }
      );
      if (wdEntity.ok) {
        const wdJson = await wdEntity.json();
        const claims = wdJson.entities?.[entityId]?.claims || {};
        const getVal = (pid) => {
          const c = claims[pid]?.[0]?.mainsnak?.datavalue?.value;
          if (!c) return null;
          if (typeof c === 'string') return c;
          if (c.text) return c.text;
          if (c.amount) return c.amount;
          if (c.time) return c.time.substring(1, 5);
          if (c.id) return c.id;
          return null;
        };
        wdProps = {
          founded: getVal('P571'),
          revenue: getVal('P2139'),
          employees: getVal('P1128'),
          hq: getVal('P159'),
          founder: getVal('P112'),
          ticker: getVal('P249'),
        };
      }
    }

    const description = wiki?.extract || '';
    const name = wiki?.title || query;
    const descLower = description.toLowerCase();
    const nameLower = name.toLowerCase();

    const industryMap = {
      'Music Streaming': ['spotify','music','streaming','audio','podcast','playlist'],
      'E-Commerce': ['amazon','shopify','ebay','alibaba','ecommerce','online shopping','marketplace'],
      'Social Media': ['facebook','instagram','twitter','tiktok','snapchat','social network'],
      'Software / SaaS': ['microsoft','salesforce','adobe','saas','software','cloud','enterprise'],
      'Electric Vehicles': ['tesla','electric vehicle','ev','battery','autopilot'],
      'Search Engine': ['google','search engine','search results','web search'],
      'Ride Sharing': ['uber','lyft','ride','taxi','driver'],
      'Food Delivery': ['doordash','ubereats','zomato','swiggy','food delivery'],
      'Video Streaming': ['netflix','disney','hulu','youtube','video streaming'],
      'Sportswear': ['nike','adidas','puma','sportswear','athletic','footwear','apparel'],
      'Beverages': ['coca-cola','pepsi','red bull','starbucks','coffee','drink','beverage'],
      'Fintech': ['paypal','stripe','square','fintech','payment','banking','finance'],
      'Smartphones': ['apple','samsung','iphone','android','smartphone','mobile phone'],
      'Gaming': ['nintendo','sony','xbox','gaming','video game','console'],
      'Retail': ['walmart','target','costco','retail','store','supermarket'],
      'Hospitality': ['airbnb','booking','hotel','hospitality','travel'],
      'Logistics': ['fedex','ups','dhl','logistics','shipping','delivery'],
    };

    let detectedIndustry = 'Technology';
    let industryScore = 0;
    for (const [ind, keywords] of Object.entries(industryMap)) {
      const score = keywords.filter(k => descLower.includes(k) || nameLower.includes(k)).length;
      if (score > industryScore) { industryScore = score; detectedIndustry = ind; }
    }

    const brandDB = {
      spotify: {
        swot: {
          strengths: ['600M+ monthly active users, largest music streaming platform globally','Personalized recommendation engine (Discover Weekly, Daily Mix) drives deep engagement','Freemium model lowers barrier to entry and fuels premium conversion','Podcast expansion diversifies content beyond music','Strong brand recognition across 180+ markets'],
          weaknesses: ['Thin profit margins due to high royalty payments to labels','Dependent on major record labels for licensing with limited negotiating power','Free tier cannibalizes premium conversion for many users','Slow to monetize podcast investments profitably'],
          opportunities: ['Audiobooks and live audio events as new revenue streams','Expansion into emerging markets (India, Africa, Southeast Asia)','AI-powered music creation tools for artists','Deeper integration with smart home and car platforms'],
          threats: ['Apple Music, YouTube Music, Amazon Music intensifying competition','Record labels pushing for higher royalty rates','Potential regulation on algorithm-driven content curation','Economic downturns reducing discretionary subscription spend']
        },
        metrics: [
          { name: 'Brand Recognition', value: 92 },
          { name: 'User Retention', value: 78 },
          { name: 'Market Share', value: 31 },
          { name: 'Revenue Growth', value: 14 },
          { name: 'Competitive Moat', value: 72 }
        ],
        businessModel: { type: 'Freemium + Subscription', revenueStreams: ['Premium subscriptions ($9.99-$15.99/mo)','Ad-supported free tier','Podcast advertising network','Artist promotional tools'], unitEconomics: 'ARPU ~$4.50/month globally; gross margin ~26% after royalties' },
        moat: { type: 'Network Effect + Data Moat', description: 'Spotifys recommendation algorithms improve with every stream. 600M users generate irreplaceable behavioral data that competitors cannot replicate overnight.', strength: 72 },
        marketing: { positioning: 'Music for everyone, personalized, accessible, everywhere', targetAudience: 'Millennials and Gen Z, 18-34, music enthusiasts and podcast listeners', keyMessage: 'Your soundtrack to life, perfectly curated', primaryChannels: ['Social Media','Influencer Marketing','In-App Viral Loops','Spotify Wrapped Campaign'], tactics: ['Annual Spotify Wrapped viral campaign drives massive organic sharing','Playlist culture and collaborative playlists increase social stickiness','Student discount strategy captures lifetime users early','Artist partnerships for exclusive content'] },
        pricingStrategy: 'Freemium with premium tiers: Individual ($9.99), Duo ($12.99), Family ($15.99), Student ($4.99). Free tier monetized via ads.',
        growthStrategy: ['Podcast and audiobook content acquisition','Emerging market penetration with local pricing','AI DJ and personalization features','Creator monetization tools to attract artists'],
        businessScore: 78,
        scoreReason: 'Strong user base and brand, but margin pressure from royalties limits profitability',
        tagline: 'The worlds most popular audio streaming subscription service',
        categoryTags: ['Music Streaming','Audio','Subscription'],
        marketTags: ['B2C','Global','Mobile-First'],
        keyInsight: 'Spotifys true moat is not music, it is data. Every skip, replay, and playlist tells Spotify more about human emotion than any record label knows. The company that owns listening behavior owns the future of audio.',
        competitiveAdvantage: 'Unmatched personalization through machine learning on 600M+ user behavioral dataset, combined with first-mover advantage in podcast aggregation.'
      },
      nike: {
        swot: {
          strengths: ['Worlds most valuable sportswear brand ($33B+ brand value)','Direct-to-consumer digital strategy drives higher margins','Iconic Just Do It brand identity with 50+ years of equity','Deep athlete endorsement network (Jordan, LeBron, Ronaldo)','Advanced supply chain and manufacturing scale'],
          weaknesses: ['Heavy reliance on third-party manufacturing in Asia','Premium pricing limits accessibility in price-sensitive markets','Inventory management challenges post-pandemic','Dependence on a few superstar athlete endorsements'],
          opportunities: ['Expanding womens sportswear and lifestyle categories','Digital fitness ecosystem (Nike Training Club, Nike Run Club)','Sustainable materials and circular economy positioning','Growing sports participation in emerging markets'],
          threats: ['Adidas, Under Armour, Lululemon gaining market share','Rising manufacturing and logistics costs','Counterfeit products damaging brand value','Geopolitical risks in Asian manufacturing hubs']
        },
        metrics: [
          { name: 'Brand Recognition', value: 97 },
          { name: 'Customer Loyalty', value: 85 },
          { name: 'Market Share', value: 27 },
          { name: 'Revenue Growth', value: 10 },
          { name: 'Competitive Moat', value: 88 }
        ],
        businessModel: { type: 'Direct-to-Consumer + Wholesale', revenueStreams: ['Nike.com and Nike App direct sales','Nike-owned retail stores','Wholesale to retailers (Foot Locker, Dicks)','Jordan Brand licensing','Nike Training digital subscriptions'], unitEconomics: 'Gross margin ~44%; DTC channel delivers ~60% higher margins than wholesale' },
        moat: { type: 'Brand Moat + Emotional Connection', description: 'Nike has built a 50-year emotional brand that transcends sportswear. Consumers do not just buy shoes, they buy identity, aspiration, and belonging to athletic culture.', strength: 88 },
        marketing: { positioning: 'Performance meets culture, athletic excellence for everyone', targetAudience: 'Athletes and aspirational consumers, 16-45, across all sports and lifestyle segments', keyMessage: 'Just Do It', primaryChannels: ['Athlete Endorsements','Social Media','Nike App','Retail Experience'], tactics: ['Athlete storytelling campaigns (Kaepernick, Serena Williams)','Limited edition drops create scarcity and hype','Nike Training Club app builds daily brand touchpoints','Community running events and sports sponsorships'] },
        pricingStrategy: 'Premium pricing strategy ($80-$250+ for footwear). Limited edition and Jordan Brand command $200-$500+. Clearance via Nike Outlet maintains brand premium while clearing inventory.',
        growthStrategy: ['DTC digital acceleration reducing wholesale dependency','Sustainability with Nike Move to Zero initiative','Womens category expansion','Digital fitness and membership ecosystem'],
        businessScore: 91,
        scoreReason: 'Exceptional brand equity, strong DTC pivot, and global scale make Nike a fortress business',
        tagline: 'The worlds leading designer, marketer and distributor of athletic footwear and apparel',
        categoryTags: ['Sportswear','Footwear','Apparel'],
        marketTags: ['B2C','Global','Premium'],
        keyInsight: 'Nike does not sell shoes, it sells the belief that you can be an athlete. This psychological positioning allows Nike to charge premium prices for products made at commodity costs, generating extraordinary margins through pure brand power.',
        competitiveAdvantage: 'Unrivaled brand equity built over 50 years, combined with the worlds most powerful athlete endorsement network and a rapidly growing direct-to-consumer digital ecosystem.'
      },
      tesla: {
        swot: {
          strengths: ['First-mover advantage in premium electric vehicles','Vertically integrated: owns battery, software, charging network','Over-the-air software updates create continuous product improvement','Supercharger network is a massive competitive moat','Elon Musks personal brand drives massive free media coverage'],
          weaknesses: ['Production scaling challenges and quality control issues','Heavy dependence on Elon Musk as key person risk','Premium pricing limits mass market penetration','Service center network underdeveloped vs traditional OEMs'],
          opportunities: ['Energy storage (Powerwall, Megapack) as major growth vertical','Full Self-Driving (FSD) as a high-margin software revenue stream','Robotaxi network could transform unit economics','Expansion in India and Southeast Asia'],
          threats: ['BYD, Volkswagen, GM, Hyundai rapidly closing EV gap','Price wars eroding margins across EV industry','Regulatory risks around FSD and autonomous driving','Elon Musks political controversies affecting brand perception']
        },
        metrics: [
          { name: 'Brand Recognition', value: 94 },
          { name: 'Innovation Index', value: 96 },
          { name: 'EV Market Share', value: 18 },
          { name: 'Revenue Growth', value: 19 },
          { name: 'Competitive Moat', value: 82 }
        ],
        businessModel: { type: 'Product + Software + Energy', revenueStreams: ['Vehicle sales (Model 3, Y, S, X, Cybertruck)','Full Self-Driving software ($8,000-$12,000 add-on)','Energy generation and storage (Solar, Powerwall, Megapack)','Supercharger network access fees','Services and insurance'], unitEconomics: 'Automotive gross margin ~18%; FSD software margin ~80%+; Energy segment growing rapidly' },
        moat: { type: 'Vertical Integration + Software Moat', description: 'Teslas Supercharger network, proprietary battery technology, and OTA software updates create a self-reinforcing ecosystem that traditional automakers cannot replicate without decades of investment.', strength: 82 },
        marketing: { positioning: 'Accelerating the worlds transition to sustainable energy', targetAudience: 'Tech-forward early adopters, environmentally conscious consumers, premium car buyers, 28-55', keyMessage: 'The future of driving is electric, autonomous, and connected', primaryChannels: ['Word of Mouth','Social Media (Elon Musk)','Zero paid advertising','Referral Program'], tactics: ['Zero traditional advertising, relies entirely on earned media','Elon Musks Twitter/X presence generates billions in free publicity','Referral program turns customers into brand ambassadors','Product launches as media events (Cybertruck reveal)'] },
        pricingStrategy: 'Premium to mid-range pricing ($38,990-$104,990). Aggressive price cuts in 2023-2024 to defend market share against Chinese competitors. FSD priced as high-margin software add-on.',
        growthStrategy: ['Robotaxi network launch (Cybercab)','FSD subscription revenue scaling','Energy business (Megapack) for utility-scale storage','Optimus humanoid robot as future revenue stream'],
        businessScore: 85,
        scoreReason: 'Revolutionary technology and brand, but increasing competition and margin pressure create uncertainty',
        tagline: 'Accelerating the worlds transition to sustainable energy',
        categoryTags: ['Electric Vehicles','Energy','Technology'],
        marketTags: ['B2C','Global','Premium'],
        keyInsight: 'Tesla is not a car company, it is a software company that happens to make cars. The real value lies in FSD, the data from millions of miles driven, and the potential robotaxi network that could generate more revenue than all vehicle sales combined.',
        competitiveAdvantage: 'The only automaker with a fully integrated ecosystem: proprietary batteries, software, charging network, and energy products, creating switching costs that go far beyond the vehicle itself.'
      },
      amazon: {
        swot: {
          strengths: ['AWS is the worlds largest cloud platform (~33% market share)','Prime membership creates unbreakable customer loyalty loop','Logistics network rivals UPS and FedEx in scale','Data advantage across retail, cloud, and advertising','Flywheel effect: more sellers, more buyers, lower prices, more sellers'],
          weaknesses: ['Thin retail margins heavily subsidized by AWS profits','Labor relations and warehouse worker conditions under scrutiny','Regulatory antitrust pressure in US and EU','Alexa and hardware division struggling to find profitability'],
          opportunities: ['Healthcare (Amazon Pharmacy, One Medical) as massive new vertical','Advertising business growing 20%+ annually','Satellite internet (Project Kuiper) competing with Starlink','AI integration across AWS and consumer products'],
          threats: ['Microsoft Azure and Google Cloud gaining AWS market share','Regulatory breakup risk in US and EU','Walmart, Shopify, TikTok Shop challenging retail dominance','Rising fulfillment and labor costs compressing margins']
        },
        metrics: [
          { name: 'Brand Recognition', value: 98 },
          { name: 'Customer Retention', value: 93 },
          { name: 'E-com Market Share', value: 38 },
          { name: 'Revenue Growth', value: 12 },
          { name: 'Competitive Moat', value: 95 }
        ],
        businessModel: { type: 'Platform + Cloud + Subscription', revenueStreams: ['AWS cloud services (~$100B ARR)','Third-party seller fees (marketplace)','Prime subscriptions ($139/year)','Advertising services ($50B+/year)','Retail product sales'], unitEconomics: 'AWS operating margin ~30%; Advertising margin ~25%; Retail margin ~2-5%' },
        moat: { type: 'Platform Flywheel + Infrastructure Moat', description: 'Amazons flywheel, where each business unit feeds the others, creates a self-reinforcing competitive advantage that has taken 30 years to build and cannot be replicated.', strength: 95 },
        marketing: { positioning: 'Earths most customer-centric company', targetAudience: 'Universal, from individual consumers to Fortune 500 enterprises', keyMessage: 'Everything you need, delivered fast', primaryChannels: ['Search (Google + Amazon internal)','Email (Prime communications)','Alexa voice commerce','Affiliate marketing'], tactics: ['Prime Day creates annual shopping event rivaling Black Friday','Subscribe and Save locks in recurring revenue','Amazon Basics private label competes with brands on its own platform','AWS re:Invent conference drives enterprise cloud adoption'] },
        pricingStrategy: 'Loss-leader pricing in retail to drive Prime adoption. AWS uses pay-as-you-go with volume discounts. Prime at $139/year is priced to be irresistible given shipping savings alone.',
        growthStrategy: ['Healthcare vertical expansion','Advertising business scaling','AI/ML services on AWS','International expansion in India and emerging markets'],
        businessScore: 96,
        scoreReason: 'Unmatched multi-business flywheel with AWS funding retail dominance, one of the strongest business models ever built',
        tagline: 'Earths most customer-centric company',
        categoryTags: ['E-Commerce','Cloud','Technology'],
        marketTags: ['B2C','B2B','Global'],
        keyInsight: 'Amazons secret weapon is that AWS profits subsidize retail losses, allowing Amazon to undercut every competitor on price while building the worlds most powerful logistics network. No pure-play retailer can compete with a company that does not need retail to be profitable.',
        competitiveAdvantage: 'The only company in history to simultaneously dominate e-commerce, cloud computing, digital advertising, and logistics, each business reinforcing the others in a self-sustaining flywheel.'
      },
      apple: {
        swot: {
          strengths: ['Most valuable company in the world ($3T+ market cap)','Ecosystem lock-in: iPhone, Mac, iPad, Watch, AirPods work seamlessly together','Services (App Store, iCloud, Apple Music) generate $85B+/year at high margins','Unmatched brand loyalty with 90%+ iPhone upgrade retention','Apple Silicon (M-series chips) delivers industry-leading performance per watt'],
          weaknesses: ['Premium pricing excludes majority of global smartphone market','Heavy dependence on iPhone (~50% of revenue)','Manufacturing concentration in China creates geopolitical risk','App Store monopoly facing regulatory challenges globally'],
          opportunities: ['Apple Vision Pro and spatial computing as next platform','Healthcare devices (Apple Watch health monitoring, medical partnerships)','Financial services (Apple Pay, Apple Card, Apple Savings)','India manufacturing expansion reducing China dependency'],
          threats: ['Antitrust regulation threatening App Store 30% commission','Samsung, Google Pixel, and Chinese brands in hardware','EU Digital Markets Act forcing sideloading and third-party payments','Slowing smartphone market growth globally']
        },
        metrics: [
          { name: 'Brand Recognition', value: 99 },
          { name: 'Customer Loyalty', value: 92 },
          { name: 'Profit Margin', value: 26 },
          { name: 'Services Growth', value: 16 },
          { name: 'Competitive Moat', value: 94 }
        ],
        businessModel: { type: 'Hardware + Ecosystem + Services', revenueStreams: ['iPhone sales (~$200B/year)','Mac, iPad, Wearables hardware','App Store (30% commission on $1T+ transactions)','Apple Music, TV+, Arcade, iCloud subscriptions','Apple Pay and financial services'], unitEconomics: 'Hardware gross margin ~37%; Services gross margin ~74%; Overall ~46%' },
        moat: { type: 'Ecosystem Lock-In + Brand Moat', description: 'Once a user owns an iPhone, Mac, AirPods, and Apple Watch, switching to Android means losing years of data, habits, and seamless integrations. This ecosystem creates the highest switching costs in consumer technology.', strength: 94 },
        marketing: { positioning: 'Technology that empowers human creativity and privacy', targetAudience: 'Premium consumers, creative professionals, students, and enterprise users globally', keyMessage: 'Think Different, technology that just works', primaryChannels: ['Apple Stores (retail experience)','Product launch events','Word of mouth','Premium retail partnerships'], tactics: ['Annual iPhone launch events as cultural moments','Apple Store as brand temple with highest revenue per sq ft in retail','Privacy positioning differentiates from Google/Meta','Shot on iPhone campaign turns customers into brand ambassadors'] },
        pricingStrategy: 'Unapologetically premium: iPhone from $799-$1,599. Mac from $999-$6,999. Never compete on price, always compete on value and experience.',
        growthStrategy: ['Services revenue scaling to $150B+','Vision Pro and spatial computing platform','India as next major growth market','Healthcare and financial services expansion'],
        businessScore: 97,
        scoreReason: 'The most profitable consumer technology ecosystem ever built, with unmatched brand loyalty and expanding high-margin services',
        tagline: 'Technology at the intersection of the liberal arts and technology',
        categoryTags: ['Smartphones','Computers','Consumer Electronics'],
        marketTags: ['B2C','Premium','Global'],
        keyInsight: 'Apples genius is selling hardware at premium prices to build an ecosystem, then monetizing that ecosystem through high-margin services forever. The iPhone is the key that unlocks a lifetime of recurring revenue, making Apple less a hardware company and more a subscription business disguised as a phone maker.',
        competitiveAdvantage: 'The worlds most powerful consumer ecosystem combining hardware, software, and services with 2B+ active devices creating an unbreakable network of switching costs and recurring revenue.'
      },
      netflix: {
        swot: {
          strengths: ['270M+ subscribers across 190 countries','Original content library (Stranger Things, Squid Game) drives global cultural moments','Password sharing crackdown successfully converted 100M+ free users to paid','Ad-supported tier opens new revenue stream and lower price point','Data-driven content decisions reduce production risk'],
          weaknesses: ['Content costs ($17B+/year) create constant cash burn pressure','No live sports rights, major gap vs Disney+, Amazon, Apple TV+','Password sharing crackdown may have exhausted easy conversion pool','Subscriber growth slowing in mature markets (US, Europe)'],
          opportunities: ['Live events and sports rights as next growth frontier','Gaming expansion (Netflix Games) as differentiation','Ad-supported tier scaling to rival traditional TV advertising','Emerging markets (India, Africa) with massive untapped audiences'],
          threats: ['Disney+, HBO Max, Apple TV+, Amazon Prime fragmenting streaming market','Content cost inflation as studios demand higher licensing fees','Password sharing crackdown backlash and churn risk','Linear TV decline reducing content licensing revenue']
        },
        metrics: [
          { name: 'Brand Recognition', value: 95 },
          { name: 'Subscriber Retention', value: 80 },
          { name: 'Content ROI', value: 68 },
          { name: 'Revenue Growth', value: 15 },
          { name: 'Competitive Moat', value: 75 }
        ],
        businessModel: { type: 'Subscription + Advertising', revenueStreams: ['Standard subscription ($15.49/mo)','Premium subscription ($22.99/mo)','Ad-supported plan ($6.99/mo)','Netflix Games (included with subscription)','Content licensing to third parties'], unitEconomics: 'ARPU ~$17/month globally; content amortization ~$17B/year; operating margin ~20%' },
        moat: { type: 'Content Library + Brand Moat', description: 'Netflixs original content library, global production infrastructure, and recommendation algorithm create a content moat that takes billions and years to replicate.', strength: 75 },
        marketing: { positioning: 'The home of the worlds best stories', targetAudience: 'Global streaming consumers, 18-54, across all demographics and geographies', keyMessage: 'Watch anywhere. Cancel anytime.', primaryChannels: ['Social Media','Content Marketing (trailers, clips)','Word of Mouth','Email'], tactics: ['Binge-release model creates cultural event moments','Global local content strategy (Squid Game, Money Heist) drives international growth','Social media clip virality drives organic discovery','Password sharing crackdown with account transfer feature'] },
        pricingStrategy: 'Tiered subscription: Ad-supported ($6.99), Standard ($15.49), Premium ($22.99). Price anchoring makes mid-tier feel like value. Ad tier expands addressable market.',
        growthStrategy: ['Live events and sports rights acquisition','Ad-supported tier scaling','Gaming as subscriber retention tool','Emerging market growth with local content'],
        businessScore: 82,
        scoreReason: 'Strong brand and content library, but intensifying competition and content costs create long-term margin pressure',
        tagline: 'The worlds leading streaming entertainment service',
        categoryTags: ['Video Streaming','Entertainment','Subscription'],
        marketTags: ['B2C','Global','Digital'],
        keyInsight: 'Netflixs biggest competitive advantage is not its content, it is its data. Netflix knows exactly what makes you stay up until 3am, and uses that knowledge to greenlight content with surgical precision, making every $17B content budget work harder than any traditional studio.',
        competitiveAdvantage: 'First-mover advantage in global streaming combined with the worlds largest behavioral dataset on entertainment consumption, enabling data-driven content decisions that traditional studios cannot match.'
      },
      google: {
        swot: {
          strengths: ['92% global search market share, effectively a monopoly','Google Ads generates $200B+/year, most profitable ad platform ever built','Android powers 72% of global smartphones','YouTube is the worlds second largest search engine','DeepMind and Google Brain lead in AI research'],
          weaknesses: ['90%+ revenue dependence on advertising creates concentration risk','Antitrust cases in US and EU threatening core business model','Failed hardware products (Pixel, Nest) vs Apple and Samsung','Privacy concerns and data collection backlash'],
          opportunities: ['Gemini AI integration across all Google products','Google Cloud growing 28%+ annually to challenge AWS/Azure','YouTube Shorts competing with TikTok for short-form video','Waymo autonomous vehicles as transformative future business'],
          threats: ['DOJ antitrust case could force search default payment breakup','ChatGPT and AI search threatening Googles core search monopoly','TikTok replacing Google as discovery platform for Gen Z','Apple potentially building its own search engine']
        },
        metrics: [
          { name: 'Search Market Share', value: 92 },
          { name: 'Ad Revenue Growth', value: 11 },
          { name: 'Cloud Growth Rate', value: 28 },
          { name: 'Brand Recognition', value: 99 },
          { name: 'Competitive Moat', value: 93 }
        ],
        businessModel: { type: 'Advertising Platform + Cloud', revenueStreams: ['Google Search advertising ($175B+/year)','YouTube advertising ($35B+/year)','Google Cloud Platform ($35B+ ARR)','Google Play Store commissions','Hardware (Pixel, Nest, Chromebook)'], unitEconomics: 'Advertising margin ~35%; Cloud margin growing toward 10%+; Overall operating margin ~28%' },
        moat: { type: 'Data Monopoly + Distribution Moat', description: 'Google processes 8.5 billion searches per day, creating an unassailable data advantage. Combined with Android distribution and Chrome browser dominance, Google controls the entry point to the internet for most of humanity.', strength: 93 },
        marketing: { positioning: 'Organizing the worlds information and making it universally accessible', targetAudience: 'Universal, every internet user globally; enterprise customers for Cloud', keyMessage: 'Search, discover, create, Google is where the world starts', primaryChannels: ['Product is the marketing (Google Search)','Developer relations','Enterprise sales (Google Cloud)','YouTube content ecosystem'], tactics: ['Google Doodles create daily brand moments','Google for Startups builds loyalty in next-gen companies','Made with AI campaigns showcase Gemini capabilities','Google I/O developer conference drives ecosystem adoption'] },
        pricingStrategy: 'Search and core products are free, monetized through advertising. Google Cloud uses pay-as-you-go with committed use discounts. Workspace at $6-$18/user/month.',
        growthStrategy: ['Gemini AI integration across all products','Google Cloud market share expansion','YouTube Shorts monetization','Waymo commercialization'],
        businessScore: 94,
        scoreReason: 'Near-monopoly in search with extraordinary ad margins, but AI disruption and antitrust risk are real existential threats',
        tagline: 'Organizing the worlds information and making it universally accessible and useful',
        categoryTags: ['Search Engine','Advertising','Cloud'],
        marketTags: ['B2C','B2B','Global'],
        keyInsight: 'Googles moat is not its search algorithm, it is the 25 years of behavioral data it has collected on every internet user. This data advantage makes its ad targeting so superior that advertisers have no rational alternative, creating a self-funding monopoly that generates $200B/year from a product that costs users nothing.',
        competitiveAdvantage: 'Unrivaled data advantage from 8.5B daily searches, combined with Android and Chrome distribution controlling the internet entry point for 5B+ users globally.'
      },
      'red bull': {
        swot: {
          strengths: ['Worlds most popular energy drink with 40%+ global market share','Extreme sports and events marketing creates unmatched brand culture','Red Bull Media House is a full content empire (TV, YouTube, social)','Premium pricing with strong brand justification','Asset-light model: outsources manufacturing, focuses on brand and distribution'],
          weaknesses: ['Single product category creates revenue concentration risk','Health concerns around high caffeine and sugar content','Limited product diversification vs Coca-Cola and PepsiCo','Dependent on youth culture relevance which can shift quickly'],
          opportunities: ['Sugar-free and health-conscious variants growing rapidly','Emerging markets in Asia and Africa with rising disposable income','Esports and gaming sponsorships reaching new demographics','Functional beverages and wellness drink adjacencies'],
          threats: ['Monster Energy, Celsius, Reign intensifying competition','Regulatory restrictions on energy drinks in multiple countries','Health and wellness trends shifting consumers away from energy drinks','Private label energy drinks from retailers undercutting on price']
        },
        metrics: [
          { name: 'Brand Recognition', value: 91 },
          { name: 'Market Share', value: 43 },
          { name: 'Customer Loyalty', value: 74 },
          { name: 'Revenue Growth', value: 12 },
          { name: 'Competitive Moat', value: 79 }
        ],
        businessModel: { type: 'Premium Consumer Brand', revenueStreams: ['Energy drink sales (250ml, 355ml, 473ml cans)','Red Bull Sugar Free and Editions variants','Red Bull Media House content licensing','Event sponsorship and ticket revenue','Merchandise and brand licensing'], unitEconomics: 'Gross margin ~65%+ due to asset-light model; EBITDA margin ~30%+' },
        moat: { type: 'Brand Culture Moat', description: 'Red Bull has built a lifestyle brand so deeply embedded in extreme sports, music, and youth culture that it transcends the beverage category. The brand IS the moat.', strength: 79 },
        marketing: { positioning: 'Red Bull gives you wings, the energy drink for those who push limits', targetAudience: 'Young adults 18-34, athletes, students, gamers, and high-performance professionals', keyMessage: 'Red Bull gives you wings', primaryChannels: ['Extreme Sports Sponsorship','Red Bull Media House (YouTube, TV)','Event Marketing','Social Media'], tactics: ['Owns and creates events (Red Bull Air Race, Rampage, Stratos)','Red Bull Racing F1 team generates billions in global media exposure','Red Bull Media House produces world-class content that happens to market the brand','Athlete sponsorship of 600+ extreme sports athletes globally'] },
        pricingStrategy: 'Premium pricing ($2.50-$4.00 per can) positioned above mainstream sodas. Never discounts, never competes on price. Premium positioning is core to brand identity.',
        growthStrategy: ['Sugar-free and functional variant expansion','Esports and gaming market penetration','Emerging market distribution expansion','Red Bull Media House content monetization'],
        businessScore: 84,
        scoreReason: 'Extraordinary brand moat and margins, but single-category concentration and health trends are long-term risks',
        tagline: 'Red Bull gives you wings',
        categoryTags: ['Energy Drinks','Beverages','Lifestyle Brand'],
        marketTags: ['B2C','Global','Premium'],
        keyInsight: 'Red Bull spends more on marketing than manufacturing because it understood before anyone else that in the attention economy, the brand IS the product. By owning extreme sports culture, Red Bull made itself impossible to replicate, not because of the drink, but because of the world it built around it.',
        competitiveAdvantage: 'The only beverage brand that is also a global media empire, creating content that generates billions in earned media while simultaneously building the brand, making marketing a profit center rather than a cost center.'
      },
      microsoft: {
        swot: {
          strengths: ['Azure is the worlds second largest cloud platform (~23% market share)','Microsoft 365 subscription locks in 400M+ enterprise and consumer users','OpenAI partnership gives Microsoft first-mover advantage in enterprise AI','LinkedIn is the worlds dominant professional network (1B+ members)','Xbox and gaming (Activision Blizzard acquisition) creates entertainment moat'],
          weaknesses: ['Windows and Office legacy products slowing growth vs cloud-native competitors','Bing search still far behind Google despite AI integration','Hardware (Surface) remains a niche product vs Apple','Complex enterprise sales cycles slow revenue recognition'],
          opportunities: ['Copilot AI integration across all Microsoft 365 products','Azure AI services as the enterprise AI platform of choice','Gaming subscription (Game Pass) as Netflix of gaming','Cybersecurity as a $20B+ revenue opportunity'],
          threats: ['Google Workspace gaining enterprise market share from Microsoft 365','AWS maintaining cloud leadership despite Azure growth','Antitrust scrutiny of Activision Blizzard acquisition','Open-source AI models reducing dependency on Microsoft/OpenAI']
        },
        metrics: [
          { name: 'Brand Recognition', value: 97 },
          { name: 'Enterprise Retention', value: 91 },
          { name: 'Cloud Growth Rate', value: 29 },
          { name: 'Revenue Growth', value: 16 },
          { name: 'Competitive Moat', value: 90 }
        ],
        businessModel: { type: 'Cloud + Subscription + Platform', revenueStreams: ['Microsoft Azure cloud services ($100B+ ARR)','Microsoft 365 subscriptions (consumer and enterprise)','LinkedIn advertising and premium subscriptions','Xbox Game Pass and gaming revenue','Windows OEM licensing'], unitEconomics: 'Cloud gross margin ~70%; Overall operating margin ~45%; One of the most profitable companies in history' },
        moat: { type: 'Enterprise Lock-In + Cloud Moat', description: 'Microsoft 365 is embedded in the workflow of 400M+ users. Switching away from Teams, Outlook, Excel, and SharePoint requires retraining entire organizations, creating switching costs that are effectively insurmountable.', strength: 90 },
        marketing: { positioning: 'Empowering every person and organization on the planet to achieve more', targetAudience: 'Enterprise IT decision makers, developers, SMBs, and consumers globally', keyMessage: 'Be more, do more with Microsoft', primaryChannels: ['Enterprise Sales Force','Microsoft Partner Network','Developer Relations (GitHub, Azure)','LinkedIn'], tactics: ['Microsoft Ignite and Build conferences drive developer and enterprise adoption','GitHub acquisition locks in 100M+ developers into Microsoft ecosystem','Copilot AI features justify Microsoft 365 price increases','Partner channel of 400,000+ resellers extends global reach'] },
        pricingStrategy: 'Enterprise: Microsoft 365 Business at $6-$22/user/month. Azure: pay-as-you-go with enterprise agreements. Consumer: Microsoft 365 Personal at $69.99/year. Strategy: bundle everything to increase ARPU.',
        growthStrategy: ['Copilot AI monetization across all products','Azure market share expansion vs AWS','Gaming subscription (Game Pass) scaling','Cybersecurity product suite expansion'],
        businessScore: 95,
        scoreReason: 'Extraordinary enterprise moat, cloud growth, and AI positioning make Microsoft one of the most durable businesses ever built',
        tagline: 'Empowering every person and every organization on the planet to achieve more',
        categoryTags: ['Cloud Computing','Software','Enterprise Tech'],
        marketTags: ['B2B','B2C','Global'],
        keyInsight: 'Microsofts genius was transforming from a software license company into a cloud subscription empire without losing its enterprise customer base. By embedding AI (Copilot) into tools people already use daily, Microsoft is charging more for the same products while making them genuinely more valuable, a rare win-win that drives both growth and loyalty.',
        competitiveAdvantage: 'The only company with dominant positions in enterprise productivity (Office 365), cloud infrastructure (Azure), professional networking (LinkedIn), developer tools (GitHub), and enterprise AI (OpenAI partnership), creating a self-reinforcing enterprise ecosystem.'
      }
    };

    const brandKey = Object.keys(brandDB).find(k =>
      nameLower.includes(k) || k.includes(nameLower) || query.toLowerCase().includes(k)
    );

    let brandData = brandKey ? brandDB[brandKey] : null;

    if (!brandData) {
      const isPublic = descLower.includes('nasdaq') || descLower.includes('nyse') || descLower.includes('publicly traded');
      const isTech = descLower.includes('technology') || descLower.includes('software') || descLower.includes('platform') || descLower.includes('app');
      const isRetail = descLower.includes('retail') || descLower.includes('store') || descLower.includes('shop');
      const isService = descLower.includes('service') || descLower.includes('subscription');

      const strengths = [];
      const weaknesses = [];
      const opportunities = [];
      const threats = [];

      if (descLower.includes('largest') || descLower.includes('leading') || descLower.includes('biggest')) strengths.push('Market leader in ' + detectedIndustry + ' with dominant market position');
      if (descLower.includes('million') || descLower.includes('billion')) strengths.push('Large-scale operations with significant user and customer base');
      if (descLower.includes('brand') || descLower.includes('recogni')) strengths.push('Strong brand recognition and customer loyalty');
      if (isTech) strengths.push('Technology-driven competitive advantages and digital infrastructure');
      if (descLower.includes('global') || descLower.includes('worldwide') || descLower.includes('international')) strengths.push('Global presence across multiple markets and geographies');
      if (strengths.length < 3) strengths.push('Established player in the ' + detectedIndustry + ' industry with proven business model');
      if (strengths.length < 4) strengths.push('Diversified revenue streams reducing single-point-of-failure risk');
      if (strengths.length < 5) strengths.push('Strong operational capabilities and experienced management team');

      weaknesses.push('Competitive pressure from emerging players in ' + detectedIndustry);
      weaknesses.push('Potential over-reliance on core product or service for revenue');
      if (isPublic) weaknesses.push('Short-term earnings pressure from public market expectations');
      weaknesses.push('Scaling operational costs as business grows');
      weaknesses.push('Talent acquisition and retention in competitive market');

      opportunities.push('Expansion into adjacent ' + detectedIndustry + ' market segments');
      opportunities.push('AI and automation integration to improve efficiency and margins');
      opportunities.push('Emerging market penetration in Asia, Africa, and Latin America');
      opportunities.push('Strategic partnerships and acquisitions to accelerate growth');

      threats.push('Intensifying competition in the ' + detectedIndustry + ' sector');
      threats.push('Regulatory changes and compliance requirements');
      threats.push('Economic downturns affecting consumer and enterprise spending');
      threats.push('Technological disruption from new entrants and business models');

      const marketShareVal = descLower.includes('largest') || descLower.includes('leading') ? 60 + Math.floor(Math.random() * 25) : 25 + Math.floor(Math.random() * 35);
      const brandVal = descLower.includes('iconic') || descLower.includes('well-known') ? 70 + Math.floor(Math.random() * 25) : 45 + Math.floor(Math.random() * 35);
      const growthVal = descLower.includes('growing') || descLower.includes('growth') ? 50 + Math.floor(Math.random() * 35) : 25 + Math.floor(Math.random() * 40);
      const moatVal = descLower.includes('unique') || descLower.includes('patent') || descLower.includes('proprietary') ? 55 + Math.floor(Math.random() * 30) : 30 + Math.floor(Math.random() * 40);
      const retentionVal = isService || descLower.includes('subscription') ? 60 + Math.floor(Math.random() * 25) : 40 + Math.floor(Math.random() * 35);

      const businessScore = Math.round((marketShareVal * 0.25 + brandVal * 0.25 + growthVal * 0.2 + moatVal * 0.2 + retentionVal * 0.1));

      let bizModelType = 'Mixed Revenue Model';
      let revenueStreams = [];
      if (descLower.includes('subscription')) { bizModelType = 'Subscription Model'; revenueStreams.push('Recurring subscription revenue'); }
      if (descLower.includes('advertising') || descLower.includes('ad ')) { bizModelType = 'Advertising Model'; revenueStreams.push('Digital advertising revenue'); }
      if (descLower.includes('marketplace') || descLower.includes('commission')) { bizModelType = 'Marketplace Model'; revenueStreams.push('Transaction fees and commissions'); }
      if (isRetail) { bizModelType = 'Retail Model'; revenueStreams.push('Product sales revenue'); }
      if (revenueStreams.length === 0) revenueStreams = ['Core product and service revenue', 'Premium tier upsells', 'Partnership and licensing revenue'];
      revenueStreams.push('Data and analytics monetization');

      brandData = {
        swot: { strengths, weaknesses, opportunities, threats },
        metrics: [
          { name: 'Brand Recognition', value: brandVal },
          { name: 'Market Position', value: marketShareVal },
          { name: 'Growth Trajectory', value: growthVal },
          { name: 'Customer Retention', value: retentionVal },
          { name: 'Competitive Moat', value: moatVal }
        ],
        businessModel: {
          type: bizModelType,
          revenueStreams,
          unitEconomics: 'Operating in ' + detectedIndustry + ' sector. ' + (wdProps.revenue ? 'Revenue: ' + wdProps.revenue : 'Revenue data from public sources') + '. ' + (wdProps.employees ? 'Employees: ' + wdProps.employees : '')
        },
        moat: {
          type: isTech ? 'Technology + Data Moat' : descLower.includes('brand') ? 'Brand Moat' : 'Operational Moat',
          description: description.length > 100 ? description.substring(0, 220) + '...' : name + ' has built competitive advantages through its position in the ' + detectedIndustry + ' industry.',
          strength: moatVal
        },
        marketing: {
          positioning: name + ', a leading player in ' + detectedIndustry,
          targetAudience: isTech ? 'Tech-savvy consumers and enterprise clients' : isRetail ? 'Mass market consumers across demographics' : 'Core industry customers and stakeholders',
          keyMessage: name + ': delivering value in ' + detectedIndustry,
          primaryChannels: isTech ? ['Digital Marketing','Social Media','Content Marketing','SEO'] : ['Traditional Media','Social Media','Retail Presence','PR'],
          tactics: [
            'Leverage ' + detectedIndustry + ' industry expertise for thought leadership',
            'Data-driven marketing campaigns targeting high-value segments',
            'Community building and brand ambassador programs',
            'Strategic content marketing and SEO for organic growth'
          ]
        },
        pricingStrategy: isService ? 'Subscription-based pricing with tiered plans to maximize addressable market while protecting premium positioning.' : isRetail ? 'Competitive pricing strategy balancing volume and margin, with premium tiers for high-value customers.' : 'Value-based pricing reflecting ' + name + ' market position and brand equity in the ' + detectedIndustry + ' sector.',
        growthStrategy: [
          'Deepen penetration in core ' + detectedIndustry + ' market',
          'International expansion into high-growth emerging markets',
          'Product and service line extension into adjacent categories',
          'Strategic M&A to acquire technology and talent'
        ],
        businessScore,
        scoreReason: 'Based on market position, brand strength, and growth signals in the ' + detectedIndustry + ' sector',
        tagline: description.length > 50 ? description.substring(0, 110) + '...' : 'A leading company in ' + detectedIndustry,
        categoryTags: [detectedIndustry, isTech ? 'Technology' : isRetail ? 'Retail' : 'Services'],
        marketTags: [descLower.includes('global') ? 'Global' : 'Regional', isPublic ? 'Public Company' : 'Private'],
        keyInsight: name + ' strategic position in ' + detectedIndustry + ' is defined by ' + (strengths[0] ? strengths[0].toLowerCase() : 'its core competitive advantages') + '. The key to long-term success lies in ' + (opportunities[0] ? opportunities[0].toLowerCase() : 'expanding into new markets') + ' while defending against ' + (threats[0] ? threats[0].toLowerCase() : 'competitive pressures') + '.',
        competitiveAdvantage: strengths.slice(0, 2).join('. ')
      };
    }

    const response = {
      name,
      tagline: brandData.tagline,
      description,
      businessScore: brandData.businessScore,
      scoreReason: brandData.scoreReason,
      categoryTags: brandData.categoryTags,
      marketTags: brandData.marketTags,
      businessModel: brandData.businessModel,
      moat: brandData.moat,
      pricingStrategy: brandData.pricingStrategy,
      growthStrategy: brandData.growthStrategy,
      marketing: brandData.marketing,
      metrics: brandData.metrics,
      swot: brandData.swot,
      keyInsight: brandData.keyInsight,
      competitiveAdvantage: brandData.competitiveAdvantage,
      meta: {
        founded: wdProps.founded || null,
        hq: wdProps.hq || null,
        employees: wdProps.employees || null,
        revenue: wdProps.revenue || null,
        ticker: wdProps.ticker || null,
        founder: wdProps.founder || null,
      }
    };

    return res.status(200).json(response);

  } catch (err) {
    console.error('BizLens API error:', err);
    return res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
}
