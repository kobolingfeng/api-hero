// Netlify serverless function — CORS proxy for API requests
// This proxies requests to any OpenAI-compatible API to avoid CORS blocking

exports.handler = async function(event) {
  // Only allow POST
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Target-URL',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { targetUrl, method, headers, body } = JSON.parse(event.body);
    if (!targetUrl) {
      return { statusCode: 400, body: JSON.stringify({ error: 'targetUrl required' }) };
    }

    // Validate: only allow HTTPS URLs
    if (!targetUrl.startsWith('https://')) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Only HTTPS URLs allowed' }) };
    }

    // Forward the request
    const fetchHeaders = {};
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        // Only forward safe headers
        const lk = k.toLowerCase();
        if (['authorization', 'content-type'].includes(lk)) {
          fetchHeaders[k] = v;
        }
      }
    }

    const fetchOpts = {
      method: method || 'GET',
      headers: fetchHeaders,
    };

    if (body && method !== 'GET' && method !== 'HEAD') {
      fetchOpts.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(targetUrl, fetchOpts);
    const responseBody = await response.text();

    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
      body: responseBody,
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
