// netlify/functions/ss-search.js
let cache = {};

exports.handler = async function(event) {
  const params = event.queryStringParameters || {};
  const qRaw = params.q;
  if (!qRaw) return { statusCode: 400, body: 'Missing query parameter q' };

  let limit = 20;
  let offset = 0;
  if (params.limit) {
    const n = parseInt(params.limit);
    if (!isNaN(n) && n > 0 && n <= 100) limit = n;
  }
  if (params.page) {
    const p = parseInt(params.page);
    if (!isNaN(p) && p > 1) offset = (p - 1) * limit;
  } else if (params.offset) {
    const o = parseInt(params.offset);
    if (!isNaN(o) && o >= 0) offset = o;
  }
  const cacheKey = `${qRaw}::limit=${limit}::offset=${offset}`;
  if (cache[cacheKey] && (Date.now() - cache[cacheKey].ts) < 1000 * 60 * 10) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cache[cacheKey].data)
    };
  }
  const url = `https://api.semanticscholar.org/graph/v1/paper/search`
            + `?query=${encodeURIComponent(qRaw)}`
            + `&limit=${limit}&offset=${offset}`
            + `&fields=title,year,authors,url`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    cache[cacheKey] = { ts: Date.now(), data };
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};
