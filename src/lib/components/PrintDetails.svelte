<!-- @component
    Detailed info about card/print
 -->
<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import { page } from "$app/stores";
    import Avatar from "$elem/Avatar.svelte";
    import Button from "$elem/Button.svelte";
    import Clickable from "$elem/Clickable.svelte";
    import Icon from "$elem/Icon.svelte";
    import PrintAsset from "$elem/PrintAsset.svelte";
    import RarityText from "$elem/RarityText.svelte";
    import { htmlTip } from "$lib/actions/tip";
    import { showShare, fail } from "$lib/dialogs";
    import { plural } from "$lib/utils/format";
    import ShortenText from "./ShortenText.svelte";

    export let card: NM.Unmerged.Prints | NM.Unmerged.Card;
    export let owner: Pick<NM.User, "id" | "username" | "name" | "avatar"> | null;

    const { isAuthenticated, isCurrentUser, wealth } = $page.data.currentUser;

    $: aspectRatio = card.piece_assets.image.large.width / card.piece_assets.image.large.height;
    $: printCount = "prints" in card ? card.prints.length : 0;
    const currentUserOwns = wealth.getPrintCount(card.id, true);

    function sharePrint (ev: Event) {
        showShare(ev, { card });
    }
</script>

<section class="dark">
    <header>
        <h1>{card.name}</h1>
        <a href={card.set.links.permalink}>{card.set.name}</a>
        <i>by</i>
        <a href={card.set.creator.link}>{card.set.creator.name}</a>
    </header>
    <div class="stack" style:--ratio={aspectRatio}>
        {#key card.id}
            <PrintAsset
                card={card} size="xlarge"
                isPublic={!$isAuthenticated}
            />
        {/key}
        {#if "prints" in card && card.prints.length > 0}
            {@const name = !owner || $isCurrentUser(owner) ? "You own" : `${owner.name} owns`}
            <!-- FIXME also check if user views own prints -->
            <div class="print-numbers" use:htmlTip={`${name}:<br>#${
                card.prints.map((p) => p.print_num).join("<br>#")
            }`}>
                <b>#{card.prints[0].print_num}</b><!--
             -->{#if card.num_prints_total !== "unlimited"}<!--
                    -->/{card.num_prints_total}
                {/if}
            </div>
        {/if}
        {#if printCount > 1}
            <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
            {#each { length: Math.min(4, printCount) } as _}
                <div class="print"></div>
            {/each}
        {/if}
    </div>
    <div class="info">
        <div class="description">
            <ShortenText
                content={card.description}
                type="markdown"
                wordLimit={100}
                wordTolerance={20}
            />
        </div>
        <div class="row">
            <Icon icon={card.rarity.class} upper={true} />
            <RarityText rarity={card.rarity.class} darkTheme>{card.rarity.name}</RarityText>
        </div>
        {#if $isAuthenticated && "favorite" in card}
            <div class="row">
                {#if printCount}
                    <Icon icon={card.favorite ? "liked" : "like"} upper={true} />
                    <Clickable link on:click={fail}>Favorite</Clickable>
                {:else}
                    <Icon icon={card.favorite ? "wishlisted" : "wishlist"} upper={true} />
                    <Clickable link on:click={fail}>Wishlist</Clickable>
                {/if}
            </div>
        {/if}
        {#if owner && !$isCurrentUser(owner)}
            <div class="row">
                <div class="avatar">
                    <Avatar user={owner} size="fill" />
                </div>
                <a href="/{owner.username}">{owner.name}</a>
                owns {printCount} {plural(printCount, "copy", "copies")}
            </div>
        {/if}
        {#if $isAuthenticated}
            <div class="row">
                <Icon icon={$currentUserOwns > 1
                    ? "multiPrints"
                    : ($currentUserOwns > 0 ? "checkmark" : "block")
                } upper={true} />
                You own {$currentUserOwns} {plural($currentUserOwns, "copy", "copies")}
            </div>
        {/if}
        <div class="actions">
            {#if $isAuthenticated}
                <!-- FIXME replace card.own_count with checking against real owner? -->
                <!-- {#if $currentUser.canDo("trade")} -->
                    <Button icon="trade"
                        on:click={(ev) => { ev.stopPropagation(); fail(); }}
                    >Trade</Button>
                <!-- {/if} -->
                <!-- FIXME also check if user views own prints -->
                {#if printCount}
                    <Button type="subdued-light"
                        on:click={(ev) => { ev.stopPropagation(); fail(); }}
                    >
                        <div class="discard">
                            Discard
                            <small>for {card.rarity.carats} carats</small>
                        </div>
                    </Button>
                {/if}
            {/if}
            <Button type="subdued-light"on:click={sharePrint}>Share</Button>
        </div>
    </div>
</section>

<style>
    section {
        background: #1a1417;
        display: grid;
        grid-template-columns: auto 290px;
        grid-template-rows: 1fr auto auto 1fr;
        gap: 10px 30px;
    }

    header {
        grid-area: 2/2;
        color: #b39ea9;
    }
    header h1 {
        color: white;
        margin: 0;
    }

    .stack {
        grid-area: 1/1 / 5/2;
        position: relative;
        aspect-ratio: var(--ratio, 1);
        width: clamp(300px, min(calc(100vw - 550px), calc((100vh - 200px) * var(--ratio))), 1100px)
    }
    .stack .print-numbers {
        position: absolute;
        bottom: 15px;
        right: 0;
        background: url(/img/print_sticker.png) 0 bottom no-repeat;
        height: 26px;
        color: rgba(255,255,255,.85);
        font-size: 12px;
        line-height: 26px;
        padding: 0 10px;
        white-space: nowrap;
        text-shadow: 0 -1px 1px rgb(0 0 0 / 30%);
    }
    .stack .print-numbers b {
        color: white;
        font-size: 13px;
        font-weight: 500;
    }
    .stack .print {
        position: absolute;
        top: calc(100% - 1px);
        left: 0;
        right: 0;
        transform-origin: center bottom;
    }
    .stack .print:nth-child(2) {
        bottom: -12px;
        z-index: 4;
        transform: scale(.975);
        background-color: #858585;
    }
    .stack .print:nth-child(3) {
        bottom: -16px;
        z-index: 3;
        transform: scale(.95);
        background-color: #737373;
    }
    .stack .print:nth-child(4) {
        bottom: -19px;
        z-index: 2;
        transform: scale(.925);
        background-color: #666;
    }

    .stack .print:nth-child(5) {
        bottom: -21px;
        z-index: 1;
        transform: scale(.9);
        background-color: #5c5c5c;
    }

    .info {
        grid-area: 3/2;
        width: 290px;
        color: #b39ea9;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
    .description {
        margin: 10px 0;
    }
    .row {
        display: grid;
        grid-template-columns: 25px auto auto;
        align-items: end;
        gap: .5ch;
        --icon-size: 20px;
    }
    .avatar {
        width: 20px;
        height: 20px;
        /* margin-top: -5px; */
    }
    .actions {
        margin-top: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .description + .row + .actions {
        width: 50%;
    }
    .discard {
        margin: -4px -10px -6px;
    }
    .discard small {
        display: block;
        word-wrap: none;
        text-transform: none;
        color: #b39ea9;
        font-size: 1em;
        font-weight: 400;
    }
    @media screen and (max-width: 820px) {
        section {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 30px;
        }
        .stack {
            width: min(calc(100vw - 30px), calc((100vh - 150px) * var(--ratio)));
        }
        .info {
            max-width: calc(100vw - 20px);
            margin-left: 0;
        }
    }
</style>
