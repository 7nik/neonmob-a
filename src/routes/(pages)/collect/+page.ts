import { findSetts, getSettCategories } from "$api";
import { getRecent } from "$lib/services/cache";

export const load = async ({ fetch }) => {
    // eslint-disable-next-line unicorn/no-useless-undefined
    const categories = getRecent("categories", undefined)
        ?? await getSettCategories(100, fetch).loadAll();

    const settPages = Promise.all(
        categories.slice(0, 3)
            .map((c) => findSetts(c.name_slug, "", false, {}, fetch))
            .map((p) => p.toPOJO()),
    );

    return {
        categories,
        p: {
            settPages,
        },
    };
};

export const trailingSlash = "always";
