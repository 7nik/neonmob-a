<!-- @component
    Section of cards owned by user in a series
-->
<script lang="ts">
    import type { ID, rarityCss } from "$lib/utils/NM Types";
    import type NM from "$lib/utils/NM Types";

    import { StaticPaginator } from "$api";
    import CardTile from "$elem/CardTile.svelte";
    import PushSwitch from "$elem/PushSwitch.svelte";
    import TwoOrFourColumns from "$elem/TwoOrFourColumns.svelte";
    import { viewPrint } from "$lib/overlays";
    import currentUser from "$lib/services/currentUser";
    import { capitalize } from "$lib/utils/format";
    import { scaleHeight } from "$lib/utils/utils";

    /**
     * The target series
     */
    export let sett: NM.Sett;
    /**
     * The list of collected cards
     */
    export let collection: Promise<NM.Card[]>;
    /**
     * Force display of colored cards
     */
    export let isPublic = false;

    // filters are applied only when non-falsy
    let favorite = false;
    /**
     * 0 - off
     * 1 - unowned
     * 2 - owned
     */
    let own: 0|1|2 = 0;
    let duplicate = false;
    const rarities: {
        name: string,
        class: rarityCss,
        selected: boolean,
    }[] = [...sett.core_stats, ...sett.special_stats].map((stat) => ({
        name: capitalize(stat.name),
        class: stat.class_name,
        selected: false,
    }));
    let cards: NM.Card[] = [];
    let isUserCollecting: boolean;
    collection.then((data) => {
        cards = data;
        isUserCollecting = cards.some((c) => c.own_count > 0);
    });

    let filteredCards: NM.Card[] = [];

    $: {
        // if user views own cards but has nothing
        if (!isUserCollecting && !isPublic) {
            filteredCards = [];
            // eslint-disable-next-line no-labels
            break $;
        }
        const allowedRarities = rarities.some((r) => r.selected)
            ? rarities.filter((r) => r.selected).map((r) => r.class)
            : null;
        filteredCards = cards.filter((card) => (
            (!favorite || favorite && card.favorite)
            && (!duplicate || duplicate && card.own_count > 1)
            && (!own || own === 1 && card.own_count === 0 || own === 2 && card.own_count > 0)
            && (!allowedRarities || allowedRarities.includes(card.rarity.class))
        ));
    }

    function viewCard (cardId: ID<"card">) {
        const ownedCards = isPublic || !currentUser.isAuthenticated
            ? filteredCards
            : filteredCards.filter((c) => c.own_count);
        viewPrint({
            cardId,
            gallery: ownedCards.map((c) => c.id),
        });
    }
</script>

<section class="filters">
    <span class="user-filters">
        <!-- FIXME - check if is somebody's collection instead -->
        <span class="label">FILTERS:</span>
        {#if $currentUser.isAuthenticated}
            <PushSwitch
                bind:value={favorite}
                icons={["like", "liked"]}
                hint="Favorites"
            >Favorite</PushSwitch>
        {/if}
        {#if !isPublic}
            <PushSwitch
                bind:value={own}
                icons={["filterUnowned", "unowned", "owned"]}
                hint="Ownership"
            >{own === 2 ? "Owned" : "Unowned"}</PushSwitch>
            <PushSwitch
                bind:value={duplicate}
                icons={"duplicate"}
                hint="Duplicates"
            >Duplicates</PushSwitch>
        {/if}
    </span>

    <span class="rarity-filters">
        {#each rarities as rarity}
            <PushSwitch bind:value={rarity.selected} icons={rarity.class} hint={rarity.name} />
        {/each}
    </span>
</section>

<TwoOrFourColumns items={new StaticPaginator(filteredCards, 16)}
    itemHeight={(card) => scaleHeight(card.piece_assets.image.medium, 240)}
    let:item
>
    <CardTile card={item} {viewCard} {isPublic} />
    <svelte:fragment slot="empty">
        {#if isUserCollecting}
            No prints matching these filters
        {:else}
            No cards collected
        {/if}
    </svelte:fragment>
</TwoOrFourColumns>

<style>
    .filters {
        margin-top: 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
    }
    .filters .user-filters {
        display: flex;
        gap: 5px;
        color: #857A90;
        font-size: 0;
        font-weight: 500;
        line-height: 1.4;
        --icon-size: 16px;
        --icon-color: #857A90;
    }
    .filters .user-filters .label {
        align-self: center;
        font-size: 12px;
        line-height: normal;
    }
    .filters .user-filters > :global(:not(.label)) {
        width: 48px;
        height: 42px;
    }
    .filters .rarity-filters {
        height: 42px;
        width: 50%;
        display: flex;
        border: 1px solid #d6d6d6;
        border-radius: 4px;
        --icon-size: 20px;
    }
    .filters .rarity-filters > :global(*) {
        flex-grow: 1;
        box-shadow: none;
        border-right: 1px solid #d6d6d6;
        border-radius: 0;
    }
    .filters .rarity-filters > :global(:last-child) {
        border-right: none;
    }

    @media screen and (max-width: 480px) {
        .filters .user-filters {
           font-size: 13px;
           width: 100%;
           color: #39343e;
        }
        .filters .user-filters .label {
           display: none;
        }
        .filters .user-filters > :global(:not(.label)) {
            flex-grow: 1;
            width: auto;
           font-weight: 400;
        }
        .filters .rarity-filters {
            width: 100%;
        }
    }
</style>
