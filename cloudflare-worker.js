/*
 * 钉钉 MCP 代理（Cloudflare Worker）
 * ------------------------------------------------------------
 * GitHub Pages 是纯静态站点，无法运行后端代码，且钉钉 MCP 网关
 * 不支持浏览器跨域。因此用一个 Cloudflare Worker 作为同源/可跨域
 * 代理：前端把 { tool, arguments } POST 给本 Worker，Worker 完成
 * MCP 握手并转发到钉钉网关，再返回结果。
 *
 * 部署：
 *   1. 安装 wrangler，执行 `wrangler login`
 *   2. `wrangler init --from-dash` 或手动创建 Worker，把本文件内容粘到 worker 入口
 *   3. `wrangler deploy`
 *   4. 记下你的 Worker 地址，例如 https://dingtalk-proxy.<sub>.workers.dev
 *   5. 在 index.html / dingtalk.js 中把 endpoint 改成：
 *        window.DingTalkConfig.endpoint = 'https://dingtalk-proxy.<sub>.workers.dev/api/dingtalk';
 *
 * 说明：Worker 已返回 Access-Control-Allow-Origin: *，可跨域被 GitHub Pages 调用。
 */
const DINGTALK_GW = "https://mcp-gw.dingtalk.com/server/e3f697ca21a83ff63130d287bd43a9f1d83c81d976224b46e02c5c0dcf1dc41a?key=9ccd0d504a5352232e96463f95bc93a9";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

async function callDingTalk(tool, args) {
  const headers = { "Accept": "application/json, text/event-stream", "Content-Type": "application/json" };

  // 1) 初始化会话（网关无状态，失败可忽略）
  try {
    await fetch(DINGTALK_GW, {
      method: "POST",
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1, method: "initialize",
        params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "booking-proxy", version: "1.0" } }
      })
    });
  } catch (e) { /* ignore */ }

  // 2) 转发 tools/call
  const callRes = await fetch(DINGTALK_GW, {
    method: "POST",
    headers,
    body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: tool, arguments: args } })
  });
  return callRes;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }
    if (url.pathname === "/api/dingtalk" && request.method === "POST") {
      try {
        const data = await request.json();
        const upstream = await callDingTalk(data.tool, data.arguments || {});
        const text = await upstream.text();
        return new Response(text, {
          status: upstream.status,
          headers: Object.assign({ "Content-Type": "application/json; charset=utf-8" }, CORS)
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: String(e) }), {
          status: 502,
          headers: Object.assign({ "Content-Type": "application/json; charset=utf-8" }, CORS)
        });
      }
    }
    return new Response("Not Found", { status: 404, headers: CORS });
  }
};
