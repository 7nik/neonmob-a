import type { Handle } from "@sveltejs/kit";

import { error } from "@sveltejs/kit";

const API_SERVERS = {
    pa: "http://www.neonmob.com/api/",
    pn: "http://napi.neonmob.com/",
    sa: "http://staging.neonmob.com/api/",
    sn: "http://node-staginh.neonmob.com/",
};

const handleApiProxy: Handle = async ({ event }) => {
    // const origin = event.request.headers.get("Origin")
    //     ?? event.request.headers.get("Referer");

    // // reject requests that don't come from the webapp, to avoid your proxy being abused.
    // if (!origin || new URL(origin).origin !== event.url.origin) {
    //     throw error(403, "Request Forbidden.");
    // }

    // eslint-disable-next-line unicorn/no-unreadable-array-destructuring
    const [, , server, ...path] = event.url.pathname.split("/");
    if (!(server in API_SERVERS)) {
        throw error(404, "Proxy not found");
    }
    const baseUrl = API_SERVERS[server as keyof typeof API_SERVERS];

    // build the new URL path with your API base URL, the stripped path and the query string
    const url = `${baseUrl}${path.join("/")}${event.url.search}`;

    // Strip off header added by SvelteKit yet forbidden by underlying HTTP request
    // library `undici`.
    // https://github.com/nodejs/undici/issues/1470
    event.request.headers.delete("connection");
    // to bypass firewall :-)
    event.request.headers.delete("Referer");
    event.request.headers.delete("Host");
    // fails to get compressed content
    event.request.headers.delete("Accept-Encoding");

    try {
        return await fetch(url, {
            // propagate the request method and body
            body: event.request.body,
            method: event.request.method,
            // headers: event.request.headers,
        });
    } catch (err) {
        console.log("Could not proxy API request:", url, err);
        throw err;
    }
};

export const handle: Handle = async ({ event, resolve }) => {
    // if (event.url.pathname.startsWith("/api-proxy/")) {
    //     return handleApiProxy({ event, resolve });
    // }
    console.log(event.url.href);
    // debugger;
    try {
        const resp = await resolve(event);
        console.log("resolved", event.url.href);
        return resp;
    } catch (ex) {
        console.error(ex);
    }
};
