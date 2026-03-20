
const https = require('https');

function fetchURL(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { resolve(null); }
      });
    }).on('error', reject);
  });
}

async function getWikipediaData(query) {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=1`;
    const searchData = await fetchURL(searchUrl);
    if (!searchData?.query?.search?.length) return null;

    const pageId = searchData.query.search[0].pageid;
    const detailUrl = `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageId}&prop=extracts|pageprops|info&exintro=true&explaintext=true&inprop=url&format=json`;
    const detail = await fetchURL(detailUrl);
    const page = detail?.query?.pages?.[pageId];
    if (!page) return null;

    return {
      title: page.title,
      extract: page.extract?.slice(0, 1200) || '',
      url: page.fullurl || ''
    };
  } catch(e) { return null; }
}

async function getWikidataInfo(query) {
  try {
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&format=json&limit=1&type=item`;
    const searchData = await fetchURL(searchUrl);
    if (!searchData?.search?.length) return null;

    const entityId = searchData.search[0].id;
    const entityUrl = `https://www.wikidata.org/wiki/Special:EntityData/${entityId}.json`;
    const entityData = await fetchURL(entityUrl);
    const entity = entityData?.entities?.[entityId];
    if (!entity) return null;

    const claims = entity.claims || {};
    const get = (prop) => {
      try {
        const val = claims[prop]?.[0]?.mainsnak?.datavalue?.value;
        if (typeof val === 'object' && val.amount) return val.amount.replace('+','');
        if (typeof val === 'object' && val.time) return val.time.slice(1,5);
        if (typeof val === 'string') return val;
        return null;
      } catch(e) { return null; }
    };

    const getLabel = async (prop) => {
      try {
        const qid = claims[prop]?.[0]?.mainsnak?.datavalue?.value?.id;
        if (!qid) return null;
        const labelUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${qid}&props=labels&languages=en&format=json`;
        const labelData = await fetchURL(labelUrl);
        return labelData?.entities?.[qid]?.labels?.en?.value || null;
      } catch(e) { return null; }
    };

    const [country, industry, ceo] = await Promise.all([
      getLabel('P17'),
      getLabel('P452'),
      getLabel('P169')
    ]);

    return {
      entityId,
      founded: get('P571'),
      revenue: get('P2139'),
      employees: get('P1082'),
      website: get('P856'),
      stockSymbol: get('P249'),
      headquarters: await getLabel('P159'),
      country,
      industry,
      ceo,
      founder: await getLabel('P112'),
    };
  } catch(e) { return null; }
}

async function getKnowledgeGraph(query, apiKey) {
  if (!apiKey) return null;
  try {
    const url = `https://kgsearch.googleapis.com/v1/entities:search?query=${encodeURIComponent(query)}&key=${apiKey}&limit=1&indent=True`;
    const data = await fetchURL(url);
    const item = data?.itemListElement?.[0]?.result;
    if (!item) return null;
    return {
      name: item.name,
      description: item.description,
      detailedDescription: item.detailedDescription?.articleBody || '',
      url: item.url || '',
      types: item['@type'] || []
    };
  } catch(e) { return null; }
}

function formatRevenue(raw) {
  if (!raw) return null;
  const num = parseFloat(raw);
  if (isNaN(num)) return raw;
  if (num >= 1e12) return `$${(num/1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num/1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num/1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
}

function formatEmployees(raw) {
  if (!raw) return null;
  const num = parseInt(raw);
  if (isNaN(num)) return raw;
  if (num >= 1e6) return `${(num/1e6).toFixed(1)}M+`;
  if (num >= 1e3) return `${(num/1e3).toFixed(0)}K+`;
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
    const [wiki, wikidata, kg] = await Promise.all([
      getWikipediaData(query),
      getWikidataInfo(query),
      getKnowledgeGraph(query, apiKey)
    ]);

    // If absolutely nothing found
    if (!wiki && !wikidata && !kg) {
      return res.status(404).json({
        found: false,
        name: query,
        message: `No data found for "${query}". This brand may not have a public online presence or Wikipedia/Google listing yet.`
      });
    }

    // Build real response from actual data
    const name = kg?.name || wiki?.title || query;
    const description = kg?.detailedDescription || wiki?.extract || kg?.description || 'No description available.';
    const website = wikidata?.website || kg?.url || null;
    const founded = wikidata?.founded || null;
    const revenue = formatRevenue(wikidata?.revenue);
    const employees = formatEmployees(wikidata?.employees);
    const headquarters = wikidata?.headquarters || null;
    const country = wikidata?.country || null;
    const industry = wikidata?.industry || null;
    const ceo = wikidata?.ceo || null;
    const founder = wikidata?.founder || null;
    const stockSymbol = wikidata?.stockSymbol || null;
    const wikiUrl = wiki?.url || null;
    const entityId = wikidata?.entityId || null;

    return res.status(200).json({
      found: true,
      name,
      description,
      website,
      founded,
      revenue,
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
        wikidata: !!wikidata,
        googleKG: !!kg
      }
    });

  } catch(err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
};
