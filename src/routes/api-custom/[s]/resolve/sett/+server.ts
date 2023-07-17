import { error, json } from "@sveltejs/kit";
import domain from "../../domain";

const cache: Record<string, number|null> = {};

export const GET = async ({ params, url }) => {
    const slug = url.searchParams.get("slug");
    if (!slug) throw error(400);

    if (slug in cache) {
        return json(cache[slug]);
    }

    const html = await fetch(
        `${domain(params.s)}/series/${slug}/`,
    ).then((r) => {
        if (r.ok) return r.text();
        throw error(r.status);
    });
    const match = /\\u0022\/api\/setts\/(\d+)/.exec(html)?.[1];
    const id = match ? Number(match) : null;

    cache[slug] = id;

    return json(id);
};
