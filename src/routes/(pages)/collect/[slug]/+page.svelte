<script lang="ts" context="module">
    const advancedSorOptions = [{
        name: "Date of Release: New to Old",
        key: "release_date",
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
        name: "Discontinue Date: Soonest First",
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
        name: "% Sold Out: Least to Most",
        key: "percent_sold",
        desc: false,
    }];
    const newbieSortOptions = [{
        name: "A-Z",
        key: "alphabetical",
        desc: false,
    }, {
        name: "Release Date",
        key: "release_date",
        desc: true,
    }, {
        name: "Discontinue Date",
        key: "discontinue_date",
        desc: true,
    }, {
        name: "Difficulty",
        key: "difficulty",
        desc: false,
    }, {
        name: "% Series Completion",
        key: "percent_owned",
        desc: true,
    }, {
        name: "% Sold Out",
        key: "percent_sold",
        desc: true,
    }];
    const anonSortList = newbieSortOptions.filter((so) => so.key !== "percent_owned");
    function getSortOptions (authenticated: boolean) {
        // const sortOptions = currentUser.areFeaturesGated
        return authenticated ? advancedSorOptions : anonSortList;
    }
</script>
<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { findSetts, PagePaginator } from "$api";
    import Icon from "$elem/Icon.svelte";
    import PushSwitch from "$elem/PushSwitch.svelte";
    import Select from "$elem/Select.svelte";
    import SettTile from "$elem/SettTile.svelte";
    import cache from "$lib/actions/cache";
    import infiniteScroll from "$lib/actions/infiniteScroll";
    import Seo from "../Seo.svelte";

    export let data;

    const { isAuthenticated } = data.currentUser;
    const { categories, p } = data;

    let selectedCategory = categories.find((c) => c.name_slug === $page.params.slug);
    $: if (selectedCategory && $page.url.pathname !== selectedCategory?.collect_url) {
        goto(selectedCategory.collect_url);
    }
    $: setts = PagePaginator.fromPOJO(p.setts);
    $: loading = setts.isLoadingStore;

    let favorite = false;
    /**
     * 0 - all
     * 1 - limited
     * 2 - unlimited
     */
    let settType = 0 as 0|1|2;
    /**
     * 0 - all
     * 1 - owned
     * 2 - unowned
     */
    let owned = 0 as 0|1|2;
    let freebieSett = false;
    let creditSett = false;

    let sortOptions = getSortOptions($isAuthenticated);
    $: {
        sortOptions = getSortOptions($isAuthenticated);
    }
    let sortOption = sortOptions.find((so) => so.key === "release_date") ?? sortOptions[0];

    // do not do make request during initialization
    // do two skips due to issue https://github.com/sveltejs/svelte/issues/4265
    let skips = 2;
    $: if (skips > 0) {
        skips -= 1;
    } else {
        setts = findSetts(
            selectedCategory?.name_slug ?? "",
            sortOption.key,
            sortOption.desc,
            {
                favorite, owned, settType, creditSett, freebieSett,
            },
        );
    }

    function closeSelect (ev: Event) {
        // the Select opens at capture phase
        // so do one more click to close it back
        (ev.target as HTMLElement).click();
    }
</script>

<Seo/>

<header>
    <div>
        <a href="/collect/" use:cache={{ categories }}>
            ‹
            <span class="hide-on-tiny">Back to Collect</span>
        </a>
    </div>
    <h1>{selectedCategory?.name ?? ""}</h1>
    <div></div>
