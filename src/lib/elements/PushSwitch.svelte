<!-- @component
    A pushing button-toggler. Can switch across multiple states.
    When value is a integer, the number of states is set by the number of icons.
 -->
<script lang="ts">
    import type { IconName } from "./Icon.svelte";

    import tip from "$lib/actions/tip";
    import { onEnter } from "$lib/utils/utils";
    import Icon from "./Icon.svelte";

    /**
     * The current value
     */
    export let value: boolean | number;
    /**
     * The icons for each value or one universal
     */
    export let icons: IconName | IconName[] = [];
    /**
     * The tooltip text
     */
    export let hint = "";

    // use local copy to ignore update of `icons`
    const iconArr = Array.isArray(icons) ? icons : [icons, icons];
    if (Number(value) >= iconArr.length) {
        console.error(`Icon for the value ${value} wasn't provided: ${icons.length - 1} is max`);
    }
    $: icon = typeof value === "boolean"
        ? iconArr[value ? 1 : 0] as IconName
        : iconArr[value] as IconName;

    function toggle () {
        if (typeof value === "boolean") {
            value = !value;
        } else {
            value += 1;
            if (value >= iconArr.length) value = 0;
        }
    }
</script>

<div class:selected={value} use:tip={hint}
    on:click={toggle} tabindex="-1" on:keypress={onEnter(toggle)}
>
    {#if icon}<Icon {icon} />{/if}
    <slot/>
</div>

<style>
    div {
        padding: 0;
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: .7ch;
        box-shadow: inset 0 0 0 1px #0002;
        /* color: #39343E; */
        font-weight: 500;
        border-radius: 4px;
        cursor: pointer;
        user-select: none;
    }
    div.selected {
        background: #d6d6d6;
        color: #1482A1;
        box-shadow: inset 0 1px 0 0 #0002;
    }
    /* div:hover {
        box-shadow: inset 0 0 0 1px #0004;
    } */
</style>
