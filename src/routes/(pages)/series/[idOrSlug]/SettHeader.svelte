<!-- @component
    Section with general series info and actions
 -->
<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import dayjs from "dayjs";
    import { page } from "$app/stores";
    import Avatar from "$elem/Avatar.svelte";
    import Clickable from "$elem/Clickable.svelte";
    import CollectButton from "$elem/CollectButton.svelte";
    import Icon from "$elem/Icon.svelte";
    import SettCompletion from "$elem/SettCompletion.svelte";
    import SettPreviews from "$elem/SettPreviews.svelte";
    import cache from "$lib/actions/cache";
    import resolve from "$lib/actions/resolve";
    import { fail } from "$lib/dialogs";
    import SettInfo from "$lib/utils/SettInfo";
    import share from "$lib/utils/share";
    import { firstNamePossessive } from "$lib/services/user";

    const { isAuthenticated, user } = $page.data.currentUser;

    export let sett: NM.Sett;
    /**
     * Owner for the progress circles
     */
    export let owner: NM.User|null = null;

    $: settInfo = new SettInfo(sett);
    $: u = owner ?? user;

    function shareOn (channel: "facebook" | "twitter") {
        const creator = sett.creator.twitter_username
            ? `@${sett.creator.twitter_username}`
            : sett.creator.name;
        const message = `Check out this incredible digital art series by ${creator} on @NeonMob`;
        share(channel, "sett-detail", sett.permalink, message);
    }

    // TODO implement switching series
</script>

