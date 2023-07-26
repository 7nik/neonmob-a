<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import {
        getFavoriteCards,
        getFavoriteSetts,
        getWishlistedCards,
        EndlessPaginator,
        StaticPaginator,
    } from "$api";
    import Icon from "$elem/Icon.svelte";
    import MetaSeo from "$elem/MetaSeo.svelte";
    import Tabs from "$elem/Tabs.svelte";
    import { infiniteScroll } from "$lib/utils/utils";
    import CardListItem from "./CardListItem.svelte";
    import SettListItem from "./SettListItem.svelte";

    export let data;

    const { isAuthenticated, isCurrentUser, user } = data.currentUser;

    const tabs = [{
        // eslint-disable-next-line sonarjs/no-duplicate-string
        path: "favorites/",
        tab: "cards",
        prefix: "Favorite",
        name: "Cards",
    }, {
        path: "favorites/",
        tab: "series",
        prefix: "Favorite",
        name: "Series",
    }, {
        path: "favorites/",
        tab: "wishlist",
        name: "Wishlist",
    }] as const;

    let currentTab: typeof tabs[number]["name"];

    let skip = true;
    $: items = skip
        ? new EndlessPaginator<NM.Unmerged.FavoriteCards["results"][number]>()
        : getItems(currentTab);
    $: loading = items.isLoadingStore;
    $: gallery = currentTab === "Series" ? [] : $items.map((c) => c.id) as number[];

    function getItems (tab: string | null) {
        switch (tab) {
            case "Wishlist": return new StaticPaginator(getWishlistedCards(data.user.id), 15);
            case "Series": return new StaticPaginator(getFavoriteSetts(data.user.id), 15);
            // case "Cards":
            default: return new StaticPaginator(getFavoriteCards(data.user.id), 15);
        }
    }

    infiniteScroll(() => items.loadMore());

    onMount(() => {
        if (isAuthenticated()) {
            skip = false;
        } else {
            goto(`/login?next=${encodeURIComponent($page.url.pathname)}`);
        }
    });
</script>

<!-- eslint-disable-next-line max-len -->
<MetaSeo title="{data.user.first_name} {data.user.last_name} ({data.user.username})'s Favorites on NeonMo" />
<Tabs basePath="/{data.user.username}/" {tabs} bind:currentTab />
<section>
    {#each $items as item}
        {#if "sett" in item}
            <CardListItem card={item} {gallery}>
                <Icon icon={ currentTab === "Wishlist"
                    ? (item.favorite ? "wishlisted" : "wishlist")
                    : (item.favorite ? "liked" : "like")}
                />
            </CardListItem>
        {:else}
            <SettListItem sett={item}>
                <Icon icon={item.favorite ? "liked" : "like"} />
            </SettListItem>
        {/if}
    {/each}
    {#if $loading}
        <div class="loading"><Icon icon="loader"/></div>
    {:else if $items.length === 0}
        <div class="empty">
            <h2>
                {#if $isCurrentUser(data.user)}
                    {#if currentTab === "Wishlist"}
                        Nothing on your Wish List?
                    {:else}
                        No Favorites Here!
                    {/if}
                {:else}
                    Hey {user.name}! {data.user.name}
                    Doesn't Have Any {currentTab === "Wishlist" ? "Wishlist" : "Favorites"} Yet
                {/if}
            </h2>
            <p>
                {#if $isCurrentUser(data.user)}
                    {#if currentTab === "Wishlist"}
                        When you come across a card you want, click the
                        <Icon icon="wishlist" upper /> to add it here.
                    {:else}
                        Hey, thats okay. In time, you'll find your soulmate…err favorites.
                    {/if}
                {:else}
                    {#if currentTab === "Wishlist"}
                        If you're trying to start a trade, try sending a direct message
                        to find out what {data.user.name} is interested in.
                    {:else}
                        It's probably because this collector has impeccable taste and is
                        taking their time to figure just the right ones to favorite.
                    {/if}
                {/if}
            </p>
        </div>
    {/if}
</section>

<style>
    section {
        width: min(980px, 100%);
        padding: 0 10px;
        margin: 20px auto;
        display: flex;
        flex-direction: column;
        gap: 1px;
        --icon-size: 18px;
    }
    .loading {
        width: 100%;
        padding: 60px;
        text-align: center;
        grid-column: 1/4;
        --icon-size: 40px;
    }
    .empty {
        width: 100%;
        border: 2px dashed rgba(0,0,0,.15);
        padding: 40px 20px;
        border-radius: 4px;
        margin: 10px;
        text-align: center;
        --icon-size: 18px;
    }
</style>
