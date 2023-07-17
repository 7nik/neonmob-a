import { error } from "@sveltejs/kit";
import { browser } from "$app/environment";
import { getOwnedPrints, resolveCard, resolvePrint } from "$api";
import { resolve } from "$lib/services/cache";

export const load = async ({ params, fetch }) => {
    const { idOrSlug, card } = params;
    const [cardSlug, printId] = card.split("/");
    const slug = `${idOrSlug}/${cardSlug}`;

    if (!printId && resolve.card.has(slug)) {
        return {
            print: getOwnedPrints(1, resolve.card.get(slug)!, fetch),
            owner: null,
        };
    }
    const { print, owner } = printId
        ? await resolvePrint(idOrSlug, cardSlug, printId, fetch)
        : await resolveCard(idOrSlug, cardSlug, fetch);
    if (!print) throw error(404);
    if (browser) {
        resolve.card.set(slug, print.id);
        if (owner) {
            resolve.user.set(owner.username, owner.id);
        }
    }

    return { print, owner };
};

export const trailingSlash = "always";
