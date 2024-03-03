import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";

import httpProxy from "http-proxy";

const servers = {
    pa: "www.neonmob.com",
    pn: "napi.neonmob.com",
    sa: "staging.neonmob.com",
    sn: "napi-staging.neonmob.com",
};

const proxy = httpProxy.createProxyServer({
    ignorePath: true,
    changeOrigin: true,
});
// proxy.on("open", (p) => p.on("data", (d) => console.log(`Server:${d}`)));
// proxy.on("proxyReqWs", (p) => p.on("frame", (d) => console.log(`User:${d}`)));

export default (req: IncomingMessage, socket: Duplex, head: Buffer) => {
    // console.log(req.url);
    const [, server, query] = req.url?.match(/^\/api-proxy\/(\w+)\/socket\.io\/(.*)/) ?? [];
    if (!server || !(server in servers)) return;

    proxy.ws(req, socket, head, {
        target: {
            protocol: "wss",
            host: servers[server as keyof typeof servers],
            path: `/socket.io/${query}`,
        },
    }, console.error);
};
