import type { Action } from "svelte/action";

import { setRecent } from "$lib/services/cache";

type Params = Parameters<typeof setRecent>[0];

/**
 * Adds the data to the recent cache for re-using by a load function
 * @param elem - hovering this element will trigger adding to the cache
 * @param params - data to add to cache
 */
export default ((elem, params = {}) => {
    function addRecent () {
        setRecent(params);
    }

    elem.addEventListener("mouseenter", addRecent);
    elem.addEventListener("touchstart", addRecent);

    return {
        update (p) {
            params = p ?? {};
        },
    };
}) as Action<HTMLElement, Params>;
