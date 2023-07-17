import { error, json } from "@sveltejs/kit";
import { getCreator, resolveUser } from "$db";

export const GET = ({ url }) => {
    if (!url.searchParams.has("username")) {
        throw error(400);
    }
    const username = url.searchParams.get("username")!;
    const userId = resolveUser(username);
    if (!userId) throw error(404);

    return json(getCreator(userId));
};

export const trailingSlash = "always";
