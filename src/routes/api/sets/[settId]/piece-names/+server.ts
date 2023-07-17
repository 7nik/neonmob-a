import { error, json } from "@sveltejs/kit";
import { getCardNames } from "$db";

export const GET = ({ params, url }) => {
    const settId = Number(params.settId);
    if (Number.isNaN(settId)) throw error(400);

    const cards = getCardNames(settId, url.host);
    if (cards.length === 0) throw error(404);

    return json(cards);
};

export const trailingSlash = "always";
