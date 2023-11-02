import type { Action } from "svelte/action";

import tooltip, { tooltipGenerator } from "../utils/tooltip";

import "./tip.css";

/**
 * A svelte action for adding a tooltip
 * @param elem - element to trigger the tooltip
 * @param hint - the tooltip text
 */
export default tooltipGenerator("text", { className: "tip" });

/**
 * A svelte action for adding a tooltip with HTML support
 * @param elem - element to trigger the tooltip
 * @param hint - the tooltip HTML
 */
export const htmlTip = tooltipGenerator("html", { className: "tip" });

/**
 * A svelte action for adding a tooltip with an error message
 * @param elem - element to trigger the tooltip
 * @param hint - the error message
 */
export const errorTip: Action<HTMLElement, string|string[]> = (elem, msg) => {
    const tip = tooltip("text", {
        className: "tip error show",
        placement: window.innerWidth < 640 ? "top" : "right",
    });

    function show (msg: string) {
        tip.show(elem, msg);
        tip.tip?.addEventListener("animationend", (ev) => {
            (ev.currentTarget as HTMLElement).classList.remove("show");
        });
    }

    if (msg && msg.length > 0) show(String(msg));

    return {
        update (msg) {
            if (msg && msg.length > 0) {
                show(String(msg));
            } else {
                tip.tip?.classList.add("hide");
                tip.tip?.addEventListener("animationend", () => {
                    tip.hide();
                });
            }
        },
        destroy: tip.hide,
    };
};
