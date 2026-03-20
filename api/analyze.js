
const https = require('https');

function fetchURL(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'BizLens/1.0 (https://bizlens.vercel.app; contact@bizlens.in) Node.js',
        'Accept': 'application/json',
        ...headers
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { resolve(null); }
      });
    }).on('error', (e) => {
      console.error('fetchURL error:', url, e.message);
      resolve(null);
    });
  });
}

async function getWikipediaData(query) {
  try {
    const encoded = encodeURIComponent(query);
    // Step 1: search
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encoded}&format=json&srlimit=3&origin=*`;
    const searchData = await fetchURL(searchUrl);
    if (!searchData?.query?.search?.length) return null;

    const pageId = searchData.query.search[0].pageid;

    // Step 2: get extract
    const detailUrl = `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageId}&prop=extracts|info&exintro=true&explaintext=true&inprop=url&format=json&origin=*`;
    const detail = await fetchURL(detailUrl);
    const page = detail?.query?.pages?.[pageId];
    if (!page || page.missing !== undefined) return null;

    return {
      title: page.title,
      extract: (page.extract || '').slice(0, 1500),
      url: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`
    };
  } catch(e) {
    console.error('Wikipedia error:', e.message);
    return null;
  }
}

async function getWikidataInfo(query) {
  try {
    const encoded = encodeURIComponent(query);
    // Search wikidata
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encoded}&language=en&format=json&limit=3&type=item&origin=*`;
    const searchData = await fetchURL(searchUrl);
    if (!searchData?.search?.length) return null;

    const entityId = searchData.search[0].id;

    // Get entity claims
    const entityUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${entityId}&props=claims|labels|descriptions&languages=en&format=json&origin=*`;
    const entityData = await fetchURL(entityUrl);
    const entity = entityData?.entities?.[entityId];
    if (!entity) return null;

    const claims = entity.claims || {};

    function getVal(prop) {
      try {
        const snak = claims[prop]?.[0]?.mainsnak;
        if (!snak || snak.snaktype !== 'value') return null;
        const val = snak.datavalue?.value;
        if (!val) return null;
        if (typeof val === 'string') return val;
        if (val.amount) return val.amount.replace('+', '');
        if (val.time) return val.time.slice(1, 5); // year only
        if (val.text) return val.text;
        return null;
      } catch(e) { return null; }
    }

    async function getLabel(prop) {
      try {
        const qid = claims[prop]?.[0]?.mainsnak?.datavalue?.value?.id;
        if (!qid) return null;
        const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${qid}&props=labels&languages=en&format=json&origin=*`;
        const data = await fetchURL(url);
        return data?.entities?.[qid]?.labels?.en?.value || null;
      } catch(e) { return null; }
    }

    // Fetch labels in parallel
    const [country, industry, ceo, founder, hq] = await Promise.all([
      getLabel('P17'),   // country
      getLabel('P452'),  // industry
      getLabel('P169'),  // CEO
      getLabel('P112'),  // founder
      getLabel('P159'),  // HQ location
    ]);

    return {
      entityId,
      founded: getVal('P571'),
      revenue: getVal('P2139'),
      employees: getVal('P1082'),
      website: getVal('P856'),
      stockSymbol: getVal('P249'),
      netWorth: getVal('P2218'),
      country,
      industry,
      ceo,
      founder,
      headquarters: hq,
    };
  } catch(e) {
    console.error('Wikidata error:', e.message);
    return null;
  }
}

async function getKnowledgeGraph(query, apiKey) {
  if (!apiKey) return null;
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://kgsearch.googleapis.com/v1/entities:search?query=${encoded}&key=${apiKey}&limit=1&indent=True`;
    const data = await fetchURL(url);
    const item = data?.itemListElement?.[0]?.result;
    if (!item) return null;
    return {
      name: item.name || null,
      description: item.description || null,
      detailedDescription: item.detailedDescription?.articleBody || null,
      url: item.url || null,
      types: item['@type'] || []
    };
  } catch(e) {
    console.error('KG error:', e.message);
    return null;
  }
}

function formatRevenue(raw) {
  if (!raw) return null;
  const num = parseFloat(raw);
  if (isNaN(num)) return null;
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9)  return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6)  return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
}

function formatEmployees(raw) {
  if (!raw) return null;
  const num = parseInt(raw);
  if (isNaN(num)) return null;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M+`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(0)}K+`;
  return num.toLocaleString();
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { product } = req.body || {};
  if (!product || product.trim().length < 2) {
    return res.status(400).json({ error: 'Please enter a valid brand or company name.' });
  }

  const query = product.trim();
  const apiKey = process.env.GOOGLE_API_KEY || null;

  try {
    console.log('Analyzing:', query);

    // Run all 3 in parallel
    const [wiki, wikidata, kg] = await Promise.all([
      getWikipediaData(query),
      getWikidataInfo(query),
      getKnowledgeGraph(query, apiKey)
    ]);

    console.log('wiki:', !!wiki, 'wikidata:', !!wikidata, 'kg:', !!kg);

    // Nothing found at all
    if (!wiki && !wikidata && !kg) {
      return res.status(200).json({
        found: false,
        name: query,
        message: `No public data found for "${query}". This brand may not have a Wikipedia or Google listing yet. Try the full official name.`
      });
    }

    const name        = kg?.name || wiki?.title || query;
    const description = kg?.detailedDescription || wiki?.extract || kg?.description || null;
    const website     = wikidata?.website || kg?.url || null;
    const founded     = wikidata?.founded || null;
    const revenue     = formatRevenue(wikidata?.revenue);
    const netWorth    = formatRevenue(wikidata?.netWorth);
    const employees   = formatEmployees(wikidata?.employees);
    const headquarters = wikidata?.headquarters || null;
    const country     = wikidata?.country || null;
    const industry    = wikidata?.industry || null;
    const ceo         = wikidata?.ceo || null;
    const founder     = wikidata?.founder || null;
    const stockSymbol = wikidata?.stockSymbol || null;
    const wikiUrl     = wiki?.url || null;
    const entityId    = wikidata?.entityId || null;

    return res.status(200).json({
      found: true,
      name,
      description,
      website,
      founded,
      revenue,
      netWorth,
      employees,
      headquarters,
      country,
      industry,
      ceo,
      founder,
      stockSymbol,
      wikiUrl,
      wikidataUrl: entityId ? `https://www.wikidata.org/wiki/${entityId}` : null,
      sources: {
        wikipedia: !!wiki,
        wikidata:  !!wikidata,
        googleKG:  !!kg
      }
    });

  } catch(err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
};
