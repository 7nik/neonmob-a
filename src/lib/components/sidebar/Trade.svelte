<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import Avatar from "$elem/Avatar.svelte";
    import Time from "$elem/Time.svelte";
    import { sharedTradePreview } from "$lib/actions/tradePreviews";
    // import { viewTrade } from "$lib/overlays/TradeWindowOpener.svelte";
    import { firstName } from "$lib/services/user";

    /**
     * The trade data
     */
    export let trade: NM.TradeNotification;
</script>

<svelte:options immutable />

<a href={trade.object.url} class:unread={!trade.read}
    use:sharedTradePreview={trade.object.id}
    data-sveltekit-preload-data="off"
>
    <Avatar user={trade.actor} />
    <section>
        <span>
            {firstName(trade.actor)}
            <Time stamp={trade.object.expires_on}/>
        </span>
        <div>{trade.verb_phrase} a trade</div>
    </section>
</a>

<style>
    a {
        height: 54px;
        padding: 0 10px;
        gap: 10px;
        text-decoration: none;
        display: flex;
        align-items: center;
    }
    a.unread {
        background: rgba(75,187,245,.2);
    }
    a:hover {
        background: #f4f4f4;
    }
    section {
        flex-grow: 1;
        align-self: stretch;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    a + a section {
        border-top: 1px solid #efefef;
    }
    a:hover + a section {
        border-top-color: transparent;
    }
    span {
        font-size: 14px;
        color: #2c2830;
    }
    div {
        font-size: 14px;
        color: #5f5668;
    }
</style>
