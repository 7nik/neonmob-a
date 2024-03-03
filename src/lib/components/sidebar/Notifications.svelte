<script lang="ts">
    import { liveListProvider } from "$api";
    import Clickable from "$elem/Clickable.svelte";
    import AlertNotification from "./AlertNotification.svelte";
    import Header from "./Header.svelte";
    import List from "./List.svelte";

    const notificationList = liveListProvider("notifications");
    const {
        store: notifications,
        loading,
    } = notificationList;

    function markAllRead () {
        notificationList.markRead();
    }
</script>

<List icon="notifications" emptyMessage="No notifications"
    show={$loading ? "loading" : ($notifications.length > 0 ? "content" : "empty")}
>
    {#if $notifications.some(({ read }) => !read)}
        <Header>
            <Clickable link on:click={markAllRead}>
                <span>Mark all as read</span>
            </Clickable>
        </Header>
    {/if}
    {#each $notifications as notification (notification.id)}
        <AlertNotification {notification} />
    {/each}
</List>

<style>
    span {
        font-size: 10px;
        text-transform: uppercase;
    }
</style>
