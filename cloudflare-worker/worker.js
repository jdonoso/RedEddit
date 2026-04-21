const REDDIT_BASE = 'https://www.reddit.com';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const ALLOWED_PATHS = /^\/(r\/[^/]+\/(hot|new|top|rising)\.json|r\/[^/]+\/comments\/[^/]+\.json|subreddits\/search\.json)/;

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    const url = new URL(request.url);

    if (!ALLOWED_PATHS.test(url.pathname)) {
      return new Response('Not found', { status: 404 });
    }

    const redditUrl = `${REDDIT_BASE}${url.pathname}${url.search}`;

    const response = await fetch(redditUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      cf: { cacheTtl: 60, cacheEverything: true },
    });

    const body = await response.arrayBuffer();

    return new Response(body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') ?? 'application/json',
        ...corsHeaders(),
      },
    });
  },
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
