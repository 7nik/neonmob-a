<!-- @component
    Block with cards displayed above the profile
 -->
<script lang="ts">
    import type { ID } from "$lib/utils/NM Types";

    import { onMount } from "svelte";
    import { StaticPaginator, getDisplayCards } from "$api";
    import Clickable from "$elem/Clickable.svelte";
    import Icon from "$elem/Icon.svelte";
    import PrintAsset from "$elem/PrintAsset.svelte";
    import TwoOrFourColumns from "$elem/TwoOrFourColumns.svelte";
    import { viewPrint } from "$lib/overlays";

    export let userId: ID<"user">;

    // let folded = true;
    let height = 320;
    function toggleHeight (ev: Event) {
        if (height !== 320) {
            height = 320;
            return;
        }
        const target = (ev.currentTarget as Element).previousElementSibling!;
        height = target.clientHeight;
    }

    let ready = false;
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

<section class="display-cards" style:height="{height}px">
    {#await promise then cards}
        <TwoOrFourColumns items={new StaticPaginator(cards, 16)}
            itemHeight={() => 1}
            let:item
        >
            <Clickable on:click={() => viewCard(item.id)}>
                <PrintAsset card={{ ...item, name: "" }} size="large" />
            </Clickable>
        </TwoOrFourColumns>
    {/await}
    <Clickable on:click={toggleHeight}>
        <div class="condenser">
            <Icon icon={height === 320 ? "reveal" : "conceal" } />
        </div>
    </Clickable>
</section>

<style>
    .display-cards {
        position: relative;
        background: #1a1417;
        transition: height .3s linear;
        overflow: hidden;
    }
    .display-cards > :global(.items) {
        margin: 10px auto 20px;
    }
    .display-cards :global(.print-asset) {
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
    @media screen and (hover: none) {
        .condenser {
            --icon-color: white;
        }
    }
</style>
