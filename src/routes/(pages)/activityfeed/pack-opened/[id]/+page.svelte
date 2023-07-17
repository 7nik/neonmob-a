<script lang="ts">
    import MetaSeo from "$elem/MetaSeo.svelte";
    import PackBlock from "../../PackBlock.svelte";

    export let data;

    const { full_name: name, username } = data.activity.user;
</script>

<!-- url should point to one of the cards. why? -->
<!-- the image must be the promo -->
<MetaSeo title="{name} ({username}) Opened Packs on NeonMob"
    image={data.activity.packs[0].rarest_piece.large_image}
/>

<PackBlock activity={data.activity} />
