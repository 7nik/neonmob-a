<script lang="ts">
    import MetaSeo from "$elem/MetaSeo.svelte";
    import PrintDetails from "$elem/PrintDetails.svelte";

    export let data;

    const { print, owner } = data;
</script>

<!-- FIXME title also should include creator username -->
<MetaSeo title={`${print.name} from the ${print.set.name} by ${print.set.creator.name} on NeonMob`}
    description={print.description}
    image={print.piece_assets.image["large-promo"] ?? print.piece_assets.image.large}
/>

<section>
    <PrintDetails card={print} {owner} />
</section>

<style>
    section {
        flex-grow: 1;
        padding: 40px 0;
        background: #1a1417;
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
