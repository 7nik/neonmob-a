<script lang="ts">
    import { page } from "$app/stores";
    import { PagePaginator } from "$api";
    import Button from "$elem/Button.svelte";
    import Icon from "$elem/Icon.svelte";
    import MetaSeo from "$elem/MetaSeo.svelte";
    import Submission from "$elem/Submission.svelte";
    import currentUser from "$lib/services/currentUser";
    import { infiniteScroll } from "$lib/utils/utils";

    export let data;

    $: cat = $page.params.category;
    $: submissions = PagePaginator.fromPOJO(data.p.submissions);
    $: loading = submissions.isLoadingStore;

    infiniteScroll(() => submissions.loadMore());

    function submitPitch () {
        // TODO implement submitting
        window.open("https://www.neonmob.com/vote/newest");
    }
</script>

<MetaSeo title="Vote on Digital Trading Card Series Proposals" url="/vote" />

<article>
    <header>
        {#if $currentUser.isAuthenticated}
            <Button on:click={submitPitch}>Submit your pitch</Button>
        {/if}
        <h1>Vote for Future Series</h1>
        <h3>
            Like <Icon icon="like" upper/>
            your favorite designs and they may become full trading card series
        </h3>
    </header>
    <nav>
        <div>
            <span>Submissions:</span>
            <a href="./newest" class:selected={cat === "newest"}>Newest</a>
            <a href="./popular" class:selected={cat === "popular"}>Popular</a>
            <a href="./liked" class:selected={cat === "liked"}>Liked</a>
            <!-- TODO: add your submission section -->
        </div>
        <div>
            <i class="pipe"></i>
            <span>Series:</span>
            <a href="./in-progress" class:selected={cat === "in-progress"}>In Progress</a>
            <a href="./published" class:selected={cat === "published"}>Published</a>
        </div>
    </nav>
    <section>
        {#each $submissions as submission (submission.id)}
            <Submission {submission} showComment={true} />
        {/each}
        {#if $loading}
            <div class="loading"><Icon icon="loader" /></div>
        {/if}
    </section>
</article>

<style>
    article {
        margin: 0 auto;
        padding: 40px 0 20px;
        width: min(940px, 100%);
    }
    header :global(button) {
        float: right;
    }
    header h1 {
        color: #2c2830;
        margin-bottom: 0;
    }
    header h3 {
        color: #857a90;
        font-style: italic;
    }
    nav {
        margin: 20px 0;
        padding: 5px 0;
        border-top: 1px solid #d6d6d6;
        border-bottom: 1px solid #d6d6d6;
        color: #857a90;
    }
    nav div {
        display: inline;
    }
    nav span {
        font-size: 10px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: .035em;
        padding: 10px;
    }
    nav a {
        color: #5f5668;
        position: relative;
        display: inline-block;
        padding: 5px 8px 0;
        cursor: pointer;
        border-bottom: 2px solid transparent;
    }
    nav a:hover, nav a.selected {
        color: #2c2830;
    }
    nav a.selected::after {
        content: "";
        display: block;
        height: 2px;
        margin: 0 -8px;
        position: relative;
        top: 7px;
        background-image: linear-gradient(45deg,#61D3A5,#64b8d7,#B078B1);
    }
    nav .pipe {
        border-color: #d6d6d6;
    }

    section {
        padding-top: 10px;
        margin: -10px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
    }

    .loading {
        grid-column: span 3;
        padding: 20px;
        text-align: center;
        --icon-size: 40px;
    }

    @media screen and (max-width: 760px) {
        article {
            padding-top: 20px;
        }
        header, header h1, header h3, nav {
            text-align: center;
        }
        header {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }
        header h1 {
            order: -1;
        }
        nav {
            margin: 20px;
        }
        section {
            grid-template-columns: repeat(2, 300px);
            justify-content: center;
        }
    }
    @media screen and (max-width: 660px) {
        nav {
            padding: 2px 0 0 0;
        }
        nav div {
            display: block;
        }
        nav span {
            padding: 5px;
        }
        nav a {
            padding: 3px;
            font-size: 13px;
        }
        nav a.selected::after {
            top: -2px;
            margin: 0;
        }
        nav .pipe {
            display: none;
        }
        section {
            grid-template-columns: min(300px, calc(100% - 20px));
        }
    }
</style>
