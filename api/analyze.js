// api/analyze.js — BizLens Serverless Function
// Data: Wikipedia REST API + Wikidata + Google Knowledge Graph (all FREE)
// No LLM. No Anthropic. No paid API.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { product } = req.body || {};
  if (!product || typeof product !== 'string' || !product.trim())
    return res.status(400).json({ error: 'Product name is required' });
  if (product.length > 200)
    return res.status(400).json({ error: 'Product name too long' });

  const q = product.trim();

  try {
    // ── Parallel fetch: Wikipedia summary + Wikidata + Knowledge Graph ──────
    const [wikiData, kgData] = await Promise.all([
      fetchWikipedia(q),
      fetchKnowledgeGraph(q)
    ]);

    const wikidataId = wikiData.wikidataId;
    const wdData = wikidataId ? await fetchWikidata(wikidataId) : {};

    const result = buildResult(q, wikiData, kgData, wdData);
    return res.status(200).json(result);
  } catch (err) {
    console.error('BizLens error:', err);
    return res.status(500).json({ error: err.message || 'Analysis failed. Please try again.' });
  }
}

// ── Wikipedia REST API (free, no key) ────────────────────────────────────────
async function fetchWikipedia(query) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
  const r = await fetch(url, { headers: { 'User-Agent': 'BizLens/1.0' } });
  if (!r.ok) {
    // fallback: search
    const search = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`
    );
    const sd = await search.json();
    const title = sd?.query?.search?.[0]?.title;
    if (!title) return {};
    const r2 = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`, {
      headers: { 'User-Agent': 'BizLens/1.0' }
    });
    return r2.ok ? r2.json() : {};
  }
  return r.json();
}

// ── Google Knowledge Graph (free, needs GOOGLE_API_KEY env var) ──────────────
async function fetchKnowledgeGraph(query) {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) return {};
  const url = `https://kgsearch.googleapis.com/v1/entities:search?query=${encodeURIComponent(query)}&key=${key}&limit=1&indent=True`;
  try {
    const r = await fetch(url);
    const d = await r.json();
    return d?.itemListElement?.[0]?.result || {};
  } catch { return {}; }
}

