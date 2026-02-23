/**
 * api.blackroad.io — Public API gateway worker
 * Routes requests to appropriate backend services.
 */
export interface Env { BLACKROAD_GATEWAY_URL: string; }

const ROUTES: Record<string, string> = {
  "/v1/chat": "/v1/chat/completions",
  "/v1/agents": "/agents",
  "/v1/tasks": "/tasks",
  "/v1/memory": "/memory",
  "/health": "/health",
};

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const gateway = env.BLACKROAD_GATEWAY_URL || "http://127.0.0.1:8787";
    if (req.method === "OPTIONS") return new Response(null, {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" }
    });
    const backendPath = ROUTES[url.pathname] || url.pathname;
    const body = req.method !== "GET" ? await req.text() : undefined;
    const resp = await fetch(`${gateway}${backendPath}`, {
      method: req.method, headers: { "Content-Type": "application/json" }, body
    });
    return new Response(await resp.text(), {
      status: resp.status,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "X-Powered-By": "BlackRoad OS" }
    });
  }
};
