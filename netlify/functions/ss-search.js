// netlify/functions/ss-search.js
let cache = {};

exports.handler = async function(event) {
  const q = event.queryStringParameters?.q;
  if (!q) return { statusCode:400, body:'Missing query parameter q' };

  if (cache[q] && Date.now() - cache[q].ts < 600000) {
    return {
      statusCode:200,
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(cache[q].data)
    };
  }

  const url = `https://api.semanticscholar.org/graph/v1/paper/search`
            + `?query=${encodeURIComponent(q)}`
            + `&limit=5&fields=title,year,authors,url`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    cache[q] = { ts:Date.now(), data };
    return {
      statusCode:200,
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(data)
    };
  } catch (err) {
    return { statusCode:500, body:err.message };
  }
};
