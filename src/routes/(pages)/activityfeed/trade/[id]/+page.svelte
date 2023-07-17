<script lang="ts">
    import MetaSeo from "$elem/MetaSeo.svelte";
    import TradeBlock from "../../TradeBlock.svelte";

    export let data;

    const { full_name: name1, username: un1 } = data.activity.bidder.user;
    const { full_name: name2, username: un2 } = data.activity.responder.user;
</script>

<!-- the url should point to one of the cards -->
<!-- the image must be a promo -->
<MetaSeo title="{name1} ({un1}) Traded With {name2} ({un2}) on NeonMob"
    image={data.activity.responder.rarest_piece.large_image}
/>

<article>
    <TradeBlock offer={data.activity.bidder} completed={data.activity.completed} />
    <TradeBlock offer={data.activity.responder} completed={data.activity.completed} />
</article>

<style>
    article {
        margin: 10px auto;
        max-width: 500px;
        overflow: hidden;
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
</style>
