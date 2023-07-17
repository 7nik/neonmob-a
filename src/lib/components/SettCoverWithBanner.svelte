<!-- @component
    The series cover with banner of series type
 -->
<script lang="ts">
    import type { BannerColor } from "$elem/Banner.svelte";
    import type NM from "$lib/utils/NM Types";

    import Banner from "$elem/Banner.svelte";
    import SettInfo from "$lib/utils/SettInfo";

    export let sett: NM.Sett;

    $: series = new SettInfo(sett);

    // https://docs.google.com/spreadsheets/d/1jgX9kVPBdNEfAUFDxwPD6Ya67NfQ4xSG76w1IhwbP9M/edit
    const AI_IDENTIFIED_URLS = new Set([
        "/series/humanai-collection/",
        "/series/other-people/",
        "/series/what-if/",
        "/series/spooky-dudes/",
        "/series/girls-from-neo-tokyo/",
        "/series/through-a-frame/",
        "/series/royal-buildings-of-nedrios/",
        "/series/impossible-cities-garden/",
        "/series/kitty-cats/",
        "/series/elemental-monarchs-queens/",
        "/series/earth-36/",
        "/series/winter-cats/",
        "/series/this-letter-is-for-you/",
        "/series/seasonal-sweets-winterfest/",
        "/series/oh-christmas-tree/",
        "/series/the-passage/",
        "/series/the-gentledogs/",
        "/series/paradise-gardens/",
        "/series/koilorful/",
        "/series/cosmic-fantasy/",
        "/series/seasonal-sweets-new-years/",
        "/series/graffiti-pets/",
        "/series/unnatural-beauty/",
        "/series/the-way-shire/",
        "/series/owls-warriors-and-wizards/",
        "/series/uniform-lovers/",
        "/series/cowboy-compadres/",
        "/series/soul-saplings/",
        "/series/fantastic-scenes/",
        "/series/plant-people/",
        "/series/skulls-unlimited/",
        "/series/anime-style/",
        "/series/fuzzlets/",
        "/series/galaxy-fauna/",
        "/series/corrupted-waifus/",
        "/series/earths-faces/",
        "/series/fae-of-the-laurels/",
        "/series/fae-of-the-laurels-2/",
        "/series/space-mining/",
        "/series/birds-of-paradise/",
        "/series/santas-pets/",
        "/series/brigids-ther-tarot/",
        "/series/spiritus-mundi/",
        "/series/the-divine/",
        "/series/these-places-dont-exist/",
        "/series/these-caves-dont-exist/",
        "/series/future-relics/",
        "/series/cyberpunk-portraits/",
        "/series/christmas-collectibles/",
        "/series/nightmares/",
        "/series/japanese-abstract/",
        "/series/lapis-lazuli-oceanic-beauty/",
        "/series/mountains-rivers/",
        "/series/arcane-design-5e/",
        "/series/surreal-neural-arcana/",
        // staging
        "/series/ai-yes-limited/",
        "/series/ai-yes-unlimited/",
        // ???
        "/series/oz-placeholder/",
    ]);

    let bannerText: string;
    let bannerColor: BannerColor;
    $: if (AI_IDENTIFIED_URLS.has(sett.permalink)) {
        bannerText = "AI";
        bannerColor = "red";
    } else if (series.isLimited) {
        bannerText = "Limited";
        bannerColor = "violet";
    } else if (series.isEditing) {
        bannerText = "In Progress";
        bannerColor = "yellow";
    } else if (series.isSubmitted) {
        bannerText = "Submitted";
        bannerColor = "yellow";
    // not implemented or unused sett types
    // } else if (s.isPromoOnly) {
    //     bannerText = "Promo Only";
    //     bannerColor = "blue";
    // // } else if (s.isReward) {
    // //     bannerText = "Reward";
    // //     bannerColor = "green";
    } else if (series.isAmateur) {
        bannerText = "Amateur";
        bannerColor = "purple";
    } else if (series.isReplica) {
        bannerText = "Replica";
        bannerColor = "purple-dark";
    // Sold out banners aren't rendered
    // } else if (series.isSoldOut) {
    //     bannerText = "Sold-Out";
    //     bannerColor = "red";
    } else {
        bannerText = "";
    }
</script>

<svelte:options immutable />

<div>
    <img src={sett.sett_assets.large.url} alt="{sett.name}'s cover" />
    <Banner {bannerColor} {bannerText} />
</div>

<style>
    div {
        height: 100%;
        border-radius: 4px;
        overflow: hidden;
        position: relative;
    }
    img {
        display: block;
        width: 100%;
        aspect-ratio: 1;
    }
</style>
