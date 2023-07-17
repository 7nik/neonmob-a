<script lang="ts">
    import { afterNavigate } from "$app/navigation";
    import MetaSeo from "$elem/MetaSeo.svelte";
    import Submission from "$elem/Submission.svelte";

    let prevUrl: string|null;
    afterNavigate(({ from }) => {
        prevUrl = from?.url.pathname.startsWith("/vote/") ? from.url.pathname : null;
    });

    export let data;
</script>

<MetaSeo
    title="A Collection Submission by {data.submission.user.name} on NeonMob"
    description={data.submission.caption}
    image={{
        // that is what NM lies to everybody about the size
        height: 630,
        width: 1200,
        url: data.submission.image_url,
    }}
/>

<header>
    <div>
        {#if prevUrl}
            <a href={prevUrl}>
                ‹
                <span class="hide-on-tiny">Back to Vote</span>
            </a>
        {/if}
    </div>
    <h1>A Submission by {data.submission.user.name}</h1>
    <div></div>
</header>
<article>
    <Submission submission={data.submission} large={true} />
    <!-- TODO comments, only for authenticated -->
</article>

<style>
    header {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        height: 60px;
        line-height: 1;
        border-bottom: 1px solid rgba(0,0,0,.1);
        align-items: center;
        padding: 0 10px;
    }
    header * {
        flex: 1 100%;
    }
    header a {
        white-space: nowrap;
    }
    header h1 {
        text-align: center;
        margin: 0;
        font-size: 24px;
        font-weight: 300;
        color: #2c2830;
    }
    article {
        margin: 0 auto;
        padding: 40px 0 20px;
        width: min(500px, 100%);
    }

    @media screen and (max-width: 480px) {
        header > * {
            flex-basis: 25px;
        }
        header a {
            font-size: 40px;
            font-weight: 200;
        }
        header h1 {
            flex-basis: 100%;
            font-size: 20px;
        }
        .hide-on-tiny {
            display: none;
        }
    }
</style>
