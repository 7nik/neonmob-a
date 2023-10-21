<!-- @component
    Overlay with detailed info about card or print
 -->
<script lang="ts" context="module">
    import type NM from "$lib/utils/NM Types";

    import { getOwnedPrints, resolveCard } from "$api";
    import useHistory from "$lib/overlays/useHistory";
    // eslint-disable-next-line import/no-self-import
    import Overlay from "./PrintDetailsOverlay.svelte";

    const { view, close } = useHistory(
        "print details",
        () => Overlay,
        async (url, data: { cardId?: ID<"card"> } = {}) => {
            if (data.cardId !== undefined) {
                return {
                    cardId: data.cardId,
                };
            }

            // eslint-disable-next-line unicorn/no-unreadable-array-destructuring
            const [,, settSlug, cardSlug] = new URL(url).pathname.split("/");

            const { cardId } = await resolveCard(settSlug, cardSlug);
            return { cardId: cardId! };
        },
        ({ cardId }) => ({ cardId }),
    );

    export { view as viewPrint };
</script>

<script lang="ts">
    import type { ID } from "$lib/utils/NM Types";

    import Button from "$elem/Button.svelte";
    import Icon from "$elem/Icon.svelte";
    import PrintDetails from "$elem/PrintDetails.svelte";
    import { absUrl } from "$lib/utils/utils";
    import CloseableOverlay from "./CloseableOverlay.svelte";
    import { page } from "$app/stores";

    export let cardId: ID<"card">;
    export let gallery: number[] = [];
    export let owner: Pick<NM.User, "id" | "username" | "name" | "avatar"> | null = null;

    $: owner = owner ?? $page.data.currentUser.user;

    if (!gallery.includes(cardId)) gallery.push(cardId);
    const cards = gallery
        ? gallery.map(() => null) as (Promise<NM.Unmerged.Prints>|NM.Unmerged.Prints|null)[]
        : [];
    let card: NM.Unmerged.Prints|null = null;
    let printIndex: number;

    $: {
        card = null;
        printIndex = gallery.indexOf(cardId);
        showPrint(0);
    }

    async function preloadPrint (index: number) {
        if (cards[index]) return cards[index]!;
        const promise = getOwnedPrints(owner?.id || 1, gallery[index]);
        cards[index] = promise;
        const ithPrint = await promise;
        cards[index] = ithPrint;
        // preload the image
        new Image().src = ithPrint.piece_assets.image.xlarge.url;
        return ithPrint;
    }

    async function showPrint (delta: -1|0|1) {
        if (gallery.length < 2) {
            if (!card) {
                card = await getOwnedPrints(owner?.id || 1, cardId);
            }
            return;
        }
        printIndex += delta;
        if (printIndex >= gallery.length) {
            printIndex = 0;
        } else if (printIndex < 0) {
            printIndex = gallery.length - 1;
        }
        card = null;
        card = await preloadPrint(printIndex);
        const url = absUrl(card.prints[0]?.public_url ?? card.public_url);
        // preload neighbor prints
        preloadPrint((printIndex + 1) % gallery.length);
        preloadPrint((printIndex - 1 + gallery.length) % gallery.length);
        // trigger saving history
        if (window.location.pathname !== url) {
            view({ cardId: card.id }, url);
        }
    }

    function hotkey (ev: KeyboardEvent) {
        switch (ev.code) {
            case "ArrowRight": showPrint(1); break;
            case "ArrowLeft": showPrint(-1); break;
            // no default
        }
    }
</script>

<svelte:window on:keyup={hotkey} />

<CloseableOverlay {close}>
    <div class="print">
        {#if card}
            {#if gallery.length > 1}
                <div class="buttons">
                    <span class="btn">
                        <Button type="subdued-light" on:click={() => showPrint(-1)}>‹</Button>
                    </span>
                    <span class="btn">
                        <Button type="subdued-light" on:click={() => showPrint(1)}>›</Button>
                    </span>
                </div>
            {/if}
            <PrintDetails {card} {owner} />
        {:else}
            <div class="loading"><Icon icon="loader" /></div>
        {/if}
    </div>
</CloseableOverlay>

<style>
    .print {
        width: 100%;
        min-height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 50px;
        overflow: auto;
    }
    .buttons {
        display: contents;
    }
    .btn > :global(*) {
        font-size: 50px;
        font-weight: 100;
        line-height: 30px;
        padding: 40px 5px;
    }
    .btn + .btn {
        order: 1;
    }
    .loading {
        padding: 20px;
        margin: auto;
        --icon-size: 40px;
    }
    @media screen and (max-width: 820px) {
        .print {
            flex-direction: column;
            justify-content: start;
            gap: 20px;
        }
        .buttons {
            width: min(290px, calc(100vw - 20px));
            display: flex;
            justify-content: space-between;
            order: 1;
            gap: 20px;
        }
        .btn > :global(*) {
            font-size: 30px;
            padding: 5px 50px 10px;
        }
    }
</style>
