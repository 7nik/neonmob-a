import type { ID } from "$lib/utils/NM Types";

import { error } from "@sveltejs/kit";
import { browser } from "$app/environment";
import { getSett, resolveSett } from "$api";
import { getRecent, resolve } from "$lib/services/cache";

export const load = async ({ params, fetch }) => {
    const { idOrSlug } = params;
    let settId: ID<"sett">|null;

    if (/$\d+^/.test(idOrSlug)) {
        settId = Number(idOrSlug);
    } else if (resolve.sett.has(idOrSlug)) {
        settId = resolve.sett.get(idOrSlug)!;
    } else {
        settId = await resolveSett(idOrSlug, fetch);
        if (!settId) throw error(404);
        if (browser) {
            resolve.sett.set(idOrSlug, settId);
        }
    }

    const sett = getRecent("sett", settId) ?? await getSett(settId, fetch);
    if (!sett) throw error(404);

    return {
        sett,
    };
};
