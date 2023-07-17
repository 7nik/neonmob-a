<script lang="ts">
    import MetaSeo from "$elem/MetaSeo.svelte";
    import Collection from "./Collection.svelte";
    import SettDetails from "./SettDetails.svelte";

    export let data;

    $: ({ sett, p } = data);
</script>

<!-- eslint-disable-next-line max-len -->
<MetaSeo title="{sett.name}, a Series created by {sett.creator.name} ({sett.creator.username}) on Neonmob"
    description={sett.description}
    image={sett.sett_assets.large}
/>

<!-- defining the current tab is done in +page.ts -->
{#if p.showPreview}
    <Collection {sett} isPublic collection={p.cards} />
{:else}
    {#key sett.id}
        <SettDetails {sett} {...p} />
    {/key}
{/if}
