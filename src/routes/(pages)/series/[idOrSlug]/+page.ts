import { redirect } from "@sveltejs/kit";
import {
    getActivityFeed,
    getCreatorSetts,
    getSettCardNames,
    getSettCards,
} from "$api";

export const load = async ({
    params, parent, url, fetch,
}) => {
    const { idOrSlug } = params;
    const { sett } = await parent();

    if (idOrSlug === String(sett.id)) {
        throw redirect(307, sett.permalink);
    }

    if (url.searchParams.get("tab") === "preview") {
        return {
            p: {
                showPreview: true as const,
                // user with ID 2 owns only two cards in one series
                cards: getSettCards(2, sett.id, fetch),
            },
        };
    }

    return {
        p: {
            cards: getSettCardNames(sett.id, fetch),
            setts: getCreatorSetts(sett.creator.id, 4, fetch).toPOJO()
                .then((obj) => obj.items),
            activities: getActivityFeed("sett", sett.id, 20, 1, fetch).toPOJO(),
        },
    };
};

export const trailingSlash = "always";
