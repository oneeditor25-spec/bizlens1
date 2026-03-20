const https = require('https');

function fetchURL(url) {
  return new Promise((resolve) => {
    const options = {
      headers: {
        'User-Agent': 'BizLens/1.0 (https://bizlens.vercel.app) Node.js',
        'Accept': 'application/json'
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

async function getWikipedia(query) {
  try {
    const q = encodeURIComponent(query);
    const s = await fetchURL(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${q}&format=json&srlimit=3&origin=*`);
    if (!s || !s.query || !s.query.search || !s.query.search.length) return null;
    const pid = s.query.search[0].pageid;
    const d = await fetchURL(`https://en.wikipedia.org/w/api.php?action=query&pageids=${pid}&prop=extracts|info&exintro=true&explaintext=true&inprop=url&format=json&origin=*`);
    const page = d && d.query && d.query.pages && d.query.pages[pid];
    if (!page || page.missing !== undefined) return null;
    return {
      title: page.title,
      extract: (page.extract || '').slice(0, 1500),
      url: page.fullurl || ('https://en.wikipedia.org/wiki/' + encodeURIComponent(page.title))
    };
  } catch(e) { return null; }
}

async function getWikidata(query) {
  try {
    const q = encodeURIComponent(query);
    const s = await fetchURL(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${q}&language=en&format=json&limit=1&type=item&origin=*`);
    if (!s || !s.search || !s.search.length) return null;
    const eid = s.search[0].id;
    const e = await fetchURL(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${eid}&props=claims&languages=en&format=json&origin=*`);
    const claims = (e && e.entities && e.entities[eid] && e.entities[eid].claims) || {};

    function gv(prop) {
      try {
        const snak = claims[prop][0].mainsnak;
        if (snak.snaktype !== 'value') return null;
        const v = snak.datavalue.value;
        if (typeof v === 'string') return v;
        if (v.amount) return v.amount.replace('+','');
        if (v.time) return v.time.slice(1,5);
        return null;
      } catch(e) { return null; }
    }

    async function gl(prop) {
      try {
        const qid = claims[prop][0].mainsnak.datavalue.value.id;
        if (!qid) return null;
        const r = await fetchURL(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${qid}&props=labels&languages=en&format=json&origin=*`);
        return (r && r.entities && r.entities[qid] && r.entities[qid].labels && r.entities[qid].labels.en && r.entities[qid].labels.en.value) || null;
      } catch(e) { return null; }
    }

    const [country, industry, ceo, founder, hq] = await Promise.all([
      gl('P17'), gl('P452'), gl('P169'), gl('P112'), gl('P159')
    ]);

    return {
      entityId: eid,
      founded: gv('P571'),
      revenue: gv('P2139'),
      employees: gv('P1082'),
      website: gv('P856'),
      stockSymbol: gv('P249'),
      country, industry, ceo, founder, headquarters: hq
    };
  } catch(e) { return null; }
}

function fmtMoney(raw) {
  if (!raw) return null;
  const n = parseFloat(raw);
  if (isNaN(n)) return null;
  if (n >= 1e12) return '$' + (n/1e12).toFixed(2) + 'T';
  if (n >= 1e9)  return '$' + (n/1e9).toFixed(2) + 'B';
  if (n >= 1e6)  return '$' + (n/1e6).toFixed(2) + 'M';
  return '$' + n.toLocaleString();
}

function fmtEmp(raw) {
  if (!raw) return null;
  const n = parseInt(raw);
  if (isNaN(n)) return null;
  if (n >= 1e6) return (n/1e6).toFixed(1) + 'M+';
  if (n >= 1e3) return (n/1e3).toFixed(0) + 'K+';
  return n.toLocaleString();
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const product = (req.body && req.body.product) ? req.body.product.trim() : '';
  if (!product || product.length < 2) return res.status(400).json({ error: 'Enter a valid name.' });

  try {
    const [wiki, wd] = await Promise.all([getWikipedia(product), getWikidata(product)]);

    if (!wiki && !wd) {
      return res.status(200).json({
        found: false,
        name: product,
        message: 'No public data found for "' + product + '". Try the full official name (e.g. "Tata Motors" instead of "Tata").'
      });
    }

    return res.status(200).json({
      found: true,
      name: (wiki && wiki.title) || product,
      description: (wiki && wiki.extract) || null,
      website: (wd && wd.website) || null,
      founded: (wd && wd.founded) || null,
      revenue: fmtMoney(wd && wd.revenue),
      employees: fmtEmp(wd && wd.employees),
      headquarters: (wd && wd.headquarters) || null,
      country: (wd && wd.country) || null,
      industry: (wd && wd.industry) || null,
      ceo: (wd && wd.ceo) || null,
      founder: (wd && wd.founder) || null,
      stockSymbol: (wd && wd.stockSymbol) || null,
      wikiUrl: (wiki && wiki.url) || null,
      wikidataUrl: (wd && wd.entityId) ? 'https://www.wikidata.org/wiki/' + wd.entityId : null,
      sources: { wikipedia: !!wiki, wikidata: !!wd }
    });
  } catch(err) {
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
};
