<!-- @component
    A button with optional icon and text
 -->
 <script lang="ts">
    import type { IconName } from "./Icon.svelte";

    import tip from "$lib/actions/tip";
    import Icon from "./Icon.svelte";

    type ButtonType = "borderless"
        | "danger"
        | "primary"
        | "reward"
        | "subdued-light"
        | "subdued-dark"
        | "disabled-light"
        | "disabled-dark";

    /**
     * The button type (colors), default - primary
     */
    export let type: ButtonType = "primary";
    /**
     * The button size, default auto
     */
    export let size: "nano" | "mini" | "max" | "auto" = "auto";
    /**
     * The icon name
     */
    export let icon: IconName = "";
    /**
     * A text for tooltip
     */
    export let hint: string | null = null;
</script>

<svelte:options immutable/>

<button on:click class="{type} {size}" use:tip={hint ?? undefined}
    disabled={type === "disabled-dark" || type === "disabled-light"}
>
    {#if icon}<Icon {icon} />{/if}
    {#if $$slots.default}<slot/>{/if}
</button>

<style>
    button {
        border: none;
        padding: 10px 15px;
        color: white;
        font-family: locator-web,Helvetica Neue,Helvetica,Arial,sans-serif;
        text-transform: uppercase;
        letter-spacing: .05em;
        font-size: 12px;
        font-weight: 500;
        line-height: 1em;
        text-rendering: optimizeLegibility;
        border-radius: 4px;
        user-select: none;
        cursor: pointer;
        background: none;
        outline: none;
        box-shadow: inset 0 -1px 0 0 #0003;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        gap: .5ch;
        --icon-size: 14px;
    }
    button.nano {
        padding: 7px;
    }
    button.mini {
        padding: 10px;
    }
    button.max {
        width: 100%;
        /* border-radius: 0; */
        align-items: center;
    }
    button.disabled-dark {
        color: #786e83;
        background-color: #0002;
        cursor: default;
    }
    button.disabled-light {
        color: #FFF8;
        background-color: #FFF1;
        cursor: default;
    }
    button:disabled {
        box-shadow: none;
    }
    button:not(:disabled):hover {
        box-shadow: inset 0 0 0 30px #fff3, inset 0 -1px 0 0 #0003;
    }
    button:not(:disabled):active {
        box-shadow: inset 0 0 0 30px #fff3, inset 0 1px 0 0 #0003;
        position: relative;
        top: 1px;
    }
    .reward {
        background-color: #4BBBF5;
    }
    .primary {
        background-color: #C18BF2;
    }
    .danger {
        background-color: #E82C8E;
    }
    .subdued-light {
        box-shadow: inset 0 0 0 1px #fff6;
    }
    button.subdued-light:hover, button.subdued-light:active {
        /* box-shadow: inset 0 0 0 30px #fff2, inset 0 0 0 1px #fffa; */
        box-shadow: inset 0 0 0 1px #fffa;
    }
    .subdued-dark {
        color: #39343E;
        box-shadow: inset 0 0 0 1px #0003;
    }
    .borderless, button.borderless:hover, button.borderless:active {
        color: #39343E;
        box-shadow: none;
        padding: 0;
    }
    button.subdued-dark:active {
        box-shadow: inset 0 0 0 1px #0007, inset 0 1px 0 0 #0003;
    }
    button.subdued-dark:hover {
        box-shadow: inset 0 0 0 1px #0007, inset 0 -1px 0 0 #0003;
    }

    /* icon */
    button :global([style^=--color]) {
        align-self: center;
    }
</style>
