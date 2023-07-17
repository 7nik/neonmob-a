<!-- @component
    Page with series details
 -->
<script lang="ts">
    import type { PojoPaginator } from "$api";
    import type NM from "$lib/utils/NM Types";
    import type { rarityName } from "$lib/utils/NM Types";

    import { ArrayPaginator } from "$api";
    import Activities from "$elem/Activities.svelte";
    import Clickable from "$elem/Clickable.svelte";
    import Icon from "$elem/Icon.svelte";
    import MetaSeo from "$elem/MetaSeo.svelte";
    import RarityText from "$elem/RarityText.svelte";
    import SectionHeader from "$elem/SectionHeader.svelte";
    import SettTile from "$elem/SettTile.svelte";
    import ShortenText from "$elem/ShortenText.svelte";
    import { viewPrint } from "$lib/overlays";
    import SettInfo from "$lib/utils/SettInfo";

    export let sett: NM.Sett;
    export let cards: Promise<NM.CardName[]>;
    export let setts: Promise<NM.Sett[]>;
    export let activities: Promise<PojoPaginator<NM.ActivityAny>>;

    const settInfo = new SettInfo(sett);
    let cardNames: NM.CardName[] = [];
    cards.then((arr) => {
        cardNames = arr.sort((a, b) => (
            a.rarity.rarity - b.rarity.rarity || (a.name > b.name ? 1 : -1)
        ));
    });

    let creatorSetts: NM.Sett[] = [];
    setts.then((arr) => {
        creatorSetts = arr.filter((s) => s.id !== sett.id).slice(0, 3);
    });

    type Rarity = Parameters<typeof settInfo["cards"]>[0];
    function progress (filter: Rarity | rarityName) {
        filter = filter.toLowerCase() as Rarity;
        return `${settInfo.cards(filter, "owned")}/${settInfo.cards(filter, "total")}`;
    }

    let showCardList = true;

    // cards split into columns by rarity, but variants - into multiple columns
    $: checklists = [...sett.core_stats, ...sett.special_stats]
        .flatMap((rar) => {
            const list = cardNames.filter((c) => c.rarity.rarity === rar.rarity);
            if (rar.name !== "variant") {
                return [list];
            }
            let count = 5 - (settInfo.has("chase") ? 1 : 0) - (settInfo.has("legendary") ? 1 : 0);
            const column = [];
            let start = 0;
            while (count) {
                const size = Math.ceil((list.length - start) / count);
                column.push(list.slice(start, start + size));
                start += size;
                count -= 1;
            }
            return column;
        })
        .filter((arr) => arr.length);

    function viewCard (card: NM.CardName) {
        viewPrint({ cardId: card.id, gallery: cardNames.map((c) => c.id) });
    }
</script>

<!-- eslint-disable-next-line max-len -->
<MetaSeo title="{sett.name}, a Series created by {sett.creator.name} ({sett.creator.username}) on Neonmob"
    description={sett.description}
    image={sett.sett_assets.large}
/>

<section class="description">
    <SectionHeader title="Description"/>
    <ShortenText
        content={sett.description}
        type="markdown"
        wordLimit={100}
        wordTolerance={50}
    />
    {#if sett.categories.length > 0}
        <div class="categories">
            <span>found in</span>
            {#each sett.categories as cat, i}
                {#if i > 0},{/if}
                <a href={cat.collect_url}>{cat.name}</a>
            {/each}
        </div>
    {/if}
</section>
<section class="card-list">
    <SectionHeader
        title="Series Checklist ({progress("core")})"
        showLoader={cardNames.length === 0}
    >
        <Clickable on:click={() => { showCardList = !showCardList; }}>
            {showCardList ? "Hide" : "Show"} List
        </Clickable>
    </SectionHeader>
    {#if showCardList}
        <div class="checklist">
            {#each checklists as list}
                {@const rarityCss = list[0].rarity.class}
                {@const rarityName = list[0].rarity.name}
                <div class="rarity {rarityCss}">
                    <header>
                        <Icon icon={rarityCss} />
                        <RarityText rarity={rarityCss}>
                            {progress(rarityName)} {rarityName}
                        </RarityText>
                    </header>
                    <div>
                        {#each list as card}
                            <!-- FIXME implement owner check -->
                            <!-- FIXME public_url -> absolute url -->
                            <a href="{card.public_url}" class="owned"
                                data-sveltekit-preload-data="off"
                                data-sveltekit-preload-code="hover"
                                on:click|preventDefault={() => viewCard(card)}
                            >
                                <Icon icon="checkmark"/>
                                {card.name}
                            </a>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</section>
<!-- FIXME: Milestones section -->
<!-- Leaderboard section -->
{#if creatorSetts.length > 0}
    <section class="other-setts">
        <SectionHeader title="{sett.creator.first_name}'s Other Series">
            <i><a href="/creator/{sett.creator.username}">Creator's profile</a></i>
        </SectionHeader>
        {#each creatorSetts as s}
            <SettTile sett={s} />
        {/each}
    </section>
{/if}
<SectionHeader title="Recent Activity" />
<Activities paginator={ArrayPaginator.fromPOJO(activities)} />

<style>
    section {
        padding: 20px 0;
    }
    .description :global(p:last-of-type) {
        margin-bottom: 5px;
    }
    .categories {
        margin-top: 20px;
    }
    .categories span {
        color: #857a90;
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: .035em;
        padding-right: 5px;
    }
    .checklist {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 20px;
    }
    .rarity header {
        padding: 0 0 10px;
        --icon-size: 20px;
    }
    .rarity.variant ~ .rarity.variant header {
        visibility: hidden;
    }
    /* rarity icon */
    .rarity header > :global(:first-child) {
        margin-top: -2px;
    }
    .rarity div {
        margin: 0 0 10px 5px;
        font-size: 13px;
        --icon-size: 13px;
    }
    .rarity a {
        display: flex;
        gap: 7px;
        padding: 2px 0;
        word-break: break-word;
        align-items: flex-start;
        justify-content: flex-start;
    }
    .rarity .owned {
        color: #857a90;
    }
    .other-setts {
        text-align: center;
    }
    .other-setts :global(article:first-of-type) {
        margin-left: -10px;
    }
    @media screen and (max-width: 980px) {
        section.other-setts.other-setts > :global(:nth-child(4)) {
            display: none;
        }
    }
    @media screen and (max-width: 768px) {
        .checklist {
            grid-template-columns: repeat(2, 1fr);
            grid-auto-flow: row dense;
        }
        .rarity.variant ~ .rarity.variant header {
            display: none;
        }
        :not(.variant) + .rarity.variant:nth-child(even) ~ .rarity.variant {
            grid-column-start: 2;
            margin: -30px 0 0;
        }
        :not(.variant) + .rarity.variant:nth-child(odd) ~ .rarity.variant {
            grid-column-start: 1;
            margin: -30px 0 0;
        }
    }
    @media screen and (max-width: 640px) {
        section.other-setts.other-setts > :global(:nth-child(3)) {
            display: none;
        }
    }
</style>
