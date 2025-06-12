// netlify/functions/ss-search.js
// Proxy لدالة البحث مع دعم limit و offset
let cache = {};

exports.handler = async function(event) {
  const params = event.queryStringParameters || {};
  const qRaw = params.q;
  if (!qRaw) {
    return {
      statusCode: 400,
      body: 'Missing query parameter q'
    };
  }
  // اقرأ limit و offset إن وُجدتا، بخلاف ذلك استخدم افتراضياً limit=20 و offset=0
  let limit = 20;
  let offset = 0;
  if (params.limit) {
    const n = parseInt(params.limit);
    if (!isNaN(n) && n > 0 && n <= 100) limit = n;
  }
  if (params.page) {
    const p = parseInt(params.page);
    if (!isNaN(p) && p > 1) {
      offset = (p - 1) * limit;
    }
  } else if (params.offset) {
    const o = parseInt(params.offset);
    if (!isNaN(o) && o >= 0) offset = o;
  }
  // أنشئ مفتاح الكاش يشمل qRaw و limit و offset
  const cacheKey = `${qRaw}::limit=${limit}::offset=${offset}`;
  // استرجاع من الكاش خلال 10 دقائق
  if (cache[cacheKey] && (Date.now() - cache[cacheKey].ts) < 1000 * 60 * 10) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cache[cacheKey].data)
    };
  }
  // بناء رابط استعلام Semantic Scholar
  const url = `https://api.semanticscholar.org/graph/v1/paper/search`
            + `?query=${encodeURIComponent(qRaw)}`
            + `&limit=${limit}&offset=${offset}`
            + `&fields=title,year,authors,url`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    // خزّن في الكاش
    cache[cacheKey] = { ts: Date.now(), data };
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
