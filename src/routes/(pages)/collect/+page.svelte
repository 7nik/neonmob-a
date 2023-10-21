<script lang="ts">
    import type { PojoPaginator } from "$api";
    import type NM from "$lib/utils/NM Types";

    import { findSetts } from "$api";
    import HorizontalList from "$elem/HorizontalList.svelte";
    import Icon from "$elem/Icon.svelte";
    import SettTile from "$elem/SettTile.svelte";
    import cache from "$lib/actions/cache";
    import { infiniteScroll } from "$lib/utils/utils";
    import Carousel from "./Carousel.svelte";
    import Seo from "./Seo.svelte";

    export let data;

    $: ({ categories, p } = data);
    let settPages: PojoPaginator<NM.Sett>[] = [];
    let loading = true;

    $: initSetts(p.settPages);

    async function initSetts (setts: Promise<PojoPaginator<NM.Sett>[]>) {
        loading = true;
        settPages = await setts;
        loading = false;
    }

    infiniteScroll(async () => {
        if (loading || categories.length <= settPages.length) return;
        loading = true;
        const category = categories[settPages.length];
        const nextSettPage = await findSetts(category.name_slug, "", false, {}).toPOJO();
        settPages = [...settPages, nextSettPage];
        loading = false;
    });
</script>

<Seo/>

{#if settPages[0]?.items.length > 0}
    <Carousel setts={settPages[0].items} title={categories[0].name} />
{/if}

<article>
    <!-- TODO: Milestone suggestions section -->
    {#each settPages.slice(1) as settPage, i}
        {@const category = categories[i + 1]}
        {@const data = { categories, categorySetts: { ...settPage, id: category.id } }}
        {#if settPage.items.length > 0}
            <section class="category-setts">
                <h2>
                    <a href={category.collect_url} use:cache={data}>
                        {category.name}
                    </a>
                </h2>
                <HorizontalList>
                    {#each settPage.items as sett}
                        <SettTile {sett} />
                    {/each}
                    {#if settPage.next}
                        <a class="more" href={category.collect_url} use:cache={data}>
                            See More &gt;
                        </a>
                    {/if}
                </HorizontalList>
            </section>
        {/if}
    {/each}
    {#if loading}
        <div class="loading"><Icon icon="loader"/></div>
    {/if}
</article>

<style>
    article {
        margin: 0 auto;
        width: min(1300px, 100%);
    }
    .category-setts {
        border-top: 1px solid #ddd;
        padding: 0 0 10px;
    }
    .category-setts h2 {
        margin: 20px 0;
        padding: 0 20px;
    }
    .category-setts h2 a {
        color: inherit;
    }
    .category-setts a.more {
        width: min(300px, calc(100vw - 20px));
        aspect-ratio: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #d6d6d6;
        border-radius: 4px;
        margin: 51px 10px;
        vertical-align: bottom;
        font-size: 15px;
    }

    .loading {
        width: 100%;
        padding: 20px;
        text-align: center;
        --icon-size: 40px;
    }
    .loading:only-child {
        padding: 60px;
    }

    @media screen and (max-width: 480px) {
        .category-setts h2 {
            padding: 0 10px;
        }
    }
</style>
