import type { absoluteURL, fullURL } from "./NM Types";

import { afterUpdate, onMount } from "svelte";
import { get } from "svelte/store";
import { page } from "$app/stores";

/**
 * Turns the urls into the full one if needed
 * @param url - the URL to fix
 * @returns url with protocol and origin
 */
export function fullUrl (url: string): fullURL {
    if (url.startsWith("//")) return `https:${url}`as fullURL;
    if (url.startsWith("/")) return get(page).url.origin.concat(url)as fullURL;
    return url as fullURL;
}

/**
 * Turns the urls into the absolute one if needed
 * @param url - the URL to fix
 * @returns url without host
 */
export function absUrl (url: string): absoluteURL {
    if (url.startsWith("//")) {
        return url.slice(url.indexOf("/", 2)) as absoluteURL;
    }
    if (url.startsWith("http")) {
        return url.slice(url.indexOf("/", 8)) as absoluteURL;
    }
    return url as absoluteURL;
}

// /**
//  * Finds closest scrollable element
//  * @param element - the starting element
//  * @param includeHidden - search for element with `overflow: hidden` as well, by default - no
//  * @returns closest scrollable parent or passed element
//  */
// export function getScrollContainer (element: Element, includeHidden = false) {
//     let excludeStaticParent = false;
//     const scrollOverflows = includeHidden ? ["auto", "scroll", "hidden"] : ["auto", "scroll"];

//     while (element) {
//         const style = getComputedStyle(element);
//         if (style.position === "fixed") break;
//         if (!excludeStaticParent && style.position === "absolute") {
//             excludeStaticParent = true;
//         }
//         if ((!excludeStaticParent || style.position !== "static")
//             && [style.overflow, style.overflowY, style.overflowX]
//                 .some((overflow) => scrollOverflows.includes(overflow))
//         ) {
//             return element;
//         }
//         if (!element.parentElement) break;
//         element = element.parentElement;
//     }

//     return document.scrollingElement ?? document.documentElement;
// }

/**
 * A tool for infinite feed in Svelte only
 * @param action - a function to execute when around the bottom
 */
export function infiniteScroll (action: (() => void)) {
    const viewport = globalThis.document?.scrollingElement;
    function onscroll () {
        if (!viewport) return;
        // const viewport = document.scrollingElement!;
        const toBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
        if (toBottom < 500) {
            action();
        }
    }

    onMount(() => {
        if (!viewport) return;
        window.addEventListener("scroll", onscroll);
        // eslint-disable-next-line consistent-return
        return () => window.removeEventListener("scroll", onscroll);
    });

    afterUpdate(onscroll);
}

/**
 * Calls the passed function only when the pressed key is Enter
 * @param fn - the function to guard
 * @returns wrapped event handler
 */
export function onEnter (fn: (ev: KeyboardEvent) => void) {
    return function handlerWrapper (this: HTMLElement, ev: KeyboardEvent) {
        if (ev.key === "Enter" && !ev.altKey && !ev.shiftKey && !ev.ctrlKey) {
            fn.call(this, ev);
        }
    };
}

