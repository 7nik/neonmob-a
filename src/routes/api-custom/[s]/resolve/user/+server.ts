import { error, json } from "@sveltejs/kit";
import domain from "../../domain";

const cache: Record<string, number|null> = {};

export const GET = async ({ params, url }) => {
    const username = url.searchParams.get("username");
    if (!username) throw error(400);

    if (username in cache) {
        return json(cache[username]);
    }

    const html = await fetch(
        `${domain(params.s)}/${username}/collection/`,
    ).then((r) => {
        if (r.ok) return r.text();
        throw error(r.status);
    });
    const match = /var targetId = "(\d+)"/.exec(html)?.[1];
    const id = match ? Number(match) : null;

    cache[username] = id;

    return json(id);
};
