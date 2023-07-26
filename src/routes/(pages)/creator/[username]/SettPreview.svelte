<!-- @component
    A wide block of series title, previews, progress, and the collect button
 -->
<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import { page } from "$app/stores";
    import CollectButton from "$elem/CollectButton.svelte";
    import SettCompletion from "$elem/SettCompletion.svelte";
    import SettPreviews from "$elem/SettPreviews.svelte";
    import cache from "$lib/actions/cache";

    export let sett: NM.Sett;

    const { isAuthenticated } = $page.data.currentUser;
</script>

<svelte:options immutable />

<a href={sett.permalink} use:cache={{ sett }}
    style:background-image="url('{sett.sett_assets["large-blur"].url}')"
>
    <span class="graph">
        {#if $isAuthenticated}
            <SettCompletion {sett} />
        {/if}
    </span>
    <h2>{sett.name}</h2>
    <CollectButton {sett} />
    <!-- <p>by {sett.creator.name}</p> -->
    <div>
        <SettPreviews {sett} />
    </div>
</a>

<style>
    a {
        margin-top: 5px;
        margin-bottom: 20px;
        border-radius: 4px;
        position: relative;
        display: grid;
        grid-template-columns: 230px 1fr 230px;
        align-items: flex-start;
        justify-content: center;
        padding: 20px;
        background-position: center center;
        background-size: cover;
    }
    a::after {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background: rgba(0,0,0,.25);
    }
    a > :global(*) {
        z-index: 1;
    }
    h2 {
        grid-area: 1/2;
        color: white;
        text-align: center;
        line-height: 34px;
        margin: 0 0 20px;
    }
    div {
        grid-area: 2/1 / 3/4;
        border-top: 1px solid rgba(255,255,255,.2);
        margin: 0 -20px;
        padding: 60px 30px 30px;
    }
    div :global(.cover) {
        max-width: 200px;
    }
    @media screen and (max-width: 700px) {
        a {
            grid-template-columns: auto auto auto
        }
        h2 {
            grid-column: span 3;
        }
        .graph {
            grid-column: span 2;
        }
        div {
            padding: 20px 10px 10px;
        }
    }
</style>
