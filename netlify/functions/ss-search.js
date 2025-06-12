// netlify/functions/ss-search.js

// تخزين مؤقّت في الذاكرة لمدة 10 دقائق
let cache = {};

exports.handler = async function(event) {
  const q = event.queryStringParameters && event.queryStringParameters.q;
  if (!q) {
    return {
      statusCode: 400,
      body: 'Missing query parameter q'
    };
  }

  // إذا كانت النتيجة مخزنة وحديثة، أعدها فورًا
  if (cache[q] && (Date.now() - cache[q].ts) < 1000 * 60 * 10) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cache[q].data)
    };
  }

  // استعلام Semantic Scholar
  const url = `https://api.semanticscholar.org/graph/v1/paper/search`
            + `?query=${encodeURIComponent(q)}`
            + `&limit=5&fields=title,year,authors,url`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    // خزّن النتيجة مع الطابع الزمني
    cache[q] = { ts: Date.now(), data };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: err.message
    };
  }
};
