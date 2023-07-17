<!-- @component
    Add <meta> element to the head for SEO
 -->
<script lang="ts">
    import { page } from "$app/stores";
    import { fullUrl } from "$lib/utils/utils";

    export let title: string;
    /**
     * default is "Trade, collect and create digital art"...
     */
    // eslint-disable-next-line max-len
    export let description = "Trade, collect and create digital art trading cards on NeonMob, a community, game and marketplace. Find rare cards, show off your collection, trade, earn badges and more.";
    /**
     * meta og:url, def. - current
     */
    export let url = "";
    /**
     * meta og:type, def. - article
     */
    export let pageType = "article";
    /**
     * default - /img/share_square_logo.png
     */
    export let image = { url: fullUrl("/img/share_square_logo.png"), width: 1200, height: 630 };
    $: url ||= $page.url.href;
    $: imageUrl = fullUrl(image.url);
    $: pageUrl = fullUrl(url);
</script>

<svelte:head>
    <title>{title}</title>
    <meta content="{description}" name="description">
    <meta content="NeonMob" name="author">
    <meta content="NeonMob" property="og:site_name">
    <meta content="{pageType}" property="og:type">
    <meta content="{imageUrl}" property="og:image">
    {#if image.width && image.height}
        <meta content="{String(image.width)}" property="og:image:width">
        <meta content="{String(image.height)}" property="og:image:height">
    {/if}
    <meta content="{title}" property="og:title">
    <meta content="{description}" property="og:description">
    <meta content="{pageUrl}" property="og:url">
    <meta content="https://www.facebook.com/neonmob" property="og:author">
    <meta content="https://www.facebook.com/neonmob" property="og:publisher">
    <meta content="summary_large_image" name="twitter:card">
    <meta content="@neonmob" name="twitter:site">
    <meta content="@neonmob" name="twitter:creator">
    <meta content="{imageUrl}" name="twitter:image:src">
    {#if image.width && image.height}
        <meta content="{String(image.width)}" name="twitter:image:width">
        <meta content="{String(image.height)}" name="twitter:image:height">
    {/if}
    <meta content="{title}" name="twitter:title">
    <meta content="{description}" name="twitter:description">
    <meta content="{pageUrl}" name="twitter:url">
</svelte:head>
