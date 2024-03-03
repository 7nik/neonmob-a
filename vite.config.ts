import fs from "node:fs";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import proxyWebSocket from "./src/routes/api-proxy/[s]/[...path]/proxyWebSocket";
// import { nodeLoaderPlugin } from "@vavite/node-loader/plugin";

// try running the dev server on HTTPS
const server = fs.existsSync("cert/key.pem")
    ? {
        https: {
            key: fs.readFileSync(`cert/key.pem`),
            cert: fs.readFileSync(`cert/cert.pem`),
        },
        proxy: {},
    }
    : {};

export default defineConfig({
    plugins: [
        // nodeLoaderPlugin(),
        sveltekit(),
        tsconfigPaths(),
        {
            name: "integratedWebsocketServer",
            configureServer (server) {
                server.httpServer!.on("upgrade", proxyWebSocket);
            },
            configurePreviewServer (server) {
                server.httpServer!.on("upgrade", proxyWebSocket);
            },
        },
    ],
    server,
});
