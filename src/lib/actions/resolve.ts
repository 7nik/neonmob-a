import type { ID } from "$lib/utils/NM Types";
import type { Action } from "svelte/action";

import { resolve } from "$lib/services/cache";
import { absUrl } from "$lib/utils/utils";

type Params = Partial<{
    card: { id: ID<"card">, public_url: string },
    sett: ({ id: ID<"sett">, name_slug: string }
            | { id: ID<"sett">, public_url: string }
            | { id: ID<"sett">, links: { permalink: string } })
        & { creator?: { id: ID<"user">, username: string } },
    user: { id: ID<"user">, username: string },
}>;

/**
 * Uses the passed data to cache slug names resolving into object IDs
 * @param elem - unused
 * @param p - data for resolving
 */
export default ((_elem, params = {}) => {
    function addResolve ({ card, sett, user }: Params) {
        if (card) {
            resolve.card.set(card.public_url.split("/").slice(-2).join("/"), card.id);
        }
        if (sett) {
            const slug = "name_slug" in sett
                ? sett.name_slug
                : absUrl("public_url" in sett ? sett.public_url : sett.links.permalink)
                    .split("/")[2];
            resolve.sett.set(slug, sett.id);
            if (!user && "creator" in sett) user = sett.creator;
        }
        if (user) {
            resolve.user.set(user.username, user.id);
        }
    }

    addResolve(params);

    return {
        update (p) {
            addResolve(p);
        },
    };
}) as Action<HTMLElement, Params>;
