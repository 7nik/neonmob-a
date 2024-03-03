import * as path from "node:path";
import * as url from "node:url";
import proxyWebSocket from "../routes/api-proxy/[s]/[...path]/proxyWebSocket";

const fileSelf = url.fileURLToPath(import.meta.url);
const dirSelf = path.dirname(fileSelf);

const { server } = await import(path.resolve(dirSelf, "../../build/index.js"));
server.server.on("upgrade", proxyWebSocket);
