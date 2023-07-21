<script lang="ts">
    import type { Paginator } from "$api";
    import type { ID } from "$lib/utils/NM Types";
    import type NM from "$lib/utils/NM Types";

    import { EndlessPaginator, getUserCards } from "$api";
    import CardTile from "$elem/CardTile.svelte";
    import Icon from "$elem/Icon.svelte";
    import MetaSeo from "$elem/MetaSeo.svelte";
    import PushSwitch from "$elem/PushSwitch.svelte";
    import Select from "$elem/Select.svelte";
    import TwoOrFourColumns from "$elem/TwoOrFourColumns.svelte";
    import { viewPrint } from "$lib/overlays";
    import currentUser from "$lib/services/currentUser";
    import { RARITY } from "$lib/utils/config";
    import { scaleHeight } from "$lib/utils/utils";

    export let data;

    const sortOptions = [{
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
    }];

    let favorite = false;
    let duplicate = false;
    const rarities = RARITY.map((rar) => ({
        selected: false,
        class: rar.class,
        name: rar.name,
    }));
    let sortOption = sortOptions[0];

    let pageWidth = 1000; // thus it will SSR for wide screen
    let cards: Paginator<NM.OwnedCard> = new EndlessPaginator();

    let skip = true;
    $: if (skip) {
        skip = false;
    } else {
        cards = getUserCards(
            data.user.id,
            sortOption.key,
            sortOption.desc,
            {
                favorite,
                duplicates: duplicate,
                // eslint-disable-next-line unicorn/no-array-reduce
                ...rarities.reduce((obj, rar) => {
                    obj[rar.class] = rar.selected;
                    return obj;
                }, {} as Record<string, boolean>),
            },
        );
    }

    function viewCard (cardId: ID<"card">) {
        viewPrint({
            cardId,
            gallery: cards.items.map((c) => c.id),
        });
    }
</script>

<svelte:window bind:innerWidth={pageWidth}/>

<MetaSeo url="/" title="NeonMob - A Game & Marketplace of Digital Art Trading Cards" />

<section class="filters">
    <span class="user-filters">
        <span class="label">FILTERS:</span>
        {#if $currentUser.is(data.user)}
            <PushSwitch
                bind:value={favorite}
                icons={["like", "liked"]}
                hint="Favorites"
            >Favorite</PushSwitch>
        {/if}
        <PushSwitch
            bind:value={duplicate}
            icons={"duplicate"}
            hint="Duplicates"
        >Duplicates</PushSwitch>
    </span>

    <span class="rarity-filters">
        {#each rarities as rarity}
            <PushSwitch bind:value={rarity.selected} icons={rarity.class} hint={rarity.name} />
        {/each}
    </span>

    <Select list={sortOptions} bind:value={sortOption} let:item>
        {@const selected = item === sortOption}
        <span class="option current" slot="selected">{item?.name}</span>
        <span class="option" class:selected>
            {item?.name}
            {#if selected}<Icon icon="checkmark" />{/if}
        </span>
    </Select>
</section>

<TwoOrFourColumns items={cards}
    itemHeight={(card) => scaleHeight(card.piece_assets.image.medium, 240)}
    let:item
>
    <CardTile card={item} {viewCard} />
</TwoOrFourColumns>


<style>
    section {
        width: min(960px, 100%);
        margin: 0 auto;
    }

    .filters {
        padding: 20px 10px 0;
        display: flex;
        gap: 10px;
        color: #857A90;
        font-size: 0;
        font-weight: 500;
        line-height: 1.4;
        --icon-size: 14px;
    }
    .filters .user-filters {
        display: flex;
        gap: 5px;
        color: #857A90;
        font-size: 0;
        font-weight: 500;
        line-height: 1.4;
        --icon-size: 16px;
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
    .filters .user-filters > :global(.selected) {
        background: white;
    }
    .filters > :global(:last-child) {
        width: 250px;
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
    .filters .option {
        color: #433946;
        font-weight: 400;
        white-space: nowrap;
    }
    .filters .option.current {
        font-size: 12px;
    }
    .filters .option.selected {
        font-weight: 500;
        display: flex;
        justify-content: space-between;
    }
    @media screen and (max-width: 767px) {
        .filters {
            flex-wrap: wrap;
        }
        .filters .rarity-filters {
            flex-grow: 1;
            order: 1;
        }
    }
    @media screen and (max-width: 480px) {
        .filters .user-filters .label {
           display: none;
        }
    }
</style>
