import TradePreviews from "$lib/components/TradePreviews.svelte";
import { getCachedTrade } from "$lib/services/cache";
import { tooltipGenerator } from "$lib/utils/tooltip";

import "./tradePreviews.css";

/**
 * Adds to the element a trade preview
 * @param elem - the element for triggering the preview
 * @param option.tradeIds - the IDs of the trades to preview
 * @param option.cardId - optional, the card ID to highlight
 */
const tradePreview = tooltipGenerator("element", {
    className: "trade-preview",
    showDelay: 350,
    hideDelay: 200,
    interactive: true,
}, async ({ tradeIds, cardId }: { tradeIds: number[] | null, cardId?: number }) => {
    if (!tradeIds || tradeIds.length === 0) return null;

    const trades = await Promise.all(tradeIds.map((id) => getCachedTrade(id)));

    const tip = document.createElement("div");
    new TradePreviews({
        target: tip,
        props: {
            trades,
            highlightCardId: cardId,
        },
    });
    return tip;
});

/**
 * Adds to the element a trade preview with the shared tooltip window
 * @param elem - the element for triggering the preview
 * @param tradeId - the ID of the trade to preview
 */
const sharedTradePreview = tooltipGenerator("element", {
    className: "trade-preview-sidebar",
    showDelay: 600,
    hideDelay: 200,
    placement: "left",
    singleton: true,
}, async (tradeId: number) => {
    const preview = document.createElement("div");
    const trade = await getCachedTrade(tradeId);
    new TradePreviews({
        target: preview,
        props: {
            trades: [trade],
            showButton: false,
        },
    });
    return preview;
});

export { tradePreview, sharedTradePreview };
