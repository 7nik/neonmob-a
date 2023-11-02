import "./tooltip.css";

import type { Placement } from "@floating-ui/dom";
import type { Action } from "svelte/action";

import {
    autoUpdate,
    computePosition,
    offset,
    shift,
    flip,
    arrow,
} from "@floating-ui/dom";
import { browser } from "$app/environment";

type TooltipParams = {
    placement?: Placement,
    showDelay?: number,
    hideDelay?: number,
    interactive?: boolean,
    singleton?: boolean,
    className: string,
};
const defaultParams: TooltipParams = {
    placement: "top",
    showDelay: 0,
    hideDelay: 0,
    interactive: false,
    singleton: false,
    className: "tooltip",
};

type ContentType = "text" | "html" | "element";
type Content<C extends ContentType> = (C extends "element" ? HTMLElement : string) | null;
type ContentProvider<C extends ContentType> = Content<C> | (() => Content<C> | Promise<Content<C>>);

function attachTip (tip: HTMLElement, target: HTMLElement) {
    // keep tips inside top-level element if needed
    const parent = target.closest(":modal") ?? document.body;
    let container = parent.querySelector(":scope > #tips");

    if (!container) {
        container = document.createElement("div");
        container.id = "tips";
        parent.append(container);
    }
    container.append(tip);
}

function delay (ms: number) {
    return new Promise((res) => { setTimeout(res, ms); });
}

export default function tooltip<C extends ContentType> (type: C, params: TooltipParams) {
    const fullParams = { ...defaultParams, ...params };

    const arrowElem = document.createElement("div");
    arrowElem.className = "arrow";

    let tip: HTMLElement | null = null;
    // let instance: Instance | null = null;
    let closing: NodeJS.Timeout | null = null;
    let stopListeners: (() => void) | null = null;

    function hide () {
        tip?.remove();
        tip = null;
        stopListeners?.();
        stopListeners = null;
        closing = null;
    }

    function startHiding () {
        if (fullParams.hideDelay) {
            closing = setTimeout(hide, 200);
        } else {
            hide();
        }
    }

    function cancelHiding () {
        if (!closing) return;
        clearTimeout(closing);
        closing = null;
    }

    async function startShowing (elem: HTMLElement, contentProvider: ContentProvider<C>) {
        if (fullParams.singleton) {
            cancelHiding();
        } else {
            // hide and clean up previous tip
            hide();
        }
        let canceled = false;
        // do delay if needed
        if (fullParams.showDelay && !(fullParams.singleton && tip)) {
            elem.addEventListener("mouseleave", () => { canceled = true; }, { once: true });
            await delay(fullParams.showDelay);
            if (canceled) return;
        }
        const content = typeof contentProvider === "function"
            ? (await contentProvider())
            : contentProvider;
        if (canceled) return;
        // ensure the tooltip still needs to be shown
        if (content && document.contains(elem)) {
            show(elem, content);
        // if singleton is shown
        } else if (tip) {
            hide();
        }
    }

    function show (elem: HTMLElement, content: HTMLElement | string) {
        // create the tooltip and add the content
        if (tip) {
            stopListeners?.();
        } else {
            tip = document.createElement("div");
            tip.className = fullParams.className;
        }
        if (type === "html" && typeof content === "string") {
            tip.innerHTML = content;
        } else {
            tip.innerHTML = "";
            tip.append(content);
        }
        tip.prepend(arrowElem);
        if (fullParams.interactive) {
            tip.addEventListener("mouseleave", startHiding);
            tip.addEventListener("mouseenter", cancelHiding);
            tip.addEventListener("click", hide);
        }
        attachTip(tip, elem);

        // display the tooltip
        const stopTip = autoUpdate(elem, tip, () => {
            if (!tip || !document.contains(elem)) {
                hide();
                return;
            }
            computePosition(elem, tip, {
                placement: fullParams.placement,
                middleware: [
                    offset(8),
                    shift(),
                    flip(),
                    arrow({ element: arrowElem }),
                ],
            }).then(({
                x, y, placement, middlewareData,
            }) => {
                if (tip) {
                    tip.style.left = `${x}px`;
                    tip.style.top = `${y}px`;
                    tip.dataset.placement = placement;
                }
                if (middlewareData.arrow) {
                    arrowElem.style.left = `${middlewareData.arrow.x}px`;
                    arrowElem.style.top = `${middlewareData.arrow.y}px`;
                }
            });
        });
        // Listeners to hide the tooltip
        elem.addEventListener("mouseleave", startHiding);
        elem.addEventListener("mouseenter", cancelHiding);
        elem.addEventListener("click", hide);
        stopListeners = () => {
            elem.removeEventListener("mouseleave", startHiding);
            elem.removeEventListener("mouseenter", cancelHiding);
            elem.removeEventListener("click", hide);
            stopTip();
        };
    }

    return {
        get tip () { return tip; },
        show: startShowing,
        hide,
    };
}

type ContentGenerator<C extends ContentType> =
    (arg: any) => Content<C> | Promise<Content<C>>;

function tooltipGenerator <C extends ContentType, Params extends Content<C>> (
    type: C,
    params: TooltipParams,
): Action<HTMLElement, Params>;
function tooltipGenerator <C extends ContentType> (
    type: C,
    params: TooltipParams,
    provider: ContentGenerator<C>,
): Action<HTMLElement, any>;

/**
 * Generator of svelte actions of tooltips
 * @param type - type of tooltip content
 * @param params - params of the tooltip
 * @param provider - the content provider
 * @returns an action for tooltip
 */
function tooltipGenerator <C extends ContentType, Params extends Content<C> | any> (
    type: C,
    params: TooltipParams,
    provider?: ContentGenerator<C>,
): Action<HTMLElement, Params> {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    if (!browser) return () => {};
    const tip = tooltip(type, params);

    return (elem: HTMLElement, param?: Params) => {
        elem.addEventListener("mouseenter", () => {
            if (!param) return;
            tip.show(elem, provider ? provider(param!) : param as any);
        });
        return {
            update (p) {
                param = p;
            },
            destroy: tip.hide,
        };
    };
}

export { tooltipGenerator };
