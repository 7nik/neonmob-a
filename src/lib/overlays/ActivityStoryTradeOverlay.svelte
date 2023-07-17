<!-- @component
    Overlay with trade details from activity feed
 -->
<script lang="ts" context="module">
    // eslint-disable-next-line import/no-self-import
    import Overlay from "./ActivityStoryTradeOverlay.svelte";
    import useHistory from "./useHistory";

    const { view, close } = useHistory(
        "story trade",
        () => Overlay,
        (url, data: { tradeId?: number } = {}) => {
            const tradeId: ID<"trade"> = data.tradeId ?? Number(url.match(/\d+/)?.[0]);
            return { tradeId };
        },
    );

    export { view as viewTradeStory };
</script>

<script lang="ts">
    import type { ID } from "$lib/utils/NM Types";
    import { getActivityItem } from "$api";
    import Icon from "$elem/Icon.svelte";
    import TradeBlock from "../../routes/(pages)/activityfeed/TradeBlock.svelte";
    import CloseableOverlay from "./CloseableOverlay.svelte";

    export let tradeId: ID<"trade">;
</script>

<CloseableOverlay {close}>
    {#await getActivityItem("trade", tradeId)}
        <div class="loading"><Icon icon="loader" /></div>
    {:then trade}
        <div class="activity">
            <TradeBlock offer={trade.bidder} completed={trade.completed} />
            <TradeBlock offer={trade.responder} completed={trade.completed} />
        </div>
    {/await}
</CloseableOverlay>

<style>
    div {
        margin: 0 auto;
        min-height: 100%;
        display: flex;
        align-items: flex-start;
        justify-content: center;
    }
    .loading {
        align-items: center;
        --icon-size: 40px;
    }
    .activity {
        max-width: 500px;
        flex-direction: column;
        gap: 20px;
    }
    @media screen and (min-width: 1100px) {
        .activity {
            max-width: 1020px;
            flex-direction: row;
            align-items: flex-start;
        }
        .activity > :global(*) {
            width: 500px;
            position: sticky;
            top: 10px;
        }
    }
</style>
