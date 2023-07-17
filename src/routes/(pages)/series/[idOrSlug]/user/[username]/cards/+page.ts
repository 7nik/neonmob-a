import type { ID } from "$lib/utils/NM Types";

import { error } from "@sveltejs/kit";
import { browser } from "$app/environment";
import { getSettCards, resolveUser } from "$api";
import { resolve } from "$lib/services/cache";

export const load = async ({ params: { username }, parent, fetch }) => {
    let userIdPromise: Promise<ID<"user">|null>;
    if (!username) {
        throw error(404);
    } else if (resolve.user.has(username)) {
        userIdPromise = Promise.resolve(resolve.user.get(username)!);
    } else {
        userIdPromise = resolveUser(username, fetch);
        if (browser) {
            userIdPromise.then((userId) => {
                resolve.user.set(username, userId!);
            });
        }
    }

    const data = Promise.all([
        parent(),
        userIdPromise,
    ]).then(([{ sett }, userId]) => ({
        cards: getSettCards(userId ?? 2, sett.id, fetch),
        // owner: username && userId ? getUserData(userId) : null,
    }));

    return {
        p: data,
    };
};

export const trailingSlash = "always";
