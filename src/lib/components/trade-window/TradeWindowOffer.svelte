<!-- @component
    A half of the trade window for viewing and editing an offer
-->
<script lang="ts">
    import type NM from "$lib/utils/NM Types";
    import type { Actors } from "../TradeWindow.svelte";

    import { getContext, setContext, tick } from "svelte";
    import { firstName } from "$lib/services/user";
    import { linky } from "$lib/utils/format";
    import Avatar from "$elem/Avatar.svelte";
    import Button from "$elem/Button.svelte";
    import Icon from "$elem/Icon.svelte";
    import TradeGrade from "$elem/TradeGrade.svelte";
    import PrintDetails from "./PrintDetails.svelte";
    import TradeWindowEditOffer from "./TradeWindowEditOffer.svelte";
    import Clickable from "$elem/Clickable.svelte";

    /**
     * Whose side is it
     */
    export let cardOwner: NM.User;
    /**
     * Prints the card owner will give
     */
    export let offer: NM.PrintInTrade[];
    /**
     * Whether the offer can be modified
     */
    export let canEdit: boolean;
    /**
     * The initial sett to select
     */
    export let sett: { id: number, name: string } | null = null;

    const actors = getContext<Actors>("actors");
    const isItYou = cardOwner.id === actors.you.id;

    setContext("cardOwner", cardOwner);
    setContext("isItYou", isItYou);

    // show the offer, show the bio, or adding prints
    let state: "offer" | "bio" | "search" = "offer";
    $: canAddItems = offer.length < 5;

    // when `canEdit` changes
    $: resetState(canEdit);
    function resetState (updateSett: boolean) {
        state = "offer";
        if (!sett && offer.length > 0 && updateSett) {
            // if all cards in the offer are from the same sett
            const settIds = offer.map((p) => p.sett_id);
            if (settIds.every((id) => id === settIds[0])) {
                sett = {
                    id: offer[0].sett_id,
                    name: offer[0].sett_name,
                };
            }
        }
    }
    async function showSearch (ev: Event) {
        state = "search";
        const ul = (ev.currentTarget as HTMLElement).closest("article")
            ?.nextElementSibling
            ?.querySelector("ul");
        if (ul) {
            // wait when the list will be shown
            await tick();
            // kick the list to continue to load cards if needed
            ul.dispatchEvent(new Event("scroll"));
        }
    }

    function toggleBio () {
        state = state === "bio" ? "offer" : "bio";
    }

    function removePrint (print: NM.PrintInTrade) {
        offer = offer.filter((pr) => pr !== print);
    }
    function addPrint (print: NM.PrintInTrade) {
        offer = [...offer, print];
    }
</script>

