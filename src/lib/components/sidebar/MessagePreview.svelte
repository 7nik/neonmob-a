<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import { page } from "$app/stores";
    import { liveListProvider } from "$api";
    import Avatar from "$elem/Avatar.svelte";
    import Clickable from "$elem/Clickable.svelte";
    import Time from "$elem/Time.svelte";
    import { viewConversation } from "$lib/overlays";
    import { firstName } from "$lib/services/user";

    /**
     * The message data
     */
    export let message: NM.MessageNotification;

    const { isCurrentUser } = $page.data.currentUser;
    const recipient = message.object.users.find((user) => !$isCurrentUser(user))!;

    function openChat () {
        if (!message.read) {
            liveListProvider("messages").markRead(message.id);
        }
        viewConversation(message.object);
    }
</script>

<Clickable on:click={openChat}>
    <article class:unread={!message.read}>
        <Avatar user={recipient} />
        <section>
            <span>
                {firstName(recipient)}
                <Time stamp={message.actor.time} />
            </span>
            <div>
                {#if $isCurrentUser(message.object.users[0])}
                    <span>You:</span>
                {/if}
                {message.actor.action_data}
            </div>
        </section>
    </article>
</Clickable>

<style>
    article {
        height: 54px;
        padding: 0 10px;
        gap: 10px;
        display: flex;
        align-items: center;
        cursor: pointer;
    }
    article.unread {
        background: rgba(75,187,245,.2);
    }
    article:hover {
        background: #f4f4f4;
    }
    section {
        flex-grow: 1;
        align-self: stretch;
        display: flex;
        flex-direction: column;
        justify-content: center;
        box-shadow: 0 1px #efefef;
    }
    article:hover section {
        box-shadow: none;
    }
    span {
        font-size: 14px;
        color: #2c2830;
    }
    div {
        font-size: 14px;
        color: #5f5668;
    }
    div span {
        color: #857a90;
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
    }
</style>
