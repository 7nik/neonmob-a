<!-- @component
    A series submission
-->
<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import Avatar from "$elem/Avatar.svelte";
    import Banner from "$elem/Banner.svelte";
    import Button from "$elem/Button.svelte";
    import Clickable from "$elem/Clickable.svelte";
    import Icon from "$elem/Icon.svelte";
    import cache from "$lib/actions/cache";
    import { fail, showShare } from "$lib/dialogs";
    import { resolve } from "$lib/services/cache";
    import currentUser from "$lib/services/currentUser";
    import { timeAgo } from "$lib/utils/date";
    import { plural } from "$lib/utils/format";

    export let submission: NM.Submission;
    /**
     * Allow the component be wider than 300px
     */
    export let large = false;
    /**
     * Show an input-link to comments
     */
    export let showComment = false;

    const url = submission.detail_url.replace("https://www.neonmob.com", "");
    /* eslint-disable no-unused-vars */
    enum Status {
        Submitted,
        Disqualified,
        Approved,
        Published,
    }
    /* eslint-disable unicorn/no-nested-ternary, multiline-ternary */
    const submissionStatus = submission.disqualified ? Status.Disqualified
        : submission.sett?.status === 2 ? Status.Published
        : submission.sett ? Status.Approved
        : Status.Submitted;
    const bannerText = ["", "Disqualified", "In Progress", "Now a series!"][submissionStatus];
    const bannerColor = (["", "red", "yellow", "green"] as const)[submissionStatus];

    resolve.user.set(submission.user.username, submission.user.id);
    if (submissionStatus === Status.Published) {
        resolve.sett.set(submission.sett!.public_url.slice(8, -1), submission.sett!.id);
    }

    function toggleLike () {
        // TODO implement
        submission.likes.liked = !submission.likes.liked;
        fail();
    }

    function share (ev: Event) {
        showShare(ev, {
            url,
            message: `Vote for this submission to become a full series on @NeonMob!`,
            image: submission.medium_url,
            shareSource: "submissions",
        });
    }
    // TODO implement other actions
</script>

<section class:small={!large} use:cache={{ submission }}>
    <a href={url} class="card">
        <figure>
            {#if submission.poster && submission.sources && submission.hires_sources}
                {@const sources = large ? submission.hires_sources : submission.sources}
                <video poster={submission.poster} loop muted autoplay>
                    {#each sources as source}
                        <source src={source.url} type={source.mime_type}>
                    {/each}
                </video>
            {:else}
                {@const src = large ? submission.large_url : submission.medium_url}
                <img {src} alt="Submission sample"/>
            {/if}
            <figcaption>{submission.caption}</figcaption>
        </figure>
        <div class="overlay"></div>
        <Banner {bannerText} {bannerColor} />
    </a>
    <div class="reactions">
        {#if $currentUser.isAuthenticated && $currentUser.isVerified}
            <Clickable on:click={toggleLike}>
                <span>
                    <Icon icon={submission.likes.liked ? "liked" : "like"} upper />
                </span>
                Like
            </Clickable>
            <i class="pipe"/>
        {/if}
        {submission.likes.total} {plural(submission.likes.total, "like")}
        {#if submission.comment_count > 0}
            <i class="pipe"/>
            {#if large}
                {submission.comment_count} {plural(submission.comment_count, "comment")}
            {:else}
                <a href={url}>
                    {submission.comment_count} {plural(submission.comment_count, "comment")}
                </a>
            {/if}
        {/if}
        {#if large}
            {#if submissionStatus === Status.Disqualified}
                <a class="right" target="_blank" rel="noreferrer"
                    href="http://help.neonmob.com/faq/fair-use-policy"
                >
                    <i>Why is this disqualified?</i>
                </a>
            {:else if submissionStatus === Status.Published}
                <a class="right" href={submission.sett?.public_url}>
                    <i>View Series ›</i>
                </a>
            {/if}
        {/if}
    </div>
    <div class="info">
        <a href={submission.user.link}>
            <Avatar user={submission.user} size="fill" />
        </a>
        <div>
            <a href={submission.user.link}>{submission.user.name}</a>
            <div>Submitted {timeAgo(submission.created)} </div>
        </div>
        <Button type="subdued-dark" on:click={share} size="mini" >Share</Button>
    </div>
    {#if showComment}
        <div class="comment">
            <a href="{url}#add-comment">Add a comment</a>
        </div>
    {/if}
</section>

<style>
    section {
        margin: 10px;
        display: inline-flex;
        flex-direction: column;
        gap: 1px;
        border-radius: 4px;
        overflow: hidden;
        font-size: 13px;
    }
    section.small {
        max-width: 300px;
    }
    section > * {
        background: white;
    }
    a.card {
        display: block;
        position: relative;
        aspect-ratio: 1;
    }
    .card figure {
        margin: 0;
    }
    .card figure img, .card figure video {
        width: 100%;
        display: block;
    }
    .card:hover .overlay {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        right: 0;
        background: #00000040;
        z-index: 1;
    }
    .card figcaption {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 2;
        padding: 20% 10px 10px;
        color: #fff;
        font-size: 14px;
        background: linear-gradient(to bottom, transparent, #00000080);
        background-size: contain;
        visibility: hidden;
    }
    .card:hover figcaption {
        visibility: visible;
    }

    .reactions {
        padding: 10px;
        display: flex;
        gap: 3px;
        align-items: baseline;
        color: #857a90;
        --icon-size: 16px;
    }
    .reactions :global(button > span) {
        color: #5f5668;
    }
    .reactions :global(button:hover > span) {
        color: #2c2830;
    }
    .reactions .pipe {
        border-color: #d6d6d6;
        align-self: center;
    }
    .reactions .right {
        flex-grow: 1;
        text-align: right;
    }

    .info {
        display: flex;
        gap: 5px;
        padding: 10px;
        text-align: left;
    }
    .info > a {
        display: block;
        width: 34px;
        height: 34px;
    }
    .info > div {
        flex-grow: 1;
        padding-top: 3px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
    .info div a {
        color: #2c2830;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .info div div {
        color: #857a90;
    }

    .comment {
        padding: 10px;
    }
    .comment a {
        width: 100%;
        padding: 8px 10px;
        border-radius: 3px;
        font-size: 14px;
        background: #eee;
        display: inline-block;
        color: #aca4b3;
    }
</style>
