<script lang="ts">
    import { browser } from "$app/environment";
    import { viewTrade } from "$lib/overlays/TradeWindowOpener.svelte";
    import { initOverlays } from "$lib/overlays/useHistory";
    import { initCache } from "$lib/services/cache";
    import { initTradeCards } from "$lib/services/tradingCards";
    import { tick } from "svelte";
    import Topbar from "./Topbar.svelte";
    import { beforeNavigate } from "$app/navigation";

    export let data;

    if (browser) {
        initOverlays();
        initCache();
        initTradeCards();
    }

    beforeNavigate((nav) => {
        const tradeId = nav.to?.url.searchParams.get("view-trade");
        if (tradeId) {
            nav.cancel();
            tick().then(() => viewTrade(+tradeId));
        }
    });
</script>

<Topbar/>
<main>
    <slot></slot>
</main>
<footer>
    ©{new Date().getFullYear()} NeonMob —&nbsp;
    <i>{data.quote}</i>
</footer>

<style>
    main {
        margin-top: 50px;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }
    footer {
        margin-top: auto;
        padding: 20px 10px;
        text-align: center;
        font-size: 13px;
        color: #857a90;
    }
</style>
