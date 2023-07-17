<script lang="ts">
    import { page } from "$app/stores";
    import MetaSeo from "$elem/MetaSeo.svelte";
    import Tabs from "$elem/Tabs.svelte";
    import GeneralMilestones from "./GeneralMilestones.svelte";
    import Overview from "./Overview.svelte";
    import SeriesMilestones from "./SeriesMilestones.svelte";

    export let data;

    const tabs = [{
        // eslint-disable-next-line sonarjs/no-duplicate-string
        path: "milestones/",
        tab: "overview",
        name: "Overview",
    }, {
        path: "milestones/",
        tab: "core",
        name: "Core",
        postfix: "Milestones",
    }, {
        path: "milestones/",
        tab: "series",
        name: "Series",
        postfix: "Milestones",
    }, {
        path: "milestones/",
        tab: "special",
        name: "Special",
        postfix: "Milestones",
    }] as const;

    if ($page.url.searchParams.has("settId")) {
        $page.url.searchParams.set("tab", "series");
    }

    let currentTab: typeof tabs[number]["name"];
</script>

<!-- eslint-disable-next-line max-len -->
<MetaSeo title="{data.user.first_name} {data.user.last_name} ({data.user.username})'s General Milestones on NeonMob" />
<Tabs basePath="/{data.user.username}/" {tabs} bind:currentTab />
<article>
    <h2>Milestones</h2>
    {#if currentTab === "Core" || currentTab === "Special"}
        <GeneralMilestones userId={data.user.id} specials={currentTab === "Special"} />
    {:else if currentTab === "Series"}
        <SeriesMilestones userId={data.user.id} />
    {:else}
        <Overview
            user={data.user}
            level={data.user.level}
            currentPoints={data.user.points}
            stats={data.p.stats}
        />
    {/if}
</article>

<style>
    article {
        padding: 20px 0;
        margin: 0 auto;
        width: min(960px, 100%);
        color: #2c2830;
    }
    @media screen and (max-width: 960px) {
        h2 {
            padding-left: 20px;
        }
    }
    @media screen and (max-width: 767px) {
        h2 {
            padding-left: 0;
            text-align: center;
        }
    }
</style>
