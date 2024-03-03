<script lang="ts">
    import { ArrayPaginator, PagePaginator } from "$api";
    import Activities from "$elem/Activities.svelte";
    import Avatar from "$elem/Avatar.svelte";
    import Button from "$elem/Button.svelte";
    import HorizontalList from "$elem/HorizontalList.svelte";
    import Icon from "$elem/Icon.svelte";
    import MetaSeo from "$elem/MetaSeo.svelte";
    import SectionHeader from "$elem/SectionHeader.svelte";
    import ShortenText from "$elem/ShortenText.svelte";
    import Submission from "$elem/Submission.svelte";
    import { showShare, fail } from "$lib/dialogs";
    import SettPreview from "./SettPreview.svelte";

    export let data;

    $: ({
        creator, user, isFriend, isBlocked, p,
    } = data);
    // eslint-disable-next-line unicorn/consistent-destructuring
    $: setts = PagePaginator.fromPOJO(p.setts);
    $: loadingSetts = setts.isLoadingStore;
    $: submissions = PagePaginator.fromPOJO(p.submissions);
    $: loadingSubmissions = submissions.isLoadingStore;

    // eslint-disable-next-line max-len
    const socialNames = ["behance_url", "deviant_art_url", "dribbble_url", "etsy_url", "facebook_url", "instagram_url", "tumblr_url", "twitter_url"] as const;
    // eslint-disable-next-line max-len
    const socialIcons = ["behance", "deviantArt", "dribbble", "etsy", "facebook", "instagram", "tumblr", "twitter"] as const;

    function share (ev: Event) {
        showShare(ev, {
            url: window.location.href,
            message: `Check out ${user.name}'s artwork on @NeonMob!`,
            shareSource: "cprofile",
        });
    }
</script>

<!-- eslint-disable-next-line max-len -->
<MetaSeo title={`Collect Original Digital Art Trading Card Series Created by ${user.name} ${user.username}) on NeonMob`}
    image={{ width: 200, height: 200, url: user.avatar.large }}
    pageType="profile"
/>
<svelte:head>
    <meta content="{user.first_name}" property="profile:first_name">
    <meta content="{user.name.slice(user.first_name.length).trim()}" property="profile:last_name">
    <meta content="{user.username}" property="profile:username">
</svelte:head>

