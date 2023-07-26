<!-- @component
    Section of cards owned by user in a series
-->
<script lang="ts">
    import type { ID, rarityCss } from "$lib/utils/NM Types";
    import type NM from "$lib/utils/NM Types";

    import { page } from "$app/stores";
    import { EndlessPaginator, StaticPaginator } from "$api";
    import CardTile from "$elem/CardTile.svelte";
    import Filters, { type FiltersSchema } from "$elem/Filters.svelte";
    import TwoOrFourColumns from "$elem/TwoOrFourColumns.svelte";
    import { viewPrint } from "$lib/overlays";
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

    const { isAuthenticated } = $page.data.currentUser;

    const rarities: {
        key: string,
        hint: string,
        name: string,
        value: boolean,
        icons: rarityCss,
    }[] = [...sett.core_stats, ...sett.special_stats].map((stat) => ({
        key: stat.class_name,
        hint: capitalize(stat.name),
        name: capitalize(stat.name),
        value: false,
        icons: stat.class_name,
    }));
    const userFilers: FiltersSchema["buttons"] = [];
    if (isAuthenticated()) {
        userFilers.push({
            key: "favorite",
            hint: "Favorites",
            name: "Favorites",
            value: false,
            icons: ["like", "liked"],
        });
    }
    if (!isPublic) {
        userFilers.push({
            key: "owned",
            hint: "Ownership",
            name: ["Unowned", "Unowned", "Owned"],
            value: 0,
            icons: ["filterUnowned", "unowned", "owned"],
        }, {
            key: "duplicate",
            hint: "Duplicates",
            name: "Duplicates",
            value: false,
            icons: "duplicate",
        });
    }

    let filters: Record<string, any> = {};

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
        const allowedRarities = rarities.some((r) => filters[r.key])
            ? rarities.filter((r) => filters[r.key]).map((r) => r.icons)
            : null;
        const { favorite, duplicate, owned: own } = filters;
        filteredCards = cards.filter((card) => (
            // FIXME doesn't work in the preview cards mode
            (!favorite || favorite && card.favorite)
            && (!duplicate || duplicate && card.own_count > 1)
            && (!own || own === 1 && card.own_count === 0 || own === 2 && card.own_count > 0)
            && (!allowedRarities || allowedRarities.includes(card.rarity.class))
        ));
    }

    $: paginator = cards.length > 0
        ? new StaticPaginator(filteredCards, 16)
        : new EndlessPaginator<NM.Card>();

    function viewCard (cardId: ID<"card">) {
        const ownedCards = isPublic || !isAuthenticated()
            ? filteredCards
            : filteredCards.filter((c) => c.own_count);
        viewPrint({
            cardId,
            gallery: ownedCards.map((c) => c.id),
        });
    }
</script>

<Filters schema={{
    buttons: userFilers,
    group: rarities,
}} bind:filters />
<TwoOrFourColumns items={paginator}
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
