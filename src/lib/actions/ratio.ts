import type { Action } from "svelte/action";

/**
 * Sets to the element `aspect-ratio` of the given item
 * @param node - where set the ratio
 * @param s - dimensions of the item
 */
const ratio: Action<
    HTMLElement,
    { width: number, height: number }
> = (node, s) => {
    if (s) {
        node.style.aspectRatio = (s.width / s.height).toString();
    }
    return {
        update (s) {
            node.style.aspectRatio = (s.width / s.height).toString();
        },
    };
};

export default ratio;
