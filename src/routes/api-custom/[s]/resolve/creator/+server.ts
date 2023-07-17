import { error, json } from "@sveltejs/kit";
import domain from "../../domain";

const cache: Record<string, (number|null)[]> = {};

export const GET = async ({ params, url }) => {
    const username = url.searchParams.get("username");
    if (!username) throw error(400);

    if (username in cache) {
        return json(cache[username]);
    }

    const html = await fetch(
        `${domain(params.s)}/creator/${username}`,
    ).then((r) => {
        if (r.ok) return r.text();
        throw error(r.status);
    });
    const userMatch = /\\u0022id\\u0022: (\d+),/.exec(html)?.[1];
    const userId = userMatch ? Number(userMatch) : null;
    const creatorMatch = /\/api\/creator\/profile\/(\d+)\//.exec(html)?.[1];
    const creatorId = creatorMatch ? Number(creatorMatch) : null;

    cache[username] = [userId, creatorId];

    return json([userId, creatorId]);
};
