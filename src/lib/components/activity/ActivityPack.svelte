<!-- @component
    Activity feed item of opened pack(s)
 -->
<script lang="ts">
    import type NM from "$lib/utils/NM Types";
    import Icon from "$elem/Icon.svelte";
    import ratio from "$lib/actions/ratio";
    import { plural } from "$lib/utils/format";
    import ActivityBase from "./ActivityBase.svelte";

    export let activity: NM.ActivityPack;
    // TODO greyout unowned cards
</script>

<ActivityBase {activity} actionText="Opened packs" user1={activity.user}
    shareText="I'm killing it on @NeonMob today!"
>
    <figure use:ratio={activity.rarest_piece}>
        <img src={activity.rarest_piece.owned_image_url} alt="Card {activity.rarest_piece.name}"/>
        <figcaption>
            <Icon icon={activity.rarest_piece.rarity} upper />
            <span class="name">{activity.rarest_piece.name}</span>
            {#if activity.num_prints > 1}
                <span class="count">
                    +{activity.num_prints - 1}
                    <small>
                        {plural(activity.num_prints - 1, "print")}
                    </small>
                </span>
            {/if}
        </figcaption>
    </figure>
    <div class="overlay"></div>
</ActivityBase>


<style>
    figure {
        width: 100%;
        margin: 0;
        --icon-size: 20px;
    }
    img {
        width: 100%;
        display: block;
    }
    figure:hover + .overlay {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        right: 0;
        background: #00000040;
        z-index: 1;
        pointer-events: none;
    }
    figcaption {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 2;
        padding: 20% 10px 10px;
        color: #fff;
        font-size: 14px;
        display: flex;
        gap: .5ch;
        justify-content: space-between;
        align-items: center;
        white-space: nowrap;
        background: linear-gradient(to bottom, transparent, #00000080);
        background-size: contain;
    }
    .name {
        flex-grow: 1;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .count {
        color: #fff;
        text-transform: uppercase;
        border: 2px solid #fff;
        padding: 2px 5px 0;
        margin-left: 1ch;
        display: inline-block;
        font-size: 12px;
        font-weight: 500;
        opacity: .8;
        border-radius: 3px;
    }
    figure:hover .count {
        opacity: 1;
    }
    .count small {
        font-size: .8em;
    }
</style>
