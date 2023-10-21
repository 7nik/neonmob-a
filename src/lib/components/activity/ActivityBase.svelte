<!-- @component
    Template for activity feed items
 -->
<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import { browser } from "$app/environment";
    import Avatar from "$elem/Avatar.svelte";
    import Button from "$elem/Button.svelte";
    import { showShare } from "$lib/dialogs";
    import { viewTradeStory, viewPackStory } from "$lib/overlays";
    import { resolve } from "$lib/services/cache";
    import { absUrl } from "$lib/utils/utils";

    export let activity: NM.ActivityAny;
    export let user1: NM.ActivityBadge["user"];
    export let user2: NM.ActivityBadge["user"] | null = null;
    export let actionText: string;
    export let shareText: string;

    if (browser) {
        resolve.user.set(user1.profile_url.split("/")[1], user1.id);
        if (user2) {
            resolve.user.set(user2.profile_url.split("/")[1], user2.id);
        }
    }

    const url = absUrl(activity.detail_url);

    function share (ev: Event) {
        showShare(ev, {
            url,
            message: shareText,
            shareSource: "activity",
        });
    }

    // show overlays for packs and trades
    function viewActivity (ev: Event) {
        if (activity.type === "trade-completed") {
            ev.preventDefault();
            const tradeId = Number(activity.detail_url.match(/\d+/)?.[0]);
            viewTradeStory({ tradeId }, activity.detail_url);
        } else if (activity.type === "pack-opened") {
            ev.preventDefault();
            const packId = Number(activity.detail_url.match(/\d+/)?.[0]);
            viewPackStory({ packId }, activity.detail_url);
        }
    }
</script>

<section>
    <!-- preloaded data isn't used due to using overlays -->
    <a href={url}
        on:click={viewActivity}
        data-sveltekit-preload-code="off"
        data-sveltekit-preload-data="off"
    ><slot/></a>
    <div class="info">
        <a href={user1.profile_url} class:small={user2}>
            <Avatar user={user1} size="fill" />
        </a>
        {#if user2}
            <a href={user2.profile_url} class="small">
                <Avatar user={user2} size="fill" />
            </a>
        {/if}
        <div>
            <span>
                <a href={user1.profile_url}>{user1.full_name}</a>
                {#if user2}
                    and <a href={user2.profile_url}>{user2.full_name}</a>
                {/if}
            </span>
            <div>{actionText} {activity.created}</div>
        </div>
        <Button type="subdued-dark" on:click={share} size="mini" >Share</Button>
    </div>
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
        max-width: 300px;
    }
    section > * {
        background: white;
    }
    section > a {
        display: block;
        position: relative;
    }

    .info {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 10px;
    }
    .info > a {
        flex-shrink: 0;
        display: block;
        width: 34px;
        height: 34px;
    }
    .info > a.small {
        width: 28px;
        height: 28px;
        margin: 0 0 11px 0;
    }
    .info > a.small + .small {
        margin: 11px 0 0 -22px;
    }
    .info a {
        color: #2c2830;
    }
    .info > div {
        flex-grow: 1;
        padding-top: 3px;
    }
    .info > div div {
        color: #857a90;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
