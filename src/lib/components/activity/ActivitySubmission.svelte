<!-- @component
    Activity item of submitted pitch
 -->
<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import ActivityBase from "./ActivityBase.svelte";

    export let activity: NM.ActivitySubmission;
</script>

<ActivityBase {activity} actionText="Submitted" user1={activity.user}
    shareText="Vote for this submission to become a full series on @NeonMob!"
>
    <figure>
        <img src={activity.image_url} alt="Submission sample"/>
        <figcaption>{activity.caption}</figcaption>
    </figure>
    <div class="overlay"></div>
</ActivityBase>


<style>
    figure {
        margin: 0;
    }
    img {
        width: 100%;
        display: block;
    }
    figure figcaption {
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
    figure:hover figcaption {
        visibility: visible;
    }
    .overlay {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        right: 0;
        background: #00000040;
        z-index: 1;
        pointer-events: none;
        visibility: hidden;
    }
    figure:hover + .overlay {
        visibility: visible;
    }
</style>
