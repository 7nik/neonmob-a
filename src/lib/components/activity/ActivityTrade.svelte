<!-- @component
    Activity feed item of a completed trade
 -->
<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import Icon from "$elem/Icon.svelte";
    import { plural } from "$lib/utils/format";
    import ActivityBase from "./ActivityBase.svelte";
    import { page } from "$app/stores";

    export let activity: NM.ActivityTrade;

    const ownedB = $page.data.currentUser.wealth.hasPrint(activity.bidder.rarest_piece.id, true);
    const ownedR = $page.data.currentUser.wealth.hasPrint(activity.responder.rarest_piece.id, true);
</script>

<ActivityBase {activity} actionText="Traded"
    user1={activity.bidder} user2={activity.responder}
    shareText="Check out this trade on @NeonMob!"
>
    <div>
        <figure>
            <img src={activity.bidder.rarest_piece.owned_image_url}
                alt="Card {activity.bidder.rarest_piece.name}"
                class:grayOut={!$ownedB}
            />
            <figcaption>
                <Icon icon={activity.bidder.rarest_piece.rarity} upper />
                <span class="name">{activity.bidder.rarest_piece.name}</span>
                {#if activity.bidder.amt_items > 1}
                    <span class="count">
                        +{activity.bidder.amt_items - 1}
                        <small>
                            {plural(activity.bidder.amt_items - 1, "item")}
                        </small>
                    </span>
                {/if}
            </figcaption>
        </figure>
        <figure>
            <img src={activity.responder.rarest_piece.owned_image_url}
                alt="Card {activity.responder.rarest_piece.name}"
                class:grayOut={!$ownedR}
            />
            <figcaption>
                <Icon icon={activity.responder.rarest_piece.rarity} upper />
                <span class="name">{activity.responder.rarest_piece.name}</span>
                {#if activity.responder.amt_items > 1}
                    <span class="count">
                        +{activity.responder.amt_items - 1}
                        <small>
                            {plural(activity.responder.amt_items - 1, "item")}
                        </small>
                    </span>
                {/if}
            </figcaption>
        </figure>
        <div class="overlay"></div>
    </div>
</ActivityBase>


<style>
    div {
        aspect-ratio: 1;
        overflow: hidden;
        display: flex;
        justify-content: center;
        --icon-size: 20px;
    }
    img {
        width: 100%;
        display: block;
    }
    .grayOut {
        filter: grayscale(1);
    }
    .overlay {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        right: 0;
        background: #00000040;
        z-index: 1;
        opacity: 0;
        pointer-events: none;
    }
    figure:hover ~ .overlay, .overlay:hover {
        opacity: 1;
    }
    figure {
        width: 100%;
        margin: 0;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        transition: .1s margin ease-in-out;
        position: relative;
    }
    figure:first-child:hover {
        margin-left: 100%;
    }
    figure:nth-child(2):hover {
        margin-right: 100%;
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
        transition: .1s left ease-in-out, .1s right ease-in-out;
    }
    figure:first-child:not(:hover) figcaption {
        left: 50%;
    }
    figure:nth-child(2):not(:hover) figcaption {
        right: 50%;
    }
    .name {
        flex-grow: 1;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    figure:first-child:not(:hover) figcaption .name,
    figure:nth-child(2):not(:hover) figcaption .name {
        visibility: hidden;
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
