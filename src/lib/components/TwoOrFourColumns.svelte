<!-- @component
    Represents the data as two or four columns depending on the window size
 -->
<script lang="ts">
    import type { Paginator } from "$api";

    import Icon from "$elem/Icon.svelte";
    import infiniteScroll from "$lib/actions/infiniteScroll";
    import { array2columns } from "$lib/utils/utils";

    type T = $$Generic<{ id: number }>;

    export let items: Paginator<T>;
    export let itemHeight: (item: T) => number;

    // TODO init with client's screen width
    let pageWidth = 1000; // thus it will SSR for wide screen

    $: loading = items.isLoadingStore;
    let columns: T[][] = [];
    // updates during loading the data cause scroll jumping, so skip them
    $: if (!$loading) {
        columns = array2columns(
            $items,
            pageWidth > 480 ? 4 : 2,
            itemHeight,
            !items.hasMore,
        );
    }
    // clear data when receive new paginator
    $: if (items) columns = [];
</script>

<svelte:window bind:innerWidth={pageWidth}/>

<section class="items" use:infiniteScroll={() => items.loadMore()}>
    {#each columns as column}
        <div class="column">
            {#each column as item (item.id)}
                <slot {item} />
            {/each}
        </div>
    {:else}
        {#if !$loading}
            <div class="no-items">
                <Icon icon="block" />
                <slot name="empty">No items to display</slot>
            </div>
        {/if}
    {/each}
</section>
{#if $loading}
    <div class="loading"><Icon icon="loader" /></div>
{/if}

<style>
    .items {
        width: min(960px, 100%);
        margin: 20px auto;
        display: flex;
        gap: 20px;
        justify-content: center;
    }
    .column {
        width: calc((100% - 60px) / 4);
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .loading {
        width: 100%;
        padding: 20px;
        text-align: center;
        --icon-size: 40px;
    }
    .no-items {
        width: 100%;
        padding: 40px;
        border: 2px dashed #0002;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 20px;
        color: #857a90;
        font-size: 15px;
        font-style: italic;
        --icon-size: 40px;
        --icon-color: #d2d0d4;
    }
    @media screen and (max-width: 480px) {
        .items {
            gap: 10px;
        }
        .column {
            width: calc((100% - 10px) / 2);
        }
    }
</style>
