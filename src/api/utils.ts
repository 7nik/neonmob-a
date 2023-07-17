/* eslint-disable max-classes-per-file */
import type NM from "$lib/utils/NM Types";
import type { absoluteURL, fullURL } from "$lib/utils/NM Types";

import { PUBLIC_API_SERVER, PUBLIC_NAPI_SERVER, PUBLIC_CAPI_SERVER } from "$env/static/public";
import { error } from "@sveltejs/kit";
// import { error, getCookie } from "./utils";

type Fetch = typeof fetch;
type Server = "api" | "napi" | "nma";
type Endpoint<S extends (Server | "url")> = S extends "url" ? (fullURL | URL) : absoluteURL;
export type GetParams = Record<string, string|number|boolean>;

const ENDPOINT_SERVERS = {
    api: PUBLIC_API_SERVER,
    napi: PUBLIC_NAPI_SERVER,
    nma: PUBLIC_CAPI_SERVER,
} as Record<Server, fullURL>;

export const SELF = "https://self/";

/**
 * Constructs a full URL string
 * @param type - the server
 * @param url - an absolute or full URL
 * @param params - optional get-params
 * @returns a full URL
 */
export function makeUrl<S extends Server | "url"> (
    type: S,
    url: Endpoint<S>,
    params: GetParams = {},
) {
    const fullUrl = new URL(
        type === "url" ? url : ENDPOINT_SERVERS[type].concat(url as string),
        SELF,
    );
    for (const key of Object.keys(params)) {
        fullUrl.searchParams.append(key, String(params[key]));
    }
    return fullUrl.toString().replace(SELF, "/") as fullURL;
}

/**
 * API call to the endpoint
 * @param url - full URL to API
 * @param body - body (params) of the request
 * @param fetch - the fetch function
 * @return parsed JSON response
 */
async function request<T> (url: fullURL | URL, body: RequestInit, fetch: Fetch): Promise<T> {
    // debugger;
    let resp: Response;
    try {
        resp = await fetch(url, body);
    } catch (ex) {
        console.error("Failed to fetch", url, body, ex);
        throw error(500);
    }
    if (resp.status === 503) {
        // if server overloaded try again before throwing error
        resp = await fetch(url, body);
    }
    // FIXME auto-auth
    // if (resp.status === 401) {
    //     // await when user sign in and re-try the request
    //     const auth = await getInitValue("auth");
    //     await auth();
    //     resp = await fetch(url, body);
    // }
    if (resp.ok) {
        return resp.status === 204 ? null : resp.json();
    }
    // if (resp.headers.get("Content-Type")?.includes("/json")) {
    const data = await resp.json();
    console.error(url.toString(), resp.status, resp.statusText, data);
    if (data.detail) {
        throw error(resp.status, data.detail);
    }
    // } else {
    //     console.error(url.toString(), resp.status, resp.statusText);
    // }
    let detail: string;
    switch (resp.status) {
        case 400:
            detail = `Oops! Could not save!`;
            break;
        case 403:
            detail = `
                Sorry, you're not authorized.
                Make sure you are logged in to the right account!`;
            break;
        case 404:
            detail = `
                We couldn't find what you're looking for.
                Please refresh the page or contact support@neonmob.com`;
            break;
        case 503:
            detail = `
                Our servers are a little tuckered out.
                Please try again!`;
            break;
        default:
            detail = `
                Oops! Something bad happened!
                Please refresh the page or contact support@neonmob.com`;
            break;
    }
    throw error(resp.status, detail);
}

/**
 * Does a GET request
 * @param type - the target server
 * @param url - a URL to the endpoint (without starting `/api`)
 * @param params - optional params
 * @param fetch_ - the fetch function
 */
export function get<T, S extends Server | "url" = Server | "url"> (
    type: S,
    url: Endpoint<S>,
    params: GetParams = {},
    fetch_ = fetch,
): Promise<T> {
    return request(makeUrl(type, url, params), { method: "GET" }, fetch_);
}

/**
 * Does a POST request with CSRF token
 * @param type - the target server
 * @param url - a URL to the endpoint
 * @param body - optional params of the request
 * @param fetch_ - the fetch function
 * @return parsed JSON response
 */
export function post<T> (
    type: Server,
    url: absoluteURL,
    body?: BodyInit | object,
    fetch_ = fetch,
): Promise<T> {
    const headers: HeadersInit = {
        // FIXME pass CSRFToken ?
        // "X-CSRFToken": (getCookie("csrftoken") || ""),
    };
    // if it is a plain object
    if (body && Object.getPrototypeOf(body) === Object.prototype) {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(body);
    }
    return request(makeUrl(type, url, {}), {
        method: "POST",
        body: body as BodyInit,
        headers,
    }, fetch_);
}

/**
 * Does a DELETE request with CSRF token
 * @param type - the target server
 * @param url - a URL to the endpoint
 * @param fetch_ - the fetch function
 * @return parsed JSON response
 */
export function del<T> (
    type: Server,
    url: absoluteURL,
    fetch_ = fetch,
): Promise<T> {
    return request(makeUrl(type, url, {}), {
        method: "DELETE",
        headers: {
            // "X-CSRFToken": (getCookie("csrftoken") || ""),
        },
    }, fetch_);
}

/**
 * Merge objects into one which are returned by some endpoints
 * @param data - objects container to merge
 * @returns merged data
 */
export function merge<Data extends object> (data: NM.Unmerged.Container<Data>): Data {
    function mergeObj (obj: Record<string, any>): any {
        if (typeof obj !== "object" || obj === null) return obj;
        if (Array.isArray(obj)) {
            // if it's a pointer, resolve it
            if (obj[0] === "ptr" && obj[1] in data.refs) {
                return mergeObj(data.refs[obj[1]]);
            }
            return obj.map(mergeObj);
        }

        const full: Record<string, any> = {};
        for (const key of Object.keys(obj)) {
            full[key] = mergeObj(obj[key]);
        }
        return full;
    }

    return mergeObj(data.payload);
}
