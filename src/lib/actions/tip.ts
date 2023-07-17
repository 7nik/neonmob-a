import tooltip from "../utils/tooltip";

import "./tip.css";

/**
 * A svelte action for adding a tooltip
 * @param elem - element to trigger the tooltip
 * @param hint - the tooltip text
 */
export default tooltip("text", { className: "tip" });

/**
 * A svelte action for adding a tooltip with HTML support
 * @param elem - element to trigger the tooltip
 * @param hint - the tooltip HTML
 */
export const htmlTip = tooltip("html", { className: "tip" });
