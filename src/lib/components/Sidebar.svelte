<script lang="ts">
    import { page } from "$app/stores";
    import { browser } from "$app/environment";
    import { liveListProvider } from "$api";
    import Clickable from "$elem/Clickable.svelte";
    import FlagCounter from "$elem/FlagCounter.svelte";
    import Icon from "$elem/Icon.svelte";
    import { conversationData, sidebarOverlay, sidebarTab } from "$lib/overlays";
    import Conversation from "./sidebar/Conversation.svelte";
    import Friends from "./sidebar/Friends.svelte";
    import Milestones from "./sidebar/Milestones.svelte";
    import Notifications from "./sidebar/Notifications.svelte";
    import TradeMessages from "./sidebar/TradeMessages.svelte";
    import { derived } from "svelte/store";

    const { currentUser, otherUsers } = $page.data;

    const beginner = false; // currentUser.areFeaturesGated;
    const showFriends = true; /// currentUser.canDo("friend");
    const canTrade = true; // currentUser.canDo("trade");

    const unreadMessageAndTradeCount = derived(
        [liveListProvider("messages").store, liveListProvider("trades").store],
        ([messages, trades]) => (
            messages.filter((msg) => !msg.read).length
            + trades.filter((trade) => !currentUser.isCurrentUser(trade.actor)).length
        ),
    );
    const unreadNotificationCount = derived(
        liveListProvider("notifications").store,
        (notifications) => notifications.filter((n) => !n.read).length,
    );
    const friendsOnline = otherUsers.getOnlineNumber();

    $: if (browser) document.body.style.overflow = $sidebarOverlay.comp ? "hidden" : "";
</script>

<article class:hidden={!$sidebarTab && !$sidebarOverlay.comp}>
    {#if $sidebarOverlay.comp}
        <section>
            <!-- re-create the component when the props get changed -->
            {#key $sidebarOverlay.comp}
                <svelte:component
                    this={$sidebarOverlay.comp}
                    {...$sidebarOverlay.props}
                />
            {/key}
        </section>
    {:else}
        <Clickable on:click={() => sidebarTab.set(null)}><aside/></Clickable>
    {/if}
    <main class:hidden={!$sidebarTab}>
        {#if $sidebarTab !== "conversation"}
            <nav>
                {#if !beginner}
                    <Clickable on:click={() => sidebarTab.set("milestone")}>
                        <span class:active={$sidebarTab === "milestone"}>
                            Milestones
                        </span>
                    </Clickable>
                {/if}
                {#if showFriends}
                    <Clickable on:click={() => sidebarTab.set("friends")}>
                        <span class:active={$sidebarTab === "friends"}>
                            Friends
                            <FlagCounter color="#17C48D" value={$friendsOnline} />
                        </span>
                    </Clickable>
                {/if}
                {#if canTrade}
                    <Clickable on:click={() => sidebarTab.set("messages")}>
                        <span class:active={$sidebarTab === "messages"}>
                            Trades &amp; Messages
                            <FlagCounter value={$unreadMessageAndTradeCount} />
                        </span>
                    </Clickable>
                {/if}
                <Clickable on:click={() => sidebarTab.set("notifications")}>
                    <span class:active={$sidebarTab === "notifications"}>
                        Alerts
                        <FlagCounter value={$unreadNotificationCount} />
                    </span>
                </Clickable>
                <span>
                    <Icon icon="close" on:click={() => sidebarTab.set(null)} />
                </span>
            </nav>
        {/if}

        <div>
            {#if $sidebarTab === "milestone"}
                <Milestones/>
            {:else if $sidebarTab === "friends"}
                <Friends />
            {:else if $sidebarTab === "messages"}
                <TradeMessages />
            {:else if $sidebarTab === "notifications"}
                <Notifications />
            {:else if $sidebarTab === "conversation"}
                {#key $conversationData.collocutor.id}
                    <Conversation {...$conversationData} />
                {/key}
            {/if}
        </div>
    </main>
</article>

<style>
    article {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        z-index: 1100;
        align-content: stretch;
    }
    section, aside {
        flex-grow: 1;
    }
    section {
        background: rgba(37,26,48,.9);
    }
    main {
        width: 360px;
        flex-shrink: 0;
        box-shadow: 0 0 50px #0002;
        z-index: 1;
        display: flex;
        flex-direction: column;
        background: white;
    }
    article.hidden, main.hidden {
        display: none;
    }
    nav {
        flex-shrink: 0;
        height: 50px;
        border-bottom: 1px solid #e6e6e6;
        box-sizing: border-box;
        display: flex;
        padding: 17px 10px;
        gap: 16px;
        color: #5f5668;
        font-size: 13px;
    }
    nav span {
        cursor: pointer;
    }
    nav .active {
        color: #2c2830;
        display: inline-block;
        position: relative;
    }
    nav .active::after {
        content: "";
        display: block;
        height: 2px;
        position: absolute;
        left: 0;
        right: 0;
        bottom: -18px;
        background-image: linear-gradient(90deg,#61D3A5,#64b8d7,#B078B1);
    }
    nav > :last-child {
        height: 1em;
        font-weight: 600;
        color: black;
        margin-left: auto;
        position: relative;
        top: -5px;
        cursor: pointer;
        --icon-size: 16px;
    }
    nav > :last-child:not(:hover) {
        opacity: 0.4;
    }
    main > div {
        flex-grow: 1;
        overflow: auto;
        display: flex;
        flex-direction: column;
    }
</style>
