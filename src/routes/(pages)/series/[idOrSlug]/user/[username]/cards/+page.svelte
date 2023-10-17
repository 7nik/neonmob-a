<script lang="ts">
    import MetaSeo from "$elem/MetaSeo.svelte";
    import Collection from "../../../Collection.svelte";

    export let data;

    $: ({ sett, p } = data);
</script>

<!-- eslint-disable-next-line max-len -->
<MetaSeo title="{sett.name}, a Series created by {sett.creator.name} ({sett.creator.username}) on Neonmob"
    description={sett.description}
    image={sett.sett_assets.large}
    url={sett.permalink}
/>

<Collection {sett} collection={p.cards ?? Promise.resolve([])} />
