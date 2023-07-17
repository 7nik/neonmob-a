<!-- @component
    Section with general milestones
 -->
<script lang="ts">
    import type NM from "$lib/utils/NM Types";
    import type { ID } from "$lib/utils/NM Types";
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { getUserMilestones } from "$api";
    import Icon from "$elem/Icon.svelte";

    export let userId: ID<"user">;
    /**
     * Load core milestones or specials
     */
    export let specials: boolean;

    const BADGE_GROUPS = {
        trade_actions: "TRADING",
        discarding: "DISCARDING",
        freebie_opening_streak: "STREAKS",
        collection_size: "COLLECTION",
        rarity_count: "RARITY",
        series_completion: "SERIES COMPLETION",
        series_completion_time: "COMPLETION TIME",
        series_completion_order: "COMPLETION ORDER",
        difficulty_completion: "DIFFICULTY COMPLETION",
        special: "",
    } as Record<string, string>;
    const NO_BADGE_IMG = {
        trade_actions: "empty-trading.svg",
        discarding: "empty-discarding.svg",
        freebie_opening_streak: "empty-streaks.svg",
        collection_size: "empty-collection.svg",
        rarity_count: "empty-rarity.svg",
        series_completion: "empty-series-completion.svg",
        series_completion_time: "empty-series-time.svg",
        series_completion_order: "empty-series-completion-order.svg",
        difficulty_completion: "empty-difficulty-completion.svg",
        special: "phantom.svg",
    } as Record<string, string>;

    let milestones: Record<string, NM.BadgeEarned[]> | null;
    function groupMilestones (badges: NM.BadgeEarned[]) {
        milestones = {};
        for (const badge of badges) {
            const group = badge.type in BADGE_GROUPS ? badge.type : "special";
            if (!milestones[group]) milestones[group] = [];
            milestones[group].push(badge);
        }
    }

    function scrollToMilestone () {
        if (!$page.url.hash) return;
        const elem = document.getElementById($page.url.hash.slice(1));
        if (!elem) return;
        elem.scrollIntoView();
        // the header height
        window.scrollBy({ top: -50 });
    }

    let ready = false;
    $: if (ready) {
        milestones = null;
        getUserMilestones(userId, specials)
            .then(groupMilestones)
            .then(scrollToMilestone);
    }

    onMount(() => {
        ready = true;
    });
</script>

<section class="milestones">
    {#if milestones}
        {#each Object.keys(BADGE_GROUPS) as group}
            {#if milestones[group] && BADGE_GROUPS[group]}
                <h3><span>{BADGE_GROUPS[group]}</span></h3>
            {/if}
            {#each (milestones[group] ?? []) as badge}
                <span class="badge" id="badge-{badge.badge}">
                    <h4>{badge.name}</h4>
                    {#if badge.image_url}
                        <img src={badge.image_url} alt="earned badge">
                    {:else}
                        <img src="/img/badges/{NO_BADGE_IMG[group]}" alt="empty badge">
                    {/if}
                    <p>{badge.description}</p>
                </span>
            {/each}
        {/each}
    {:else}
        <div class="loading"><Icon icon="loader"/></div>
    {/if}
</section>

<style>
    .milestones {
        background: white;
        border-radius: 4px;
        text-align: center;
    }
    .milestones h3 {
        padding: 30px 0 10px;
    }
    .milestones h3 span {
        background: #EDEDED;
        border-radius: 20px;
        color: #2C2830;
        font-size: 14px;
        font-weight: 500;
        padding: 6px 16px;
    }
    .milestones .badge {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        width: 220px;
        padding: 20px 10px;
    }
    .milestones .badge h4 {
        color: #2c2830;
        font-size: 15px;
        line-height: 140%;
        font-weight: 400;
        margin: 10px 0 0;
    }
    .milestones .badge img {
        width: 160px;
        height: 160px;
    }
    .milestones .badge p {
        line-height: 1.2;
        font-size: 13px;
        margin: 10px 0 0;
        font-style: italic;
        font-weight: 400;
        color: #5f5668;
    }
    .loading {
        width: 100%;
        padding: 60px;
        text-align: center;
        --icon-size: 40px;
    }
</style>
