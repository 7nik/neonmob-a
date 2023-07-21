import { error, type ServerLoad } from "@sveltejs/kit";

const servers = {
    pa: "https://www.neonmob.com/api/",
    pn: "https://napi.neonmob.com/",
    sa: "https://staging.neonmob.com/api/",
    sn: "https://napi-stagging.neonmob.com/",
};

const proxyRequest: ServerLoad = async ({ url, request, params: { s, path } }) => {
    const server = servers[s as keyof typeof servers];
    if (!server) {
        throw error(400);
    }

    const link = new URL(server + path + url.search);
    request.headers.set("host", link.host);
    request.headers.delete("referer");
    request.headers.delete("connection");
    request.headers.set("accept-encoding", "identity");

    const resp = await fetch(link, request);
    // if the response is still encoded or getting cookies
    if (resp.headers.has("content-encoding") || resp.headers.has("set-cookie")) {
        const body = await resp.text();
        const headers = new Headers({
            "content-type": resp.headers.get("content-type")!,
        });
        for (const [key, value] of resp.headers.entries()) {
            if (key === "set-cookie") {
                headers.append(key, value.replace(" Domain=.neonmob.com;", ""));
            }
        }
        return new Response(body, { headers });
    }
    return resp;
};

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;

export const trailingSlash = "ignore";
