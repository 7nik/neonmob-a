import { redirect } from "@sveltejs/kit";
import { getUserCollections } from "$api";

export const load = async ({ url, parent, fetch }) => {
    if (url.searchParams.has("cards")) {
        throw redirect(307, url.pathname.replace("/collection/", "/cards/"));
    }

    const { user } = await parent();
    return {
        p: {
            setts: getUserCollections(user.id, "last_acquired", true, {}, fetch).toPOJO(),
        },
    };
};