/**
 * Splits array of items into multiple columns with equal total height
 * @param items - array of items
 * @param count - number of columns
 * @param getHeight - function to get item's height
 * @param adjustLastRaw - try to fix skips in the last raw, default - no
 * @returns 0..`count` columns
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
export function array2columns<T> (
    items: T[],
    count: number,
    getHeight: (it:T) => number,
    adjustLastRaw = false,
) {
    if (!items || items.length === 0) return [];
    if (items.length <= count) return items.map((item) => [item]);
    count = Math.min(items.length, Math.max(1, Math.floor(count)));
    const padding = 20;
    // eslint-disable-next-line unicorn/no-new-array
    const heights = new Array<number>(count).fill(0).map((_, i) => getHeight(items[i]));
    const columns: T[][] = heights.map((_, i) => [items[i]]);
    for (const item of items.slice(count)) {
        const h = getHeight(item) + padding;
        let i = heights.findLastIndex((hh, i) => i && hh + h / 3 < heights[i - 1]);
        if (i < 0) i = 0;
        columns[i].push(item);
        heights[i] += h;
    }

    if (!adjustLastRaw
        || count <= 2
        || items.length <= count * 2
    ) {
        return columns;
    }
    if (count > 6) {
        console.error("improve the implementation");
        return columns;
    }
    const min = Math.min(...heights);
    const max = Math.max(...heights);
    // if not so bad
    if (heights.every((h) => h - min <= 20 || max - h <= 20)) {
        return columns;
    }

    // // all possible combinations of the items
    function combine (arr: number[]): number[][] {
        if (arr.length === 1) return [arr];
        return arr.flatMap((x, i) => {
            const copy = arr.slice();
            copy.splice(i, 1);
            return combine(copy).map((combines) => [x, ...combines]);
        });
    }

    // // all possible combinations of the items
    // // but when one item can appear twice
    // function combine2 (arr: number[]): number[][] {
    //     return arr.flatMap((x) => arr.flatMap((_, i) => {
    //         const copy = arr.slice();
    //         copy.splice(i, 1, x);
    //         return combine(copy);
    //     }));
    // }

    function combineOf (n: number) {
        return combine(Array.from({ length: n }).map((_, i) => i));
    }

    // all possible moves of one card to another column
    function cardMoves (size: number) {
        const moves: number[][] = [];
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (i !== j) {
                    const move = [];
                    move[i] = j;
                    moves.push(move);
                }
            }
        }
        return moves;
    }

    function estimateSolution (itemHeights: number[], swaps: number[]) {
        const newHeights = heights.slice();
        // eslint-disable-next-line unicorn/no-array-for-each
        swaps.forEach((to, from) => {
            newHeights[from] -= itemHeights[from];
            newHeights[to] += itemHeights[from];
        });
        const min = Math.min(...newHeights);
        const max = Math.max(...newHeights);
        // if one card starts lower than ends of the rest
        const subMax = max - itemHeights[newHeights.indexOf(max)];
        if (newHeights.every((h) => h === max || h < subMax)) {
            return 1e6;
        }
        // if one card ends higher than starts of the rest
        if (newHeights.every((h, i) => h === min || min < h - itemHeights[i] - 50)) {
            return 1e6;
        }

        const plainness = max - min;
        // const mid = Math.floor(count / 2);
        // const added = Math.max(...newHeights) - Math.max(...partialHeights);
        let dir = newHeights[0] - newHeights[1];
        let dirChanges = 0;
        // let diffs = 0;
        for (let i = 1; i < newHeights.length; i++) {
            // diffs += Math.abs(newHeights[i] - newHeights[i - 1]);
            const d = newHeights[i - 1] - newHeights[i];
            if (d !== dir && d * dir <= 0) {
                if (d && dir) dirChanges += 1;
                dir = d || dir;
            }
        }
        return plainness + dirChanges * 1000 + (dir < 0 ? 200 : 0);
        // return plainness;// + diffs + (goesDown || dirChanges > 1 ? 1000 : 0);
        // let diffs = 0;
        // let slope = 0;
        // for (let i = 0; i < newHeights.length - 1; i++) {
        //     slope += Math.abs(max - plainness * (i + 1) / count - newHeights[i]);
        //     if (i) diffs = Math.abs(newHeights[i] - newHeights[i - 1]);
        // }
        // return slope + diffs;
    }

    // try to apply a set of ways to improve the lats row
    function tryOptimization (getSwaps: (n:number) => number[][]) {
        const itemHeights = columns.map((column) => getHeight(column.at(-1)!) + padding);
        const initialScore = estimateSolution(itemHeights, []);
        const swaps = getSwaps(count);
        const scores = swaps.map((swap) => estimateSolution(itemHeights, swap));
        const bestScore = Math.min(...scores);
        // if initial solution isn't that bad
        // console.log(initialScore, bestScore);
        if (initialScore - bestScore > 20) {
            const bestSwap = swaps[scores.indexOf(bestScore)];
            // console.log(bestSwap);
            const removedItems: T[] = [];
            // eslint-disable-next-line unicorn/no-array-for-each
            bestSwap.forEach((_, from) => {
                removedItems[from] = columns[from].pop()!;
                heights[from] -= itemHeights[from];
            });
            // eslint-disable-next-line unicorn/no-array-for-each
            bestSwap.forEach((to, from) => {
                columns[to].push(removedItems[from]!);
                heights[to] += itemHeights[from];
            });
        }
    }

    // just swapping of all the last card in each column
    tryOptimization(combineOf);
    // try to move one card
    tryOptimization(cardMoves);

    return columns;
}

/**
 * Get the named cookie
 * @param name - the cookie name
 * @returns cookie value or nothing
 */
export function getCookie (name: string) {
    const [, valueAndTrash] = `; ${globalThis.document?.cookie}`.split(`; ${name}=`);
    if (valueAndTrash) return valueAndTrash.split(";", 2)[0];
    return null;
}

/**
 * Scale item dimensions to the given width and returns width
 * @param size - item dimensions to scale
 * @param width - the target width
 * @returns the scaled height
 */
export function scaleHeight ({ width, height }: { width: number, height: number }, w: number) {
    return height * (w / width);
}
