// Cloudflare Pages Function — CORS proxy for API requests
// Routes: POST /api/proxy

export async function onRequestPost(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Target-URL',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

  try {
    const { targetUrl, method, headers, body } = await context.request.json();
    if (!targetUrl) {
      return new Response(JSON.stringify({ error: 'targetUrl required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!targetUrl.startsWith('https://')) {
      return new Response(JSON.stringify({ error: 'Only HTTPS URLs allowed' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Forward only safe headers
    const fetchHeaders = {};
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        const lk = k.toLowerCase();
        if (['authorization', 'content-type'].includes(lk)) {
          fetchHeaders[k] = v;
        }
      }
    }

    const fetchOpts = { method: method || 'GET', headers: fetchHeaders };
    if (body && method !== 'GET' && method !== 'HEAD') {
      fetchOpts.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(targetUrl, fetchOpts);
    const responseBody = await response.text();

    return new Response(responseBody, {
      status: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': response.headers.get('content-type') || 'application/json',
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Target-URL',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Max-Age': '86400',
    }
  });
}
