<!-- @component
    A horizontal list of content with scrolling buttons
 -->
<script lang="ts">
    import { onMount } from "svelte";
    import Clickable from "$elem/Clickable.svelte";

    let container: HTMLElement;
    let showLeft = false;
    let showRight = false;

    function updateArrows () {
        showLeft = container.scrollLeft >= 10;
        showRight = container.scrollWidth - container.scrollLeft - container.clientWidth >= 10;
    }

    function scroll (ev: Event, dx: 1|-1) {
        ev.preventDefault();
        let left = container.scrollLeft;
        const steps = (Array.from(container.children) as HTMLElement[]).map((el) => el.offsetLeft);
        if (steps.includes(left)) {
            left = steps[steps.indexOf(left) + dx] ?? left;
        } else {
            const next = steps.findIndex((x) => x > left);
            left = steps[dx > 0 ? next : next - 1];
        }
        container.scrollTo({ left, behavior: "smooth" });
    }
    onMount(updateArrows);
</script>

<svelte:window on:resize={updateArrows} />

<div>
    <section bind:this={container} on:scroll={updateArrows}>
        <slot/>
    </section>
    <Clickable on:click={(ev) => scroll(ev, -1)}>
        <span class="left" class:show={showLeft}>‹</span>
    </Clickable>
    <Clickable on:click={(ev) => scroll(ev, 1)}>
        <span class="right" class:show={showRight}>›</span>
    </Clickable>
    </div>

<style>
    div {
        width: 100%;
        position: relative;
        overflow: hidden;
        padding: 0 0 0 20px;
        margin: 0 20px 0 0;
    }
    section {
        /* overflow: hidden; */
        overflow: auto;
        white-space: nowrap;
        font-size: 0;
        /* padding-bottom: 10px; */
        position: relative;
    }
    /* div:hover section {
        overflow: auto;
        overflow: overlay;
    } */
    div:not(:hover) section {
        scrollbar-color: transparent;
    }
    div:not(:hover) section::-webkit-scrollbar {
        opacity: 1;
    }
    .left, .right {
        position: absolute;
        top: 40%;
        bottom: 40%;
        aspect-ratio: .6;
        padding-bottom: 0.1em;
        z-index: 5;
        cursor: pointer;
        text-align: center;
        background: #efefef;
        transition: .2s transform;
        font-size: 100px;
        font-weight: 100;
        color: #0008;
        display: flex;
        align-items: center;
        justify-content: center;
        user-select: none;
    }
    .left:hover, .right:hover {
        color: #000;
    }
    .left {
        left: 0;
        border-radius: 0 4px 4px 0;
        transform: translateX(-100%);
    }
    .right {
        right: 0;
        border-radius: 4px 0 0 4px;
        transform: translateX(100%);
    }
    .show {
        transform: translateX(0);
    }

    @media screen and (max-width: 480px) {
        div {
            padding: 0;
            margin: 0;
        }
        .left, .right {
            font-size: 50px;
        }
    }
</style>
