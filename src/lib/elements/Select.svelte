<!-- @component
    Template for dropdown list of items
 -->
<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { onEnter } from "$lib/utils/utils";
    import Icon from "./Icon.svelte";

    // eslint-disable-next-line no-undef
    type T = $$Generic;
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    interface $$Slots {
        default: {
            item: T | null,
        }
        selected: {
            item: T | null,
        }
    }
    /**
     * The list of the values
     */
    export let list: T[];
    /**
     * THe current value
     */
    export let value: T | null;

    const dispatcher = createEventDispatcher<{
        change: T | null,
    }>();
    let opened = false;

    function select (item: T) {
        if (value !== item) {
            value = item;
            dispatcher("change", item);
        }
    }

    function toggle () {
        opened = !opened;
    }
</script>

<svelte:options immutable />

<span class:opened
    on:click={toggle}
    on:keypress={onEnter(toggle)}
    tabindex="-1"
>
    {#if $$slots.selected}
        <slot item={value} name="selected"></slot>
    {:else}
        <slot item={value}/>
    {/if}
    <button>{#if opened}<Icon icon="close" upper/>{/if}</button>
    <ul>
        {#each list as item}
            <li class:selected={value === item}
                on:click={() => select(item)}
                on:keypress={onEnter(() => select(item))}
                tabindex="-1"
            >
                <slot {item}>{String(item)}</slot>
            </li>
        {/each}
    </ul>
</span>

<style>
    span {
        position: relative;
        display: inline-flex;
        justify-content: space-between;
        padding: 10px 0 10px 15px;
        border: 1px solid #0002;
        border-radius: 4px;
        font-size: 13px;
        cursor: pointer;
        align-items: center;
    }
    span:hover {
        border-color: #0006;
    }
    span.opened::after {
        content: "";
        display: block;
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 10;
    }
    button {
        border: 0;
        padding: 0;
        appearance: none;
        width: 40px;
        height: 1em;
        opacity: .8;
        background: url('data:image/svg+xml,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6 10"%3e%3cpath fill="%2300000064" d="M0 4h6L3 0ZM0 6h6L3 10Z"/%3e%3c/svg%3e') center no-repeat;
        cursor: pointer;
        --icon-size: 10px;
    }
    button:hover {
        opacity: 1;
    }
    .opened button {
        opacity: .5;
        background: none;
    }
    .opened button:hover {
        opacity: .8;
    }
    ul {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        margin: 4px 0;
        padding: 0;
        max-height: 35vh;
        background: white;
        border: 1px lightgrey solid;
        overflow: auto;
        z-index: 2;
        list-style: none;
        border: 1px solid #0002;
        border-radius: 3px;
        box-shadow: 0 1px 3px #0002;
        z-index: 11;
    }
    span.opened ul {
        display: block;
    }
    li {
        cursor: pointer;
        padding: 15px 14px;
        box-shadow: 10px 1px #EFEFEF;
    }
    li:not(:first-child) {
        margin-top: 1px;
    }
    li.selected {
        background: #FAFAFA;
    }
    li:hover {
        background: #F4F4F4;
    }
    ul::-webkit-scrollbar {
        width: 7px;
    }
    ul::-webkit-scrollbar-thumb {
        border-radius: 4px;
        background-color: rgba(0,0,0,.5);
    }
</style>
