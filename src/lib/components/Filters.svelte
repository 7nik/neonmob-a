<!-- @component
    Section with filters
 -->
<script lang="ts" context="module">
    type Filter = {
        key: string,
        hint: string,
        name: string,
        value: boolean,
        icons: IconName | IconName[],
    } | {
        key: string,
        hint: string,
        name: string | string[],
        value: number,
        icons: IconName[],
    };
    type Order = {
        key: string,
        name: string,
        desc: boolean,
    }

    export type FiltersSchema = {
        buttons: Filter[],
        group: Filter[],
        list?: Order[],
    }
</script>
<script lang="ts">
    import type { IconName } from "$elem/Icon.svelte";

    import Icon from "$elem/Icon.svelte";
    import PushSwitch from "$elem/PushSwitch.svelte";
    import Select from "$elem/Select.svelte";

    /**
     * Description of filters to apply
     */
    export let schema: FiltersSchema;
    /**
     * Resulting filters with values
     */
    export let filters: Record<string, any>;

    let selectedOrder: Order;

    filters = {};
    for (const filter of schema.buttons) {
        filters[filter.key] = filter.value;
    }
    for (const filter of schema.group) {
        filters[filter.key] = filter.value;
    }
    if (schema.list) {
        [selectedOrder] = schema.list;
    }
    $: if (selectedOrder) applyOrder(selectedOrder);
    function applyOrder ({ key, desc }: Order) {
        filters.orderBy = key;
        filters.order = desc ? "desc" : "asc";
    }
    // TODO allow to use this component in the series finder
</script>

<section class="filters">
    <span class="separate-filters">
        <span class="label">FILTERS:</span>
        {#each schema.buttons as filter}
            <PushSwitch
                bind:value={filters[filter.key]}
                icons={filter.icons}
                hint={filter.hint}
            >
                {Array.isArray(filter.name) ? filter.name[+filters[filter.key]] : filter.name}
            </PushSwitch>
        {/each}
    </span>

    <span class="group-filters">
        {#each schema.group as filter}
            <PushSwitch
                bind:value={filters[filter.key]}
                icons={filter.icons}
                hint={filter.hint}
            >{filter.name}</PushSwitch>
        {/each}
    </span>

    {#if schema.list}
        <Select list={schema.list} bind:value={selectedOrder} let:item>
            {@const selected = item === selectedOrder}
            <span class="option current" slot="selected">{item?.name}</span>
            <span class="option" class:selected>
                {item?.name}
                {#if selected}<Icon icon="checkmark" />{/if}
            </span>
        </Select>
    {/if}
</section>

<style>
    section {
        width: min(960px, 100%);
        margin: 0 auto;
    }

    .filters {
        padding: 20px 10px 0;
        display: flex;
        gap: 10px;
        color: #857A90;
        font-size: 0;
        font-weight: 500;
        line-height: 1.4;
        --icon-size: 14px;
    }
    .filters .separate-filters {
        display: flex;
        gap: 5px;
        color: #857A90;
        font-size: 0;
        font-weight: 500;
        line-height: 1.4;
        --icon-size: 16px;
    }
    .filters .separate-filters .label {
        align-self: center;
        font-size: 12px;
        line-height: normal;
    }
    .filters .separate-filters > :global(:not(.label)) {
        width: 48px;
        height: 42px;
    }
    .filters .group-filters {
        height: 42px;
        width: 50%;
        display: flex;
        border: 1px solid #d6d6d6;
        border-radius: 4px;
        --icon-size: 20px;
    }
    .filters .group-filters > :global(*) {
        flex-grow: 1;
        box-shadow: none;
        border-right: 1px solid #d6d6d6;
        border-radius: 0;
    }
    .filters .group-filters > :global(:last-child) {
        border-right: none;
    }
    .filters .option {
        color: #433946;
        font-weight: 400;
        white-space: nowrap;
    }
    .filters .option.current {
        font-size: 12px;
    }
    .filters .option.selected {
        font-weight: 500;
        display: flex;
        justify-content: space-between;
    }
    .filters .separate-filters > :global(.selected),
    .filters .group-filters > :global(.selected) {
        background: white;
    }
    /* Select */
    .filters .group-filters + :global(*) {
        width: 250px;
        border-color: #d6d6d6;
    }
    @media screen and (max-width: 767px) {
        .filters {
            flex-wrap: wrap;
        }
        .filters .group-filters {
            flex-grow: 1;
            order: 1;
        }
    }
    @media screen and (max-width: 480px) {
        .filters .separate-filters {
            font-size: 13px;
            flex-grow: 1;
            color: #39343e;
        }
        .filters .separate-filters .label {
            display: none;
        }
        .filters .separate-filters > :global(:not(.label)) {
            flex-grow: 1;
            width: auto;
            font-weight: 400;
        }
        /* Select */
        .filters .group-filters + :global(*) {
            width: auto;
            flex-grow: 1;
        }
    }
    @media screen and (max-width: 320px) {
        .filters .separate-filters {
            font-size: 11px;
        }
    }
</style>
