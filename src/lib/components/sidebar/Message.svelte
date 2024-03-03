<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import { page } from "$app/stores";
    import Avatar from "$elem/Avatar.svelte";
    import Clickable from "$elem/Clickable.svelte";
    import Time from "$elem/Time.svelte";
    import TradePreviews from "$elem/TradePreviews.svelte";
    import { firstName } from "$lib/services/user";
    import { linky } from "$lib/utils/format";

    /**
     * The message data
     */
    export let message: NM.Message;
    /**
     * The collocutor's data
     */
    export let collocutor: NM.UserCollocutor;
    /**
     * Whether collapse the message with the previous one
     */
    export let isCondensed = false;

    const { isCurrentUser, user } = $page.data.currentUser;
    const commenter = isCurrentUser(message.user_id) ? user : collocutor;
    let showTrade = message.attachment?.active ?? false;

    // converts the attachment into TradePreview compatible object
    function makeTradeObject (data: Exclude<NM.Message["attachment"], undefined>) {
        const youAreBidder = isCurrentUser(data.bidder_id);
        // make the prints go in descending order of rarity
        data.bidder_offer.prints.reverse().sort((a, b) => b.rarity.rarity - a.rarity.rarity);
        data.responder_offer.prints.reverse().sort((a, b) => b.rarity.rarity - a.rarity.rarity);
        return {
            ...data,
            bidder: youAreBidder ? user : collocutor,
            responder: youAreBidder ? collocutor : user,
        };
    }
</script>

<svelte:options immutable />

<li class:isCondensed>
    <a class="avatar" target="_self" href={commenter.links.profile}>
        <Avatar user={commenter} />
    </a>
    <header>
        {#if message.attachment?.type === "trade"}
            {firstName(commenter)} {message.comment}
        {:else}
            <a target="_self" href={commenter.links.profile}>
                {firstName(commenter)}
            </a>
        {/if}
        <Time stamp={message.created} />
    </header>

    <section>
        {#if message.attachment?.type === "trade"}
            {#if showTrade}
                <TradePreviews trades={[makeTradeObject(message.attachment)]} />
            {:else}
                <Clickable link on:click={() => { showTrade = true; }}>
                    Show Details
                </Clickable>
            {/if}
        {:else}
            {linky(message.comment)}
        {/if}
    </section>
</li>

<style>
    li {
        padding: 8px 10px;
        gap: 0 5px;
        display: grid;
        grid-template-columns: 40px auto;
        grid-template-rows: 10px minmax(20px, auto);
    }
    li.isCondensed {
        grid-template-rows: 0 0 auto;
        padding-top: 0;
    }
    li:not(:first-child):not(.isCondensed)::before {
        content: "";
        display: block;
        height: 1px;
        width: calc(100% + 10px);
        background: #e6e6e6;
        position: relative;
        top: -6px;
        grid-area: 1/2;
    }
    .avatar {
        grid-area: 1/1 / 4/2;
    }
    .isCondensed .avatar {
        display: none;
    }
    header {
        grid-area: 2/2;
        font-size: 14px;
        color: #2c2830;
    }
    /* header a:link, header a:visited, section div {
        font-size: 14px;
        color: #0d9ce6;
        text-decoration: none;
        cursor: pointer;
    }
    header a:hover, section div:hover {
        color: #085b85;
    } */
    .isCondensed header {
        display: none;
    }
    section {
        font-size: 14px;
        color: #5f5668;
        grid-area: 3/2;
    }
</style>
