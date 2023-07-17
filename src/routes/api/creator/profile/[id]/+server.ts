import { error, json } from "@sveltejs/kit";
import { getCreator } from "$db";

export const GET = ({ params }) => {
    const userId = Number(params.id);
    if (Number.isNaN(userId)) throw error(400);

    const creator = getCreator(userId);
    if (!creator) throw error(404);

    return json(creator);
};

export const trailingSlash = "always";
