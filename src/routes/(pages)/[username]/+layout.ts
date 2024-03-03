import type NM from "$lib/utils/NM Types.js";

import { error } from "@sveltejs/kit";
import { getUserData, getUserStatsBase, resolveUser } from "$api";
import { resolve } from "$lib/services/cache";

export const load = async ({ parent, params, fetch }) => {
    const userId = resolve.user.get(params.username)
        ?? (await resolveUser(params.username, fetch));
    if (!userId) throw error(404);
    const { otherUsers } = await parent();
    return {
        user: getUserData(userId, fetch),
        isFriend: otherUsers.isFriend(userId),
        isBlocked: otherUsers.isBlocked(userId),
        p: {
            stats: getUserStatsBase(userId, fetch)
                .catch((err) => { console.error(err); return [] as unknown as NM.UserStats; }),
        },
    };
};

export const trailingSlash = "always";
