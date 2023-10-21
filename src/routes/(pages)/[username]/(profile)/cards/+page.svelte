<script lang="ts">
    import type { Paginator } from "$api";
    import type { FiltersSchema } from "$elem/Filters.svelte";
    import type { ID } from "$lib/utils/NM Types";
    import type NM from "$lib/utils/NM Types";

    import { EndlessPaginator, getUserCards } from "$api";
    import CardTile from "$elem/CardTile.svelte";
    import Filters from "$elem/Filters.svelte";
    import MetaSeo from "$elem/MetaSeo.svelte";
    import TwoOrFourColumns from "$elem/TwoOrFourColumns.svelte";
    import { viewPrint } from "$lib/overlays";
    import { RARITY } from "$lib/utils/config";
    import { scaleHeight } from "$lib/utils/utils";

    export let data;

    const { isAuthenticated } = data.currentUser;

    const filtersSchema: FiltersSchema = {
        buttons: [{
            key: "duplicates",
            hint: "Duplicates",
            name: "Duplicates",
            value: false,
            icons: "duplicate",
        }],
        group: RARITY.map((rar) => ({
            key: rar.class,
            hint: rar.name,
            name: rar.name,
            value: false,
            icons: rar.class,
        })),
        list: [{
            name: "Recently Collected",
            key: "acquired",
            desc: true,
        }, {
            name: "Alphabetical: A to Z",
            key: "alphabetical",
            desc: false,
        }, {
            name: "Alphabetical: Z to A",
            key: "alphabetical",
            desc: true,
        }, {
            name: "Scarcity : High to Low",
            key: "scarcity",
            desc: false,
        }, {
            name: "Copies Owned",
            key: "own_count",
            desc: true,
        }, {
            name: "Print # : Low to High",
            key: "print_num",
            desc: false,
        }],
    };
    if (isAuthenticated()) {
        filtersSchema.buttons.unshift({
            key: "favorite",
            hint: "Favorites",
            name: "Favorites",
            value: false,
            icons: ["like", "liked"],
        });
    }
    let filters: Record<string, any> = {};

    let cards: Paginator<NM.OwnedCard> = new EndlessPaginator();

    let skip = true;
    $: if (skip) {
        skip = false;
    } else {
        cards = getUserCards(
            data.user.id,
            filters,
        );
    }

    function viewCard (cardId: ID<"card">) {
        viewPrint({
            cardId,
            gallery: cards.items.map((c) => c.id),
            owner: data.user,
        });
    }
</script>

<MetaSeo url="/" title="NeonMob - A Game & Marketplace of Digital Art Trading Cards" />

<Filters schema={filtersSchema} bind:filters />
<TwoOrFourColumns items={cards}
    itemHeight={(card) => scaleHeight(card.piece_assets.image.medium, 240)}
    let:item
>
    <CardTile card={item} {viewCard} />
</TwoOrFourColumns>
