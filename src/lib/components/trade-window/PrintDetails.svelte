<script context="module" lang="ts">
    import type { Readable } from "svelte/store";
    import type OwnedCards from "$lib/services/OwnedCards";
    import type NM from "$lib/utils/NM Types";

    import { derived } from "svelte/store";

    function getPrintCounts (ownedCollections: OwnedCards[], print: NM.PrintInTrade, youAreBidder: boolean) {
        const side = youAreBidder ? "responder" : "bidder";
        return ownedCollections.map((collection) => collection.isLoading
            ? derived(collection.getPrintCount(print.id, true), (count) => {
                if (!collection.isLoading) return count;
                return print.own_counts?.[side] ?? null;
            })
            : collection.getPrintCount(print.id, true)
        );
    }
</script>
<!-- @component
    Renders a print in the trade window, may change the print number
 -->
<script lang="ts">
    import type { Actors } from "../TradeWindow.svelte";

    import { getContext } from "svelte";
    import { getOwnedPrints } from "$api";
    import Icon from "$elem/Icon.svelte";
    import Clickable from "$elem/Clickable.svelte";
    import RarityText from "$elem/RarityText.svelte";
    import PrintAsset from "$lib/components/PrintAsset.svelte";
    import tip from "$lib/actions/tip";
    import { tradePreview } from "$lib/actions/tradePreviews";
    import { alert } from "$lib/dialogs";
    import { num2text } from "$lib/utils/format";
    import { getTrades, isTrading } from "../../services/tradingCards";
    import CollectionProgress from "./CollectionProgress.svelte";

    /**
     * The print to display, can be replaced
     */
    export let print: NM.PrintInTrade;
    /**
     * Whether show the print number and allow to change it
     */
    export let showPrintNumber: "yes" | "no" | "list" = "no";

    const actors = getContext<Actors>("actors");
    const direction = getContext<boolean>("isItYou") ? "give" : "receive";
    const tradeId = getContext<Readable<number|null>>("tradeId");

    $: total = print.num_prints_total === "unlimited" ? "∞" : num2text(print.num_prints_total);

    let printChooserState: "off" | "view" | "loading" | "select";
    $: printChooserState = showPrintNumber === "list" ? "view" : "off";
    let prints: Record<number|string, NM.PrintInTrade & {trading?:boolean}> = {
        [print.print_num]: print,
    };
    // get all the numbers of all the copies the user owns
    async function loadPrints () {
        printChooserState = "loading";
        try {
            const details = await getOwnedPrints(actors.you.id, print.id);
            prints = {};
            for (const p of details.prints) {
                prints[p.print_num] = p.print_num === print.print_num
                    ? print
                    : {
                        ...print,
                        print_id: p.id,
                        print_num: p.print_num,
                    };
            }
            printChooserState = "select";
        } catch (reason) {
            alert(String(reason));
            printChooserState = "view";
        }
    }

    const trades = derived(
        getTrades(print, direction, "card"),
        (tradeIds) => tradeIds?.filter((id) => id !== $tradeId),
    );
    $: isTradingPrint = derived(
        getTrades(print, direction, direction === "give" ? "print" : "card"),
        (tradeIds) => tradeIds && tradeIds.find((id) => id !== $tradeId),
    );
    // update the list when trades changes
    $: if (printChooserState === "select") {
        for (const p of Object.values(prints)) {
            const trading = isTrading(
                p,
                direction,
                direction === "give" ? "print" : "card",
            );
            if (p.trading !== trading) {
                p.trading = trading;
            }
        }
    }
    // the number of copies, init with data from the trade, if available,
    // but the data in the trade can be outdated because it's cached
    // so, anyway load the actual data
    const [youOwn, partnerOwns] = getPrintCounts(getContext("ownedCollections"), print, actors.youAreBidder);
</script>

<svelte:options immutable/>

