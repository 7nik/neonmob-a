<!-- @component
    Header with horizontal line next to the text
 -->
<script lang="ts">
    import Icon from "$elem/Icon.svelte";

    /**
     * The header title
     */
    export let title: string;
    /**
     * Make font size smaller
     */
    export let small = false;
    /**
     * Add the loader icon after the title
     */
    export let showLoader = false;
</script>

<h1 class:small>
    {title}
    {#if showLoader}
        <Icon icon="loader"/>
    {/if}
    <hr>
    {#if $$slots.default}
        <i><slot/></i>
    {/if}
</h1>

<style>
    h1 {
        display: flex;
        align-items: center;
        gap: 1.5%;
        color: #2c2830;
        font-size: 28px;
        text-align: left;
        padding: 5px 0;
    }
    h1.small {
        font-size: 22px;
        margin-bottom: 10px;
    }
    hr {
        flex-grow: 1;
        margin: 0;
    }
    i {
        color: #0d9ce6;
        cursor: pointer;
        font-size: 15px;
        font-weight: 400;
        text-align: center;
    }
    @media screen and (max-width: 640px) {
        h1 {
            font-size: 22px;
        }
    }
    @media screen and (max-width: 480px) {
        h1 {
            justify-content: center;
        }
        hr {
            display: none;
        }
    }
</style>
