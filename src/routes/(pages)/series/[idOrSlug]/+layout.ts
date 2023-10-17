import type { ID } from "$lib/utils/NM Types";

import { error, redirect } from "@sveltejs/kit";
import { browser } from "$app/environment";
import {
    getSett,
    getSettCards,
    getUserData,
    resolveSett,
    resolveUser,
} from "$api";
import { getRecent, resolve } from "$lib/services/cache";

async function getSettId (idOrSlug: string, f: typeof fetch): Promise<ID<"sett">> {
    if (/$\d+^/.test(idOrSlug)) {
        return Number(idOrSlug);
    }
    if (resolve.sett.has(idOrSlug)) {
        return resolve.sett.get(idOrSlug)!;
    }
    const settId = await resolveSett(idOrSlug, f);
    if (!settId) throw error(404);
    if (browser) {
        resolve.sett.set(idOrSlug, settId);
    }
    return settId;
}

async function getUserId (username: string|undefined, f: typeof fetch): Promise<ID<"user">|null> {
    if (!username) {
        return null;
    }
    if (resolve.user.has(username)) {
        return resolve.user.get(username)!;
    }
    const userIdPromise = resolveUser(username, f);
    if (browser) {
        userIdPromise.then((userId) => {
            resolve.user.set(username, userId!);
        });
    }
    return userIdPromise;
}

export const load = async ({ params, fetch }) => {
    const { idOrSlug, username } = params;

    const [settId, userId] = await Promise.all([
        getSettId(idOrSlug, fetch),
        getUserId(username, fetch),
    ]);

    let sett = getRecent("sett", settId);
    if (!sett || sett.ownerId && sett.ownerId !== userId) {
        sett = await getSett(settId, userId, fetch);
    }
    if (!sett) throw error(404);

    if (!userId) {
        if (!username) {
            return {
                sett,
                p: {},
            };
        }
        throw redirect(302, sett.permalink);
    }

    return {
        sett,
        owner: getUserData(userId, fetch),
        p: {
            cards: getSettCards(userId ?? 2, sett.id, fetch),
        },
    };
};
