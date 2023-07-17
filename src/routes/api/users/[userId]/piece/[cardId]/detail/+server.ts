import { error, json } from "@sveltejs/kit";
import { getPrint } from "$db";

export const GET = ({ params, url }) => {
    const cardId = Number(params.cardId);
    if (Number.isNaN(cardId)) throw error(400);

    const print = getPrint(cardId, url.host);
    if (!print) throw error(404);

    return json({ payload: print });
};

export const trailingSlash = "always";
