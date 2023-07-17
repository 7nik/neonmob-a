<!-- @component
    A list of series previews and the cover
 -->
<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import SettCover from "$elem/SettCoverWithBanner.svelte";

    export let sett: NM.Sett;

    $: imgs = [
        sett.preview_2,
        sett.preview_0,
        sett.sett_assets.large.url,
        sett.preview_1,
        sett.preview_3,
    ];
</script>

<svelte:options immutable />

<div>
    {#each imgs as src, i}
        {#if i === 2}
            <span class="cover">
                <SettCover {sett} />
            </span>
        {:else if src}
            <!-- <span class="thumb t{i}"> -->
                <img {src} class="thumb t{i}" alt="{sett.name}'s thumbnail #{i}">
            <!-- </span> -->
        {/if}
    {/each}
</div>

<style>
    div {
        display: flex;
        align-items: center;
        justify-content: center;
        max-width: 1000px;
        margin: 0 auto;
    }
    div > * {
        transition: transform .1s ease-in .15s;
    }
    .cover {
        display: inline-block;
        margin: 0 -10px;
        z-index: 3;
        box-shadow: 0 2px 6px 0 #0003;
        border-radius: 4px;
        overflow: hidden;
        width: 26%;
    }
    .cover:hover {
        transform: scale(1.1);
    }
    .thumb {
        display: inline-block;
        box-shadow: 0 0 0 1px rgb(0 0 0 / 5%), 0 2px 4px 0 rgb(0 0 0 / 15%);
        border-radius: 3px;
        overflow: hidden;
        width: auto;
        height: auto;
        max-width: 18%;
        max-height: min(240px, calc(100vw / 5));
    }
    .thumb.t0 {
        transform: rotate(-3deg) translate(3px,8px);
        z-index: 1;
    }
    .thumb.t0:hover {
        transform: rotate(-4.5deg) translate(-8px,8px) scale(1.1);
    }
    .thumb.t1 {
        transform: rotate(-1.5deg);
        z-index: 2;
    }
    .thumb.t1:hover {
        transform: rotate(-3deg) translate(-10px,0) scale(1.1);
    }
    .thumb.t3 {
        transform: rotate(1.5deg);
        z-index: 2;
    }
    .thumb.t3:hover {
        transform: rotate(3deg) translate(10px,0) scale(1.1);
    }
    .thumb.t4 {
        transform: rotate(3deg) translate(-3px,8px);
        z-index: 1;
    }
    .thumb.t4:hover {
        transform: rotate(4.5deg) translate(8px,8px) scale(1.1);
    }
    @media screen and (max-width: 700px) {
        div {
            padding: 20px 2%;
        }
        .graph {
            grid-column: span 2;
        }
    }
    @media screen and (max-width: 520px) {
        .cover {
            width: 40%;
        }
        .thumb {
            max-width: 30%;
            max-height: calc(100vw / 3.5);
            /* max-height: calc(100vw * 0.125 + 40px); */
        }
        .thumb.t0 {
            display: none;
        }
        .thumb.t4 {
            display: none;
        }
    }
</style>
