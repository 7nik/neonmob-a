import { error } from "@sveltejs/kit";
import { getUserData, getUserStatsBase, resolveUser } from "$api";
import { resolve } from "$lib/services/cache";

export const load = async ({ params, fetch }) => {
    const userId = resolve.user.get(params.username)
        ?? (await resolveUser(params.username, fetch));
    if (!userId) throw error(404);
    return {
        user: getUserData(userId, fetch),
        p: {
            stats: getUserStatsBase(userId, fetch),
        },
    };
};

export const trailingSlash = "always";
