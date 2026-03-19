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
    const description = wiki?.extract || '';
    const name = wiki?.title || query;
    const descLower = description.toLowerCase();
    const nameLower = name.toLowerCase();

    const brandDB = {
      spotify: {
        netWorth: '$25.8B', revenue: '$15.9B (2024)', revenueGrowth: '+19% YoY',
        suggestions: ['Try searching: Apple Music', 'Try searching: YouTube Music', 'Try searching: SoundCloud'],
        swot: { strengths: ['600M+ monthly active users, largest music streaming platform globally','Personalized recommendation engine (Discover Weekly, Daily Mix) drives deep engagement','Freemium model lowers barrier to entry and fuels premium conversion','Podcast expansion diversifies content beyond music','Strong brand recognition across 180+ markets'], weaknesses: ['Thin profit margins due to high royalty payments to labels','Dependent on major record labels for licensing','Free tier cannibalizes premium conversion for many users','Slow to monetize podcast investments profitably'], opportunities: ['Audiobooks and live audio events as new revenue streams','Expansion into emerging markets (India, Africa, Southeast Asia)','AI-powered music creation tools for artists','Deeper integration with smart home and car platforms'], threats: ['Apple Music, YouTube Music, Amazon Music intensifying competition','Record labels pushing for higher royalty rates','Potential regulation on algorithm-driven content curation','Economic downturns reducing discretionary subscription spend'] },
        metrics: [{ name: 'Brand Recognition', value: 92 },{ name: 'User Retention', value: 78 },{ name: 'Market Share', value: 31 },{ name: 'Revenue Growth', value: 14 },{ name: 'Competitive Moat', value: 72 }],
        businessModel: { type: 'Freemium + Subscription', revenueStreams: ['Premium subscriptions ($9.99-$15.99/mo)','Ad-supported free tier','Podcast advertising network','Artist promotional tools'], unitEconomics: 'ARPU ~$4.50/month globally; gross margin ~26% after royalties' },
        moat: { type: 'Network Effect + Data Moat', description: 'Spotifys recommendation algorithms improve with every stream. 600M users generate irreplaceable behavioral data that competitors cannot replicate overnight.', strength: 72 },
        marketing: { positioning: 'Music for everyone, personalized, accessible, everywhere', targetAudience: 'Millennials and Gen Z, 18-34, music enthusiasts and podcast listeners', keyMessage: 'Your soundtrack to life, perfectly curated', primaryChannels: ['Social Media','Influencer Marketing','In-App Viral Loops','Spotify Wrapped Campaign'], tactics: ['Annual Spotify Wrapped viral campaign drives massive organic sharing','Playlist culture and collaborative playlists increase social stickiness','Student discount strategy captures lifetime users early','Artist partnerships for exclusive content'] },
        pricingStrategy: 'Freemium with premium tiers: Individual ($9.99), Duo ($12.99), Family ($15.99), Student ($4.99). Free tier monetized via ads.',
        growthStrategy: ['Podcast and audiobook content acquisition','Emerging market penetration with local pricing','AI DJ and personalization features','Creator monetization tools to attract artists'],
        businessScore: 78, scoreReason: 'Strong user base and brand, but margin pressure from royalties limits profitability',
        tagline: 'The worlds most popular audio streaming subscription service',
        categoryTags: ['Music Streaming','Audio','Subscription'], marketTags: ['B2C','Global','Mobile-First'],
        keyInsight: 'Spotifys true moat is not music, it is data. Every skip, replay, and playlist tells Spotify more about human emotion than any record label knows. The company that owns listening behavior owns the future of audio.',
        competitiveAdvantage: 'Unmatched personalization through machine learning on 600M+ user behavioral dataset, combined with first-mover advantage in podcast aggregation.'
      },
      nike: {
        netWorth: '$28.6B', revenue: '$51.4B (FY2024)', revenueGrowth: '-10% YoY (restructuring)',
        suggestions: ['Try searching: Adidas', 'Try searching: Under Armour', 'Try searching: Lululemon'],
        swot: { strengths: ['Worlds most valuable sportswear brand ($33B+ brand value)','Direct-to-consumer digital strategy drives higher margins','Iconic Just Do It brand identity with 50+ years of equity','Deep athlete endorsement network (Jordan, LeBron, Ronaldo)','Advanced supply chain and manufacturing scale'], weaknesses: ['Heavy reliance on third-party manufacturing in Asia','Premium pricing limits accessibility in price-sensitive markets','Inventory management challenges post-pandemic','Dependence on a few superstar athlete endorsements'], opportunities: ['Expanding womens sportswear and lifestyle categories','Digital fitness ecosystem (Nike Training Club, Nike Run Club)','Sustainable materials and circular economy positioning','Growing sports participation in emerging markets'], threats: ['Adidas, Under Armour, Lululemon gaining market share','Rising manufacturing and logistics costs','Counterfeit products damaging brand value','Geopolitical risks in Asian manufacturing hubs'] },
        metrics: [{ name: 'Brand Recognition', value: 97 },{ name: 'Customer Loyalty', value: 85 },{ name: 'Market Share', value: 27 },{ name: 'Revenue Growth', value: 10 },{ name: 'Competitive Moat', value: 88 }],
        businessModel: { type: 'Direct-to-Consumer + Wholesale', revenueStreams: ['Nike.com and Nike App direct sales','Nike-owned retail stores','Wholesale to retailers (Foot Locker, Dicks)','Jordan Brand licensing','Nike Training digital subscriptions'], unitEconomics: 'Gross margin ~44%; DTC channel delivers ~60% higher margins than wholesale' },
        moat: { type: 'Brand Moat + Emotional Connection', description: 'Nike has built a 50-year emotional brand that transcends sportswear. Consumers do not just buy shoes, they buy identity, aspiration, and belonging to athletic culture.', strength: 88 },
        marketing: { positioning: 'Performance meets culture, athletic excellence for everyone', targetAudience: 'Athletes and aspirational consumers, 16-45, across all sports and lifestyle segments', keyMessage: 'Just Do It', primaryChannels: ['Athlete Endorsements','Social Media','Nike App','Retail Experience'], tactics: ['Athlete storytelling campaigns (Kaepernick, Serena Williams)','Limited edition drops create scarcity and hype','Nike Training Club app builds daily brand touchpoints','Community running events and sports sponsorships'] },
        pricingStrategy: 'Premium pricing strategy ($80-$250+ for footwear). Limited edition and Jordan Brand command $200-$500+.',
        growthStrategy: ['DTC digital acceleration reducing wholesale dependency','Sustainability with Nike Move to Zero initiative','Womens category expansion','Digital fitness and membership ecosystem'],
        businessScore: 91, scoreReason: 'Exceptional brand equity, strong DTC pivot, and global scale make Nike a fortress business',
        tagline: 'The worlds leading designer, marketer and distributor of athletic footwear and apparel',
        categoryTags: ['Sportswear','Footwear','Apparel'], marketTags: ['B2C','Global','Premium'],
        keyInsight: 'Nike does not sell shoes, it sells the belief that you can be an athlete. This psychological positioning allows Nike to charge premium prices for products made at commodity costs, generating extraordinary margins through pure brand power.',
        competitiveAdvantage: 'Unrivaled brand equity built over 50 years, combined with the worlds most powerful athlete endorsement network and a rapidly growing direct-to-consumer digital ecosystem.'
      },
      tesla: {
        netWorth: '$800B+', revenue: '$97.7B (2023)', revenueGrowth: '+19% YoY',
        suggestions: ['Try searching: BYD', 'Try searching: Rivian', 'Try searching: Lucid Motors'],
        swot: { strengths: ['First-mover advantage in premium electric vehicles','Vertically integrated: owns battery, software, charging network','Over-the-air software updates create continuous product improvement','Supercharger network is a massive competitive moat','Elon Musks personal brand drives massive free media coverage'], weaknesses: ['Production scaling challenges and quality control issues','Heavy dependence on Elon Musk as key person risk','Premium pricing limits mass market penetration','Service center network underdeveloped vs traditional OEMs'], opportunities: ['Energy storage (Powerwall, Megapack) as major growth vertical','Full Self-Driving (FSD) as a high-margin software revenue stream','Robotaxi network could transform unit economics','Expansion in India and Southeast Asia'], threats: ['BYD, Volkswagen, GM, Hyundai rapidly closing EV gap','Price wars eroding margins across EV industry','Regulatory risks around FSD and autonomous driving','Elon Musks political controversies affecting brand perception'] },
        metrics: [{ name: 'Brand Recognition', value: 94 },{ name: 'Innovation Index', value: 96 },{ name: 'EV Market Share', value: 18 },{ name: 'Revenue Growth', value: 19 },{ name: 'Competitive Moat', value: 82 }],
        businessModel: { type: 'Product + Software + Energy', revenueStreams: ['Vehicle sales (Model 3, Y, S, X, Cybertruck)','Full Self-Driving software ($8,000-$12,000 add-on)','Energy generation and storage (Solar, Powerwall, Megapack)','Supercharger network access fees','Services and insurance'], unitEconomics: 'Automotive gross margin ~18%; FSD software margin ~80%+; Energy segment growing rapidly' },
        moat: { type: 'Vertical Integration + Software Moat', description: 'Teslas Supercharger network, proprietary battery technology, and OTA software updates create a self-reinforcing ecosystem that traditional automakers cannot replicate without decades of investment.', strength: 82 },
        marketing: { positioning: 'Accelerating the worlds transition to sustainable energy', targetAudience: 'Tech-forward early adopters, environmentally conscious consumers, premium car buyers, 28-55', keyMessage: 'The future of driving is electric, autonomous, and connected', primaryChannels: ['Word of Mouth','Social Media (Elon Musk)','Zero paid advertising','Referral Program'], tactics: ['Zero traditional advertising, relies entirely on earned media','Elon Musks Twitter/X presence generates billions in free publicity','Referral program turns customers into brand ambassadors','Product launches as media events (Cybertruck reveal)'] },
        pricingStrategy: 'Premium to mid-range pricing ($38,990-$104,990). Aggressive price cuts in 2023-2024 to defend market share. FSD priced as high-margin software add-on.',
        growthStrategy: ['Robotaxi network launch (Cybercab)','FSD subscription revenue scaling','Energy business (Megapack) for utility-scale storage','Optimus humanoid robot as future revenue stream'],
        businessScore: 85, scoreReason: 'Revolutionary technology and brand, but increasing competition and margin pressure create uncertainty',
        tagline: 'Accelerating the worlds transition to sustainable energy',
        categoryTags: ['Electric Vehicles','Energy','Technology'], marketTags: ['B2C','Global','Premium'],
        keyInsight: 'Tesla is not a car company, it is a software company that happens to make cars. The real value lies in FSD, the data from millions of miles driven, and the potential robotaxi network that could generate more revenue than all vehicle sales combined.',
        competitiveAdvantage: 'The only automaker with a fully integrated ecosystem: proprietary batteries, software, charging network, and energy products, creating switching costs that go far beyond the vehicle itself.'
      },
      amazon: {
        netWorth: '$2.1T+', revenue: '$574.8B (2023)', revenueGrowth: '+12% YoY',
        suggestions: ['Try searching: Shopify', 'Try searching: Walmart', 'Try searching: Alibaba'],
        swot: { strengths: ['AWS is the worlds largest cloud platform (~33% market share)','Prime membership creates unbreakable customer loyalty loop','Logistics network rivals UPS and FedEx in scale','Data advantage across retail, cloud, and advertising','Flywheel effect: more sellers, more buyers, lower prices, more sellers'], weaknesses: ['Thin retail margins heavily subsidized by AWS profits','Labor relations and warehouse worker conditions under scrutiny','Regulatory antitrust pressure in US and EU','Alexa and hardware division struggling to find profitability'], opportunities: ['Healthcare (Amazon Pharmacy, One Medical) as massive new vertical','Advertising business growing 20%+ annually','Satellite internet (Project Kuiper) competing with Starlink','AI integration across AWS and consumer products'], threats: ['Microsoft Azure and Google Cloud gaining AWS market share','Regulatory breakup risk in US and EU','Walmart, Shopify, TikTok Shop challenging retail dominance','Rising fulfillment and labor costs compressing margins'] },
        metrics: [{ name: 'Brand Recognition', value: 98 },{ name: 'Customer Retention', value: 93 },{ name: 'E-com Market Share', value: 38 },{ name: 'Revenue Growth', value: 12 },{ name: 'Competitive Moat', value: 95 }],
        businessModel: { type: 'Platform + Cloud + Subscription', revenueStreams: ['AWS cloud services (~$100B ARR)','Third-party seller fees (marketplace)','Prime subscriptions ($139/year)','Advertising services ($50B+/year)','Retail product sales'], unitEconomics: 'AWS operating margin ~30%; Advertising margin ~25%; Retail margin ~2-5%' },
        moat: { type: 'Platform Flywheel + Infrastructure Moat', description: 'Amazons flywheel, where each business unit feeds the others, creates a self-reinforcing competitive advantage that has taken 30 years to build and cannot be replicated.', strength: 95 },
        marketing: { positioning: 'Earths most customer-centric company', targetAudience: 'Universal, from individual consumers to Fortune 500 enterprises', keyMessage: 'Everything you need, delivered fast', primaryChannels: ['Search (Google + Amazon internal)','Email (Prime communications)','Alexa voice commerce','Affiliate marketing'], tactics: ['Prime Day creates annual shopping event rivaling Black Friday','Subscribe and Save locks in recurring revenue','Amazon Basics private label competes with brands on its own platform','AWS re:Invent conference drives enterprise cloud adoption'] },
        pricingStrategy: 'Loss-leader pricing in retail to drive Prime adoption. AWS uses pay-as-you-go with volume discounts. Prime at $139/year is priced to be irresistible given shipping savings alone.',
        growthStrategy: ['Healthcare vertical expansion','Advertising business scaling','AI/ML services on AWS','International expansion in India and emerging markets'],
        businessScore: 96, scoreReason: 'Unmatched multi-business flywheel with AWS funding retail dominance, one of the strongest business models ever built',
        tagline: 'Earths most customer-centric company',
        categoryTags: ['E-Commerce','Cloud','Technology'], marketTags: ['B2C','B2B','Global'],
        keyInsight: 'Amazons secret weapon is that AWS profits subsidize retail losses, allowing Amazon to undercut every competitor on price while building the worlds most powerful logistics network. No pure-play retailer can compete with a company that does not need retail to be profitable.',
        competitiveAdvantage: 'The only company in history to simultaneously dominate e-commerce, cloud computing, digital advertising, and logistics, each business reinforcing the others in a self-sustaining flywheel.'
      },
      apple: {
        netWorth: '$3.5T+', revenue: '$391B (FY2024)', revenueGrowth: '+2% YoY',
        suggestions: ['Try searching: Samsung', 'Try searching: Google', 'Try searching: Microsoft'],
        swot: { strengths: ['Most valuable company in the world ($3.5T+ market cap)','Ecosystem lock-in: iPhone, Mac, iPad, Watch, AirPods work seamlessly together','Services (App Store, iCloud, Apple Music) generate $85B+/year at high margins','Unmatched brand loyalty with 90%+ iPhone upgrade retention','Apple Silicon (M-series chips) delivers industry-leading performance per watt'], weaknesses: ['Premium pricing excludes majority of global smartphone market','Heavy dependence on iPhone (~50% of revenue)','Manufacturing concentration in China creates geopolitical risk','App Store monopoly facing regulatory challenges globally'], opportunities: ['Apple Vision Pro and spatial computing as next platform','Healthcare devices (Apple Watch health monitoring, medical partnerships)','Financial services (Apple Pay, Apple Card, Apple Savings)','India manufacturing expansion reducing China dependency'], threats: ['Antitrust regulation threatening App Store 30% commission','Samsung, Google Pixel, and Chinese brands in hardware','EU Digital Markets Act forcing sideloading and third-party payments','Slowing smartphone market growth globally'] },
        metrics: [{ name: 'Brand Recognition', value: 99 },{ name: 'Customer Loyalty', value: 92 },{ name: 'Profit Margin', value: 26 },{ name: 'Services Growth', value: 16 },{ name: 'Competitive Moat', value: 94 }],
        businessModel: { type: 'Hardware + Ecosystem + Services', revenueStreams: ['iPhone sales (~$200B/year)','Mac, iPad, Wearables hardware','App Store (30% commission on $1T+ transactions)','Apple Music, TV+, Arcade, iCloud subscriptions','Apple Pay and financial services'], unitEconomics: 'Hardware gross margin ~37%; Services gross margin ~74%; Overall ~46%' },
        moat: { type: 'Ecosystem Lock-In + Brand Moat', description: 'Once a user owns an iPhone, Mac, AirPods, and Apple Watch, switching to Android means losing years of data, habits, and seamless integrations. This ecosystem creates the highest switching costs in consumer technology.', strength: 94 },
        marketing: { positioning: 'Technology that empowers human creativity and privacy', targetAudience: 'Premium consumers, creative professionals, students, and enterprise users globally', keyMessage: 'Think Different, technology that just works', primaryChannels: ['Apple Stores (retail experience)','Product launch events','Word of mouth','Premium retail partnerships'], tactics: ['Annual iPhone launch events as cultural moments','Apple Store as brand temple with highest revenue per sq ft in retail','Privacy positioning differentiates from Google/Meta','Shot on iPhone campaign turns customers into brand ambassadors'] },
        pricingStrategy: 'Unapologetically premium: iPhone from $799-$1,599. Mac from $999-$6,999. Never compete on price, always compete on value and experience.',
        growthStrategy: ['Services revenue scaling to $150B+','Vision Pro and spatial computing platform','India as next major growth market','Healthcare and financial services expansion'],
        businessScore: 97, scoreReason: 'The most profitable consumer technology ecosystem ever built, with unmatched brand loyalty and expanding high-margin services',
        tagline: 'Technology at the intersection of the liberal arts and technology',
        categoryTags: ['Smartphones','Computers','Consumer Electronics'], marketTags: ['B2C','Premium','Global'],
        keyInsight: 'Apples genius is selling hardware at premium prices to build an ecosystem, then monetizing that ecosystem through high-margin services forever. The iPhone is the key that unlocks a lifetime of recurring revenue, making Apple less a hardware company and more a subscription business disguised as a phone maker.',
        competitiveAdvantage: 'The worlds most powerful consumer ecosystem combining hardware, software, and services with 2B+ active devices creating an unbreakable network of switching costs and recurring revenue.'
      },
      netflix: {
        netWorth: '$380B+', revenue: '$39.0B (2024)', revenueGrowth: '+15% YoY',
        suggestions: ['Try searching: Disney Plus', 'Try searching: HBO Max', 'Try searching: Amazon Prime Video'],
        swot: { strengths: ['270M+ subscribers across 190 countries','Original content library (Stranger Things, Squid Game) drives global cultural moments','Password sharing crackdown successfully converted 100M+ free users to paid','Ad-supported tier opens new revenue stream and lower price point','Data-driven content decisions reduce production risk'], weaknesses: ['Content costs ($17B+/year) create constant cash burn pressure','No live sports rights, major gap vs Disney+, Amazon, Apple TV+','Password sharing crackdown may have exhausted easy conversion pool','Subscriber growth slowing in mature markets (US, Europe)'], opportunities: ['Live events and sports rights as next growth frontier','Gaming expansion (Netflix Games) as differentiation','Ad-supported tier scaling to rival traditional TV advertising','Emerging markets (India, Africa) with massive untapped audiences'], threats: ['Disney+, HBO Max, Apple TV+, Amazon Prime fragmenting streaming market','Content cost inflation as studios demand higher licensing fees','Password sharing crackdown backlash and churn risk','Linear TV decline reducing content licensing revenue'] },
        metrics: [{ name: 'Brand Recognition', value: 95 },{ name: 'Subscriber Retention', value: 80 },{ name: 'Content ROI', value: 68 },{ name: 'Revenue Growth', value: 15 },{ name: 'Competitive Moat', value: 75 }],
        businessModel: { type: 'Subscription + Advertising', revenueStreams: ['Standard subscription ($15.49/mo)','Premium subscription ($22.99/mo)','Ad-supported plan ($6.99/mo)','Netflix Games (included with subscription)','Content licensing to third parties'], unitEconomics: 'ARPU ~$17/month globally; content amortization ~$17B/year; operating margin ~20%' },
        moat: { type: 'Content Library + Brand Moat', description: 'Netflixs original content library, global production infrastructure, and recommendation algorithm create a content moat that takes billions and years to replicate.', strength: 75 },
        marketing: { positioning: 'The home of the worlds best stories', targetAudience: 'Global streaming consumers, 18-54, across all demographics and geographies', keyMessage: 'Watch anywhere. Cancel anytime.', primaryChannels: ['Social Media','Content Marketing (trailers, clips)','Word of Mouth','Email'], tactics: ['Binge-release model creates cultural event moments','Global local content strategy (Squid Game, Money Heist) drives international growth','Social media clip virality drives organic discovery','Password sharing crackdown with account transfer feature'] },
        pricingStrategy: 'Tiered subscription: Ad-supported ($6.99), Standard ($15.49), Premium ($22.99). Price anchoring makes mid-tier feel like value.',
        growthStrategy: ['Live events and sports rights acquisition','Ad-supported tier scaling','Gaming as subscriber retention tool','Emerging market growth with local content'],
        businessScore: 82, scoreReason: 'Strong brand and content library, but intensifying competition and content costs create long-term margin pressure',
        tagline: 'The worlds leading streaming entertainment service',
        categoryTags: ['Video Streaming','Entertainment','Subscription'], marketTags: ['B2C','Global','Digital'],
        keyInsight: 'Netflixs biggest competitive advantage is not its content, it is its data. Netflix knows exactly what makes you stay up until 3am, and uses that knowledge to greenlight content with surgical precision, making every $17B content budget work harder than any traditional studio.',
        competitiveAdvantage: 'First-mover advantage in global streaming combined with the worlds largest behavioral dataset on entertainment consumption, enabling data-driven content decisions that traditional studios cannot match.'
      },
      google: {
        netWorth: '$2.3T+', revenue: '$350.0B (2024)', revenueGrowth: '+14% YoY',
        suggestions: ['Try searching: Microsoft Bing', 'Try searching: DuckDuckGo', 'Try searching: Meta'],
        swot: { strengths: ['92% global search market share, effectively a monopoly','Google Ads generates $200B+/year, most profitable ad platform ever built','Android powers 72% of global smartphones','YouTube is the worlds second largest search engine','DeepMind and Google Brain lead in AI research'], weaknesses: ['90%+ revenue dependence on advertising creates concentration risk','Antitrust cases in US and EU threatening core business model','Failed hardware products (Pixel, Nest) vs Apple and Samsung','Privacy concerns and data collection backlash'], opportunities: ['Gemini AI integration across all Google products','Google Cloud growing 28%+ annually to challenge AWS/Azure','YouTube Shorts competing with TikTok for short-form video','Waymo autonomous vehicles as transformative future business'], threats: ['DOJ antitrust case could force search default payment breakup','ChatGPT and AI search threatening Googles core search monopoly','TikTok replacing Google as discovery platform for Gen Z','Apple potentially building its own search engine'] },
        metrics: [{ name: 'Search Market Share', value: 92 },{ name: 'Ad Revenue Growth', value: 11 },{ name: 'Cloud Growth Rate', value: 28 },{ name: 'Brand Recognition', value: 99 },{ name: 'Competitive Moat', value: 93 }],
        businessModel: { type: 'Advertising Platform + Cloud', revenueStreams: ['Google Search advertising ($175B+/year)','YouTube advertising ($35B+/year)','Google Cloud Platform ($35B+ ARR)','Google Play Store commissions','Hardware (Pixel, Nest, Chromebook)'], unitEconomics: 'Advertising margin ~35%; Cloud margin growing toward 10%+; Overall operating margin ~28%' },
        moat: { type: 'Data Monopoly + Distribution Moat', description: 'Google processes 8.5 billion searches per day, creating an unassailable data advantage. Combined with Android distribution and Chrome browser dominance, Google controls the entry point to the internet for most of humanity.', strength: 93 },
        marketing: { positioning: 'Organizing the worlds information and making it universally accessible', targetAudience: 'Universal, every internet user globally; enterprise customers for Cloud', keyMessage: 'Search, discover, create, Google is where the world starts', primaryChannels: ['Product is the marketing (Google Search)','Developer relations','Enterprise sales (Google Cloud)','YouTube content ecosystem'], tactics: ['Google Doodles create daily brand moments','Google for Startups builds loyalty in next-gen companies','Made with AI campaigns showcase Gemini capabilities','Google I/O developer conference drives ecosystem adoption'] },
        pricingStrategy: 'Search and core products are free, monetized through advertising. Google Cloud uses pay-as-you-go with committed use discounts. Workspace at $6-$18/user/month.',
        growthStrategy: ['Gemini AI integration across all products','Google Cloud market share expansion','YouTube Shorts monetization','Waymo commercialization'],
        businessScore: 94, scoreReason: 'Near-monopoly in search with extraordinary ad margins, but AI disruption and antitrust risk are real existential threats',
        tagline: 'Organizing the worlds information and making it universally accessible and useful',
        categoryTags: ['Search Engine','Advertising','Cloud'], marketTags: ['B2C','B2B','Global'],
        keyInsight: 'Googles moat is not its search algorithm, it is the 25 years of behavioral data it has collected on every internet user. This data advantage makes its ad targeting so superior that advertisers have no rational alternative, creating a self-funding monopoly that generates $200B/year from a product that costs users nothing.',
        competitiveAdvantage: 'Unrivaled data advantage from 8.5B daily searches, combined with Android and Chrome distribution controlling the internet entry point for 5B+ users globally.'
      },
      'red bull': {
        netWorth: '$20B+', revenue: '$11.6B (2023)', revenueGrowth: '+12% YoY',
        suggestions: ['Try searching: Monster Energy', 'Try searching: Celsius', 'Try searching: Rockstar Energy'],
        swot: { strengths: ['Worlds most popular energy drink with 40%+ global market share','Extreme sports and events marketing creates unmatched brand culture','Red Bull Media House is a full content empire (TV, YouTube, social)','Premium pricing with strong brand justification','Asset-light model: outsources manufacturing, focuses on brand and distribution'], weaknesses: ['Single product category creates revenue concentration risk','Health concerns around high caffeine and sugar content','Limited product diversification vs Coca-Cola and PepsiCo','Dependent on youth culture relevance which can shift quickly'], opportunities: ['Sugar-free and health-conscious variants growing rapidly','Emerging markets in Asia and Africa with rising disposable income','Esports and gaming sponsorships reaching new demographics','Functional beverages and wellness drink adjacencies'], threats: ['Monster Energy, Celsius, Reign intensifying competition','Regulatory restrictions on energy drinks in multiple countries','Health and wellness trends shifting consumers away from energy drinks','Private label energy drinks from retailers undercutting on price'] },
        metrics: [{ name: 'Brand Recognition', value: 91 },{ name: 'Market Share', value: 43 },{ name: 'Customer Loyalty', value: 74 },{ name: 'Revenue Growth', value: 12 },{ name: 'Competitive Moat', value: 79 }],
        businessModel: { type: 'Premium Consumer Brand', revenueStreams: ['Energy drink sales (250ml, 355ml, 473ml cans)','Red Bull Sugar Free and Editions variants','Red Bull Media House content licensing','Event sponsorship and ticket revenue','Merchandise and brand licensing'], unitEconomics: 'Gross margin ~65%+ due to asset-light model; EBITDA margin ~30%+' },
        moat: { type: 'Brand Culture Moat', description: 'Red Bull has built a lifestyle brand so deeply embedded in extreme sports, music, and youth culture that it transcends the beverage category. The brand IS the moat.', strength: 79 },
        marketing: { positioning: 'Red Bull gives you wings, the energy drink for those who push limits', targetAudience: 'Young adults 18-34, athletes, students, gamers, and high-performance professionals', keyMessage: 'Red Bull gives you wings', primaryChannels: ['Extreme Sports Sponsorship','Red Bull Media House (YouTube, TV)','Event Marketing','Social Media'], tactics: ['Owns and creates events (Red Bull Air Race, Rampage, Stratos)','Red Bull Racing F1 team generates billions in global media exposure','Red Bull Media House produces world-class content that happens to market the brand','Athlete sponsorship of 600+ extreme sports athletes globally'] },
        pricingStrategy: 'Premium pricing ($2.50-$4.00 per can) positioned above mainstream sodas. Never discounts, never competes on price.',
        growthStrategy: ['Sugar-free and functional variant expansion','Esports and gaming market penetration','Emerging market distribution expansion','Red Bull Media House content monetization'],
        businessScore: 84, scoreReason: 'Extraordinary brand moat and margins, but single-category concentration and health trends are long-term risks',
        tagline: 'Red Bull gives you wings',
        categoryTags: ['Energy Drinks','Beverages','Lifestyle Brand'], marketTags: ['B2C','Global','Premium'],
        keyInsight: 'Red Bull spends more on marketing than manufacturing because it understood before anyone else that in the attention economy, the brand IS the product. By owning extreme sports culture, Red Bull made itself impossible to replicate, not because of the drink, but because of the world it built around it.',
        competitiveAdvantage: 'The only beverage brand that is also a global media empire, creating content that generates billions in earned media while simultaneously building the brand, making marketing a profit center rather than a cost center.'
      },
      microsoft: {
        netWorth: '$3.2T+', revenue: '$245.1B (FY2024)', revenueGrowth: '+16% YoY',
        suggestions: ['Try searching: Google Workspace', 'Try searching: Salesforce', 'Try searching: Oracle'],
        swot: { strengths: ['Azure is the worlds second largest cloud platform (~23% market share)','Microsoft 365 subscription locks in 400M+ enterprise and consumer users','OpenAI partnership gives Microsoft first-mover advantage in enterprise AI','LinkedIn is the worlds dominant professional network (1B+ members)','Xbox and gaming (Activision Blizzard acquisition) creates entertainment moat'], weaknesses: ['Windows and Office legacy products slowing growth vs cloud-native competitors','Bing search still far behind Google despite AI integration','Hardware (Surface) remains a niche product vs Apple','Complex enterprise sales cycles slow revenue recognition'], opportunities: ['Copilot AI integration across all Microsoft 365 products','Azure AI services as the enterprise AI platform of choice','Gaming subscription (Game Pass) as Netflix of gaming','Cybersecurity as a $20B+ revenue opportunity'], threats: ['Google Workspace gaining enterprise market share from Microsoft 365','AWS maintaining cloud leadership despite Azure growth','Antitrust scrutiny of Activision Blizzard acquisition','Open-source AI models reducing dependency on Microsoft/OpenAI'] },
        metrics: [{ name: 'Brand Recognition', value: 97 },{ name: 'Enterprise Retention', value: 91 },{ name: 'Cloud Growth Rate', value: 29 },{ name: 'Revenue Growth', value: 16 },{ name: 'Competitive Moat', value: 90 }],
        businessModel: { type: 'Cloud + Subscription + Platform', revenueStreams: ['Microsoft Azure cloud services ($100B+ ARR)','Microsoft 365 subscriptions (consumer and enterprise)','LinkedIn advertising and premium subscriptions','Xbox Game Pass and gaming revenue','Windows OEM licensing'], unitEconomics: 'Cloud gross margin ~70%; Overall operating margin ~45%; One of the most profitable companies in history' },
        moat: { type: 'Enterprise Lock-In + Cloud Moat', description: 'Microsoft 365 is embedded in the workflow of 400M+ users. Switching away from Teams, Outlook, Excel, and SharePoint requires retraining entire organizations, creating switching costs that are effectively insurmountable.', strength: 90 },
        marketing: { positioning: 'Empowering every person and organization on the planet to achieve more', targetAudience: 'Enterprise IT decision makers, developers, SMBs, and consumers globally', keyMessage: 'Be more, do more with Microsoft', primaryChannels: ['Enterprise Sales Force','Microsoft Partner Network','Developer Relations (GitHub, Azure)','LinkedIn'], tactics: ['Microsoft Ignite and Build conferences drive developer and enterprise adoption','GitHub acquisition locks in 100M+ developers into Microsoft ecosystem','Copilot AI features justify Microsoft 365 price increases','Partner channel of 400,000+ resellers extends global reach'] },
        pricingStrategy: 'Enterprise: Microsoft 365 Business at $6-$22/user/month. Azure: pay-as-you-go with enterprise agreements. Consumer: Microsoft 365 Personal at $69.99/year.',
        growthStrategy: ['Copilot AI monetization across all products','Azure market share expansion vs AWS','Gaming subscription (Game Pass) scaling','Cybersecurity product suite expansion'],
        businessScore: 95, scoreReason: 'Extraordinary enterprise moat, cloud growth, and AI positioning make Microsoft one of the most durable businesses ever built',
        tagline: 'Empowering every person and every organization on the planet to achieve more',
        categoryTags: ['Cloud Computing','Software','Enterprise Tech'], marketTags: ['B2B','B2C','Global'],
        keyInsight: 'Microsofts genius was transforming from a software license company into a cloud subscription empire without losing its enterprise customer base. By embedding AI (Copilot) into tools people already use daily, Microsoft is charging more for the same products while making them genuinely more valuable.',
        competitiveAdvantage: 'The only company with dominant positions in enterprise productivity (Office 365), cloud infrastructure (Azure), professional networking (LinkedIn), developer tools (GitHub), and enterprise AI (OpenAI partnership).'
      },
      meta: {
        netWorth: '$1.5T+', revenue: '$164.5B (2024)', revenueGrowth: '+22% YoY',
        suggestions: ['Try searching: TikTok', 'Try searching: Snapchat', 'Try searching: Twitter'],
        swot: { strengths: ['3.3B+ daily active users across Facebook, Instagram, WhatsApp, Messenger','Worlds most powerful social advertising platform with unmatched targeting','Instagram and WhatsApp are dominant in their respective categories globally','Reality Labs (Quest VR) positions Meta for the metaverse era','AI investments (Llama) creating open-source AI leadership'], weaknesses: ['90%+ revenue from advertising creates concentration risk','Facebook aging demographic as Gen Z prefers TikTok and Instagram','Privacy scandals and regulatory fines damage brand trust','Reality Labs losing $15B+/year with unclear path to profitability'], opportunities: ['WhatsApp monetization barely started, massive untapped revenue potential','AI-powered advertising tools increasing ad ROI for businesses','Threads as Twitter/X alternative gaining traction','Metaverse and VR as next computing platform'], threats: ['TikTok dominating Gen Z attention and advertiser budgets','EU and US regulatory pressure on data privacy and antitrust','Apple iOS privacy changes reducing ad targeting effectiveness','Advertiser boycotts over content moderation failures'] },
        metrics: [{ name: 'Daily Active Users', value: 89 },{ name: 'Ad Revenue Growth', value: 22 },{ name: 'Brand Recognition', value: 98 },{ name: 'User Engagement', value: 76 },{ name: 'Competitive Moat', value: 85 }],
        businessModel: { type: 'Advertising Platform', revenueStreams: ['Facebook and Instagram advertising ($150B+/year)','WhatsApp Business API fees','Quest VR hardware sales','Horizon Worlds virtual goods','Meta AI services'], unitEconomics: 'ARPU ~$50/year globally; advertising margin ~40%; Reality Labs margin deeply negative' },
        moat: { type: 'Network Effect Moat', description: 'With 3.3B daily users, Metas network effects are unparalleled. Every person who joins makes the platform more valuable for everyone else, creating a self-reinforcing loop that has taken 20 years to build.', strength: 85 },
        marketing: { positioning: 'Connecting the world and building the metaverse', targetAudience: 'Universal, 2B+ users globally across all demographics; advertisers of all sizes', keyMessage: 'Connect with the people and things you care about', primaryChannels: ['Product is the marketing (social network virality)','Developer platform and API ecosystem','Advertiser tools and education','Influencer and creator ecosystem'], tactics: ['Instagram Reels competing directly with TikTok for creator attention','WhatsApp Business tools locking in SMB advertisers globally','Meta AI assistant integrated across all apps','Quest VR developer ecosystem building metaverse content library'] },
        pricingStrategy: 'Free for consumers, monetized through advertising. WhatsApp Business API at per-message pricing. Quest VR hardware at $299-$499 (sold near cost to build ecosystem).',
        growthStrategy: ['WhatsApp monetization acceleration','AI advertising tools increasing ad effectiveness','Metaverse and VR long-term platform bet','Threads scaling as Twitter alternative'],
        businessScore: 88, scoreReason: 'Dominant social advertising platform with massive user base, but regulatory risk and TikTok competition are real threats',
        tagline: 'Connecting the world across Facebook, Instagram, WhatsApp, and beyond',
        categoryTags: ['Social Media','Advertising','Technology'], marketTags: ['B2C','B2B','Global'],
        keyInsight: 'Metas real product is not social networking, it is the most detailed psychological profile of 3.3 billion humans ever assembled. This data asset, built over 20 years of free usage, enables advertising targeting so precise that it generates $164B/year from businesses willing to pay to reach exactly the right person at exactly the right moment.',
        competitiveAdvantage: 'The only company with simultaneous dominance in social networking (Facebook), photo sharing (Instagram), and messaging (WhatsApp), creating a three-platform moat that captures virtually every moment of digital social life.'
      },
      airbnb: {
        netWorth: '$75B+', revenue: '$11.1B (2024)', revenueGrowth: '+12% YoY',
        suggestions: ['Try searching: Booking.com', 'Try searching: Vrbo', 'Try searching: Expedia'],
        swot: { strengths: ['8M+ listings in 220+ countries, largest accommodation marketplace globally','Asset-light model: owns no properties, pure marketplace economics','Strong brand recognition and trust built over 15+ years','Experiences product diversifies beyond accommodation','Host community creates supply-side loyalty and advocacy'], weaknesses: ['Regulatory battles in major cities (NYC, Barcelona, Amsterdam) restricting listings','Quality inconsistency across 8M listings damages trust','Seasonal demand creates revenue volatility','Dependence on travel industry cycles and economic conditions'], opportunities: ['Long-term stays (1+ month) growing as remote work becomes permanent','Airbnb Rooms (shared home stays) relaunched to expand supply','Experiences and activities as high-margin revenue stream','Corporate travel market largely untapped'], threats: ['Hotel chains improving digital experience and loyalty programs','Regulatory crackdowns reducing available inventory in key markets','Vrbo and Booking.com competing aggressively for hosts and guests','Economic recession reducing discretionary travel spending'] },
        metrics: [{ name: 'Brand Recognition', value: 90 },{ name: 'Host Retention', value: 72 },{ name: 'Market Share', value: 20 },{ name: 'Revenue Growth', value: 12 },{ name: 'Competitive Moat', value: 74 }],
        businessModel: { type: 'Two-Sided Marketplace', revenueStreams: ['Guest service fees (14-16% of booking)','Host service fees (3% of booking)','Airbnb Experiences commissions','Business travel program fees','Currency conversion fees'], unitEconomics: 'Take rate ~13% of gross booking value; gross margin ~75%; operating margin ~18%' },
        moat: { type: 'Network Effect + Brand Moat', description: 'Airbnbs two-sided network effect means more hosts attract more guests, which attracts more hosts. Combined with 15 years of trust-building, this creates a marketplace moat that is extremely difficult to displace.', strength: 74 },
        marketing: { positioning: 'Belong anywhere, authentic local travel experiences', targetAudience: 'Millennial and Gen Z travelers, 25-45, seeking authentic experiences over hotel stays', keyMessage: 'Live like a local, belong anywhere', primaryChannels: ['SEO and content marketing','Word of mouth and referrals','Social media (Instagram-worthy properties)','Email marketing to past guests'], tactics: ['Host success stories build supply-side community','Unique property categories (treehouses, castles) drive viral social sharing','Flexible cancellation policies post-COVID rebuilt guest trust','Airbnb Magazine and travel content drives organic discovery'] },
        pricingStrategy: 'Dynamic pricing based on demand, location, and seasonality. Service fees of 14-16% for guests and 3% for hosts. Smart Pricing tool helps hosts optimize rates.',
        growthStrategy: ['Long-term stays and remote work market','Airbnb Rooms relaunch for urban markets','Experiences and activities expansion','Corporate and business travel program'],
        businessScore: 80, scoreReason: 'Strong marketplace moat and brand, but regulatory headwinds and quality consistency challenges limit upside',
        tagline: 'Belong anywhere',
        categoryTags: ['Travel','Marketplace','Hospitality'], marketTags: ['B2C','Global','Platform'],
        keyInsight: 'Airbnbs genius was not building a hotel company, it was building a trust infrastructure. By solving the fundamental problem of strangers trusting each other with their homes, Airbnb unlocked 8 million properties that no hotel chain could ever build, at zero capital cost.',
        competitiveAdvantage: 'The worlds largest accommodation marketplace with 8M+ listings built on a trust infrastructure of reviews, verification, and insurance that took 15 years to develop and cannot be replicated quickly.'
      }
    };

    const brandKey = Object.keys(brandDB).find(k =>
      nameLower.includes(k) || k.includes(nameLower) || query.toLowerCase().includes(k)
    );
    let brandData = brandKey ? brandDB[brandKey] : null;

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

      const similarBrands = Object.keys(brandDB).slice(0, 3).map(k => 'Try searching: ' + k.charAt(0).toUpperCase() + k.slice(1));

      brandData = {
        netWorth: isPublic ? 'Public company (see stock market)' : 'Private company',
        revenue: descLower.includes('billion') ? 'Multi-billion dollar revenue' : 'Revenue data not publicly available',
        revenueGrowth: descLower.includes('growing') ? 'Growing YoY' : 'Stable',
        suggestions: similarBrands,
        swot: { strengths, weaknesses, opportunities, threats },
        metrics: [
          { name: 'Brand Recognition', value: brandVal },
          { name: 'Market Position', value: marketShareVal },
          { name: 'Growth Trajectory', value: growthVal },
          { name: 'Customer Retention', value: retentionVal },
          { name: 'Competitive Moat', value: moatVal }
        ],
        businessModel: { type: bizModelType, revenueStreams, unitEconomics: 'Operating in ' + detectedIndustry + ' sector.' },
        moat: { type: isTech ? 'Technology + Data Moat' : 'Brand Moat', description: description.length > 100 ? description.substring(0, 220) + '...' : name + ' has built competitive advantages in the ' + detectedIndustry + ' industry.', strength: moatVal },
        marketing: { positioning: name + ', a leading player in ' + detectedIndustry, targetAudience: isTech ? 'Tech-savvy consumers and enterprise clients' : 'Core industry customers and stakeholders', keyMessage: name + ': delivering value in ' + detectedIndustry, primaryChannels: isTech ? ['Digital Marketing','Social Media','Content Marketing','SEO'] : ['Traditional Media','Social Media','Retail Presence','PR'], tactics: ['Leverage ' + detectedIndustry + ' industry expertise for thought leadership','Data-driven marketing campaigns targeting high-value segments','Community building and brand ambassador programs','Strategic content marketing and SEO for organic growth'] },
        pricingStrategy: isService ? 'Subscription-based pricing with tiered plans.' : isRetail ? 'Competitive pricing strategy balancing volume and margin.' : 'Value-based pricing reflecting ' + name + ' market position in ' + detectedIndustry + '.',
        growthStrategy: ['Deepen penetration in core ' + detectedIndustry + ' market','International expansion into high-growth emerging markets','Product and service line extension into adjacent categories','Strategic M&A to acquire technology and talent'],
        businessScore,
        scoreReason: 'Based on market position, brand strength, and growth signals in the ' + detectedIndustry + ' sector',
        tagline: description.length > 50 ? description.substring(0, 110) + '...' : 'A leading company in ' + detectedIndustry,
        categoryTags: [detectedIndustry, isTech ? 'Technology' : isRetail ? 'Retail' : 'Services'],
        marketTags: [descLower.includes('global') ? 'Global' : 'Regional', isPublic ? 'Public Company' : 'Private'],
        keyInsight: name + ' strategic position in ' + detectedIndustry + ' is defined by ' + (strengths[0] ? strengths[0].toLowerCase() : 'its core competitive advantages') + '. The key to long-term success lies in ' + (opportunities[0] ? opportunities[0].toLowerCase() : 'expanding into new markets') + ' while defending against ' + (threats[0] ? threats[0].toLowerCase() : 'competitive pressures') + '.',
        competitiveAdvantage: strengths.slice(0, 2).join('. ')
      };
    }

    return res.status(200).json({
      name,
      tagline: brandData.tagline,
      description,
      businessScore: brandData.businessScore,
      scoreReason: brandData.scoreReason,
      categoryTags: brandData.categoryTags,
      marketTags: brandData.marketTags,
      netWorth: brandData.netWorth,
      revenue: brandData.revenue,
      revenueGrowth: brandData.revenueGrowth,
      suggestions: brandData.suggestions || [],
      businessModel: brandData.businessModel,
      moat: brandData.moat,
      pricingStrategy: brandData.pricingStrategy,
      growthStrategy: brandData.growthStrategy,
      marketing: brandData.marketing,
      metrics: brandData.metrics,
      swot: brandData.swot,
      keyInsight: brandData.keyInsight,
      competitiveAdvantage: brandData.competitiveAdvantage
    });

  } catch (err) {
    console.error('BizLens API error:', err);
    return res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
}
