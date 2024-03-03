import type { Action } from "svelte/action";

// import { onMount, afterUpdate } from "svelte";

/**
 * Finds closest scrollable element
 * @param element - the starting element
 * @param includeHidden - search for element with `overflow: hidden` as well, by default - no
 * @returns closest scrollable parent or passed element
 */
function getScrollContainer (element: Element, includeHidden = false) {
    let excludeStaticParent = false;
    const scrollOverflows = includeHidden ? ["auto", "scroll", "hidden"] : ["auto", "scroll"];

    // body has set overflow prop, so exclude it
    while (element && element !== document.body) {
        const style = getComputedStyle(element);
        if (style.position === "fixed") break;
        if (!excludeStaticParent && style.position === "absolute") {
            excludeStaticParent = true;
        }
        if ((!excludeStaticParent || style.position !== "static")
            && [style.overflow, style.overflowY, style.overflowX]
                .some((overflow) => scrollOverflows.includes(overflow))
        ) {
            return element;
        }
        element = element.parentElement as Element;
    }

    return document.scrollingElement ?? document.documentElement;
}

type Props = {
    action: (() => void),
    threshold: number,
} | (() => void) & Partial<{
    action: (() => void),
    threshold: number,
}>

/**
 * An action for creating infinite feed. Automatically find the closest scrollable container
 * @param elem - a target container for the feed
 * @param params - the action to perform or object:
 * @param params.action - the action
 * @param params.threshold - distance to the viewport end to trigger the action
 */
const infiniteScroll: Action<HTMLElement, Props> = (elem, params) => {
    const viewport = getScrollContainer(elem);
    if (!params) throw new Error("Params are required");
    const {
        action = params as () => void,
        threshold = 500,
    } = params;

    function onscroll () {
        if (!viewport) return;
        const toBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
        if (toBottom < threshold) {
            action();
        }
    }

    // afterUpdate(onscroll);

    const container = viewport === document.scrollingElement ? window : viewport;
    container.addEventListener("scroll", onscroll);
    // eslint-disable-next-line consistent-return
    return {
        destroy () { container.removeEventListener("scroll", onscroll); },
    };
};

export default infiniteScroll;
