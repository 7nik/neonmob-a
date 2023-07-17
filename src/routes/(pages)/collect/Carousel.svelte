<!-- @component
    A carousel of setts in a category
 -->
<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import SettCover from "$elem/SettCoverWithBanner.svelte";
    import SettHeader from "../series/[idOrSlug]/SettHeader.svelte";

    export let title: string;
    export let setts: NM.Sett[];

    const maxIndex = setts.length;
    let index = 0;

    function getSett (n: number) {
        return setts[(maxIndex + n) % maxIndex];
    }

    function shiftIndex (n: number) {
        index = (n + index + maxIndex) % maxIndex;
    }

    let timer: NodeJS.Timer | null = null;
    function setAutoAdvance (enable: boolean) {
        if (enable && !timer) {
            timer = setTimeout(function next () {
                shiftIndex(1);
                timer = setTimeout(next, 7000);
            }, 7000);
        } else if (!enable && timer) {
            clearTimeout(timer);
            timer = null;
        }
    }

    onMount(() => {
        setAutoAdvance(true);
        return () => setAutoAdvance(false);
    });
</script>


<section
    on:mouseover={() => setAutoAdvance(false)}
    on:focus={() => setAutoAdvance(false)}
    on:mouseleave={() => setAutoAdvance(true)}
    on:blur={() => setAutoAdvance(true)}
>
    {#each [1, 0] as di ((index + di) % maxIndex)}
        {@const bg = getSett(index + di).sett_assets["large-blur"].url }
        <div class="bg s{index + di}"
            style:background-image="url({bg})"
            out:fade={{ duration: 1000 }}
        ></div>
    {/each}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="previous" on:click={() => shiftIndex(-1)}>
        <h3>{getSett(index - 1).name}</h3>
        <div>
            <SettCover sett={getSett(index - 1)} />
        </div>
    </div>
    <div class="current">
        <h2>{title}</h2>
        <SettHeader sett={getSett(index)} />
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="next" on:click={() => shiftIndex(1)}>
        <h3>{getSett(index + 1).name}</h3>
        <div>
            <SettCover sett={getSett(index + 1)} />
        </div>
    </div>
</section>

<style>
    section {
        display: grid;
        grid-template-columns: 15% 70% 15%;
        grid-template-rows: 420px;
        overflow: hidden;
        margin-bottom: 20px;
        position: relative;
    }
    section::after {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background: linear-gradient(#00000080, #0000001A);
    }

    .bg {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-repeat: no-repeat;
        background-position: center center;
        background-size: cover;
    }
    .next, .previous {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 1;
    }
    .next::after, .previous::after {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background: #00000040;
        z-index: 1;
    }
    .next h3, .previous h3 {
        margin: 20px;
        font-size: 15px;
        font-weight: 300;
        color: rgba(255,255,255,.7);
        text-align: center;
    }
    .next div, .previous div {
        padding: 0 40px;
        position: relative;
    }
    .next div::after, .previous div::after {
        content: "›";
        position: absolute;
        left: 0;
        right: 0;
        top: 50%;
        text-align: center;
        font-size: 100px;
        font-weight: 100;
        color: rgb(255, 255, 255);
        z-index: 10;
        transform: translateY(-55%);
    }
    .previous div::after {
        content: "‹";
    }
    .current {
        z-index: 1;
    }
    .current h2 {
        margin: 20px 0 0;
        text-align: center;
        color: rgba(255,255,255,.3);
    }
    .current > :global(h1) {
        font-size: 30px;
    }

    .current :global(.previews) {
        max-width: 960px;
    }
    .current :global(.previews .cover) {
        width: 22%;
        max-width: initial;
    }
    .current :global(.previews .thumb) {
        width: 17%;
        max-width: initial;
    }
    .current :global(.actions) {
        display: none;
    }
    .current :global(.meta) {
        padding: 0;
        margin: 20px auto 0;
    }

    @media screen and (max-width: 1100px) {
        section {
            grid-template-columns: 20% 60% 20%;
        }
        .current > :global(h1) {
            font-size: 22px;
        }
        .next :global(.banner), .previous :global(.banner) {
            font-size: 8px;
        }
    }
    @media screen and (max-width: 800px) {
        section {
            grid-template-columns: 10% 80% 10%;
            grid-template-rows: 400px;
        }
        .next h3, .previous h3,
        .next div > :global(*), .previous div > :global(*) {
            display: none;
        }
        .current :global(.banner) {
            font-size: 6px;
        }
    }
    @media screen and (max-width: 600px) {
        section {
            grid-template-rows: 450px;
        }
        .current :global(.meta),
        .current :global(.meta > :not(:first-child)::after),
        .current :global(.meta > :last-child) {
            border: none;
        }
        .current :global(.meta > :last-child) {
            margin-top: 0;
            flex-direction: column;
        }
        .current :global(.meta button) {
            width: auto;
            align-self: stretch;
        }
    }
    @media screen and (max-width: 520px) {
        .current :global(.previews .cover) {
            width: 40%;
        }
        .current :global(.previews .thumb) {
            width: 30%;
        }
    }
    @media screen and (max-width: 480px) {
        .current h2 {
            font-size: 15px;
        }
        .next, .previous {
            background: none;
        }
        .next div::before, .previous div::after {
            font-size: 60px;
        }
    }
</style>
