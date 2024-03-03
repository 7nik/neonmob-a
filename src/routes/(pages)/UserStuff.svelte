<!-- @component
    The sidebar tab icons and user currencies
 -->
<script lang="ts">
    import { derived } from "svelte/store";
    import { page } from "$app/stores";
    import { liveListProvider } from "$api";
    import Clickable from "$elem/Clickable.svelte";
    import FlagCounter from "$elem/FlagCounter.svelte";
    import Icon from "$elem/Icon.svelte";
    import Sidebar from "$elem/Sidebar.svelte";
    import tip from "$lib/actions/tip";
    import { fail, viewCaratBalance } from "$lib/dialogs";
    import { sidebarTab } from "$lib/overlays";
    import { plural } from "$lib/utils/format";

    const {
        carats,
        credits,
        freebies,
        timeToNextFreebie,
        isAuthenticated,
        isCurrentUser,
    } = $page.data.currentUser;

    const friendCount = $page.data.otherUsers.getOnlineNumber();
    const messageCount = derived(
        liveListProvider("messages").store,
        (list) => list.filter((msg) => !msg.read).length,
    );
    const tradeCount = derived(
        liveListProvider("trades").store,
        (list) => list.filter((trade) => !isCurrentUser(trade.actor)).length,
    );
    const notificationCount = derived(
        liveListProvider("notifications").store,
        (notifications) => notifications.filter((n) => !n.read).length,
    );

    function buyCredits () {
        // TODO implement?
        fail();
    }
</script>

{#if $isAuthenticated}
    <Sidebar/>
{/if}
<input type="checkbox" id="fold-user-stuff" checked hidden />
<div class="sidebar-head">
    <Clickable on:click={() => sidebarTab.set("milestone")}>
        <span>
            <Icon icon="badge" hint="Milestones"/>
        </span>
    </Clickable>
    <Clickable on:click={() => sidebarTab.set("friends")}>
        <span>
            <Icon icon="owners"
                hint="You have {$friendCount} {plural($friendCount, "friends")} online"
            />
            <FlagCounter value={$friendCount} color="#17C48D" />
        </span>
    </Clickable>
    <Clickable on:click={() => sidebarTab.set("messages")}>
        <span>
            <Icon icon="trade"
                hint="You have {$tradeCount} {plural($tradeCount, "trade")} and
                    {$messageCount} unread {plural($messageCount, "message")}."
            />
            <FlagCounter value={$tradeCount + $messageCount} />
        </span>
    </Clickable>
    <Clickable on:click={() => sidebarTab.set("notifications")}>
        <span>
            <Icon icon="notifications"
                hint="You have {$notificationCount} {plural($notificationCount, "alert")}"
            />
            <FlagCounter value={$notificationCount} />
        </span>
    </Clickable>
</div>
<div class="user-stuff">
    <section class="freebie">
        {#if $timeToNextFreebie}
            <div use:tip={"Until next free pack"}>{$timeToNextFreebie}</div>
        {:else}
            <div use:tip={"Free pack limit is reached!"}>full</div>
        {/if}
        <span>
            {$freebies ? `${$freebies} free ${plural($freebies, "pack")}` : "No packs left"}
        </span>
    </section>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <section class="carats" use:tip={
            "Your total carats! Click to find out how to earn carats and how they are used."
        } on:click={viewCaratBalance}
    >
        <div>{$carats < 1000 ? $carats : `${Math.round($carats / 1000)}K`}</div>
        <span>carats</span>
    </section>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <section class="credits" on:click={buyCredits}>
        <div class="hover">buy</div>
        <div>{$credits < 1000 ? $credits : `${Math.round($credits / 1000)}K`}</div>
        <span>credits</span>
    </section>
    <label for="fold-user-stuff" class="btn-unfold">
        <Icon icon="reward-star"/>
    </label>
    <label for="fold-user-stuff" class="btn-fold">
        <Icon icon="close"/>
    </label>
</div>

<style>
    .sidebar-head {
        display: flex;
        align-items: stretch;
    }
    .sidebar-head span {
        padding: 16px 10px;
        vertical-align: middle;
        position: relative;
        color: #FFF8;
        cursor: pointer;
        --icon-size: 18px;
    }
    .sidebar-head span:hover {
        color: #FFF;
    }

    .user-stuff {
        align-self: center;
        display: flex;
        margin-left: 10px;
        padding: 4px 7px;
        vertical-align: middle;
        box-shadow: inset 0 0 0 1px rgb(255 255 255 / 40%);
        border-radius: 4px;
        color: #f6f4f5;
        cursor: pointer;
        font-size: 12px;
        text-align: center;
        white-space: nowrap;
    }
    label {
        cursor: pointer;
    }
    section {
        line-height: .9;
    }
    .freebie {
        margin-right: 6px;
        width: 70px;
    }
    .carats {
        padding: 0 7px;
        border-left: 1px solid #45363d;
        border-right: 1px solid #45363d;
    }
    .credits {
        padding-left: 6px;
    }
    section div {
        color: white;
        letter-spacing: .1em;
        text-transform: uppercase;
        font-weight: 500;
    }
    section:not(:hover) div.hover, section:hover div.hover + div {
        display: none;
    }
    .user-stuff span {
        color: white;
        opacity: .5;
        letter-spacing: 0;
        text-transform: lowercase;
        font-weight: 400;
    }
    .btn-unfold {
        --icon-size: 22px;
    }
    .btn-fold {
        border-left: 1px solid #45363d;
        padding: 4px 4px 4px 9px;
        margin-left: 3px;
        --icon-size: 13px;
    }
    @media screen and (min-width: 531px) {
        label {
            display: none;
        }
    }
    @media screen and (max-width: 530px) {
        .sidebar-head span {
            padding: 16px 5px;
        }
        #fold-user-stuff:not(:checked) + .sidebar-head,
        #fold-user-stuff:not(:checked) ~ .user-stuff .btn-unfold {
            display: none;
        }
        #fold-user-stuff:checked ~ .user-stuff section,
        #fold-user-stuff:checked ~ .user-stuff .btn-fold {
            display: none;
        }
    }
</style>
