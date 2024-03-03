<script lang="ts" context="module">
    import type { ID } from "$lib/utils/NM Types";

    import TemporalMap from "$lib/utils/TemporalMap";

    const cache = new TemporalMap<string, Paginator<NM.Collector>>(15 * 60_000);
    let clickedUsers = new Set<ID<"user">>();
    let clickedUsersCard: ID<"card">;

    let recentParams: [
        Pick<NM.Card, "id"|"name"|"asset_type"|"piece_assets"|"is_replica">,
        { id: number, name: string },
        boolean,
     ] | null = null;
    export function getRecentParams () {
        return recentParams;
    }
</script>

<script lang="ts">
    import type NM from "$lib/utils/NM Types";
    import type { IconName } from "$elem/Icon.svelte";

    import { page } from "$app/stores";
    import { findTradePartners, type Paginator } from "$api";
    import Avatar from "$elem/Avatar.svelte";
    import Button from "$elem/Button.svelte";
    import Icon from "$elem/Icon.svelte";
    import TradeGrade from "$elem/TradeGrade.svelte";
    import infiniteScroll from "$lib/actions/infiniteScroll";
    import tip from "$lib/actions/tip";
    import { viewConversation, sidebarOverlay } from "$lib/overlays";
    import { startTrade } from "$lib/overlays/TradeWindowOpener.svelte";
    import { plural } from "$lib/utils/format";
    import PrintAsset from "./PrintAsset.svelte";
    import SettCompletion from "./SettCompletion.svelte";

    export let card: Pick<NM.Card, "id"|"name"|"asset_type"|"piece_assets"|"is_replica">;
    export let sett: { id: number, name: string };
    export let searchNeeders: boolean;

    // @ts-expect-error - some shit error
    recentParams = [ card, sett, searchNeeders ];
    $: recentParams = [ card, sett, searchNeeders ];

    if (clickedUsersCard != card.id) {
        clickedUsersCard = card.id;
        clickedUsers = new Set();
    }

    const { currentUser } = $page.data;

    const canChat = currentUser.isVerified();// && currentUser.hasPermissions;

    let sortOptions: { key: string, order: "desc"|"asc"|null }[] = [{
        key: "grade",
        order: null,
    }, {
        key: "owned",
        order: null,
    }, {
        key: "wishlisted",
        order: null,
    }, {
        key: "completion",
        order: null,
    }];
    let searchText = "";
    let searchTextRaw = "";
    let showUserSearch = false;
    let timer: NodeJS.Timeout;
    $: {
        clearTimeout(timer);
        timer = setTimeout(() => {
            searchText = searchTextRaw;
        }, 500);
    }

    function closeSearch () {
        showUserSearch = false;
        searchTextRaw = "";
    }

    function toggleOrder (option: { key: string, order: "desc"|"asc"|null }) {
        if (option.order === null) {
            option.order = "desc";
        } else if (option.order === "desc") {
            option.order = "asc";
        } else {
            option.order = null;
        }
        sortOptions = sortOptions;
    }

    // just to cast the type
    function getIcon (user: NM.Collector) {
        return user.level.app_icon_selector as IconName;
    }

    // mostly to cast typing
    function getSett (user: NM.Collector) {
        return {
            ...user,
            id: sett.id,
            name: sett.name,
            ownerId: user.id,
            permalink: "/",
        } as unknown as NM.Sett;
    }

    function tradeWith (user: NM.Collector) {
        clickedUsers.add(user.id);
        startTrade(
            user,
            {
                card,
                sett,
                side: searchNeeders ? "responder" : "bidder",
            },
            searchNeeders ? "seekers" : "owners",
        );
    }

    function close () {
        sidebarOverlay.set({ comp: null, props: {} });
    }

    function focus (elem: HTMLElement) {
        elem.focus();
    }

    $: searchOptions = sortOptions.reduce((options, option) => {
        if (option.order) options[option.key] = option.order;
        return options;
    }, (showUserSearch && searchText ? { search: searchText } : {}) as Record<string, string>);

    let collectors: Paginator<NM.Collector>;
    let preloading = false;

    let collectorsKey: string;
    function showCollectors (options: Record<string, string>) {
        const cacheKey = JSON.stringify([card.id, searchNeeders, options]);
        collectorsKey = cacheKey;
        if (cache.has(cacheKey)) {
            collectors = cache.get(cacheKey)!;
            return;
        }
        const paginator = findTradePartners(card.id, searchNeeders ? "needers" : "owners", options);
        cache.set(cacheKey, paginator);
        preloading = false;
        if (paginator.items.length > 0) {
            collectors = paginator;
            return;
        }
        // do not let `collectors` be undefined
        if (!collectors) {
            collectors = paginator;
        }
        collectorsKey = cacheKey;
        preloading = true;
        paginator.waitLoading().then(() => {
            if (collectorsKey === cacheKey) {
                collectors = paginator;
                preloading = false;
            }
        });
    }

    $: showCollectors(searchOptions);
    $: loading = collectors.isLoadingStore;

    $: collectorType = searchNeeders ? "Collector" : "Owner";
    $: collectorCount = $collectors.length
        ? (collectors.total > 100
            ? `100+ ${collectorType}s`
            : `${collectors.total} ${plural(collectors.total, collectorType)}`)
        : `No ${collectorType}s`;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<article on:click|self={close}>
    <div>
        <header>
            <span class="close-button">
                <Icon icon="close" on:click={close} />
            </span>
            <div class="card-preview">
                <PrintAsset {card} size="small" isPublic showRarity />
            </div>
            {#if $loading && collectors.total < 1}
                <h1 class:header-empty={!searchNeeders && collectors.total === 0}>
                    Loading {searchNeeders ? "Seekers" : "Owners"}&hellip;
                </h1>
            {:else}
                <h1>
                    <span use:tip={`${collectors.total} ${plural(collectors.total, collectorType)}`}>
                        {collectorCount}
                    </span>
                    {searchNeeders ? "Seeking" : "Of"}
                    {card.name}
                </h1>

                <div class="description">
                    {#if searchNeeders}
                        All collectors of this series who don't own this.
                    {:else}
                        All collectors with one or more of these.
                    {/if}
                </div>
                <div class="toggle-button">
                    <Button type="subdued-dark" on:click={() => { searchNeeders = !searchNeeders; }}>
                        view {searchNeeders ? "owners" : "seekers"}
                    </Button>
                </div>
            {/if}
        </header>
        <hr>
        <main
            class:hide={preloading}
            class:loading={$loading}
            use:infiniteScroll={() => collectors.loadMore()}
        >
            {#if showUserSearch}
                <div class="col-header row search-bar" class:border={$collectors.length === 0}>
                    <label for="collector-search">
                        <Icon icon="search" />
                    </label>
                    <input
                        id="collector-search"
                        placeholder="Search Collector"
                        bind:value={searchTextRaw}
                        use:focus
                    >
                    <span>
                        <Icon icon="close" on:click={closeSearch} />
                    </span>
                </div>
            {/if}
            <div class="col-header search">
                <span>Collector</span>
                <span>
                    <Icon icon="search" on:click={() => { showUserSearch = true; }} />
                </span>
            </div>
            <div class="col-header">
                <span>
                    <div class="large-screen">Trader</div>
                    Grade
                </span>
                <span class:selected={sortOptions[0].order !== null}>
                    <Icon icon={sortOptions[0].order === "asc" ? "ascendingSimple" : "descendingSimple"}
                        on:click={() => toggleOrder(sortOptions[0])}
                    />
                </span>
            </div>
            <div class="col-header">
                {#if searchNeeders}
                    <span>
                        <div class="large-screen">Collector's</div>
                        <div>
                            <span class="smaller-screen symbol"># </span>
                            <span class="no-smaller-screen">Wishlist</span>
                        </div>
                    </span>
                    <span class:selected={sortOptions[2].order !== null}>
                        <Icon icon={sortOptions[2].order === "asc" ? "ascendingSimple" : "descendingSimple"}
                            on:click={() => toggleOrder(sortOptions[2])}
                        />
                    </span>
                {:else}
                    <span>
                        <span class="smaller-screen symbol"># </span>
                        <span class="no-smaller-screen">Owned</span>
                    </span>
                    <span class:selected={sortOptions[1].order !== null}>
                        <Icon icon={sortOptions[1].order === "asc" ? "ascendingSimple" : "descendingSimple"}
                            on:click={() => toggleOrder(sortOptions[1])}
                        />
                    </span>
                {/if}
            </div>
            <div class="col-header">
                <span>
                    <div class="large-screen">Series</div>
                    <div>
                        <div class="smaller-screen symbol">%</div>
                        <div class="no-smaller-screen">Completion</div>
                    </div>
                </span>
                <span class:selected={sortOptions[3].order !== null}>
                    <Icon icon={sortOptions[3].order === "asc" ? "ascendingSimple" : "descendingSimple"}
                        on:click={() => toggleOrder(sortOptions[3])}
                    />
                </span>
            </div>
            <div class="col-header last">
                <Icon icon="helpLight"
                    hint="Search and sort to easily locate the collectors who most likely would accept your trade"
                />
            </div>
            {#each $collectors as collector}
                <div class="cell user" class:clicked={clickedUsers.has(collector.id)}>
                    <a
                        href={collector.link}
                        class="avatar"
                    >
                        <Avatar user={collector} size="fill" />
                        <div class="icon" style:background={collector.level.icon_color}>
                            <Icon icon={getIcon(collector)} />
                        </div>
                    </a>
                    {#if collector.pro_badge}
                        <Icon icon="pro" hint="Pro Collector" upper />
                    {/if}
                    <a href={collector.link} class="collector-name">
                        {collector.name}
                    </a>
                </div>
                <div class="cell trader-grade">
                    <TradeGrade user={collector} />
                </div>
                <div class="cell own-count">
                    {#if searchNeeders}
                        <Icon icon={collector.wishlisted ? "wishlisted" : "wishlist"} />
                    {:else}
                        {collector.print_count}
                        <span class="symbol-times">&times;</span>
                    {/if}
                </div>
                <div class="cell completed-count">
                    <SettCompletion sett={getSett(collector)} owner={collector} hideHeader darkTheme />
                </div>
                <div class="cell actions">
                    {#if canChat}
                        <span class="large-screen">
                            <Button
                                type="subdued-dark"
                                icon="chat"
                                on:click={() => viewConversation(collector.id)}
                            />
                        </span>
                    {/if}
                    {#if currentUser.vacationMode()}
                        <Button icon="trade" size="mini"
                            hint="To enable, turn on trading in Settings"
                        >
                            <span class="no-smaller-screen">Trade</span>
                        </Button>
                    {:else}
                        <Button icon="trade" size="mini"
                            type={collector.vacation_mode ? "disabled-dark" : "primary"}
                            hint={collector.vacation_mode ? 'Not accepting trades right now.' : ""}
                            on:click={() => tradeWith(collector)}
                        >
                            <span class="no-smaller-screen">Trade</span>
                        </Button>
                    {/if}
                </div>
            {/each}
            {#if $loading}
                <div class="row loading">
                    <Icon icon="loader" />
                </div>
            {:else if preloading}
                <div class="preloading">
                    <Icon icon="loader" />
                </div>
            {:else if $collectors.length === 0}
                <div class="row empty">
                    <div class="item-list-empty">
                        {#if searchText}
                            <div class="emoji-monocle"></div>
                            <div class="no-results">No users match your search criteria</div>
                        {:else}
                            <span class="no-results">
                                No {searchNeeders ? "owners" : "collectors"} found :(
                            </span>
                        {/if}
                    </div>
                </div>
            {/if}
        </main>
    </div>
</article>

<style>
    article {
        height: 100%;
        overflow: scroll;
        display: flex;
        padding: 40px;
    }
    article > div {
        width: 700px;
        margin: auto;
        padding: 40px;
        background: white;
        border-radius: 6px;
        overflow: hidden;
    }

    header {
        min-height: 60px;
        display: grid;
        grid-template-areas: "card title title" "card desc button";
        grid-template-columns: 60px auto 1fr;
        gap: 0 10px;
        position: relative;
        justify-items: flex-start;
    }
    .close-button {
        position: absolute;
        top: 0;
        right: 0;
        cursor: pointer;
        --icon-size: 20px;
    }
    .card-preview {
        grid-area: card;
        border-radius: 4px;
        overflow: hidden;
        align-self: flex-start;
        aspect-ratio: 1;
    }
    h1 {
        grid-area: title;
        margin: 0 30px 0 0;
        color: #2c2830;
    }
    .description, .no-results {
        grid-area: desc;
        color: #857a90;
        font-style: italic;
    }
    .toggle-button {
        grid-area: button;
        justify-self: flex-end;
    }
    hr {
        height: 1.3px;
        margin: 15px -50px;
        border: none;
        background-position: bottom left;
        background-repeat: repeat-x;
        background: linear-gradient(90deg, #B078B1, #B5CE80, #51B2D5, #B078B1);
        background-size: 300px;
    }
    main {
        display: grid;
        grid-template-columns: 1fr repeat(4, min-content);
        align-content: flex-start;
        position: relative;
        min-height: 200px;
    }
    .col-header {
        height: 34px;
        padding: 10px 5px 10px 0;
        color: #2C2830;
        opacity: .8;
        line-height: .8em;
        font-size: 10px;
        font-weight: 500;
        letter-spacing: .035em;
        text-transform: uppercase;
        text-align: center;
        display: inline-flex;
        align-items: center;
        --icon-size: 14px;
        --icon-color: #8b8a8c;
    }
    .col-header.search-bar {
        position: absolute;
        top: 0;
        width: 100%;
        display: flex;
        align-items: center;
        padding: 0;
        border: none;
    }
    .col-header.search-bar label {
        width: 0;
        z-index: 1;
    }
    .col-header.search-bar input {
        flex-grow: 1;
        padding: 7px 25px;
        font-size: 14px;
        caret-color: #000;
        color: #000;
        border: none;
        box-shadow: none;
        -webkit-appearance: none;
        appearance: none;
    }
    .col-header.search-bar ~ .col-header {
        visibility: hidden;
    }
    .col-header.last {
        min-width: 80px;
        padding-right: 0;
        justify-content: flex-end;
        cursor: help;
        margin-right: 20px;
        --icon-size: 18px;
    }
    .col-header > :last-child {
        cursor: pointer;
    }
    .col-header > :last-child:not(.selected):not(:hover) {
        opacity: 0.4;
    }
    .col-header.search {
        --icon-size: 16px;
        gap: 5px;
    }
    .hide.loading .col-header {
        visibility: hidden;
    }
    .cell {
        border-top: 1px solid #d6d6d6;
        padding: 10px 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .cell.clicked:not(:hover),
    .cell.clicked:not(:hover) + *,
    .cell.clicked:not(:hover) + * + *,
    .cell.clicked:not(:hover) + * + * + *,
    .cell.clicked:not(:hover) + * + * + * + * {
        opacity: 0.4;
    }
    .hide .cell {
        visibility: hidden;
    }
    .cell.user {
        justify-content: flex-start;
        gap: 10px;
        --icon-size: 12px;
    }
    .user a {
        color: #39343E;
    }
    .user a:hover {
        color: #085b85;
    }
    .avatar {
        position: relative;
        display: inline-block;
        width: 30px;
    }
    .avatar .icon {
        position: absolute;
        bottom: -2px;
        right: -4px;
        border: 2px solid white;
        border-radius: 16px;
        height: 16px;
        aspect-ratio: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        --icon-size: 8px;
        --icon-color: white;
    }
    .actions {
        gap: 5px;
    }
    .row {
        grid-column: 1 / 6;
        border-top: 1px solid #d6d6d6;
    }
    .row.loading {
        text-align: center;
        padding: 20px;
        --icon-size: 30px;
    }
    .hide.loading .row.loading {
        border: none;
    }
    .preloading {
        position: absolute;
        top: min(50%, 40vh);
        left: 50%;
        height: min(50vh, 400px);
        transform: translate(-50%);
        --icon-size: 30px;
    }
    .row.loading:only-child {
        border: none;
        --icon-size: 50px;
    }
    .emoji-monocle {
        background: url(/img/monocle.png) center no-repeat;
        background-size: auto;
        margin-top: 64px;
        height: 64px;
        background-size: contain;
    }
    .no-results {
        text-align: center;
        padding-bottom: 30px;
    }

    .smaller-screen {
        display: none;
    }
    @media screen and (max-width: 680px) {
        .large-screen {
            display: none;
        }
    }
    @media screen and (max-width: 680px) {
        .no-smaller-screen {
            display: none;
        }
        .symbol {
            font-size: 12px;
        }
    }
</style>