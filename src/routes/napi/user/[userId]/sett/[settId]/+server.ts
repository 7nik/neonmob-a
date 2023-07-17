import { error, json } from "@sveltejs/kit";
import { getCards } from "$db";

export const GET = ({ params }) => {
    const settId = Number(params.settId);
    if (Number.isNaN(settId)) throw error(400);

    const cards = getCards(settId);
    // if (cards.length === 0) throw error(404);

    return json(cards);
};