// ── Wikidata (free, no key) ───────────────────────────────────────────────────
async function fetchWikidata(wikidataId) {
  const url = `https://www.wikidata.org/wiki/Special:EntityData/${wikidataId}.json`;
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'BizLens/1.0' } });
    const d = await r.json();
    const entity = d?.entities?.[wikidataId];
    if (!entity) return {};

    const claims = entity.claims || {};
    const get = (prop) => claims[prop]?.[0]?.mainsnak?.datavalue?.value;
    const getStr = (prop) => {
      const v = get(prop);
      return typeof v === 'string' ? v : v?.text || v?.amount || null;
    };
    const getLabel = async (prop) => {
      const v = get(prop);
      const id = v?.id;
      if (!id) return null;
      try {
        const r2 = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${id}.json`, {
          headers: { 'User-Agent': 'BizLens/1.0' }
        });
        const d2 = await r2.json();
        return d2?.entities?.[id]?.labels?.en?.value || null;
      } catch { return null; }
    };

    const [industry, country, founder] = await Promise.all([
      getLabel('P452'),   // industry
      getLabel('P17'),    // country
      getLabel('P112')    // founder
    ]);

    return {
      revenue:    getStr('P2139'),
      employees:  getStr('P1128'),
      founded:    getStr('P571'),
      hq:         getStr('P159'),
      industry,
      country,
      founder,
      website:    getStr('P856'),
      stockTicker: getStr('P249'),
      isin:       getStr('P946'),
    };
  } catch { return {}; }
}

// ── Build structured result from raw data ────────────────────────────────────
function buildResult(query, wiki, kg, wd) {
  const name        = kg?.name || wiki?.title || query;
  const description = wiki?.extract || kg?.description || 'No description available.';
  const thumbnail   = wiki?.thumbnail?.source || kg?.image?.contentUrl || null;
  const url         = wiki?.content_urls?.desktop?.page || kg?.url || null;

  // Derive category tags from KG types + wiki categories
  const kgTypes = (kg?.['@type'] || []).filter(t => t !== 'Thing');
  const categoryTags = kgTypes.length
    ? kgTypes.slice(0, 3)
    : deriveTagsFromText(description);

  // Score heuristic based on data richness
  const score = computeScore(wiki, kg, wd);

  // Business model type heuristic
  const bizType = guessBizModel(description, wd.industry);

  // Revenue streams from description keywords
  const revenueStreams = guessRevenueStreams(description, bizType);

  // Marketing channels heuristic
  const channels = guessChannels(description, categoryTags);

  // SWOT from description
  const swot = buildSWOT(description, wd);

  // Metrics
  const metrics = buildMetrics(description, wd, score);

  return {
    name,
    tagline: wiki?.description || kg?.description || description.split('.')[0],
    thumbnail,
    wikiUrl: url,
    businessScore: score,
    scoreReason: scoreReason(score),
    founded: wd.founded ? wd.founded.split('T')[0] : null,
    founder: wd.founder || null,
    hq: wd.hq || null,
    employees: wd.employees || null,
    revenue: wd.revenue || null,
    website: wd.website || null,
    stockTicker: wd.stockTicker || null,
    industry: wd.industry || null,
    country: wd.country || null,
    categoryTags,
    marketTags: guessMarketTags(description, wd),
    businessModel: {
      type: bizType,
      revenueStreams,
      unitEconomics: guessUnitEconomics(bizType, description)
    },
    moat: buildMoat(description, score),
    pricingStrategy: guessPricing(description, bizType),
    growthStrategy: guessGrowth(description, bizType),
    marketing: {
      positioning: guessPositioning(description, name),
      targetAudience: guessAudience(description, categoryTags),
      keyMessage: wiki?.description || description.split('.')[0],
      primaryChannels: channels,
      tactics: guessTactics(description, channels)
    },
    metrics,
    competitiveAdvantage: description.split('.').slice(0, 2).join('. ') + '.',
    swot,
    keyInsight: buildInsight(description, wd, bizType),
    rawDescription: description
  };
}

// ── Heuristic helpers ─────────────────────────────────────────────────────────
function deriveTagsFromText(text) {
  const t = text.toLowerCase();
  const tags = [];
  if (t.includes('software') || t.includes('app') || t.includes('platform')) tags.push('Technology');
  if (t.includes('retail') || t.includes('store') || t.includes('shop')) tags.push('Retail');
  if (t.includes('food') || t.includes('beverage') || t.includes('drink')) tags.push('F&B');
  if (t.includes('media') || t.includes('streaming') || t.includes('music')) tags.push('Media');
  if (t.includes('finance') || t.includes('bank') || t.includes('payment')) tags.push('FinTech');
  if (t.includes('health') || t.includes('medical') || t.includes('pharma')) tags.push('Health');
  if (t.includes('fashion') || t.includes('clothing') || t.includes('apparel')) tags.push('Fashion');
  if (t.includes('automobile') || t.includes('car') || t.includes('vehicle')) tags.push('Automotive');
  if (tags.length === 0) tags.push('Consumer Brand');
  return tags.slice(0, 3);
}

function guessBizModel(text, industry) {
  const t = (text + ' ' + (industry || '')).toLowerCase();
  if (t.includes('subscription') || t.includes('saas') || t.includes('monthly')) return 'Subscription / SaaS';
  if (t.includes('marketplace') || t.includes('platform')) return 'Marketplace Platform';
  if (t.includes('advertising') || t.includes('ad revenue')) return 'Advertising-Driven';
  if (t.includes('franchise')) return 'Franchise Model';
  if (t.includes('hardware') || t.includes('device') || t.includes('electronics')) return 'Hardware + Ecosystem';
  if (t.includes('retail') || t.includes('store')) return 'Retail / DTC';
  if (t.includes('service')) return 'Service Business';
  return 'Consumer Brand / DTC';
}

function guessRevenueStreams(text, bizType) {
  const t = text.toLowerCase();
  const streams = [];
  if (t.includes('subscription')) streams.push('Subscription fees');
  if (t.includes('advertis')) streams.push('Advertising revenue');
  if (t.includes('licens')) streams.push('Licensing');
  if (t.includes('hardware') || t.includes('device')) streams.push('Hardware sales');
  if (t.includes('service')) streams.push('Service fees');
  if (t.includes('franchise')) streams.push('Franchise royalties');
  if (streams.length < 2) {
    if (bizType.includes('Retail') || bizType.includes('DTC')) streams.push('Product sales');
    if (bizType.includes('SaaS')) streams.push('SaaS subscriptions');
    streams.push('Brand partnerships');
  }
  return streams.slice(0, 4);
}

function guessChannels(text, tags) {
  const t = text.toLowerCase();
  const ch = [];
  if (t.includes('social') || t.includes('instagram') || t.includes('tiktok')) ch.push('Social Media');
  if (t.includes('tv') || t.includes('television') || t.includes('broadcast')) ch.push('TV / Broadcast');
  if (t.includes('digital') || t.includes('online')) ch.push('Digital Marketing');
  if (t.includes('retail') || t.includes('store')) ch.push('Retail / In-store');
  if (t.includes('influencer') || t.includes('celebrity')) ch.push('Influencer Marketing');
  if (ch.length < 3) {
    ch.push('Content Marketing');
    ch.push('SEO / Search');
    ch.push('Email / CRM');
  }
  return ch.slice(0, 4);
}

function buildSWOT(text, wd) {
  const t = text.toLowerCase();
  return {
    strengths: [
      'Strong brand recognition',
      wd.founded ? `Established since ${wd.founded.split('-')[0]}` : 'Market leader position',
      'Loyal customer base',
      wd.employees ? `Large workforce (${wd.employees} employees)` : 'Global distribution network'
    ],
    weaknesses: [
      'High dependency on core market',
      'Premium pricing limits mass-market reach',
      'Exposure to supply chain risks'
    ],
    opportunities: [
      'Emerging market expansion',
      'Digital transformation & e-commerce growth',
      'New product category extensions'
    ],
    threats: [
      'Intensifying competition',
      'Changing consumer preferences',
      'Regulatory and compliance risks'
    ]
  };
}

function buildMetrics(text, wd, score) {
  const base = score;
  return [
    { name: 'Brand Power',        value: Math.min(99, base + 5) },
    { name: 'Market Penetration', value: Math.min(99, base - 5) },
    { name: 'Pricing Power',      value: Math.min(99, base - 10) },
    { name: 'Customer Loyalty',   value: Math.min(99, base + 2) },
    { name: 'Growth Potential',   value: Math.min(99, base - 8) }
  ];
}

function buildMoat(text, score) {
  const t = text.toLowerCase();
  let type = 'Brand Moat';
  if (t.includes('network') || t.includes('platform')) type = 'Network Effects';
  else if (t.includes('patent') || t.includes('proprietary')) type = 'IP / Patents';
  else if (t.includes('switch') || t.includes('ecosystem')) type = 'Switching Costs';
  else if (t.includes('cost') || t.includes('scale')) type = 'Cost Advantage';
  return {
    type,
    description: `${type} creates a durable competitive advantage. Customers and partners are deeply integrated into the ecosystem, making switching costly and reinforcing market position.`,
    strength: Math.min(95, score + 5)
  };
}

function computeScore(wiki, kg, wd) {
  let s = 40;
  if (wiki?.extract?.length > 200) s += 15;
  if (wiki?.thumbnail) s += 5;
  if (kg?.name) s += 10;
  if (wd?.revenue) s += 10;
  if (wd?.employees) s += 5;
  if (wd?.founded) s += 5;
  if (wd?.stockTicker) s += 5;
  if (wd?.industry) s += 5;
  return Math.min(97, s);
}

function scoreReason(s) {
  if (s >= 85) return 'Dominant global brand with strong data presence';
  if (s >= 70) return 'Well-established brand with solid market position';
  if (s >= 55) return 'Growing brand with moderate market presence';
  return 'Emerging brand with limited public data';
}

function guessUnitEconomics(bizType, text) {
  if (bizType.includes('SaaS')) return 'High gross margins (70-85%), recurring revenue, LTV >> CAC';
  if (bizType.includes('Marketplace')) return 'Asset-light model, take-rate driven, scales with GMV';
  if (bizType.includes('Advertising')) return 'Zero marginal cost per user, revenue scales with engagement';
  if (bizType.includes('Hardware')) return 'Lower hardware margins offset by high-margin services/ecosystem';
  return 'Brand premium drives above-average margins vs. category peers';
}

function guessPricing(text, bizType) {
  const t = text.toLowerCase();
  if (t.includes('premium') || t.includes('luxury')) return 'Premium pricing strategy — price signals quality and exclusivity, reinforcing brand positioning.';
  if (t.includes('free') || t.includes('freemium')) return 'Freemium model — free tier drives adoption, paid tiers monetize power users.';
  if (t.includes('subscription')) return 'Subscription pricing — predictable recurring revenue with tiered plans for different segments.';
  return 'Value-based pricing aligned with perceived brand equity and competitive positioning.';
}

function guessGrowth(text, bizType) {
  const t = text.toLowerCase();
  const strategies = [];
  if (t.includes('international') || t.includes('global')) strategies.push('International market expansion');
  if (t.includes('digital') || t.includes('online')) strategies.push('Digital channel acceleration');
  strategies.push('Product line extensions into adjacent categories');
  strategies.push('Strategic partnerships and co-branding');
  strategies.push('Community-led growth and brand advocacy');
  return strategies.slice(0, 4);
}

function guessPositioning(text, name) {
  const first = text.split('.')[0];
  return first.length > 20 ? first : `${name} positions itself as a category-defining brand in its core market.`;
}

function guessAudience(text, tags) {
  const t = text.toLowerCase();
  if (t.includes('young') || t.includes('youth') || t.includes('teen')) return 'Young adults and Gen Z consumers seeking identity-driven brands';
  if (t.includes('professional') || t.includes('enterprise') || t.includes('business')) return 'Business professionals and enterprise decision-makers';
  if (t.includes('family') || t.includes('children') || t.includes('parent')) return 'Families and parents across income segments';
  return 'Broad consumer base with core focus on aspirational middle-to-upper income segments';
}

function guessTactics(text, channels) {
  return [
    'Emotional storytelling campaigns',
    'Athlete / celebrity endorsements',
    'Limited edition product drops',
    'Community events and experiential marketing'
  ];
}

function guessMarketTags(text, wd) {
  const tags = [];
  if (wd.stockTicker) tags.push('Publicly Traded');
  if (wd.country) tags.push(wd.country);
  const t = text.toLowerCase();
  if (t.includes('global') || t.includes('worldwide') || t.includes('international')) tags.push('Global');
  else tags.push('Regional');
  return tags.slice(0, 3);
}

function buildInsight(text, wd, bizType) {
  const sentences = text.split('.').filter(s => s.trim().length > 40);
  const core = sentences[1] || sentences[0] || text.substring(0, 150);
  return `${core.trim()}. The real strategic advantage lies not just in the product, but in the brand's ability to command loyalty and pricing power that competitors cannot easily replicate.`;
}
