// Cloudflare Pages Function — CORS proxy
export async function onRequestPost(context) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
  try {
    const { targetUrl, method, headers, body } = await context.request.json();
    if (!targetUrl || !targetUrl.startsWith('https://'))
      return new Response(JSON.stringify({ error: 'HTTPS targetUrl required' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
    const h = {};
    if (headers) for (const [k, v] of Object.entries(headers)) {
      if (['authorization', 'content-type'].includes(k.toLowerCase())) h[k] = v;
    }
    const opts = { method: method || 'GET', headers: h };
    if (body && method !== 'GET' && method !== 'HEAD')
      opts.body = typeof body === 'string' ? body : JSON.stringify(body);
    const res = await fetch(targetUrl, opts);
    return new Response(await res.text(), {
      status: res.status,
      headers: { ...cors, 'Content-Type': res.headers.get('content-type') || 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
}
export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  }});
}
