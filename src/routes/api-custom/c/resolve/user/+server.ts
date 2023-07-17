import { error, json } from "@sveltejs/kit";
import { resolveUser } from "$db";

export const GET = async ({ url }) => {
    const username = url.searchParams.get("username");
    if (!username) throw error(400);

    return json(resolveUser(username));
};
