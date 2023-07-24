<!-- @component
    A tile of a card with its info and possible actions
-->
<script lang="ts">
    import type { ID } from "$lib/utils/NM Types";
    import type NM from "$lib/utils/NM Types";

    import { page } from "$app/stores";
    import Button from "$elem/Button.svelte";
    import Icon from "$elem/Icon.svelte";
    import { fail } from "$lib/dialogs";
    import currentUser from "$lib/services/currentUser";
    import { onEnter } from "$lib/utils/utils";
    import PrintAsset from "./PrintAsset.svelte";

    export let card: NM.OwnedCard|NM.Card;
    // TODO switch to gallery on context?
    /**
     * A function to show details about the card
     */
    export let viewCard: (id: ID<"card">) => void;
    /**
     * Force display of the card
     */
    export let isPublic = false;

    const { width, height } = card.piece_assets.image.medium;
    const ownedCount = card.own_count;

    function view () {
        if (isPublic || ownedCount) viewCard(card.id);
    }
</script>

<svelte:options immutable />

<div class="card"
    class:empty={ownedCount === 0 && !isPublic}
    use:ratio={card.piece_assets.image.medium}
    tabindex="-1"
    on:click={view}
    on:keypress={onEnter(view)}
>
    {#if isPublic || ownedCount > 0}
        <div class="img">
            <PrintAsset card={card} size="medium" {isPublic} />
        </div>
    {/if}
    {#if card.is_replica}
        <span class="edition"><Icon icon="RE" hint="Replica Edition"/></span>
    {:else if card.version === /* new limited */ 3 }
        <span class="edition"><Icon icon="LE" hint="Limited Edition"/></span>
    {/if}
    <div class="info" class:no-shadow={!$currentUser.isAuthenticated}>
        <Icon icon={card.rarity.class} />
        <span class="name">{card.name}</span>
        {#if ownedCount > 1}
            <span class="dups">{ownedCount}×</span>
        {/if}
    </div>
    {#if $currentUser.isAuthenticated}
        <div class="actions">
            <!-- FIXME replace card.own_count with checking against real owner? -->
            {#if $currentUser.canDo("trade")}
                <Button icon="trade" type="subdued-light"
                    hint={ownedCount
                        ? "Trade with a collector seeking this card"
                        : "Trade with an owner of this card"
                    }
                    on:click={(ev) => { ev.stopPropagation(); fail(); }}/>
            {/if}
            {#if ownedCount}
                <Button icon="discard" type="subdued-light"
                    hint="Discard for {card.rarity.carats} carats"
                    on:click={(ev) => { ev.stopPropagation(); fail(); }}/>
            {/if}
            {#if $currentUser.canDo("favorite")}
                <Button icon={ownedCount
                    ? (card.favorite ? "liked" : "like")
                    : (card.favorite ? "wishlisted" : "wishlist")
                }
                    type="subdued-light"
                    hint="{ownedCount ? "Favorite" : "Wishlist"}"
                    on:click={(ev) => { ev.stopPropagation(); fail(); }}/>
            {/if}
        </div>
    {/if}
</div>

<style>
    .card {
        position: relative;
        cursor: zoom-in;
        user-select: none;
        border-radius: 3px;
        overflow: hidden;
    }
    .card.empty {
        cursor: default;
    }
    .card .img, .card .info, .card .actions {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
    }
    .card .edition {
        position: absolute;
        top: 3%;
        right: 3%;
        --icon-size: 26px;
        z-index: 1;
    }
    .card .info {
        padding: 10px;
        display: flex;
        gap: .5ch;
        align-items: flex-end;
        color: white;
        background: linear-gradient(0, rgba(0,0,0,.5), transparent 100%);
        background-size: contain;
        --icon-size: 20px;
    }
    .card.empty .info {
        border: 2px dashed #d6d6d6;
        border-radius: 3px;
        background: none;
        color: #5f5668;
    }
    .card:hover .info:not(.no-shadow) {
        border: none;
        background:
            linear-gradient(0, rgba(0,0,0,.7), rgba(0,0,0,.06)),
            rgba(0,0,0,.25);
        color: white;
    }
    .card .name {
        flex-grow: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 14px;
        line-height: 17px;
    }
    .card .dups {
        justify-self: flex-end;
        /* margin-left: auto; */
        /* text-transform: uppercase; */
        border: 2px solid #fff;
        padding: 2px 5px 0;
        display: inline-block;
        font-size: 12px;
        font-weight: 500;
        opacity: .8;
        border-radius: 3px;
    }
    .card .actions {
        opacity: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
    }
    .card:hover .actions {
        opacity: 1;
    }
    .card .actions :global(.subdued-light) {
        box-shadow: inset 0 0 0 1px #fffa;
        /* box-shadow: none; */
    }
    .card .actions :global(.subdued-light:hover),
    .card .actions :global(.subdued-light:active) {
        /* box-shadow: inset 0 0 0 30px #fff2, inset 0 0 0 1px #fffa; */
        box-shadow: inset 0 0 0 1px #fff;
        /* box-shadow: none; */
    }
    @media screen and (max-width: 480px) {
        .card .name {
            font-size: 12px;
        }
    }
</style>
