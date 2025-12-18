// Cloudflare Pages Function - Proxy for fetching .tpl files
// This bypasses CORS restrictions by fetching server-side

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const targetUrl = url.searchParams.get('url');

  // Validate URL parameter exists
  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Validate .tpl extension
  if (!targetUrl.toLowerCase().endsWith('.tpl')) {
    return new Response(JSON.stringify({ error: 'URL must end with .tpl' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Validate URL format
  let parsedUrl;
  try {
    parsedUrl = new URL(targetUrl);
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid URL format' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Only allow http/https protocols
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return new Response(JSON.stringify({ error: 'Only HTTP/HTTPS URLs allowed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Tiny-Interpreter/1.0'
      }
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Remote server returned ${response.status}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const content = await response.text();

    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: `Failed to fetch: ${error.message}` }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
