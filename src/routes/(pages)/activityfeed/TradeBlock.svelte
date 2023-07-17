<!-- @component
    One side of a trade in detailed trade activity item
 -->
<script lang="ts">
    import type NM from "$lib/utils/NM Types";

    import Avatar from "$elem/Avatar.svelte";
    import Button from "$elem/Button.svelte";
    import { showShare } from "$lib/dialogs";
    import { resolve } from "$lib/services/cache";
    import { plural } from "$lib/utils/format";
    import { absUrl } from "$lib/utils/utils";
    import Cards from "./Cards.svelte";

    /**
     * One side of the trade
     */
    export let offer: NM.ActivityStoryTrade["bidder"];
    /**
     * When the trade was completed
     */
    export let completed: string;

    resolve.user.set(offer.user.username, offer.user.id);

    function share (ev: Event) {
        showShare(ev, {
            message: "Sweet trade on @NeonMob!",
            shareSource: "trade-detail",
        });
    }
</script>

<section>
    <Cards rarestCard={offer.rarest_piece}
        restCards={offer.items}
        owner={offer.user}
    />
    <div class="info">
        <a href={absUrl(offer.user.profile_url)}>
            <Avatar user={offer.user} size="fill" />
        </a>
        <div>
            <span>
                <a href={absUrl(offer.user.profile_url)}>
                    {offer.user.full_name}
                </a>
            </span>
            <div>
                Received {offer.amt_items} {plural(offer.amt_items, "item")}
                {completed}
            </div>
        </div>
        <Button type="subdued-dark" on:click={share} size="mini" >Share</Button>
    </div>
</section>

<style>
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
    .info > div div {
        color: #857a90;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
