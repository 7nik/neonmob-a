<script lang="ts">
    import { getUserCollections, PagePaginator } from "$api";
    import Icon from "$elem/Icon.svelte";
    import PushSwitch from "$elem/PushSwitch.svelte";
    import Select from "$elem/Select.svelte";
    import SettTile from "$elem/SettTile.svelte";
    import currentUser from "$lib/services/currentUser";
    import { infiniteScroll } from "$lib/utils/utils";

    export let data;

    const sortOptions = [{
        name: "Recently Collected",
        key: "last_acquired",
        desc: true,
    }, {
        name: "Alphabetical: A to Z",
        key: "alphabetical",
        desc: false,
    }, {
        name: "Alphabetical: Z to A",
        key: "alphabetical",
        desc: true,
    }, {
        name: "Date of Release",
        key: "release_date",
        desc: false,
    }, {
        name: "Discontinue Date",
        key: "discontinue_date",
        desc: false,
    }, {
        name: "Difficulty: Easiest to Hardest",
        key: "difficulty",
        desc: false,
    }, {
        name: "Difficulty: Hardest to Easiest",
        key: "difficulty",
        desc: true,
    }, {
        name: "% Series Complete : Least to Most",
        key: "percent_owned",
        desc: false,
    }];

    let favorite = false;
    let sortOption = sortOptions[0];

    $: setts = PagePaginator.fromPOJO(data.p.setts);
    $: loading = setts.isLoadingStore;

    // do not do make request during initialization
    // do two skips due to issue https://github.com/sveltejs/svelte/issues/4265
    let skips = 2;
    $: if (skips > 0) {
        skips -= 1;
    } else {
        console.log("update setts");
        setts = getUserCollections(
            data.user.id,
            sortOption.key,
            sortOption.desc,
            { favorite },
        );
    }

    infiniteScroll(() => setts.loadMore());
</script>

<section class="filters">
    <span class="label">FILTERS:</span>
    {#if $currentUser.is(data.user)}
        <PushSwitch
            bind:value={favorite}
            icons={["like", "liked"]}
            hint="Favorites"
        >Favorite</PushSwitch>
    {/if}

    <Select list={sortOptions} bind:value={sortOption} let:item>
        {@const selected = item === sortOption}
        <span class="option current" slot="selected">{item?.name}</span>
        <span class="option" class:selected>
            {item?.name}
            {#if selected}<Icon icon="checkmark" />{/if}
        </span>
    </Select>
</section>
<section class="setts">
    {#if setts.total > 0}
        {#each $setts as sett (sett.id)}
            <SettTile {sett} owner={data.user} />
        {/each}
    {/if}
    {#if $loading}
        <div class="loading"><Icon icon="loader"/></div>
    {/if}
</section>


<style>
    section {
        width: min(960px, 100%);
        margin: 0 auto;
    }

    .filters {
        margin-top: 20px;
        padding-left: 10px;
        display: flex;
        gap: 10px;
        color: #857A90;
        font-size: 0;
        font-weight: 500;
        line-height: 1.4;
        --icon-size: 14px;
    }
    .filters .label {
        align-self: center;
        font-size: 12px;
        line-height: normal;
    }
    .filters .label + :global(:not(:last-child)) {
        width: 48px;
        height: 42px;
    }
    .filters .label + :global(:not(:last-child).selected) {
        background: white;
    }
    .filters > :global(:last-child) {
        width: 250px;
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

    .setts {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
    }

    .loading {
        width: 100%;
        padding: 20px;
        text-align: center;
        grid-column: 1/4;
        --icon-size: 40px;
    }
    .loading:only-child {
        padding: 60px;
    }

    @media screen and (max-width: 640px) {
        .setts {
            grid-template-columns: 1fr 1fr;
        }
    }
    @media screen and (max-width: 480px) {
        .setts {
            grid-template-columns: 1fr;
            justify-items: center;
        }
    }
</style>
