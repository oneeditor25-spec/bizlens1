const https = require('https');

// ── Hardcoded brand database ──────────────────────────────────────────────────
const BRANDS = {
  "nike": {
    name: "Nike, Inc.", founded: "1964", headquarters: "Beaverton, Oregon, USA",
    industry: "Sportswear & Athletic Footwear", ceo: "John Donahoe",
    founder: "Phil Knight, Bill Bowerman", employees: "79,000+",
    revenue: "$51.4B", stockSymbol: "NKE", website: "https://www.nike.com",
    description: "Nike, Inc. is the world's largest supplier of athletic shoes and apparel. Founded in 1964 as Blue Ribbon Sports, it became Nike in 1971. The company designs, develops, and sells footwear, apparel, equipment, and accessories worldwide.",
    country: "USA"
  },
  "apple": {
    name: "Apple Inc.", founded: "1976", headquarters: "Cupertino, California, USA",
    industry: "Consumer Electronics & Software", ceo: "Tim Cook",
    founder: "Steve Jobs, Steve Wozniak, Ronald Wayne", employees: "164,000+",
    revenue: "$383B", stockSymbol: "AAPL", website: "https://www.apple.com",
    description: "Apple Inc. is an American multinational technology company that designs, develops, and sells consumer electronics, computer software, and online services. It is the world's most valuable company by market cap.",
    country: "USA"
  },
  "google": {
    name: "Google LLC", founded: "1998", headquarters: "Mountain View, California, USA",
    industry: "Internet & Technology", ceo: "Sundar Pichai",
    founder: "Larry Page, Sergey Brin", employees: "182,000+",
    revenue: "$307B", stockSymbol: "GOOGL", website: "https://www.google.com",
    description: "Google LLC is an American multinational technology company focusing on search engine technology, online advertising, cloud computing, and AI. It is a subsidiary of Alphabet Inc.",
    country: "USA"
  },
  "amazon": {
    name: "Amazon.com, Inc.", founded: "1994", headquarters: "Seattle, Washington, USA",
    industry: "E-Commerce & Cloud Computing", ceo: "Andy Jassy",
    founder: "Jeff Bezos", employees: "1.5M+",
    revenue: "$574B", stockSymbol: "AMZN", website: "https://www.amazon.com",
    description: "Amazon is the world's largest e-commerce and cloud computing company. It started as an online bookstore and expanded to electronics, streaming, AI, and logistics.",
    country: "USA"
  },
  "microsoft": {
    name: "Microsoft Corporation", founded: "1975", headquarters: "Redmond, Washington, USA",
    industry: "Software & Cloud Computing", ceo: "Satya Nadella",
    founder: "Bill Gates, Paul Allen", employees: "221,000+",
    revenue: "$245B", stockSymbol: "MSFT", website: "https://www.microsoft.com",
    description: "Microsoft is a global technology company known for Windows OS, Office suite, Azure cloud, Xbox, and LinkedIn. It is one of the most valuable companies in the world.",
    country: "USA"
  },
  "tesla": {
    name: "Tesla, Inc.", founded: "2003", headquarters: "Austin, Texas, USA",
    industry: "Electric Vehicles & Clean Energy", ceo: "Elon Musk",
    founder: "Elon Musk, Martin Eberhard, Marc Tarpenning", employees: "140,000+",
    revenue: "$97.7B", stockSymbol: "TSLA", website: "https://www.tesla.com",
    description: "Tesla designs and manufactures electric vehicles, battery energy storage, solar panels, and AI-driven autonomous driving systems. It is the world's most valuable automaker.",
    country: "USA"
  },
  "meta": {
    name: "Meta Platforms, Inc.", founded: "2004", headquarters: "Menlo Park, California, USA",
    industry: "Social Media & Technology", ceo: "Mark Zuckerberg",
    founder: "Mark Zuckerberg", employees: "86,000+",
    revenue: "$134B", stockSymbol: "META", website: "https://www.meta.com",
    description: "Meta owns Facebook, Instagram, WhatsApp, and Threads. It is the world's largest social media company and is investing heavily in the metaverse and AI.",
    country: "USA"
  },
  "netflix": {
    name: "Netflix, Inc.", founded: "1997", headquarters: "Los Gatos, California, USA",
    industry: "Streaming & Entertainment", ceo: "Greg Peters",
    founder: "Reed Hastings, Marc Randolph", employees: "13,000+",
    revenue: "$36.8B", stockSymbol: "NFLX", website: "https://www.netflix.com",
    description: "Netflix is the world's leading streaming entertainment service with over 260 million subscribers in 190+ countries. It produces original films, series, and documentaries.",
    country: "USA"
  },
  "spotify": {
    name: "Spotify Technology S.A.", founded: "2006", headquarters: "Stockholm, Sweden",
    industry: "Music Streaming", ceo: "Daniel Ek",
    founder: "Daniel Ek, Martin Lorentzon", employees: "9,800+",
    revenue: "$15.7B", stockSymbol: "SPOT", website: "https://www.spotify.com",
    description: "Spotify is the world's largest music streaming platform with over 600 million users. It offers music, podcasts, and audiobooks across 180+ markets.",
    country: "Sweden"
  },
  "samsung": {
    name: "Samsung Electronics Co., Ltd.", founded: "1969", headquarters: "Suwon, South Korea",
    industry: "Consumer Electronics & Semiconductors", ceo: "Jong-Hee Han",
    founder: "Lee Byung-chul", employees: "270,000+",
    revenue: "$224B", stockSymbol: "005930.KS", website: "https://www.samsung.com",
    description: "Samsung is the world's largest manufacturer of smartphones, semiconductors, and consumer electronics. It is South Korea's largest conglomerate.",
    country: "South Korea"
  },
  "tata": {
    name: "Tata Group", founded: "1868", headquarters: "Mumbai, Maharashtra, India",
    industry: "Conglomerate (Steel, IT, Auto, Retail)", ceo: "N. Chandrasekaran",
    founder: "Jamsetji Tata", employees: "935,000+",
    revenue: "$165B", stockSymbol: "TATAMOTORS.NS", website: "https://www.tata.com",
    description: "Tata Group is India's largest conglomerate with operations in steel, automobiles (Tata Motors, Jaguar Land Rover), IT (TCS), retail, hospitality, and more.",
    country: "India"
  },
  "tata motors": {
    name: "Tata Motors Limited", founded: "1945", headquarters: "Mumbai, Maharashtra, India",
    industry: "Automobile Manufacturing", ceo: "Shailesh Chandra",
    founder: "Jamsetji Tata", employees: "83,000+",
    revenue: "$44B", stockSymbol: "TATAMOTORS.NS", website: "https://www.tatamotors.com",
    description: "Tata Motors is India's largest automobile manufacturer and owns Jaguar Land Rover. It produces cars, trucks, buses, and electric vehicles.",
    country: "India"
  },
  "reliance": {
    name: "Reliance Industries Limited", founded: "1966", headquarters: "Mumbai, Maharashtra, India",
    industry: "Conglomerate (Oil, Telecom, Retail)", ceo: "Mukesh Ambani",
    founder: "Dhirubhai Ambani", employees: "236,000+",
    revenue: "$120B", stockSymbol: "RELIANCE.NS", website: "https://www.ril.com",
    description: "Reliance Industries is India's most valuable company. It operates in petrochemicals, oil refining, telecom (Jio), retail (JioMart), and digital services.",
    country: "India"
  },
  "jio": {
    name: "Reliance Jio Infocomm Limited", founded: "2007", headquarters: "Mumbai, Maharashtra, India",
    industry: "Telecommunications", ceo: "Akash Ambani",
    founder: "Mukesh Ambani", employees: "50,000+",
    revenue: "$14B", stockSymbol: "RELIANCE.NS", website: "https://www.jio.com",
    description: "Jio is India's largest telecom operator with over 450 million subscribers. It disrupted the Indian telecom market with affordable 4G/5G data plans.",
    country: "India"
  },
  "zomato": {
    name: "Zomato Limited", founded: "2008", headquarters: "Gurugram, Haryana, India",
    industry: "Food Delivery & Technology", ceo: "Deepinder Goyal",
    founder: "Deepinder Goyal, Pankaj Chaddah", employees: "6,000+",
    revenue: "$1.4B", stockSymbol: "ZOMATO.NS", website: "https://www.zomato.com",
    description: "Zomato is India's leading food delivery and restaurant discovery platform operating in 800+ cities. It also owns Blinkit for quick commerce.",
    country: "India"
  },
  "swiggy": {
    name: "Swiggy", founded: "2014", headquarters: "Bengaluru, Karnataka, India",
    industry: "Food Delivery & Quick Commerce", ceo: "Sriharsha Majety",
    founder: "Sriharsha Majety, Nandan Reddy, Rahul Jaimini", employees: "5,000+",
    revenue: "$1.2B", stockSymbol: "SWIGGY.NS", website: "https://www.swiggy.com",
    description: "Swiggy is one of India's largest food delivery platforms operating in 500+ cities. It also offers Instamart for 10-minute grocery delivery.",
    country: "India"
  },
  "flipkart": {
    name: "Flipkart Private Limited", founded: "2007", headquarters: "Bengaluru, Karnataka, India",
    industry: "E-Commerce", ceo: "Kalyan Krishnamurthy",
    founder: "Sachin Bansal, Binny Bansal", employees: "30,000+",
    revenue: "$8B", stockSymbol: "Private", website: "https://www.flipkart.com",
    description: "Flipkart is India's largest e-commerce marketplace, owned by Walmart. It sells electronics, fashion, groceries, and more across India.",
    country: "India"
  },
  "infosys": {
    name: "Infosys Limited", founded: "1981", headquarters: "Bengaluru, Karnataka, India",
    industry: "IT Services & Consulting", ceo: "Salil Parekh",
    founder: "N. R. Narayana Murthy", employees: "317,000+",
    revenue: "$18.6B", stockSymbol: "INFY", website: "https://www.infosys.com",
    description: "Infosys is India's second-largest IT company providing software development, consulting, and outsourcing services to global clients.",
    country: "India"
  },
  "wipro": {
    name: "Wipro Limited", founded: "1945", headquarters: "Bengaluru, Karnataka, India",
    industry: "IT Services & Consulting", ceo: "Srinivas Pallia",
    founder: "M. H. Hasham Premji", employees: "240,000+",
    revenue: "$11.3B", stockSymbol: "WIT", website: "https://www.wipro.com",
    description: "Wipro is a leading global IT, consulting, and business process services company headquartered in India.",
    country: "India"
  },
  "tcs": {
    name: "Tata Consultancy Services", founded: "1968", headquarters: "Mumbai, Maharashtra, India",
    industry: "IT Services & Consulting", ceo: "K Krithivasan",
    founder: "J. R. D. Tata", employees: "614,000+",
    revenue: "$29B", stockSymbol: "TCS.NS", website: "https://www.tcs.com",
    description: "TCS is India's largest IT company and one of the world's top IT services firms, providing software, consulting, and digital transformation services.",
    country: "India"
  },
  "amul": {
    name: "Amul (GCMMF)", founded: "1946", headquarters: "Anand, Gujarat, India",
    industry: "Dairy & Food Products", ceo: "Jayen Mehta",
    founder: "Tribhuvandas Patel, Verghese Kurien", employees: "10,000+",
    revenue: "$9.5B", stockSymbol: "Cooperative", website: "https://www.amul.com",
    description: "Amul is India's largest dairy cooperative and food brand, known for butter, milk, cheese, and ice cream. It is managed by Gujarat Cooperative Milk Marketing Federation.",
    country: "India"
  },
  "paytm": {
    name: "One97 Communications (Paytm)", founded: "2010", headquarters: "Noida, Uttar Pradesh, India",
    industry: "Fintech & Digital Payments", ceo: "Vijay Shekhar Sharma",
    founder: "Vijay Shekhar Sharma", employees: "11,000+",
    revenue: "$1.1B", stockSymbol: "PAYTM.NS", website: "https://www.paytm.com",
    description: "Paytm is India's leading digital payments and financial services company offering mobile payments, banking, insurance, and lending services.",
    country: "India"
  },
  "ola": {
    name: "ANI Technologies (Ola Cabs)", founded: "2010", headquarters: "Bengaluru, Karnataka, India",
    industry: "Ride-Hailing & Mobility", ceo: "Hemant Bakshi",
    founder: "Bhavish Aggarwal, Ankit Bhati", employees: "5,000+",
    revenue: "$1B", stockSymbol: "Private", website: "https://www.olacabs.com",
    description: "Ola is India's largest ride-hailing platform operating in 250+ cities. It also has Ola Electric for electric scooters.",
    country: "India"
  },
  "byju's": {
    name: "BYJU'S (Think & Learn Pvt. Ltd.)", founded: "2011", headquarters: "Bengaluru, Karnataka, India",
    industry: "EdTech", ceo: "Byju Raveendran",
    founder: "Byju Raveendran", employees: "50,000+",
    revenue: "$1.2B", stockSymbol: "Private", website: "https://byjus.com",
    description: "BYJU'S is India's largest edtech company offering online learning for K-12 students and competitive exam preparation.",
    country: "India"
  },
  "airbnb": {
    name: "Airbnb, Inc.", founded: "2008", headquarters: "San Francisco, California, USA",
    industry: "Travel & Hospitality", ceo: "Brian Chesky",
    founder: "Brian Chesky, Joe Gebbia, Nathan Blecharczyk", employees: "6,900+",
    revenue: "$9.9B", stockSymbol: "ABNB", website: "https://www.airbnb.com",
    description: "Airbnb is an online marketplace for short-term homestays and experiences. It operates in 220+ countries with over 7 million listings.",
    country: "USA"
  },
  "uber": {
    name: "Uber Technologies, Inc.", founded: "2009", headquarters: "San Francisco, California, USA",
    industry: "Ride-Hailing & Delivery", ceo: "Dara Khosrowshahi",
    founder: "Travis Kalanick, Garrett Camp", employees: "32,000+",
    revenue: "$37.3B", stockSymbol: "UBER", website: "https://www.uber.com",
    description: "Uber is the world's largest ride-hailing company operating in 70+ countries. It also offers Uber Eats food delivery and freight services.",
    country: "USA"
  },
  "twitter": {
    name: "X (formerly Twitter)", founded: "2006", headquarters: "San Francisco, California, USA",
    industry: "Social Media", ceo: "Linda Yaccarino",
    founder: "Jack Dorsey, Noah Glass, Biz Stone, Ev Williams", employees: "1,500+",
    revenue: "$3.4B", stockSymbol: "Private", website: "https://www.x.com",
    description: "X (formerly Twitter) is a social media platform for real-time news, discussions, and short-form content. It was acquired by Elon Musk in 2022.",
    country: "USA"
  },
  "x": {
    name: "X (formerly Twitter)", founded: "2006", headquarters: "San Francisco, California, USA",
    industry: "Social Media", ceo: "Linda Yaccarino",
    founder: "Jack Dorsey", employees: "1,500+",
    revenue: "$3.4B", stockSymbol: "Private", website: "https://www.x.com",
    description: "X (formerly Twitter) is a social media platform for real-time news and discussions, acquired by Elon Musk in 2022.",
    country: "USA"
  },
  "openai": {
    name: "OpenAI", founded: "2015", headquarters: "San Francisco, California, USA",
    industry: "Artificial Intelligence", ceo: "Sam Altman",
    founder: "Sam Altman, Elon Musk, Greg Brockman", employees: "3,000+",
    revenue: "$3.7B", stockSymbol: "Private", website: "https://www.openai.com",
    description: "OpenAI is an AI research company known for ChatGPT, GPT-4, DALL-E, and Sora. It is one of the most valuable AI startups in the world.",
    country: "USA"
  },
  "red bull": {
    name: "Red Bull GmbH", founded: "1984", headquarters: "Fuschl am See, Austria",
    industry: "Energy Drinks & Beverages", ceo: "Franz Watzlawick",
    founder: "Dietrich Mateschitz, Chaleo Yoovidhya", employees: "15,000+",
    revenue: "$11.6B", stockSymbol: "Private", website: "https://www.redbull.com",
    description: "Red Bull is the world's leading energy drink brand, selling over 12 billion cans annually in 175+ countries. It is also known for extreme sports sponsorships.",
    country: "Austria"
  },
  "coca cola": {
    name: "The Coca-Cola Company", founded: "1892", headquarters: "Atlanta, Georgia, USA",
    industry: "Beverages", ceo: "James Quincey",
    founder: "Asa Griggs Candler", employees: "82,500+",
    revenue: "$45.8B", stockSymbol: "KO", website: "https://www.coca-colacompany.com",
    description: "Coca-Cola is the world's largest beverage company, selling over 500 brands in 200+ countries including Coke, Sprite, Fanta, and Minute Maid.",
    country: "USA"
  },
  "pepsi": {
    name: "PepsiCo, Inc.", founded: "1965", headquarters: "Purchase, New York, USA",
    industry: "Beverages & Snacks", ceo: "Ramon Laguarta",
    founder: "Donald Kendall, Herman Lay", employees: "318,000+",
    revenue: "$91.5B", stockSymbol: "PEP", website: "https://www.pepsico.com",
    description: "PepsiCo is a global food and beverage company known for Pepsi, Lay's, Gatorade, Tropicana, and Quaker. It operates in 200+ countries.",
    country: "USA"
  },
  "adidas": {
    name: "Adidas AG", founded: "1949", headquarters: "Herzogenaurach, Germany",
    industry: "Sportswear & Athletic Footwear", ceo: "Bjørn Gulden",
    founder: "Adolf Dassler", employees: "59,000+",
    revenue: "$25.2B", stockSymbol: "ADS.DE", website: "https://www.adidas.com",
    description: "Adidas is the world's second-largest sportswear manufacturer, known for footwear, apparel, and accessories. It owns Reebok and sponsors major sports events.",
    country: "Germany"
  },
  "hdfc": {
    name: "HDFC Bank Limited", founded: "1994", headquarters: "Mumbai, Maharashtra, India",
    industry: "Banking & Financial Services", ceo: "Sashidhar Jagdishan",
    founder: "Hasmukhbhai Parekh", employees: "213,000+",
    revenue: "$28B", stockSymbol: "HDFCBANK.NS", website: "https://www.hdfcbank.com",
    description: "HDFC Bank is India's largest private sector bank offering retail banking, wholesale banking, and treasury operations.",
    country: "India"
  },
  "icici": {
    name: "ICICI Bank Limited", founded: "1994", headquarters: "Mumbai, Maharashtra, India",
    industry: "Banking & Financial Services", ceo: "Sandeep Bakhshi",
    founder: "ICICI Limited", employees: "130,000+",
    revenue: "$20B", stockSymbol: "ICICIBANK.NS", website: "https://www.icicibank.com",
    description: "ICICI Bank is India's second-largest private sector bank offering banking, insurance, and investment services.",
    country: "India"
  }
};

