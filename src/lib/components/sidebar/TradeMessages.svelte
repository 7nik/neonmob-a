<script lang="ts">
    import { liveListProvider } from "$api";
    import Clickable from "$elem/Clickable.svelte";
    import Header from "./Header.svelte";
    import List from "./List.svelte";
    import Message from "./MessagePreview.svelte";
    import Trade from "./Trade.svelte";

    const { store: trades, loading: loadingTrades } = liveListProvider("trades");
    const messageList = liveListProvider("messages");
    const { store: messages, loading: loadingMessages } = messageList;
    $: loading = $loadingTrades || $loadingMessages;

    function markAllRead () {
        messageList.markRead();
    }
</script>

<List icon="trade" emptyMessage="No trades or messages"
    show={loading ? "loading" : ($messages.length > 0 || $trades.length > 0 ? "content" : "empty")}
>
    {#if $trades.length > 0}
        <Header>
            {$trades.length} Pending Trade{$trades.length > 1 ? "s" : ""}
        </Header>
        {#each $trades as trade (trade.id)}
            <Trade {trade} />
        {/each}
    {/if}
    {#if $messages.length > 0}
        <Header>
            Messages
            {#if $messages.some(({ read }) => !read)}
                <Clickable link on:click={markAllRead}>
                    <span>Mark all as read</span>
                </Clickable>
            {/if}
        </Header>
        {#each $messages as message (message.id)}
            <Message {message} />
        {/each}
    {/if}
</List>

<style>
    span {
        font-size: 10px;
        text-transform: uppercase;
    }
</style>