<header class:empty={!creator.banner_url}>
    {#if creator.banner_url}
        <img src="{creator.banner_url}" alt="Creator's banner" />
    {/if}
</header>
<article class="profile">
    <aside>
        <Avatar {user} size="fill" />
    </aside>
    <section class="name">
        <h1>
            {#if user.pro_badge}
                <Icon icon="pro" upper />
            {/if}
            {user.name}
        </h1>
        <nav>
            <!-- TODO: add user caching -->
            <a href="/{user.username}/collection/">Collector Profile</a>
            <span class="pipe"></span>
            <Button type="subdued-light" size="mini" on:click={share}>Share</Button>
        </nav>
    </section>
    <section class="actions">
        <span class="buttons">
            <Button icon="chat"
                type={isBlocked ? "disabled-dark" : "subdued-dark"}
                on:click={fail}
            >
                &nbsp; Message
            </Button>
            <Button icon={isFriend ? "minus" : "add"}
                type={isBlocked ? "disabled-dark" : "subdued-dark"}
                on:click={fail}
            >
                &nbsp; Friends list
            </Button>
        </span>
        <span class="links">
            {#each socialNames as name, i}
                {#if creator[name]}
                <a href={creator[name]} target="_blank" rel="noreferrer">
                    <Icon icon={socialIcons[i]} />
                </a>
                {/if}
            {/each}
        </span>
    </section>
    <section class="bio">
        <ShortenText
            content={creator.creator_bio || "I am a creator on NeonMob."}
            type="linky"
            wordLimit={100}
            wordTolerance={10}
        />
    </section>
</article>
<article class="setts">
    <SectionHeader title="{user.first_name}'s Series"/>
    {#each $setts as sett}
        <SettPreview {sett} />
    {/each}
    {#if $setts.length < setts.total}
        {#if $loadingSetts}
            <div class="loading"><Icon icon="loader" /></div>
        {:else}
            <Button size="max" on:click={() => setts.loadMore()}>load more</Button>
        {/if}
    {/if}
</article>
{#if $submissions.length > 0 || $loadingSubmissions}
    <article class="submissions">
        <SectionHeader title="{user.first_name}'s Submissions"
            showLoader={$loadingSubmissions}
        />
        {#if $submissions.length > 0}
            <HorizontalList>
                {#each $submissions as submission}
                    <Submission {submission} />
                {/each}
            </HorizontalList>
        {/if}
    </article>
{/if}

<article class="activity">
    <SectionHeader title="People Collecting {user.first_name}'s Work" />
    <Activities paginator={ArrayPaginator.fromPOJO(p.activities)} />
</article>

<style>
    header {
        aspect-ratio: 4;
        overflow: hidden;
        position: relative;
        z-index: -1;
    }
    header:after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        top: 40%;
        background: linear-gradient(0, rgba(0,0,0,.5), transparent);
        background-size: contain;
    }
    header.empty {
        aspect-ratio: auto;
        background: #1a1417;
        height: 140px;
    }
    img {
        width: 100%;
    }
    article {
        width: 940px;
        margin: 0 auto;
        padding-bottom: 20px;
    }
    .profile {
        margin-top: -100px;
        display: grid;
        grid-template-areas: "a t" "a m" "a b";
        grid-template-columns: auto 1fr;
        gap: 20px 10px;
    }
    .profile aside {
        grid-area: a;
        width: 200px;
        aspect-ratio: 1;
        border-radius: 100%;
        border: 5px solid #efefef;
        overflow: hidden;
        background: #efefef;
    }
    .name {
        grid-area: t;
        height: 100px;
        padding-bottom: 10px;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
    }
    .name h1 {
        color: #fff;
        font-size: 36px;
        line-height: 1;
        margin: 0;
        --icon-size: 26px;
    }
    .name nav {
        display: flex;
        align-items: center;
        font-size: 15px;
    }
    .name a:link, .name a:visited {
        font-size: 13px;
        color: rgba(255,255,255,.7);
    }
    .name a:link:hover, .name a:visited:hover {
        color: white;
    }
    .actions {
        grid-area: m;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
    }
    .actions .buttons {
        display: flex;
        gap: 8px;
    }
    .actions .links {
        display: flex;
        gap: 14px;
        margin-bottom: 4px;
        --icon-size: 18px;
    }
    .actions .links a:not(:hover) {
        --icon-color: #a8a8a8 !important;
    }
    .bio {
        font-size: 18px;
        line-height: 140%;
        font-weight: 400;
        white-space: pre-line;
    }

    .loading {
        width: 100%;
        padding: 20px;
        text-align: center;
        --icon-size: 40px;
    }

    /* horizontal list */
    .submissions > :global(:last-child) {
        width: auto;
        padding: 0;
        margin: 0;
        text-align: center;
    }
    .submissions > :global(:last-child > :first-child) {
        overflow: hidden;
    }
    .submissions > :global(:last-child > :first-child > :first-child) {
        margin-left: 0;
    }
    .submissions > :global(:last-child > :first-child > :last-child) {
        margin-right: 0;
    }

    @media screen and (max-width: 960px) {
        article {
            margin: 0 10px;
            width: auto;
        }
        .profile {
            margin-top: -70px;
        }
        .profile aside {
            width: 140px;
        }
        .name {
            height: 70px;
        }
        .name h1 {
            font-size: 30px;
        }
    }
    @media screen and (max-width: 600px) {
        header.empty {
            height: 70px;
        }
        .profile {
            margin-top: -50px;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
        }
        .profile aside {
            align-self: center;
            width: 100px;
        }
        .name {
            margin-top: -95px;
            flex-direction: column-reverse;
            height: 140px;
        }
        .name h1 {
            color: inherit;
            font-size: 26px;
            color: #2c2830;
            align-self: center;
            margin-top: 10px;
        }
        .name nav {
            align-self: stretch;
            align-items: flex-end;
            justify-content: space-between;
        }
        .name nav .pipe {
            display: none;
        }
        .actions {
            flex-direction: column;
            align-items: center;
            gap: 20px;
        }
        .bio {
            text-align: center;
        }
    }
</style>
