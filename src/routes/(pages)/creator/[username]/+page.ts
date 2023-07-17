import type { ID } from "$lib/utils/NM Types";

import { error } from "@sveltejs/kit";
import { browser } from "$app/environment";
import {
    getActivityFeed,
    getCreator,
    getCreatorSetts,
    getCreatorSubmissions,
    getUserData,
    resolveCreator,
} from "$api";
import { resolve } from "$lib/services/cache";

export const load = async ({ params, fetch }) => {
    const { username } = params;
    let userId: ID<"user">|null;
    let creatorId: ID<"creator">|null;

    if (resolve.user.has(username) && resolve.creator.has(username)) {
        userId = resolve.user.get(username)!;
        creatorId = resolve.creator.get(username)!;
    } else {
        [userId, creatorId] = await resolveCreator(username, fetch) ?? [null, null];
        if (!userId || !creatorId) throw error(404);
        if (browser) {
            resolve.user.set(username, userId);
            resolve.creator.set(username, creatorId);
        }
    }

    return {
        user: getUserData(userId, fetch),
        creator: getCreator(creatorId, fetch),
        isFriend: false,
        isBlocked: false,
        p: {
            setts: getCreatorSetts(userId, 9, fetch).toPOJO(),
            submissions: getCreatorSubmissions(userId, fetch).toPOJO(),
            activities: getActivityFeed("creator", userId, 50, 1, fetch).toPOJO(),
        },
    };
};