<li>
    <PrintAsset card={print} size="medium" isPublic showSettType />
    <dl>
        <dt>Name</dt>
        <dd>{print.name}</dd>

        <dt>Series</dt>
        <dd>
            <a target=_blank rel="noreferrer" href="/series/{print.sett_id}">{print.sett_name}</a>
            <slot name="series"/>
        </dd>

        <dt>Collected</dt>
        <dd>
            <CollectionProgress user={actors.you} settId={print.sett_id} />,
            <CollectionProgress user={actors.partner} settId={print.sett_id} />
        </dd>

        <dt>Rarity</dt>
        <dd>
            <Icon icon={print.rarity.class} hint={print.rarity.name} />
            <RarityText rarity={print.rarity.class}>{print.rarity.name}</RarityText>
        </dd>

        <dt>{showPrintNumber === "no" ? "Copies" : "Print"}</dt>
        <dd>
            {#if showPrintNumber === "no"}
                {total} cards
            {:else if printChooserState === "off"}
                #{print.print_num}/{total} cards
            {:else if printChooserState === "view"}
                <Clickable on:click={loadPrints}>
                    <span use:tip={"Click to change the print number"}>
                        #{print.print_num}/{total} cards
                    </span>
                </Clickable>
            {:else if printChooserState === "loading"}
                <span style:cursor="wait">
                    #{print.print_num}/{total} cards
                </span>
            {:else if printChooserState === "select"}
                <select class="print-chooser"
                    disabled={Object.keys(prints).length === 1}
                    bind:value={print}
                >
                    {#each Object.keys(prints) as num}
                        <option value={prints[num]}>
                            #{num} {prints[num].trading ? "⇄" : ""}
                        </option>
                    {/each}
                </select>/{total} cards
            {/if}
        </dd>

        <dt>Own</dt>
        <dd>
            <span class:text-warning={$youOwn === 0}>
                You own {$youOwn ?? "?"}.
            </span>
            <span class:text-warning={$partnerOwns === 0}>
                {actors.partner.first_name} owns {$partnerOwns ?? "?"}.
            </span>
        </dd>
    </dl>

    {#if $trades && $trades.length > 0 }
        <div class="trade-usage" class:trade-print={$isTradingPrint}
            use:tradePreview={{ tradeIds: $trades }}
        >
            <Icon icon="card-trading" />
        </div>
    {/if}

    {#if $$slots.default}
        <div class=card-action>
            <slot/>
        </div>
    {/if}
</li>

<style>
    li {
        padding: 10px 20px;
        display: flex;
        position: relative;
        align-items: flex-start;
        flex-shrink: 0;
    }
    li:not(:last-child) {
        border-bottom: 1px solid rgba(0,0,0,.1);
    }
    li > :global(:first-child) {
        min-width: 20%;
        width: 20%;
        border-radius: 5px;
        overflow: hidden;
    }
    dl {
        flex-grow: 1;
        margin: 5px 10px;
        line-height: 1.4;
        display: grid;
        grid-template-columns: min-content auto;
        gap: 0 10px;
    }
    dt {
        color: #9f96a8;
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
        justify-self: end;
        align-self: center;
    }
    dd {
        font-size: 13px;
        font-weight: 400;
        margin: 0;
        --icon-size: 20px;
    }
    dd:first-of-type {
        font-size: 15px;
        font-weight: 400;
        line-height: 18px;
        word-break: break-word;
    }
    a {
        color: #0d9ce6 !important;
        text-decoration: none;
    }
    select {
        border: none;
        outline: none;
        background: none;
        color: inherit;
        font-size: inherit;
        font-weight: inherit;
        margin: -2px;
        cursor: pointer;
    }
    .text-warning {
        color: #E7327C;
    }
    .trade-usage {
        position: absolute;
        right: 30px;
        top: 15px;
        opacity: 0.35;
        --icon-size: 12px;
    }
    .trade-usage.trade-print {
        opacity: 1;
    }
    .card-action {
        align-self: center;
    }
</style>