</header>
<article use:infiniteScroll={() => setts.loadMore()}>
    <section class="filters" class:anon={!$isAuthenticated}>
        <span class="filters1">
            <Select list={categories} bind:value={selectedCategory} let:item>
                <a href="{item?.collect_url}" class="item">{item?.name ?? "Select Category"}</a>
                <span class="label" slot="selected">{item?.name ?? "Select Category"}</span>
            </Select>
            {#if $isAuthenticated}
                <PushSwitch
                    icons={["like", "liked"]}
                    bind:value={favorite}
                >
                    <span class="hide-on-small">Favorites</span>
                </PushSwitch>
            {/if}
            <PushSwitch
                icons={["limited", "limited", "unlimited"]}
                bind:value={settType}
                hint="Toggle between Limited Series, Unlimited Series and All Series"
            >
                <span class="hide-on-small">{["All", "Limited", "Unlimited"][settType]}</span>
            </PushSwitch>
            {#if $isAuthenticated}
                <PushSwitch
                    icons={["owned", "owned", "unowned"]}
                    bind:value={owned}
                    hint="Toggle between series you own, series you don't own, and All Series"
                >
                    <span class="hide-on-small">{["All", "Owned", "Unowned"][owned]}</span>
                </PushSwitch>
            {/if}
        </span>
        <span class="filters2">
            <span class="multi">
                <PushSwitch
                    icons={"freebie"}
                    bind:value={freebieSett}
                    hint="Series available for Free"
                ></PushSwitch>
                <PushSwitch
                    icons={"credit"}
                    bind:value={creditSett}
                    hint="Series available for Credits"
                ></PushSwitch>
            </span>
            <span class="pipe"></span>
            <Select list={sortOptions} bind:value={sortOption} let:item>
                <span class="item">{item?.name ?? "Select Order"}</span>
                <span class="ordered" slot="selected">
                    <span class="label">{item?.name ?? "Select Order"}</span>
                    <!-- have to use `sortOption` instead of `item`
                        because then there is no reactive re-rendering.
                        Possible related issues:
                        https://github.com/sveltejs/svelte/issues/8052
                        https://github.com/sveltejs/svelte/issues/7913
                    -->
                    <span class:selected={!sortOption.desc}>
                        <Icon icon="descending" hint="Ascending Order"
                            on:click={(ev) => { closeSelect(ev); sortOption.desc = false; }}
                        />
                    </span>
                    <span class:selected={sortOption.desc}>
                        <Icon icon="descending" hint="Descending Order"
                            on:click={(ev) => { closeSelect(ev); sortOption.desc = true; }}
                        />
                    </span>
                    <span class="pipe"></span>
                </span>
            </Select>
        </span>
    </section>
    <section class="description">
        {selectedCategory?.description ?? ""}
    </section>
    {#if setts.total > 0}
        <section class="setts">
            {#each $setts as sett}
                <SettTile {sett} />
            {/each}
        </section>
    {:else if !$loading}
        <div class="no-setts">
            No luck! None of these filters matches your criteria.
            Try changing the filters.
        </div>
    {/if}
    {#if $loading}
        <div class="loading"><Icon icon="loader"/></div>
    {/if}
</article>

<style>
    header {
        display: flex;
        height: 60px;
        line-height: 1;
        background: white;
        border-bottom: 1px solid rgba(0,0,0,.1);
        align-items: center;
        padding: 0 10px;
    }
    header * {
        flex: 1 100%;
    }
    header h1 {
        text-align: center;
        margin: 0;
        font-size: 24px;
        font-weight: 300;
        color: #2c2830;
        white-space: nowrap;
    }
    article {
        margin: 0 auto;
        padding-bottom: 20px;
        width: min(960px, 100%);
    }
    .filters {
        padding: 20px 0;
        display: flex;
        gap: 15px;
    }
    .filters > * {
        display: flex;
        justify-content: space-between;
        min-width: 0;
    }
    .filters1 {
        flex: 3 1 40px;
        gap: 15px;
        --icon-size: 13px;
    }
    .filters2 {
        flex: 2 1 40px;
        --icon-size: 15px;
    }
    .filters1 > :global(:first-child) {
        width: 50%;
        min-width: 0;
    }
    .anon .filters1 > :global(:first-child) {
        flex-grow: 1;
    }
    .filters1 > :global(:first-child ~ *),
    .filters2 .multi {
        min-width: 100px;
        box-shadow: none;
        color: #A19FA2;
        border: 1px solid #0003;
    }
    .filters1 > :global(:first-child ~ *:hover),
    .filters2 .multi:hover {
        color: #1f1c22;
        border: 1px solid #0006;
    }
    .filters1 > :global(:first-child ~ *.selected),
    .filters2 .multi > :global(.selected) {
        color: #1482A1;
        background: white;
    }
    .filters1 span, .filters .label {
        font-weight: 400;
        font-size: 12px;
        color: #39343e;
        margin-bottom: -2px;
    }
    .filters .label {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .filters1 .item {
        font-size: 13px;
        color: #433946;
    }
    .filters2 .multi {
        display: flex;
        border: 1px solid #0003;
        border-radius: 4px;
        overflow: hidden;
    }
    .filters2 .multi > :global(*) {
        flex-grow: 1;
        box-shadow: none;
        border-right: 1px solid #d6d6d6;
        border-radius: 0;
    }
    .filters2 .multi > :global(:last-child) {
        border-right: none;
    }
    .filters2 .pipe {
        height: auto;
        margin: 0 15px;
        border-color: #d6d6d6;
    }
    .filters2 > :global(:last-child) {
        width: 65%;
        min-width: 0;
    }
    .filters2 .ordered {
        flex-grow: 1;
        display: flex;
        align-items: center;
        gap: 1ch;
        min-width: 0;
        --icon-size: 18px;
        --icon-color: #d1d0d1;
    }
    .filters2 .ordered :first-child {
        flex-grow: 1;
    }
    .filters2 .ordered :nth-child(2) {
        transform: scaleY(-1);
    }
    .filters2 .ordered .selected {
        --icon-color: #a19fa2;
    }
    .filters2 .ordered .pipe {
        margin: 0 0 0 5px;
        align-self: stretch;
    }
    .description {
        border-top: 1px solid rgba(0,0,0,.1);
        padding: 20px 0 10px;
        text-align: center;
    }
    .setts {
        background: #fff;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
        width: 100%;
        text-align: center;
    }
    .loading {
        width: 100%;
        padding: 20px;
        text-align: center;
        --icon-size: 40px;
    }
    .loading:only-child {
        padding: 60px;
    }
    .no-setts {
        width: 100%;
        padding: 40px;
        border: 2px dashed #0002;
        border-radius: 4px;
        color: #857a90;
        font-size: 15px;
        font-style: italic;
        text-align: center;
    }
    @media screen and (max-width: 768px) {
        .filters {
            width: 400px;
            margin: 0 auto;
            flex-direction: column;
        }
        .filters1 > :global(:first-child ~ *),
        .filters2 .multi > :global(*),
        .filters2 .multi {
            min-width: 45px;
            flex-shrink: 0;
        }
        .hide-on-small {
            display: none;
        }
    }
    @media screen and (max-width: 480px) {
        header > * {
            flex-basis: 25px;
        }
        header a {
            font-size: 40px;
            font-weight: 200;
        }
        header h1 {
            flex-basis: 100%;
            font-size: 20px;
            white-space: nowrap;
        }
        .filters {
            max-width: calc(100% - 20px);
        }
        .filters1 > :global(:first-child ~ *),
        .filters2 .multi > :global(*) {
            min-width: 35px;
        }
        .filters2 .ordered {
            gap: .5ch;
        }
        .description {
            padding: 20px 10px 10px;
        }
        .hide-on-tiny {
            display: none;
        }
    }
</style>
