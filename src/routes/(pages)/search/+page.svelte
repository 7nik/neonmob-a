<script lang="ts">
    import type NMA from "$lib/utils/NMA Types";

    import { onMount } from "svelte";
    import { derived } from "svelte/store";
    import { page } from "$app/stores";
    import { searchItems } from "$api";
    // import cache from "$lib/actions/cache";
    import Avatar from "$elem/Avatar.svelte";
    import Button from "$elem/Button.svelte";
    import CollectButton from "$elem/CollectButton.svelte";
    import Icon from "$elem/Icon.svelte";
    import MetaSeo from "$elem/MetaSeo.svelte";
    import PrintAsset from "$elem/PrintAsset.svelte";
    import resolve from "$lib/actions/resolve";
    import { fail } from "$lib/dialogs";
    import { viewPrint } from "$lib/overlays";

    const query = derived(page, ($page) => $page.url.searchParams.get("search") ?? "");
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    let promise: Promise<NMA.SearchResults> = new Promise(() => {});
    onMount(() => query.subscribe(($query) => {
        promise = searchItems($query);
    }));

    async function viewCard (cardId: number) {
        const { cards } = await promise;
        viewPrint({ cardId, gallery: cards.map((c) => c.id) });
    }
</script>

<MetaSeo title="NeonMob - Search Results" />

<h1>Search Results For "{$query}"</h1>
{#await promise}
    <article class="loading"><Icon icon="loader"/></article>
{:then data}
    <article>
        <h2>Cards <span>{data.cards.length}</span></h2>
        <ul>
            {#each data.cards as card}
                <!-- FIXME add checks whether the user owns the card -->
                <li>
                    <!-- preload data isn't used due to usage of the overlay -->
                    <a class="img" href={card.public_url}
                        data-sveltekit-preload-data="off"
                        on:click|preventDefault={() => viewCard(card.id)}
                    >
                        <PrintAsset
                            card={card}
                            size="small"
                            isPublic={!$page.data.currentUser.isAuthenticated()}
                            showRarity
                            showSettType
                        />
                    </a>
                    <section>
                        <a href={card.public_url}
                            on:click|preventDefault={() => viewCard(card.id)}
                        >{card.name}</a>
                        <div use:resolve={{ sett: card.sett }}>
                            <a href={card.sett.link}>
                                {card.sett.name}
                            </a>
                            by
                            <a href={card.creator.link}>
                                {card.creator.name}
                            </a>
                        </div>
                    </section>
                    <!-- TODO fix button -->
                    <Button icon="owners" on:click={fail}>Seekers</Button>
                </li>
            {/each}
        </ul>

        <h2>Series <span>{data.setts.length}</span></h2>
        <ul>
            {#each data.setts as sett}
                <li use:resolve={{ sett }}>
                    <a class="img pack" href={sett.permalink}>
                        <img src={sett.sett_assets.small.url} alt="Cover of {sett.name}">
                    </a>
                    <section>
                        <a href={sett.permalink}>{sett.name}</a>
                        created by
                        <a href={sett.creator.link}>
                            {sett.creator.name}
                        </a>
                    </section>
                    <CollectButton {sett} darkTheme />
                </li>
            {/each}
        </ul>

        <h2>Collectors <span>{data.users.length}</span></h2>
        <ul>
            {#each data.users as user}
                <li use:resolve={{ user }}>
                    <a href={user.link}>
                        <Avatar {user} />
                    </a>
                    <a href={user.link}>{user.name}</a>
                </li>
            {/each}
        </ul>
    </article>
{:catch ex}
    {ex}
{/await}

<style>
    article, h1 {
        width: min(100%, 960px);
        margin: 20px auto;
        color: #2c2830;
    }
    article {
        margin-top: 0;
        background: #fff;
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        box-shadow: 0 1px 2px rgba(0,0,0,.075);
    }
    .loading {
        padding: 20px;
        text-align: center;
        --icon-size: 40px;
    }
    h2 {
        margin: 0;
        padding: 22px 20px 12px;
        font-size: 18px;
        border-bottom: 1px solid #0001;
    }
    h2 span {
        display: inline-block;
        font-size: 13px;
        font-weight: 500;
        padding: 2px 6px 0;
        color: #5e4f63;
        vertical-align: middle;
        letter-spacing: .05em;
        border-radius: 5em;
        background-color: rgba(0,0,0,.07);
    }
    ul {
        padding: 0;
        margin: 0;
        list-style: none;
    }
    li {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 10px 20px 10px 10px;
        border-bottom: 1px solid #0001;
    }
    li .img, li img {
        display: block;
        width: 60px;
        height: 60px;
        border-radius: 3px;
        overflow: hidden;
    }
    .pack {
        position: relative;
    }
    .pack::after {
        content: "";
        display: block;
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background: url(/img/pack.png) center center no-repeat;
        background-size: contain;
        z-index: 3;
    }
    section {
        flex-grow: 1;
    }
</style>
