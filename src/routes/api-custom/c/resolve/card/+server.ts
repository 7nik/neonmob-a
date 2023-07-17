import { error, json } from "@sveltejs/kit";
import { resolveCard } from "$db";

export const GET = async ({ url }) => {
    const settSlug = url.searchParams.get("settSlug");
    const cardSlug = url.searchParams.get("cardSlug");
    if (!settSlug || !cardSlug) throw error(400);

    return json(resolveCard(settSlug, cardSlug));
};
