<!-- @component
    A tile of a series with a button to open packs
 -->
<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import { page } from "$app/stores";
    import Button from "$elem/Button.svelte";
    import Icon from "$elem/Icon.svelte";
    import SettCover from "$elem/SettCoverWithBanner.svelte";
    import cache from "$lib/actions/cache";
    import resolve from "$lib/actions/resolve";
    import { fail } from "$lib/dialogs";
    import CollectButton from "./CollectButton.svelte";
    import SettCompletion from "./SettCompletion.svelte";

    export let sett: NM.Sett;

    export let owner: NM.UserMinimal | undefined = undefined;

    const { isAuthenticated } = $page.data.currentUser;

    // TODO allow set the target user and check if currentUser collects it
    $: bodyLink = owner
        ? `${sett.permalink}user/${owner.username}/cards/`
        : sett.permalink;
</script>

<svelte:options immutable />

<!-- in most cases the preloaded data won't be used -->
<article use:cache={{ sett }} use:resolve={{ sett }}
    data-sveltekit-preload-data="off" data-sveltekit-preload-code="hover"
>
    <header>
        <Icon icon={sett.difficulty.class_name} hint={sett.difficulty.name} />
        <div>
            <a href={sett.permalink}>{sett.name}</a>
            <a href="/creator/{sett.creator.username}">{sett.creator.name}</a>
        </div>
        {#if $isAuthenticated}
            <SettCompletion {sett} darkTheme owner={owner} />
        {/if}
    </header>
    <a class="body" href={bodyLink}>
        <SettCover {sett} />
        <div>
            {#if $isAuthenticated}
                <span>
                    <Button type="subdued-light" icon="like" on:click={fail}>Favorite</Button>
                </span>
            {/if}
            {#if sett.preview_0 && sett.preview_1}
                <img src={sett.preview_0} alt="{sett.name}'s first preview">
                <img src={sett.preview_1} alt="{sett.name}'s second preview">
            {/if}
        </div>
    </a>
    <CollectButton {sett} darkTheme />
</article>

<style>
    article {
        /* padding-top: 5px; */
        /* margin: 10px; */
        padding: 15px 10px 10px;
        width: min(320px, 100%);
        font-size: 15px;
        display: inline-flex;
        flex-direction: column;
        gap: 10px;
        min-width: 0;
    }
    header {
        --icon-size: 16px;
        display: flex;
        gap: 5px;
    }
    header div {
        flex-grow: 1;
        text-align: left;
    }
    header a {
        display: block;
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #2c2830;
    }
    header a + a {
        color: #857a90;
        font-size: 13px;
        font-style: italic;
    }
    .body {
        position: relative;
        width: 100%;
        aspect-ratio: 1;
        cursor: pointer;
    }
    .body::before, .body div {
        display: none;
        opacity: 0;
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        /* z-index: 5; */
        border-radius: 4px;
        transition: opacity .2s ease-in;
        z-index: 1;
    }
    .body::before {
        content: "";
        background: #000;
    }
    .body:hover::before {
        opacity: .7;
        display: block;
    }
    .body:hover div {
        opacity: 1;
        display: block;
    }
    .body div {
        z-index: 1;
        perspective: 800px;
        line-height: 0;
    }
    .body span {
        position: absolute;
        top: 50px;
        left: 20px;
        right: 20px;
        display: flex;
        flex-direction: column;
    }
    .body img {
        position: absolute;
        bottom: 0;
        z-index: 6;
        height: 162.16px;
        width: auto;
        max-height: 162.16px;
        max-width: 162.16px;
        box-shadow: 0 1px 2px rgb(0 0 0 / 20%);
        border-radius: 3px;
        overflow: hidden;
        z-index: 2;
    }
    .body img:first-of-type {
        left: -10px;
        transform: rotateY(30deg);
    }
    .body img:last-of-type {
        right: -10px;
        transform: rotateY(-30deg);
    }
</style>