<article class:hidden={canEdit && state === "search"}>
    <header>
        <Avatar user={cardOwner} />
        <div>
            <TradeGrade user={cardOwner} />
            {firstName(cardOwner)} will give
            {#if cardOwner.bio || isItYou}
                <Clickable on:click={toggleBio}>
                    <div class="bio" class:bio-shown={state === "bio"}>
                        <span class=disclosure-triangle class:open={state === "bio"}>▶</span>
                        <span class=bio-text>{cardOwner.bio || "Add a bio"}</span>
                        <span class=bio-action>
                            {state === "bio" ? "Hide" : "Show"} full bio
                        </span>
                    </div>
                </Clickable>
            {/if}
        </div>
        {#if canEdit}
            <Button
                type={canAddItems ? "primary" : "disabled-dark"}
                icon={canAddItems ? "add" : ""} size="mini"
                on:click={showSearch}
            >
                {canAddItems ? "Add" : "5 max"}
            </Button>
        {/if}
    </header>
    <section class="offer">
        {#if offer.length === 0}
            <div class=trade-tips>
                <div>
                    <div>
                        <h3>Add up to 5 items {isItYou ? "you" : cardOwner.name} will give</h3>
                        {#if isItYou}
                            <div class="text-subdued text-small">
                                Tips for new traders. Try offering:<br>
                                – Cards they don't own<br>
                                – Cards you have duplicates of<br>
                                – Fair rarity trades
                                    (<Icon icon="uncommon" hint="Uncommon"/>
                                    for <Icon icon="uncommon" hint="Uncommon"/>)<br>
                                – Two for one trades
                                    (<Icon icon="uncommon" hint="Uncommon"/>
                                    + <Icon icon="uncommon" hint="Uncommon"/>
                                    for <Icon icon="rare" hint="rare"/>)
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        {:else}
            <ul>
                {#each offer as print (print.id)}
                    <PrintDetails
                        bind:print
                        showPrintNumber={isItYou && canEdit ? "list" : "yes"}
                    >
                        {#if canEdit}
                            <Button type="danger" size="mini" icon="minus"
                                hint="Remove it"
                                on:click={() => removePrint(print)}
                            />
                        {/if}
                    </PrintDetails>
                {/each}
            </ul>
        {/if}
        {#if state === "bio"}
            <div class=full-bio>
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                {@html linky(cardOwner.bio)}
                {#if isItYou}
                    <br><br>
                    <a href="{actors.you.links.profile}/collection"
                        target="_blank" rel="noreferrer"
                    >
                        <Button type="subdued-light" size="max">
                            Edit Your Bio
                        </Button>
                    </a>
                {/if}
            </div>
        {/if}
    </section>
</article>

{#if canEdit}
    <!-- just hide this block to not re-render the huge list -->
    <section class="searcher" class:hidden={state !== "search"}>
        <TradeWindowEditOffer
            {sett}
            {offer}
            on:close = {() => { state = "offer"; }}
            on:add = {(ev) => { addPrint(ev.detail); state = "offer"; }}
        />
    </section>
{/if}

<style>
    article {
        display: flex;
        flex-direction: column;
        flex: 1;
        background: white;
        position: relative;
    }
    header {
        height: 40px;
        box-sizing: content-box;
        background: #efefef;
        padding: 10px;
        display: flex;
        gap: 1ch;
        align-items: center;
    }
    header > div {
        flex-grow: 1;
        flex-shrink: 1e6;
        display: grid;
        grid-template-columns: auto 1fr;
        align-items: center;
        gap: 0 1ch;
        font-weight: 400;
    }
    .bio {
        grid-column: span 2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #9f96a8;
        user-select: none;
        font-size: 13px;
        cursor: pointer;
    }
    .bio .bio-text {
        font-style: italic;
    }
    .bio:hover, .bio-shown {
        color: #0d9ce6;
    }
    .bio:hover .bio-text, .bio-shown .bio-text, .bio-action {
        display: none;
    }
    .bio:hover .bio-action, .bio-shown .bio-action {
        display: initial;
    }
    .disclosure-triangle {
        transition: transform .1s ease-in-out;
        display: inline-block;
    }
    .disclosure-triangle.open {
        transform: rotate(90deg);
    }
    .offer {
        display: flex;
        justify-content: center;
    }
    .trade-tips {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #9f96a8;
        font-size: 13px;
        padding: 20px;
    }
    .trade-tips h3 {
        color: #2c2830;
        margin: 0 0 0.5em 0;
        font-size: 15px;
        font-weight: 400;
    }
    ul {
        flex-grow: 1;
        padding: 0;
        margin: 0;
        list-style: none;
    }
    .full-bio {
        position: absolute;
        top: 60px;
        right: 0;
        bottom: 0;
        left: 0;
        overflow: auto;
        padding: 20px;
        background: white;
        white-space: pre-line;
        font-weight: 400;
    }
    a:link, a:visited, a:hover {
        color: #0d9ce6;
        text-decoration: none;
    }
    .searcher {
        display: flex;
        flex: 1;
        overflow: initial;
    }
    .hidden {
        display: none;
    }
    @media screen and (min-width: 961px) {
        section {
            flex-grow: 1;
            min-height: 0;
            background: white;
            overflow-y: auto;
        }
    }
    @media screen and (max-width: 960px) {
        article {
            min-height: 50%;
        }
        .searcher {
            display: flex;
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            z-index: 1;
            border-radius: 6px;
            overflow: hidden;
            background: white;
            transition: top .2s ease-in-out, bottom .2s ease-in-out;
        }
        .searcher.hidden {
            top: 100vh;
            bottom: -100vh;
        }
    }
</style>
