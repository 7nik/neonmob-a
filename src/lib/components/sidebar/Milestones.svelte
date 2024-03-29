<script lang="ts">
    import { page } from "$app/stores";
    import { liveListProvider } from "$api";
    import Header from "./Header.svelte";
    import List from "./List.svelte";
    import Milestone from "./Milestone.svelte";

    const {
        store: recentMilestones,
        loading: recentLoading,
    } = liveListProvider("recent");
    const {
        store: suggestedMilestones,
        loading: suggestedLoading,
    } = liveListProvider("suggestion");
    const completed = liveListProvider("completed");
    const {
        store: completedMilestones,
        loading: completedLoading,
    } = completed;
    // the milestones do not receive updates, so do this to
    // get the actual completed milestones at the next time
    completed.on("init", () => {
        completed.stopListening();
    });

    $: loading = $recentLoading || $suggestedLoading || $completedLoading;
    $: empty = $recentMilestones.length === 0
        && $suggestedMilestones.length === 0
        && $completedMilestones.length === 0;
</script>

<List icon="badge" emptyMessage="No Milestones"
    show={loading ? "loading" : (empty ? "empty" : "content")}
>
    {#if $recentMilestones.length > 0}
        <Header>
            recent progress
            <a target="_self" href="/{$page.data.currentUser.user.username}/milestones/">
                see all milestones
            </a>
        </Header>
        {#each $recentMilestones as milestone (milestone)}
            <Milestone {milestone} />
        {/each}
    {/if}
    {#if $suggestedMilestones.length > 0}
        <Header>milestone suggestion</Header>
        {#each $suggestedMilestones as milestone (milestone)}
            <Milestone {milestone} />
        {/each}
    {/if}
    {#if $completedMilestones.length > 0}
        <Header>recently completed</Header>
        <section>
            {#each $completedMilestones as milestone (milestone)}
                <Milestone {milestone} />
            {/each}
        </section>
    {/if}
</List>

<style>
    a:link, a:visited {
        color: #0d9ce6;
        text-decoration: none;
    }
    a:hover {
        color: #085b85;
    }
    section {
        filter: grayscale(1);
    }
</style>