// ── Wikipedia fallback ────────────────────────────────────────────────────────
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
      extract: (page.extract || '').slice(0, 1200),
      url: page.fullurl || ('https://en.wikipedia.org/wiki/' + encodeURIComponent(page.title))
    };
  } catch(e) { return null; }
}

// ── Main handler ──────────────────────────────────────────────────────────────
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const product = (req.body && req.body.product) ? req.body.product.trim() : '';
  if (!product || product.length < 2) return res.status(400).json({ error: 'Enter a valid name.' });

  const key = product.toLowerCase();

  // 1️⃣ Check hardcoded database first (instant, always works)
  if (BRANDS[key]) {
    const b = BRANDS[key];
    return res.status(200).json({
      found: true,
      source: 'database',
      name: b.name,
      description: b.description,
      website: b.website,
      founded: b.founded,
      revenue: b.revenue,
      employees: b.employees,
      headquarters: b.headquarters,
      country: b.country,
      industry: b.industry,
      ceo: b.ceo,
      founder: b.founder,
      stockSymbol: b.stockSymbol,
      wikiUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(b.name)}`
    });
  }

  // 2️⃣ Try partial match in database
  const partialKey = Object.keys(BRANDS).find(k => k.includes(key) || key.includes(k));
  if (partialKey) {
    const b = BRANDS[partialKey];
    return res.status(200).json({
      found: true,
      source: 'database',
      name: b.name,
      description: b.description,
      website: b.website,
      founded: b.founded,
      revenue: b.revenue,
      employees: b.employees,
      headquarters: b.headquarters,
      country: b.country,
      industry: b.industry,
      ceo: b.ceo,
      founder: b.founder,
      stockSymbol: b.stockSymbol,
      wikiUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(b.name)}`
    });
  }

  // 3️⃣ Wikipedia fallback for unknown brands
  const wiki = await getWikipedia(product);
  if (wiki) {
    return res.status(200).json({
      found: true,
      source: 'wikipedia',
      name: wiki.title,
      description: wiki.extract,
      website: null,
      founded: null,
      revenue: null,
      employees: null,
      headquarters: null,
      country: null,
      industry: null,
      ceo: null,
      founder: null,
      stockSymbol: null,
      wikiUrl: wiki.url
    });
  }

  // 4️⃣ Nothing found
  return res.status(200).json({
    found: false,
    name: product,
    message: `No data found for "${product}". Try the full official name.`
  });
};
