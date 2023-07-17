import { findSetts, getSettCategories } from "$api";
import { getRecent } from "$lib/services/cache";

export const load = ({ params, fetch }) => {
    // eslint-disable-next-line unicorn/no-useless-undefined
    const categories = getRecent("categories", undefined)
        ?? getSettCategories(100, fetch).loadAll();

    const promise = Promise.resolve(categories);
    const setts = promise.then((arr) => {
        const categoryId = arr.find((c) => c.name_slug === params.slug)?.id;
        return (categoryId && getRecent("categorySetts", categoryId))
            ?? findSetts(params.slug, "release_date", true, {}, fetch).toPOJO()
                .catch(() => findSetts("", "release_date", true, {}, fetch).toPOJO());
    });

    return {
        categories,
        p: {
            setts,
        },
    };
};
