<!-- @component
    Wrapper to display data in overlay with close button and hotkey
 -->
<script lang="ts">
    import { onMount } from "svelte";
    import { afterNavigate } from "$app/navigation";
    import Icon from "$elem/Icon.svelte";

    export let close: () => void;

    function hotkey (ev: KeyboardEvent) {
        if (ev.code === "Escape") close();
    }

    onMount(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    });
    afterNavigate(close);
</script>

<svelte:window on:keyup={hotkey} />

<section>
    <span class="close"><Icon icon="close" on:click={close} /></span>
    <slot/>
</section>

<style>
    section {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        padding: 20px;
        z-index: 200;
        background: #1a1417;
        overflow: auto;
    }
    .close {
        position: fixed;
        top: 15px;
        right: 25px;
        cursor: pointer;
        user-select: none;
        z-index: 1;
        --icon-size: 26px;
        --icon-color: #FFFA;
    }
    .close:hover {
        --icon-color: #FFF;
    }
    @media (pointer: coarse) {
        .close {
            top: 10px;
            right: 10px;
        }
    }
    @media screen and (max-width: 820px) {
        section {
            padding: 10px;
        }
    }
</style>
