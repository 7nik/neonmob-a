<!-- @component
    Activity feed item of an earned badge
 -->
<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import ActivityBase from "./ActivityBase.svelte";

    export let activity: NM.ActivityBadge;
</script>

<ActivityBase {activity} actionText="Hit a milestone" user1={activity.user}
    shareText="{activity.user.full_name} hit a milestone on @NeonMob!"
>
    <div class="activity">
        <h3>{activity.name}</h3>
        {#if activity.sett_name}
            <p>for {activity.sett_name}</p>
        {/if}
        <div class="img">
            <img src={activity.image_url} alt="Badge icon"/>
        </div>
        <p>{activity.description}</p>
    </div>
    <div class="overlay"></div>
</ActivityBase>


<style>
    .activity {
        padding: 30px 0;
        color: #2c2830;
        background-position: center center;
        background-size: cover;
        text-align: center;
        font-size: 15px;
        line-height: 140%;
    }
    h3, p {
        margin: 10px 0 0;
        position: relative;
        z-index: 2;
    }
    p {
        color: #857a90;
        font-size: 13px;
        font-style: italic;
    }
    .img {
        width: 160px;
        max-height: 160px;
        margin: 0 auto;
    }
    img {
        max-width: 100%;
        max-height: 100%;
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
    div:hover + .overlay {
        visibility: visible;
    }
</style>
