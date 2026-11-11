import assert from "node:assert/strict";
import { createServer } from "node:http";
import { test } from "node:test";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const message = {
  jsonrpc: "2.0",
  id: "synthetic-call",
  method: "tools/call",
  params: { name: "youtube_video", arguments: { video: "synthetic-video" } },
};

async function readRequest(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  return {
    method: request.method,
    url: request.url,
    headers: request.headers,
    body: Buffer.concat(chunks).toString("utf8"),
  };
}

async function listen(t, handler) {
  const server = createServer((request, response) => {
    response.setHeader("Connection", "close");
    handler(request, response).catch((error) => {
      response.writeHead(500);
      response.end(String(error));
    });
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  t.after(async () => {
    server.closeAllConnections();
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });
  return new URL(`http://127.0.0.1:${server.address().port}/`);
}

function transportFor(t, url) {
  const transport = new StreamableHTTPClientTransport(url, {
    sessionId: "synthetic-session-id",
    requestInit: {
      headers: {
        Authorization: "Bearer synthetic-api-key",
        "User-Agent": "tubealfred-mcp/security-test",
      },
    },
  });
  t.after(() => transport.close());
  return transport;
}

for (const status of [307, 308]) {
  test(`HTTP transport refuses cross-origin ${status} redirects without forwarding session or body`, async (t) => {
    const sourceRequests = [];
    const sinkRequests = [];
    const sink = await listen(t, async (request, response) => {
      sinkRequests.push(await readRequest(request));
      response.writeHead(202);
      response.end();
    });
    const source = await listen(t, async (request, response) => {
      sourceRequests.push(await readRequest(request));
      response.writeHead(status, { Location: sink.href });
      response.end();
    });
    const transport = transportFor(t, source);
    await transport.start();

    const outcome = await transport.send(message).then(
      () => ({ rejected: false }),
      () => ({ rejected: true }),
    );

    assert.equal(sourceRequests.length, 1);
    assert.equal(sourceRequests[0].headers.authorization, "Bearer synthetic-api-key");
    assert.equal(sourceRequests[0].headers["mcp-session-id"], "synthetic-session-id");
    assert.deepEqual(JSON.parse(sourceRequests[0].body), message);
    assert.equal(sinkRequests.length, 0, "A cross-origin destination must receive no request");
    assert.equal(outcome.rejected, true, "The transport must reject a cross-origin redirect");
  });

  test(`HTTP transport follows same-origin ${status} redirects and preserves the MCP request`, async (t) => {
    const requests = [];
    const source = await listen(t, async (request, response) => {
      requests.push(await readRequest(request));
      if (request.url === "/") {
        response.writeHead(status, { Location: "/final" });
      } else {
        response.writeHead(202);
      }
      response.end();
    });
    const transport = transportFor(t, source);
    await transport.start();

    await transport.send(message);

    assert.equal(requests.length, 2);
    assert.equal(requests[1].url, "/final");
    assert.equal(requests[1].method, "POST");
    assert.equal(requests[1].headers.authorization, "Bearer synthetic-api-key");
    assert.equal(requests[1].headers["mcp-session-id"], "synthetic-session-id");
    assert.deepEqual(JSON.parse(requests[1].body), message);
  });
}
