import { error, json } from "@sveltejs/kit";
import { getSett } from "$db";

export const GET = ({ params, url }) => {
    const settId = Number(params.id);
    if (Number.isNaN(settId)) throw error(400);

    const sett = getSett(settId, url.host);
    if (!sett) throw error(404);

    return json(sett);
};

export const trailingSlash = "always";
