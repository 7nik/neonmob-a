<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import { readable } from "svelte/store";
    import { page } from "$app/stores";
    import { getUserStatus } from "$api";
    import Avatar from "$elem/Avatar.svelte";
    import Button from "$elem/Button.svelte";
    import Clickable from "$elem/Clickable.svelte";
    import Icon from "$elem/Icon.svelte";
    import { viewConversation } from "$lib/overlays";

    /**
     * The person's data
     */
    export let friend: NM.UserFriend;
    /**
     * Whether to show the on/offline status
     */
    export let showStatus = false;

    const { currentUser, otherUsers } = $page.data;

    $: isOnline = showStatus ? getUserStatus(friend.id) : readable(false);
    const isFriend = otherUsers.isFriend(friend.id);

    const { isVerified } = currentUser;
    const canFriend = true; // currentUser.canDo("friends");
</script>

<svelte:options immutable />

<article class:offline={!$isOnline && showStatus} class:online={$isOnline}>
    <Clickable on:click={() => viewConversation(friend.id)}>
        <aside>
            <Avatar user={friend} />
        </aside>
        <section>
            <div>
                {#if friend.pro_status}
                    <Icon icon="pro" />
                {/if}
                {friend.name}
            </div>
            <i>
                @{friend.username}
            </i>
        </section>
        {#if showStatus && $isFriend}
            <b></b>
        {:else if $isVerified && canFriend && !$isFriend}
            <Button icon="add" size="mini"
                hint="Add to Friends List"
                on:click={() => otherUsers.startFriendship(friend.id)}
            />
        {/if}
    </Clickable>
</article>

<style>
    article {
        padding: 0 10px;
        gap: 0 10px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        cursor: pointer;
    }
    article:hover {
        background: #f4f4f4;
    }
    article::before {
        content: "";
        display: block;
        height: 1px;
        width: 100%;
        background: #efefef;
        margin: 0 -10px 0 50px;
        position: relative;
        top: -1px;
    }
    article:hover::before {
        background: transparent;
    }
    aside {
        width: 40px;
        padding: 7px 0;
    }
    .offline aside {
        filter: grayscale(1) opacity(.5);
    }
    section {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    div {
        color: #2c2830;
        font-size: 15px;
        font-weight: 400;
        --icon-size: 10px;
    }
    .offline div {
        opacity: .5;
    }
    i {
        font-size: 13px;
        color: #857a90;
    }
    b {
        background: #c6c6c6;
        width: 8px;
        height: 8px;
        border-radius: 4px;
    }
    .online b {
        background: #17C48D;
    }
</style>
