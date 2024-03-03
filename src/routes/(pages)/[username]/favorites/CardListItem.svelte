<!-- @component
    A card item in a list
 -->
<script lang="ts">
    import type NM from "$lib/utils/NM Types";
    import type { ID } from "$lib/utils/NM Types";

    import Clickable from "$elem/Clickable.svelte";
    import PrintAsset from "$elem/PrintAsset.svelte";
    import RarityText from "$elem/RarityText.svelte";
    import resolve from "$lib/actions/resolve";
    import { viewPrint } from "$lib/overlays/PrintDetailsOverlay.svelte";

    /**
     * The card to display
     */
    export let card: NM.Unmerged.FavoriteCards["results"][number];
    // TODO bypass gallery through context
    /**
     * All the list
     */
    export let gallery: ID<"card">[] = [];

    function viewCard () {
        viewPrint({ cardId: card.id, gallery });
    }
</script>

<div class="card">
    <div class="img">
        <Clickable on:click={viewCard}>
            <PrintAsset
                card={card}
                size="small"
                isPublic
                showRarity
                showSettType
            />
        </Clickable>
    </div>
    <div class="info">
        <Clickable on:click={viewCard}>
            <RarityText rarity={card.rarity.class}>{card.name}</RarityText>
        </Clickable>
        <span use:resolve={{ sett: card.sett }}>
            <a href={card.sett.links.permalink}>
                {card.sett.name}
            </a>
            by
            <a href="/{card.sett.creator.username}">
                {card.sett.creator.name}
            </a>
        </span>
    </div>
    <slot/>
</div>

<style>
    .card {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 10px 20px 10px 10px;
        background: white;
    }
    .img {
        flex-shrink: 0;
        display: block;
        width: 60px;
        height: 60px;
        border-radius: 4px;
        overflow: hidden;
    }
    .info {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        font-size: 15px;
    }
    .info span {
        font-size: 13px;
        color: #857a90;
    }
</style>
