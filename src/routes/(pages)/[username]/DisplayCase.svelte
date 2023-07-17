<!-- @component
    Block with cards displayed above the profile
 -->
<script lang="ts">
    import type { ID } from "$lib/utils/NM Types";

    import { onMount } from "svelte";
    import { getDisplayCards } from "$api";
    import Clickable from "$elem/Clickable.svelte";
    import Icon from "$elem/Icon.svelte";
    import PrintAsset from "$elem/PrintAsset.svelte";
    import { viewPrint } from "$lib/overlays";
    import { array2columns } from "$lib/utils/utils";

    export let userId: ID<"user">;

    let folded = true;
    let ready = false;
    let pageWidth = 1000;
    $: cols = pageWidth > 480 ? 4 : 2;

    $: promise = ready
        ? getDisplayCards(userId)
        : Promise.resolve([]);

    onMount(() => {
        ready = true;
    });

    async function viewCard (cardId: ID<"card">) {
        // eslint-disable-next-line unicorn/no-await-expression-member
        viewPrint({ cardId, gallery: (await promise).map((c) => c.id) });
    }
</script>

<svelte:window bind:innerWidth={pageWidth} />

<section class="display-cards" class:folded>
    <div class="cards">
        {#await promise then cards}
            {@const columns = array2columns(cards, cols, (c) => c.piece_assets.image.large.height)}
            {#each columns as column}
                <div class="column">
                    {#each column as card}
                        <Clickable on:click={() => viewCard(card.id)}>
                            <PrintAsset
                                card={{ ...card, name: "" }}
                                size="large"
                            />
                        </Clickable>
                    {/each}
                </div>
            {/each}
        {/await}
    </div>
    <Clickable on:click={() => { folded = !folded; }}>
        <div class="condenser">
            <Icon icon={folded ? "reveal" : "conceal" } />
        </div>
    </Clickable>
</section>

<style>
    .display-cards {
        height: 100%;
        position: relative;
        background: #1a1417;
        transition: height .3s linear;
    }
    .display-cards.folded {
        height: 320px;
        overflow: hidden;
    }
    .cards {
        max-width: 960px;
        margin: 10px auto 20px;
        padding: 0 10px;
        display: flex;
        gap: 20px;
    }
    .column {
        flex-basis: 0;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    .column > :global(*>*) {
        border-radius: 4px;
        overflow: hidden;
        cursor: zoom-in;
    }
    .condenser {
        width: 100%;
        height: 100px;
        padding: 0 0 20px;
        position: absolute;
        bottom: 0;
        background: linear-gradient(0, #0008, transparent);
        display: flex;
        align-items: flex-end;
        justify-content: center;
        --icon-size: 40px;
        --icon-color: transparent;
    }
    .display-cards:hover .condenser {
        --icon-color: white;
    }
    @media screen and (max-width: 480px) {
        .cards, .column {
            gap: 10px;
        }
    }
</style>
