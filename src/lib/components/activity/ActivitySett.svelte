<!-- @component
    Activity feed item of series publishing
 -->
<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import ActivityBase from "./ActivityBase.svelte";

    export let activity: NM.ActivitySett;
</script>

<ActivityBase {activity} actionText="Made a series" user1={activity.user}
    shareText="I'm killing it on @NeonMob today!"
>
    <div style:background-image="url('{activity.background_image_url}')">
        <h3>{activity.name}</h3>
        <p>
            by {activity.user.full_name}
        </p>
        <img src={activity.cover_image_url} alt="{activity.name}'s Cover"/>
        <div class="overlay"></div>
    </div>
</ActivityBase>


<style>
    div {
        padding: 40px 0;
        color: #fff;
        background-position: center center;
        background-size: cover;
        text-align: center;
        font-size: 15px;
        line-height: 140%;
    }
    h3, p {
        position: relative;
        z-index: 2;
    }
    p {
        opacity: .7;
        font-size: 13px;
        font-style: italic;
    }
    img {
        padding: 10px 0;
        width: 100%;
        display: block;
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
    }
</style>