<h1>
    {#if $isAuthenticated}
        <div class="actions">
            <a href="{u.username}/colection/" on:click={fail}>
                <Icon icon="backToCollection" />
                <span class="hide-on-small">{firstNamePossessive(u, true)}</span> Collection
            </a>
            <Clickable on:click={fail}>
                <span>
                    <Icon icon="switchSeries" />
                    Switch <span class="hide-on-small">Series</span>
                </span>
            </Clickable>
        </div>
    {/if}
    <a href={sett.permalink} use:cache={{ sett }}>{sett.name}</a>
</h1>
<a href={sett.permalink} class="previews" use:cache={{ sett }}>
    <SettPreviews {sett} />
</a>
<div class="meta">
    <span class="share">
        <span class="hide-on-small">Share</span>
        <span><Icon icon="facebook" on:click={() => shareOn("facebook")} /></span>
        <span><Icon icon="twitter" on:click={() => shareOn("twitter")} /></span>
    </span>
    <Clickable on:click={fail}>
        <Icon icon={sett.favorite ? "liked" : "like"} />
        <span class="hide-on-small">Favorite</span>
    </Clickable>
    <a href="/creator/{sett.creator.username}" use:resolve={{ user: sett.creator }}>
        <Avatar user={sett.creator} />
        <div class="hide-on-tiny">Created by<br>{sett.creator.name}</div>
    </a>
    <span class="difficulty">
        <Icon icon={sett.difficulty.class_name} />
        <div class="hide-on-tiny">{sett.difficulty.name}</div>
    </span>
    {#if $isAuthenticated}
        <span>
            <SettCompletion {sett} owner={u} />
        </span>
    {/if}
    <span>
        <CollectButton {sett} />
        <div class="sett-status">
            {settInfo.isComingSoon ? "Coming" : "Released"}
            {dayjs(sett.released).format("MMM D, YYYY")}

            {#if settInfo.isUnlimited && !settInfo.isSoldOut
                || $isAuthenticated && settInfo.isSoldOut
            }
                <div>
                    Out of Print on
                    {dayjs(sett.discontinue_date).format("MMM D, YYYY")}
                </div>
            {/if}
            {#if settInfo.isLimited && $isAuthenticated}
                {#if sett.freebies_discontinued}
                    <div>Free Packs All Claimed</div>
                {:else if !settInfo.areFreebiesAvailableNow}
                    <div>Free Packs Claimed Today</div>
                    <div>Return Tomorrow for More</div>
                {:else if sett.free_packs_claimed_percent >= 50}
                    <div>{sett.free_packs_claimed_percent}% Free Packs Claimed</div>
                {/if}
                {#if sett.percent_sold_out >= 50 && sett.freebies_discontinued}
                    <div>{sett.percent_sold_out}% Packs Claimed</div>
                {/if}
            {/if}
        </div>
    </span>
</div>

<style>
    h1 {
        text-align: center;
        font-size: 40px;
        font-weight: 100;
        padding: 0 20px;
        margin: 20px 0;
    }
    h1 a {
        color: rgba(255,255,255,.7);
    }
    .actions {
        height: 0;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 0 20px;
        --icon-size: 16px;
    }
    .actions a, .actions span {
        padding: 10px 7px;
        border-radius: 4px;
    }
    .actions > a:hover, .actions > span:hover {
        background: #e4e4e04f;
    }
    .actions a:link, .actions a:visited, .actions span {
        color: white;
        font-size: 15px;
        font-weight: 400;
    }
    .previews {
        display: block;
        padding: 0 50px;
        margin: 0 auto;
    }
    .meta {
        border-top: 1px solid rgba(255,255,255,.1);
        max-width: 1160px;
        margin: 40px auto 0;
        padding: 15px 0 0;
        overflow: hidden;
        position: relative;
        color: rgba(255,255,255,.7);
        display: flex;
        align-items: stretch;
        justify-content: center;
        flex-wrap: wrap;
        --icon-size: 18px;
    }
    .meta a {
        color: rgba(255,255,255,.7);
    }
    .meta > :global(*) {
        padding: 5px 15px;
        display: flex;
        align-items: center;
        gap: 1ch;
        position: relative;
    }
    .meta > :global(:not(:first-child)::before) {
        content: "";
        display: inline-block;
        height: 36px;
        margin: auto 0;
        position: absolute;
        left: 0;
        border-left: 1px solid rgba(255,255,255,.1);
    }
    .meta > :global(:hover:not(:last-child)) {
        color: white;
        border-radius: 4px;
        background-color: rgba(0,0,0,.2);
    }
    /* icons */
    .meta > * > :global(span:not(.hide-on-small)) {
        margin-bottom: .25em;
    }
    .share :not(.hide-on-small) {
        --icon-color: white;
        opacity: .5;
        cursor: pointer;
    }
    .share :not(.hide-on-small):hover {
        opacity: 1;
    }
    .difficulty {
        --icon-size: 20px;
    }
    /* the collect button */
    .meta :last-child :global(button) {
        width: 230px;
        padding: 13px 15px;
    }
    .sett-status {
        padding-left: 10px;
        font-style: italic;
        line-height: 1.1;
    }
    .sett-status div {
        color: white;
    }
    @media screen and (max-width: 900px) {
        h1 {
            font-weight: 300;
            font-size: 30px;
        }
        .meta {
            font-size: 13px;
        }
    }
    @media screen and (max-width: 768px) {
        .actions {
            align-items: flex-end;
            padding: 0;
        }
        .hide-on-small {
            display: none;
        }
    }
    @media screen and (max-width: 700px) {
        h1 {
            font-size: 22px;
        }
        .previews {
            margin: -20px 0;
            padding: 0;
        }
        .meta > * {
            padding: 0 10px;
        }
        .meta > :last-child {
            width: 100%;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid rgba(255,255,255,.1);
            display: flex;
            justify-content: center;
        }
    }
    @media screen and (max-width: 480px) {
        .previews {
            padding: 0;
        }
        .meta {
            border: none;
            margin-top: 20px;
        }
        .meta.meta > * {
            border: none;
        }
        .meta a :global(img) {
            width: 30px;
            height: 30px;
        }
        .share {
            gap: 20px;
        }
        .meta > :last-child {
            flex-wrap: wrap;
        }
        .sett-status {
            font-size: 15px;
            text-align: center;
        }
        .hide-on-tiny {
            display: none;
        }
    }
</style>
