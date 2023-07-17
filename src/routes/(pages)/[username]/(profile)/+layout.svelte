<script lang="ts">
    import MetaSeo from "$elem/MetaSeo.svelte";
    import Tabs from "$elem/Tabs.svelte";

    export let data;

    const tabs = [{
        path: "collection/",
        name: "Series",
    }, {
        path: "cards/",
        name: "Cards",
    }, {
        path: "activity/",
        name: "Activity",
    }];

</script>

<MetaSeo url="/{data.user.username}/collection/"
    title="{data.user.username}'s Digital Art Collection: Collect, Trade & Show Off Art on NeonMob"
/>
<Tabs basePath="/{data.user.username}/" {tabs} />
<slot/>
