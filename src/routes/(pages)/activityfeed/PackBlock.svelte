<!-- @component
    Section with cards opened in a pack
 -->
<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import Avatar from "$elem/Avatar.svelte";
    import Button from "$elem/Button.svelte";
    import { showShare } from "$lib/dialogs";
    import { resolve } from "$lib/services/cache";
    import { absUrl } from "$lib/utils/utils";
    import Cards from "./Cards.svelte";

    export let activity: NM.ActivityStoryPack;

    resolve.sett.set(activity.sett.detail_url.split("/").at(-1)!, activity.sett.id);
    resolve.user.set(activity.user.username, activity.user.id);

    function share (ev: Event) {
        showShare(ev, {
            url: absUrl(activity.packs[0].share_url),
            message: "I'm killing it on @NeonMob today!",
            shareSource: "pack-open-detail",
        });
    }
</script>

<article>
    <section>
        <Cards rarestCard={activity.packs[0].rarest_piece}
            restCards={activity.packs[0].pieces}
            owner={activity.user}
        />
        <div class="info">
            <div>
                <a href={absUrl(activity.sett.detail_url)}>{activity.sett.name}</a>
                <div>
                    {#if activity.packs[0].sizing === "bonus"}
                        <small>SUPER PACK</small>
                    {:else if activity.packs[0].sizing === "special"}
                        <small>SPECIAL PACK</small>
                    {:else}
                        Pack
                    {/if}
                    opened
                    {activity.packs[0].acquired}
                </div>
            </div>
            <Button type="subdued-dark" on:click={share} size="mini" >Brag!</Button>
        </div>
    </section>
    <section>
        <div class="info">
            <a href={absUrl(activity.user.profile_url)}>
                <Avatar user={activity.user} size="fill" />
            </a>
            <div>
                <span>
                    <a href={absUrl(activity.user.profile_url)}>
                        {activity.user.full_name}
                    </a>
                </span>
                <div>Opened 1 pack</div>
            </div>
        </div>
    </section>
</article>

<style>
    article {
        margin: 20px auto;
        max-width: 500px;
        overflow: hidden;
        position: relative;
        display: flex;
        flex-direction: column;
    }
    article::before {
        content: '';
        width: 2px;
        position: absolute;
        left: 50%;
        top: 20px;
        bottom: 20px;
        z-index: -1;
        background: rgba(179,179,179,0.6);
    }
    section {
        margin: 10px;
        display: flex;
        flex-direction: column;
        border-radius: 4px;
        overflow: hidden;
        font-size: 13px;
        background-color: white;
        --icon-size: 20px;
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
    .info a {
        color: #2c2830;
    }
    .info > div {
        flex-grow: 1;
        padding-top: 3px;
    }
    .info small {
        font-size: 10px;
        letter-spacing: .035em;
        font-weight: 500;
    }
    .info > div div {
        color: #857a90;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
